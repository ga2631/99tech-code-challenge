# Feature: problem6-live-scoreboard

## 1. End-to-End System Flow
This feature defines a comprehensive, production-ready architectural specification for the **Live Scoreboard Module (Problem 6)** on the API backend application server.

The end-to-end execution flow operates across four tightly coordinated layers:
1. **Client & Ingress Interaction Layer:**
   - **Action Completion Client:** Upon completing a score-earning task, the web client submits a `POST /api/v1/scores/increment` request containing a Bearer JWT, an HMAC-signed `actionTicket`, a client timestamp, and a unique `X-Idempotency-Key`.
   - **Live Scoreboard Viewers:** Clients establish persistent WebSocket connections (`WSS /ws/v1/leaderboard`) or Server-Sent Events (SSE) to receive live top-10 updates without polling.
2. **Security & Anti-Cheat Pipeline (API Layer):**
   - **Identity Authentication:** Validates the JWT signature, expiry, and user permissions.
   - **Action Proof Ticket Validation:** Computes and verifies the HMAC-SHA256 signature of the `actionTicket` to guarantee that the action was legitimately completed and not forged.
   - **Atomic Idempotency Interceptor:** Evaluates `SET idempotency:action:<key> 1 NX EX 300` in Redis. Duplicate requests (replay attacks) are rejected immediately with `409 Conflict`.
   - **Rate Limiting & Velocity Bounds:** Redis sliding window verifies that user increment frequency remains within allowed thresholds ($\le 1$ action / 2s), responding with `429 Too Many Requests` on abuse.
3. **In-Memory Score Engine & Real-Time Distribution (Redis Tier):**
   - **Atomic Rank & Score Mutation:** The score increment is applied to the global sorted set via `ZINCRBY leaderboard:global <delta> <userId>`, guaranteeing atomic $O(\log N)$ time complexity without database row locking.
   - **Top 10 Evaluation & Rank Differential:** Queries `ZREVRANGE leaderboard:global 0 9 WITHSCORES` to verify if the top 10 members or order have changed.
   - **Pub/Sub Fan-Out & Throttled Broadcast:** If the top 10 is modified, a delta event is published to `channel:leaderboard_updates`. A 500ms sliding buffer debounces messages to prevent broadcast storms, emitting batched `LEADERBOARD_UPDATED` payloads to all active WebSocket nodes and viewers.
4. **Durable Persistence & Ledger Tier (PostgreSQL):**
   - **Immutable Audit Logging:** Asynchronously writes an entry into `score_audit_logs` storing user ID, action type, score before/after, client IP, user agent, and verification hash.
   - **Durable Score Synchronization:** Updates the persistent `user_scores` table using optimistic concurrency control.

---

## 2. Database & Schema Changes

### 1. Redis In-Memory Schemas
- **`leaderboard:global` (`ZSET`):** Sorted set storing `user_id` as member and total aggregated points as score.
- **`idempotency:action:<key>` (`STRING`):** Nonce key storing execution status with a 300-second TTL (`SET NX EX 300`).
- **`user:profile:<user_id>` (`HASH`):** Cached user profile metadata (`username`, `displayName`, `avatarUrl`) for rapid leaderboard hydration.

### 2. PostgreSQL Relational Schema
```sql
-- Users Table
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Persistent User Scores
CREATE TABLE user_scores (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_score BIGINT NOT NULL DEFAULT 0 CHECK (current_score >= 0),
    version BIGINT NOT NULL DEFAULT 1,
    last_action_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_user_scores_current_score ON user_scores (current_score DESC);

-- Immutable Score Audit Log Ledger
CREATE TABLE score_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    action_idempotency_key VARCHAR(128) NOT NULL UNIQUE,
    score_delta INTEGER NOT NULL CHECK (score_delta > 0),
    score_before BIGINT NOT NULL,
    score_after BIGINT NOT NULL,
    client_ip INET,
    user_agent TEXT,
    verification_hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_score_audit_logs_user_id ON score_audit_logs (user_id, created_at DESC);
```

---

## 3. Technical Optimizations
- **$O(\log N)$ In-Memory Complexity:** Utilizing Redis Sorted Sets enables real-time rank lookups (`ZREVRANK`) and range queries (`ZREVRANGE`) in sub-millisecond latency for millions of users without triggering heavy SQL index scans.
- **Broadcast Storm Protection (Micro-Batching / Debounce):** Under peak loads (e.g., 5,000 increments/sec across 100,000 viewers), broadcast updates are aggregated into a 500ms sliding window, capping outbound WebSocket frames at $\le 2$ updates/sec to protect network bandwidth and client rendering threads.
- **Multi-Tiered Anti-Cheat & Replay Protection:** Combines HMAC-SHA256 action proof tickets, atomic Redis `SET NX` idempotency nonces, user-level velocity rate limiting, and server-authoritative score delta mapping.
- **Write-Behind Asynchronous Ledger:** Decouples high-frequency Redis writes from durable PostgreSQL disk operations using an asynchronous queue/worker pattern, guaranteeing high write throughput without database connection pool exhaustion.
- **Fault-Tolerant Reconnection with Jitter:** WebSocket client contract specifies exponential backoff with randomized jitter and immediate state reconciliation via `LEADERBOARD_SNAPSHOT` upon reconnect.

---

## 4. Impacted Files
- `src/problem6/README.md`: Complete engineering specification document for the backend team, containing architectural topology, Redis/SQL schemas, security pipelines, API contracts, Mermaid sequence diagrams, throttling strategies, and future improvements.
- `docs/features/problem6-live-scoreboard.md`: Dedicated technical feature documentation satisfying repository governance rules.
