# Real-Time Live Scoreboard API Module Specification

> **Target Audience:** Backend Engineering Team, Tech Leads, QA Engineers, Security & DevOps Engineers  
> **Status:** Draft / Ready for Implementation  
> **Document Version:** `1.0.0`  
> **Module Scope:** API Service (Backend Application Server)

---

## Table of Contents
1. [Module Overview & Objectives](#1-module-overview--objectives)
2. [Functional & Non-Functional Requirements](#2-functional--non-functional-requirements)
3. [System Architecture & Component Topology](#3-system-architecture--component-topology)
4. [Data Models & Storage Strategy](#4-data-models--storage-strategy)
5. [Security & Anti-Cheat Architecture](#5-security--anti-cheat-architecture)
6. [API & Real-Time Interface Contracts](#6-api--real-time-interface-contracts)
7. [Detailed Execution Flows & Sequence Diagrams](#7-detailed-execution-flows--sequence-diagrams)
8. [Real-Time Broadcast & Throttling Strategy](#8-real-time-broadcast--throttling-strategy)
9. [Error Handling & Edge Cases](#9-error-handling--edge-cases)
10. [Engineering Implementation Checklist](#10-engineering-implementation-checklist)
11. [Additional Recommendations & Future Improvements](#11-additional-recommendations--future-improvements)

---

## 1. Module Overview & Objectives

The **Live Scoreboard Module** is a high-throughput, low-latency API backend component responsible for:
- Managing user scores and maintaining a global top-10 leaderboard.
- Securing score update actions against malicious manipulation, tampering, unauthorized replay attacks, and bot automation.
- Broadcasting near real-time score updates to connected website clients via WebSocket / Server-Sent Events (SSE).
- Persisting state reliably across memory caches and durable relational storage.

```
+-----------------------------------------------------------------------------------+
|                               SYSTEM OBJECTIVE                                    |
|  +--------------------+    +-----------------------+    +----------------------+  |
|  | User Action Done   | -> | Secure Verified Update| -> | Real-Time Live Sync  |  |
|  | (Browser / Client) |    | (Low Latency / Redis) |    | (Top 10 Live Delta)  |  |
|  +--------------------+    +-----------------------+    +----------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Functional & Non-Functional Requirements

### 2.1 Functional Requirements
1. **Top 10 Leaderboard Query:** Provide an endpoint to retrieve the current top 10 users with their ranks, user identifiers, display names, and total scores.
2. **Action Completion & Score Increment:** Expose a secure endpoint invoked upon the completion of a user action to increment the authenticated user's score.
3. **Live Scoreboard Broadcast:** Push immediate or micro-batched leaderboard updates to all active web clients whenever the top 10 rankings or top 10 scores change.
4. **User Rank Lookup:** Enable users to retrieve their own rank, score, and surrounding competitors even if they are not in the top 10.

### 2.2 Non-Functional & Quality Requirements
- **Low Latency:** Score increments and top-10 queries must complete in under **15ms** (p99) at the storage tier.
- **High Concurrency:** Capable of handling **10,000+ score increment requests/sec** and **100,000+ concurrent live WebSocket viewers**.
- **Data Integrity & Consistency:** Zero score loss, no race conditions, atomic increments, and exact audit trails.
- **Zero-Trust Security:** No unauthenticated or forged requests may alter any user's score. Rate limits, action verification tickets, and replay prevention must be strictly enforced.

---

## 3. System Architecture & Component Topology

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer"]
        BrowserA["Web Client A (Active Player)"]
        BrowserB["Web Client B (Viewer)"]
        BrowserC["Web Client N (Viewer)"]
    end

    subgraph IngressGateway ["Ingress & Security Gateway"]
        LB["API Gateway / Reverse Proxy (Nginx / Cloudflare)"]
        WAF["WAF & Rate Limiter (IP / TLS Handshake)"]
    end

    subgraph AppCluster ["Application Server Cluster (Stateless Node.js/Go)"]
        API1["API Worker 1\n(Auth + Score Controller)"]
        API2["API Worker 2\n(Auth + Score Controller)"]
        WS1["WebSocket / SSE Gateway 1"]
        WS2["WebSocket / SSE Gateway 2"]
    end

    subgraph FastDataLayer ["In-Memory Data Tier (Redis Cluster)"]
        RedisZSet[("Redis Sorted Set\n'leaderboard:global'")]
        RedisNonce[("Redis Nonce / Idempotency Cache\n(TTL: 5m)")]
        RedisPubSub[("Redis Pub/Sub / Streams\n'channel:leaderboard_updates'")]
    end

    subgraph PersistentTier ["Durable Storage Tier (PostgreSQL)"]
        DB[(PostgreSQL Primary)]
        AuditLog[(Score Audit Logs & Ledger)]
    end

    BrowserA -->|1. HTTPS POST /api/v1/scores/increment| LB
    BrowserB & BrowserC -->|WebSocket WSS /ws/v1/leaderboard| LB
    LB --> WAF
    WAF --> API1 & API2 & WS1 & WS2

    API1 & API2 -->|Auth Check & Idempotency| RedisNonce
    API1 & API2 -->|Atomic ZINCRBY / ZREVRANGE| RedisZSet
    API1 & API2 -->|Publish Diff Event| RedisPubSub
    API1 & API2 -.->|Async Queue / Write-Behind| DB
    API1 & API2 -.->|Append-Only Ledger| AuditLog

    RedisPubSub -->|Subscribe Top 10 Diffs| WS1 & WS2
    WS1 -->|Live Push| BrowserA & BrowserB
    WS2 -->|Live Push| BrowserC
```

### Component Breakdown
1. **API Gateway / Ingress:** Terminates TLS, handles global DDoS mitigation, enforces IP-level rate limits, and routes HTTP/WebSocket traffic.
2. **API Worker Cluster:** Stateless application instances hosting REST endpoints, business validation, JWT verification, cryptographic action token validation, and score increment logic.
3. **Real-time Gateway (WebSocket / SSE):** Manages persistent client connections, handles heartbeats, subscribes to Redis Pub/Sub channels, and broadcasts throttled/debounced leaderboard snapshots.
4. **Redis Tier:**
   - `Redis Sorted Set (ZSET)`: Primary fast leaderboard engine (`ZINCRBY`, `ZREVRANGE`, `ZREVRANK`).
   - `Redis String Key (Idempotency)`: Prevents duplicate execution of the same action completion.
   - `Redis Pub/Sub`: Fan-out channel distributing leaderboard changes to all distributed WebSocket nodes.
5. **Durable Database Tier (PostgreSQL):** Stores user profile information, total persistent scores, and an immutable audit log ledger for financial/compliance reconciliation.

---

## 4. Data Models & Storage Strategy

### 4.1 Redis In-Memory Data Structures

#### 1. Global Leaderboard Sorted Set
- **Key:** `leaderboard:global`
- **Type:** `ZSET` (Sorted Set)
- **Member:** `user_id` (e.g., `"usr_01HXYZ789"`)
- **Score:** Floating point or Integer representation of the user's total score (e.g., `15420.0`).
- **Complexity:**
  - `ZINCRBY leaderboard:global <score_delta> <user_id>`: $O(\log N)$
  - `ZREVRANGE leaderboard:global 0 9 WITHSCORES`: $O(\log N + M)$ where $M = 10 \implies O(\log N)$
  - `ZREVRANK leaderboard:global <user_id>`: $O(\log N)$

#### 2. Idempotency & Action Nonce Keys
- **Key:** `idempotency:action:<nonce>`
- **Type:** `STRING` (Value: `user_id`, TTL: `300 seconds`)
- **Operation:** `SET idempotency:action:<nonce> <user_id> NX EX 300`

#### 3. User Cached Metadata Hash
- **Key:** `user:profile:<user_id>`
- **Type:** `HASH` (`username`, `avatar_url`, `country_code`)

---

### 4.2 Relational Database Schema (PostgreSQL DDL)

```sql
-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY, -- e.g., 'usr_01HXYZ789'
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. User Scores Summary Table (Durable Copy)
CREATE TABLE user_scores (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_score BIGINT NOT NULL DEFAULT 0 CHECK (current_score >= 0),
    version BIGINT NOT NULL DEFAULT 1, -- Optimistic Locking
    last_action_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_user_scores_current_score ON user_scores (current_score DESC);

-- 3. Immutable Score Audit Log Ledger (Anti-Cheat & Reconciliation)
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

## 5. Security & Anti-Cheat Architecture

Preventing malicious users from arbitrarily incrementing scores is a critical system requirement. A multi-layer defense-in-depth model is specified below:

```
+------------------------------------------------------------------------------------+
|                           MULTI-LAYER SECURITY SHIELD                              |
|                                                                                    |
| [1. TLS & WAF]          -> Cloudflare DDoS / IP Rate Limiting                      |
| [2. Authentication]     -> Cryptographic JWT (Bearer Token, Expiry <= 15m)         |
| [3. Action Proof Ticket]-> HMAC-SHA256 Signed Action Verification Token            |
| [4. Idempotency Nonce]  -> Single-use UUIDv7 checked atomically via Redis SET NX    |
| [5. Velocity Limits]    -> Leaky Bucket (Max 5 score actions / 10s per user)       |
| [6. Anomaly Detection]  -> Dynamic Delta Bounds (Score increment capped per action)|
+------------------------------------------------------------------------------------+
```

### 5.1 Defense Mechanisms

| Layer | Threat Vector | Mitigation Strategy |
|---|---|---|
| **1. Identity Verification** | Unauthenticated callers, session hijacking | Validated JWT Bearer Token in `Authorization` header. Subject `sub` must match target `userId`. |
| **2. Action Proof Ticket (Signed Token)** | Arbitrary script calling `/increment` without actually doing the action | When an action starts or is issued by the server, the backend issues a signed, short-lived **Action Ticket** (`actionTicket`) containing `actionId`, `userId`, `actionType`, `issuedAt`, `expiresAt` (e.g., 60s TTL), and an HMAC-SHA256 signature generated with an internal secret. The `/increment` endpoint validates this signature before processing. |
| **3. Replay Attack Prevention** | Intercepting a valid payload and re-sending it | Every action completion requires a unique `idempotencyKey` (UUIDv7/v4). Redis executes `SET idempotency:action:<key> "1" NX EX 300`. If key exists, return `409 Conflict` immediately. |
| **4. Rate Limiting & Velocity Bounds** | Fast-clicking bots, macro scripts | User-level rate limiting using Redis Sliding Window (e.g., max 1 increment per 2 seconds, max 30 per minute). Requests violating limits return `429 Too Many Requests`. |
| **5. Score Increment Validation** | Hackers sending `scoreDelta: 9999999` | The client **does not determine the score increment value**. The server maps `actionType` $\rightarrow$ pre-configured static or rule-based score delta (e.g., `ACTION_SOLVE_PUZZLE` $\rightarrow$ `+100 pts`). If client attempts to override the score, the request is rejected with `400 Bad Request`. |
| **6. Payload Checksum Verification** | Man-In-The-Middle tampering | Header `X-Signature: HMAC-SHA256(userId + actionType + idempotencyKey + timestamp, clientSecret)` verified if native client/app is involved. |

---

## 6. API & Real-Time Interface Contracts

### 6.1 `POST /api/v1/scores/increment` (Complete Action & Increment Score)

Processes action completion and updates user score.

#### Request Headers
```http
POST /api/v1/scores/increment HTTP/1.1
Host: api.example.com
Authorization: Bearer <JWT_ACCESS_TOKEN>
Content-Type: application/json
X-Idempotency-Key: 018f3a6b-9c7d-7b2e-a108-4682c499f521
```

#### Request Body
```json
{
  "actionType": "DAILY_CHALLENGE_COMPLETE",
  "actionTicket": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3Rpb25JZCI6ImFjdF8wMDEiLCJ1c2VySWQiOiJ1c3JfMDFIWFlaNzg5IiwiZXhwIjoxNzg5MTIzNDU2fQ.abc123signature",
  "clientTimestamp": 1789123400000,
  "metadata": {
    "durationSeconds": 45
  }
}
```

#### Response: `200 OK` (Success)
```json
{
  "success": true,
  "data": {
    "userId": "usr_01HXYZ789",
    "scoreDelta": 50,
    "currentScore": 1250,
    "previousScore": 1200,
    "globalRank": 7,
    "inTop10": true,
    "top10Changed": true,
    "updatedAt": "2026-09-12T14:55:00.000Z"
  }
}
```

#### Error Responses
- `400 Bad Request`: Invalid payload or unsupported `actionType`.
- `401 Unauthorized`: Missing or expired JWT.
- `403 Forbidden`: Invalid or tampered `actionTicket`.
- `409 Conflict`: Duplicate `idempotencyKey` (replay attempt).
- `429 Too Many Requests`: Action velocity limit exceeded.

---

### 6.2 `GET /api/v1/scores/top` (Retrieve Top 10 Leaderboard)

Retrieves the latest cached snapshot of the top 10 players.

#### Request
```http
GET /api/v1/scores/top HTTP/1.1
Host: api.example.com
```

#### Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "usr_alpha01",
        "username": "dragon_slayer",
        "displayName": "Alex Walker",
        "avatarUrl": "https://cdn.example.com/avatars/1.png",
        "score": 98450
      },
      {
        "rank": 2,
        "userId": "usr_beta02",
        "username": "speedy_coder",
        "displayName": "Sarah Connor",
        "avatarUrl": "https://cdn.example.com/avatars/2.png",
        "score": 94120
      },
      {
        "rank": 10,
        "userId": "usr_01HXYZ789",
        "username": "phoenix",
        "displayName": "Tuan Nguyen",
        "avatarUrl": "https://cdn.example.com/avatars/10.png",
        "score": 75200
      }
    ],
    "lastEvaluatedAt": "2026-09-12T14:55:01.120Z"
  }
}
```

---

### 6.3 `GET /api/v1/scores/me` (Current User Rank & Nearby Competitors)

#### Request
```http
GET /api/v1/scores/me HTTP/1.1
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

#### Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "usr_9999",
    "rank": 42,
    "score": 3840,
    "pointsToNextRank": 120,
    "surrounding": [
      { "rank": 41, "userId": "usr_8888", "username": "player_a", "score": 3960 },
      { "rank": 42, "userId": "usr_9999", "username": "my_user", "score": 3840 },
      { "rank": 43, "userId": "usr_7777", "username": "player_b", "score": 3810 }
    ]
  }
}
```

---

### 6.4 Real-Time WebSocket Interface (`WSS /ws/v1/leaderboard`)

Clients connect via WebSocket to receive live updates without polling.

#### 1. Connection Handshake
```http
GET /ws/v1/leaderboard HTTP/1.1
Host: api.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

#### 2. Server Event: Initial Snapshot (`LEADERBOARD_SNAPSHOT`)
Sent immediately upon successful connection:
```json
{
  "event": "LEADERBOARD_SNAPSHOT",
  "timestamp": 1789123405000,
  "data": {
    "top10": [
      { "rank": 1, "userId": "usr_alpha01", "username": "dragon_slayer", "score": 98450 },
      { "rank": 2, "userId": "usr_beta02", "username": "speedy_coder", "score": 94120 }
    ]
  }
}
```

#### 3. Server Event: Live Update (`LEADERBOARD_UPDATED`)
Broadcast to all connected clients when top 10 rankings/scores change (throttled at $\le 1$ update per second):
```json
{
  "event": "LEADERBOARD_UPDATED",
  "timestamp": 1789123406500,
  "data": {
    "top10": [
      { "rank": 1, "userId": "usr_alpha01", "username": "dragon_slayer", "score": 98500 },
      { "rank": 2, "userId": "usr_beta02", "username": "speedy_coder", "score": 94120 }
    ],
    "changedEntries": [
      { "userId": "usr_alpha01", "oldRank": 1, "newRank": 1, "scoreDelta": 50 }
    ]
  }
}
```

---

## 7. Detailed Execution Flows & Sequence Diagrams

### 7.1 Secure Score Increment & Broadcast Execution Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Web Client)
    participant GW as API Gateway / WAF
    participant API as API Server (Score Module)
    participant Redis as Redis Cluster (Leaderboard & Nonce)
    participant PubSub as Redis Pub/Sub
    participant WS as WebSocket Gateway Cluster
    participant DB as PostgreSQL (Async Ledger)

    User->>GW: POST /api/v1/scores/increment (JWT, ActionTicket, IdempotencyKey)
    GW->>API: Route validated request
    
    rect rgb(240, 248, 255)
        Note over API: Security & Anti-Cheat Pipeline
        API->>API: 1. Verify JWT signature & validity
        API->>API: 2. Verify ActionTicket HMAC signature & timestamp
        API->>Redis: 3. SET idempotency:action:<key> 1 NX EX 300
        alt Key already exists (Replay Attack)
            Redis-->>API: Key exists (0)
            API-->>User: 409 Conflict ("Action already processed")
        end
        Redis-->>API: Key set OK (1)
        
        API->>Redis: 4. Check user velocity limit (Rate Limiting)
        alt Rate Limit Exceeded
            API-->>User: 429 Too Many Requests
        end
    end

    rect rgb(245, 255, 245)
        Note over API,Redis: Atomic Score Calculation
        API->>API: 5. Lookup scoreDelta from ActionType (e.g. +50)
        API->>Redis: 6. ZREVRANK leaderboard:global <userId> (Get old rank)
        API->>Redis: 7. ZINCRBY leaderboard:global 50 <userId>
        Redis-->>API: Returns new total score
        API->>Redis: 8. ZREVRANGE leaderboard:global 0 9 WITHSCORES (Fetch Top 10)
        Redis-->>API: Returns current Top 10 members
    end

    rect rgb(255, 250, 240)
        Note over API,WS: Real-time Evaluation & Notification
        API->>API: 9. Check if Top 10 scores/ranks changed
        opt Top 10 Affected
            API->>PubSub: PUBLISH channel:leaderboard_updates <Top10Payload>
            PubSub-->>WS: Deliver Top 10 diff payload
            WS-->>User: Broadcast LEADERBOARD_UPDATED to all connected viewers
        end
    end

    API-->>User: 200 OK (currentScore, globalRank, inTop10)

    rect rgb(245, 245, 245)
        Note over API,DB: Asynchronous Persistence & Audit Logging
        API-)DB: INSERT INTO score_audit_logs (Audit Record)
        API-)DB: UPDATE user_scores SET current_score = current_score + 50
    end
```

---

### 7.2 WebSocket Subscription & Connection Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Client as Web Browser
    participant WS as WebSocket Gateway Node
    participant Redis as Redis Cluster (Cache + PubSub)

    Client->>WS: WSS /ws/v1/leaderboard Handshake
    WS->>WS: Authenticate Token (Optional for public viewer)
    WS-->>Client: 101 Switching Protocols (Connection Established)
    
    WS->>Redis: ZREVRANGE leaderboard:global 0 9 WITHSCORES
    Redis-->>WS: Current Top 10
    WS-->>Client: Message: LEADERBOARD_SNAPSHOT

    Note over WS,Redis: Node listens on Pub/Sub channel
    Redis-)WS: Event: LEADERBOARD_UPDATED (debounced)
    WS-->>Client: Message: LEADERBOARD_UPDATED

    loop Keep-Alive Heartbeat (Every 30s)
        Client->>WS: Ping
        WS-->>Client: Pong
    end

    Client->>WS: Close Connection
    WS->>WS: Clean up connection registry
```

---

## 8. Real-Time Broadcast & Throttling Strategy

### 8.1 The "Broadcast Storm" Problem & Solution
If 5,000 score increments happen per second, broadcasting 5,000 WebSocket frames per second to 100,000 clients would generate **500,000,000 messages/sec**, crashing backend networking and freezing browser rendering threads.

### 8.2 Micro-Batching & Sliding Debounce
To solve this, the application server and WebSocket gateway employ a **Throttling Buffer**:
1. **Producer Side (API Workers):** When a score increment occurs, it updates Redis `ZSET` immediately. If the user's score qualifies for Top 10, a flag or event is published.
2. **Aggregator / Debouncer Worker:** Aggregates update events in a **500ms sliding buffer**.
3. **Broadcaster:** Emits at most **1 leaderboard frame per 500ms – 1000ms** per channel.
4. **Result:** Network throughput remains completely linear and predictable regardless of traffic spikes.

```
Incoming Increments (5000/s) ---> [Redis ZSET Instant Update]
                                           |
                                  [500ms Debounce Window]
                                           |
                                           v
WebSocket Broadcast (Max 2 frames/sec) ---> 100,000 Connected Viewers
```

---

## 9. Error Handling & Edge Cases

| Scenario | System Behavior | Recovery / Fallback |
|---|---|---|
| **Redis Node Failure / Failover** | Read/write to Redis temporarily errors. | API falls back to PostgreSQL write with row-level locks (`SELECT FOR UPDATE`). Async background job syncs Redis when healthy. |
| **Network Flapping / Disconnected WS** | Client loses WebSocket connectivity. | Client applies exponential backoff with jitter (1s, 2s, 4s, +rand). Upon reconnect, client immediately requests initial `LEADERBOARD_SNAPSHOT`. |
| **Tied Scores in Top 10** | Two users have the exact same score. | Secondary sorting rule applied: `score DESC, last_action_timestamp ASC` (earlier timestamp ranks higher). |
| **Banned / Flagged User in Top 10** | Cheater detected by anti-cheat worker. | Worker removes user from Redis `ZSET` (`ZREM leaderboard:global <userId>`) and marks `users.is_banned = true`. Immediate Pub/Sub event updates top 10. |
| **Database Write Latency Spike** | PostgreSQL disk queue gets saturated. | Redis handles immediate read/write. DB writes are buffered via durable Queue (Kafka / RabbitMQ / BullMQ) with at-least-once delivery. |

---

## 10. Engineering Implementation Checklist

For the backend engineering team building this service:

- [ ] **Config & Environment:** Setup Redis client (`ioredis`) with connection pooling, retry strategies, and cluster support.
- [ ] **Data Validation:** Implement Zod/Joi validation schemas for all incoming HTTP payloads.
- [ ] **Authentication Middleware:** Verify Bearer JWT and inject `req.user`.
- [ ] **Action Verification Service:** Implement HMAC-SHA256 signature generator & validator for `ActionTicket`.
- [ ] **Idempotency Interceptor:** Redis `SET ... NX EX` middleware on `/api/v1/scores/increment`.
- [ ] **Leaderboard Service:** Encapsulate `ZINCRBY`, `ZREVRANGE`, `ZREVRANK`, and batch user profile hydration.
- [ ] **WebSocket Server:** Setup `ws` / `Socket.io` server with channel-based pub/sub broadcasting and heartbeat pings.
- [ ] **Database Persistence Worker:** Implement transactional audit logging and write-behind score synchronization.
- [ ] **Automated Testing Suite:**
  - Unit tests for ActionTicket validation, idempotency, and ranking algorithms.
  - Integration tests for Redis concurrency, race conditions, and replay attack rejection.
  - Load testing (k6 / Artillery) simulating 10,000 req/s score increments and 50,000 WebSocket subscribers.

---

## 11. Additional Recommendations & Future Improvements

To elevate the system from a solid baseline to an enterprise-grade, highly resilient platform, consider the following engineering improvements:

### 1. Server-Authoritative Action Verification (Zero-Trust Gaming Model)
- **Current Model:** Client notifies server that an action was completed.
- **Improvement:** Move action execution entirely to the server side (e.g., state-machine validation). Instead of `POST /increment`, the client sends `POST /actions/{actionId}/execute` with telemetry or game inputs. The server computes the outcome and awards score, completely eliminating client-side action forgery.

### 2. Event Sourcing & CQRS Architecture
- Implement **Event Sourcing** where every score change is an immutable event (`ScoreIncrementedEvent`).
- The current total score is a materialized read projection derived from the event stream. This guarantees 100% mathematical auditability and allows replaying the leaderboard to any historical point in time.

### 3. Multi-Tier & Partitioned Leaderboards
- As the user base grows, introduce:
  - **Seasonal / Weekly Leaderboards:** `leaderboard:season_2026_q3` (auto-expires with Redis TTL).
  - **Regional / Country Leaderboards:** `leaderboard:country:VN`, `leaderboard:country:SG`.
  - **Friend / Guild Leaderboards:** Subset rankings for personal social engagement.

### 4. Server-Sent Events (SSE) as a Lightweight Alternative for Read-Only Viewers
- For web clients that only need to **view** the leaderboard (and never send messages upstream over the socket), **Server-Sent Events (SSE)** over HTTP/2 are significantly lighter on server memory, bypass firewall WebSocket restrictions, and provide native browser auto-reconnection.

### 5. OpenTelemetry & Prometheus Metrics
- Instrument Prometheus gauges and counters:
  - `scoreboard_increments_total{status="success|conflict|rate_limited"}`
  - `scoreboard_active_websocket_connections`
  - `scoreboard_broadcast_latency_seconds`
  - `redis_command_duration_seconds{command="zincrby|zrevrange"}`

---

*Specification authored by Antigravity Engineering for the 99Tech Code Challenge.*
