# Feature: upgrade-nodejs-v24-and-lts

## 1. End-to-End System Flow

This technical audit and upgrade task transitions all project modules, container configurations, dependencies, and execution environments to **Node.js v24+ LTS** along with the latest LTS ecosystem dependencies (TypeScript 5+, Vite 6, React 18/19, SQLite WAL engine, Express, Zod, and Docker multi-stage builds).

The end-to-end integration and execution flow across updated services is structured as follows:

1. **Development & Host Environment:**
   - Package manifests (`package.json`) in all active sub-projects (`src/problem2`, `src/problem5`) enforce minimum runtime bounds via the `engines` field (`"node": ">=24.0.0"`, `"npm": ">=10.0.0"`).
   - Local toolchains compile modern ECMAScript specifications (ES2022 / ESNext) supported natively by Node.js v24's V8 engine without redundant polyfill bloat.

2. **Container Build Pipeline (Docker Multi-Stage on `node:24-alpine`):**
   - **Frontend (Problem 2 - Currency Swap Form):**
     - **Stage 1 (Builder):** Uses `node:24-alpine` to execute `npm ci`/`install` and compile assets with Vite 6 + TypeScript 5+.
     - **Stage 2 (Runner):** High-performance `nginx:alpine` statically serves the minified bundle with optimized HTTP caching, gzip compression, and security headers.
   - **Backend (Problem 5 - Express TypeScript CRUD Server):**
     - **Stage 1 (Builder):** Uses `node:24-alpine` with native build tools (`python3`, `make`, `g++`) to compile `better-sqlite3` C++ bindings against Node 24 V8 ABI, and runs `tsc` to produce optimized JavaScript.
     - **Stage 2 (Runner):** Lightweight `node:24-alpine` runtime running as an unprivileged `node` user with `sqlite-libs` and persistent SQLite storage in WAL mode.

3. **Runtime Execution & Architecture Alignment (Problem 4 & Problem 6):**
   - **Problem 4 (Three Ways to Sum to n):** Pure algorithmic TypeScript implementations with comprehensive mathematical complexity analysis, verified under Node.js v24+ LTS runtime and Jest test runner.
   - **Problem 6 (Live Scoreboard API Specification):** System architecture updated to reflect high-throughput stateless Node.js v24+ LTS / Go backend workers interfaced with Redis Cluster and PostgreSQL.

---

## 2. Database & Schema Changes

`N/A` (No database schema alterations were required. The underlying SQLite persistence layer in `src/problem5` continues operating with Write-Ahead Logging (`WAL`) mode, fully compatible with Node 24 C++ native bindings).

---

## 3. Technical Optimizations

- **V8 Engine Performance (Node.js v24 LTS):** Upgrading the runtime base image to Node.js v24 brings updated V8 JIT engine optimizations, enhanced garbage collection latency profiles, and improved native cryptographic primitives.
- **Strict Engine Guardrails:** Declared explicit `"engines"` declarations in `package.json` to prevent accidental execution under outdated or unsupported Node versions.
- **Docker Image Layer Caching & Security:** Standardized on `node:24-alpine` for minimal container image surface area, reduced vulnerability scan findings, and accelerated build caching.
- **TypeScript & Native Module Compatibility:** Configured compilation pipelines and build essentials to guarantee seamless ABI compatibility for `better-sqlite3` on Node 24 Alpine Linux.
- **Unified Documentation & Tooling Alignment:** Synchronized tech stack descriptions across root `README.md`, individual problem documentation, and feature guides.

---

## 4. Impacted Files

| File | Change Type | Responsibility |
|---|---|---|
| [`src/problem2/Dockerfile`](file:///Users/tanhn/Projects/99tech-code-challenge/src/problem2/Dockerfile) | Modified | Updated builder stage base image to `node:24-alpine`. |
| [`src/problem2/Dockerfile.dev`](file:///Users/tanhn/Projects/99tech-code-challenge/src/problem2/Dockerfile.dev) | Modified | Updated development container base image to `node:24-alpine`. |
| [`src/problem2/package.json`](file:///Users/tanhn/Projects/99tech-code-challenge/src/problem2/package.json) | Modified | Added `"engines"` specification (`node >= 24.0.0`, `npm >= 10.0.0`). |
| [`src/problem2/README.md`](file:///Users/tanhn/Projects/99tech-code-challenge/src/problem2/README.md) | Modified | Updated Tech Stack section to specify Node.js v24+ LTS and `node:24-alpine`. |
| [`src/problem4/README.md`](file:///Users/tanhn/Projects/99tech-code-challenge/src/problem4/README.md) | Modified | Added Runtime & Testing section specifying Node.js v24+ LTS compatibility. |
| [`src/problem5/Dockerfile`](file:///Users/tanhn/Projects/99tech-code-challenge/src/problem5/Dockerfile) | Modified | Updated both builder and runner stages to `node:24-alpine`. |
| [`src/problem5/package.json`](file:///Users/tanhn/Projects/99tech-code-challenge/src/problem5/package.json) | Modified | Added `"engines"` specification (`node >= 24.0.0`, `npm >= 10.0.0`). |
| [`src/problem5/README.md`](file:///Users/tanhn/Projects/99tech-code-challenge/src/problem5/README.md) | Modified | Updated runtime and containerization specification to Node.js v24+ LTS and `node:24-alpine`. |
| [`src/problem6/README.md`](file:///Users/tanhn/Projects/99tech-code-challenge/src/problem6/README.md) | Modified | Updated application server cluster diagram and runtime specification to Node.js v24+ LTS. |
| [`README.md`](file:///Users/tanhn/Projects/99tech-code-challenge/README.md) | Modified | Refined root repository Tech Stack Overview, Prerequisites, and Problem 4 challenge descriptions. |
| [`docs/features/upgrade-nodejs-v24-and-lts.md`](file:///Users/tanhn/Projects/99tech-code-challenge/docs/features/upgrade-nodejs-v24-and-lts.md) | New | Dedicated feature documentation compliant with repository governance rules. |
