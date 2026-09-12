# 99Tech Code Challenge - Full-Stack Engineer

This repository contains my submission for the Full-Stack Engineer technical challenge at **99Tech**. Each challenge is organized in its respective directory with dedicated documentation and setup instructions.

---

## 📂 Challenges Overview

| #             | Challenge                             | Focus Area                           | Status    | Documentation                      |
| ------------- | ------------------------------------- | ------------------------------------ | --------- | ---------------------------------- |
| **Problem 2** | Fancy Form (Currency Swap)            | Frontend / UI / State Management     | Completed | [README](./src/problem2/README.md) |
| **Problem 4** | Three ways to sum to $n$              | Algorithms / TypeScript / Complexity | Completed | [README](./src/problem4/README.md) |
| **Problem 5** | A Crude Server                        | Backend API / CRUD / Architecture    | Completed | [README](./src/problem5/README.md) |
| **Problem 6** | Architecture Specification            | System Design / Security / Real-time | Completed | [README](./src/problem6/README.md) |

---

## 🛠 Tech Stack Overview

- **Runtime & Environment:** Node.js (v24+ LTS) & TypeScript (v5+)
- **Frontend:** React 18, Vite 6, Custom Vanilla CSS Design System, Lucide Icons
- **Backend:** Express.js, SQLite with WAL Mode (`better-sqlite3`), Zod validation, Helmet, CORS, Morgan
- **Architecture & System Design:** Distributed Redis Cluster, WebSocket / SSE, PostgreSQL, Zero-Trust Action Tickets
- **Tooling & Containerization:** Docker (`node:24-alpine`), Docker Compose, Jest, Supertest

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v24+ LTS recommended)
- [Docker](https://www.docker.com/) & Docker Compose (optional, if running containerized services)
- Package Manager: `npm`, `yarn`, or `pnpm`

### Repository Structure

```text
.
├── README.md                 # Root documentation (this file)
├── src/
│   ├── problem2/             # Interactive currency swap application
│   │   └── README.md
│   ├── problem4/             # Algorithm implementations (Three ways to sum to n)
│   │   └── README.md
│   ├── problem5/             # Backend service & CRUD APIs
│   │   └── README.md
│   └── problem6/             # System architecture & execution flow diagram
└── ...
```
