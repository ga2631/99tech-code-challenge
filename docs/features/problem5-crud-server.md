# Feature: problem5-crud-server

## 1. End-to-End System Flow
This feature implements a complete, production-ready backend service utilizing **Express.js**, **TypeScript**, and **SQLite** for the **99Tech Code Challenge - Problem 5**.

The end-to-end execution flow operates across the following layers:
1. **Client / HTTP Ingress Layer:**
   - External clients (web apps, mobile apps, or cURL requests) communicate via HTTP REST endpoints under `/api/v1/resources` or `/health`.
   - Security headers are applied automatically by `helmet`, while `cors` middleware validates and allows cross-origin requests.
2. **Routing & Validation Layer:**
   - Requests are routed to `src/routes/resourceRoutes.ts`.
   - Before reaching controllers, incoming request payloads (body, query parameters, path params) are intercepted and parsed by `src/validators/resourceValidator.ts` using **Zod**.
   - Invalid payloads immediately trigger a structured `400 Bad Request` with exact field error details, protecting downstream layers from malformed data.
3. **Controller & Serialization Layer (`src/controllers/resourceController.ts`):**
   - Controllers unpack sanitized inputs from requests and invoke corresponding business methods on `src/services/resourceService.ts`.
   - Service outputs are formatted into standardized JSON responses (`ApiResponse<T>`) including HTTP status codes (`201 Created`, `200 OK`, `404 Not Found`).
4. **Service & Business Logic Layer (`src/services/resourceService.ts`):**
   - Contains core business rules, entity validations, and maps database existence checks to typed domain errors (`NotFoundError`, `BadRequestError`).
5. **Data Access & Persistence Layer (`src/repositories/resourceRepository.ts`):**
   - Directly executes parameterized SQL queries against the embedded **SQLite** engine (`better-sqlite3`).
   - Handles multi-criteria filtering (`search`, `category`, `status`, `minPrice`, `maxPrice`), sorting, and SQL-level pagination (`LIMIT` / `OFFSET`).
   - Automatically maintains `createdAt` and `updatedAt` ISO timestamps and assigns UUID primary keys.
6. **Error Interception Layer (`src/middlewares/errorHandler.ts`):**
   - Centralized middleware catches synchronous and asynchronous errors across the application stack, transforming them into clean, predictable error payloads without leaking sensitive stack traces in production.

---

## 2. Database & Schema Changes
An embedded relational SQLite schema was created in `data/database.sqlite` (or in-memory `:memory:` during testing):

### Table: `resources`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Unique identifier (UUID v4) |
| `title` | `TEXT` | `NOT NULL` | Resource name / title |
| `description` | `TEXT` | `NULLABLE` | Detailed description |
| `category` | `TEXT` | `NOT NULL` | Lowercase category label |
| `price` | `REAL` | `NOT NULL`, `CHECK (price >= 0)` | Resource price |
| `status` | `TEXT` | `NOT NULL DEFAULT 'active'`, `CHECK (status IN ('draft', 'active', 'archived'))` | Lifecycle status |
| `stock` | `INTEGER` | `NOT NULL DEFAULT 0`, `CHECK (stock >= 0)` | Available inventory count |
| `createdAt` | `TEXT` | `NOT NULL` | ISO 8601 creation timestamp |
| `updatedAt` | `TEXT` | `NOT NULL` | ISO 8601 update timestamp |

### Indexes
- `idx_resources_category` on `resources(category)`: Optimizes category filtering queries.
- `idx_resources_status` on `resources(status)`: Optimizes status filtering.
- `idx_resources_price` on `resources(price)`: Accelerates price range queries (`minPrice`, `maxPrice`).
- `idx_resources_createdAt` on `resources(createdAt)`: Accelerates default chronological sorting and pagination.

---

## 3. Technical Optimizations
- **SQLite WAL (Write-Ahead Logging) Mode:** Configured `PRAGMA journal_mode = WAL` to allow concurrent readers while a write is occurring, maximizing read and write throughput.
- **Strict Parameterized Queries:** All repository SQL statements use named (`@param`) or positional (`?`) parameters, completely preventing SQL injection vulnerabilities.
- **Memory Safety & Streamlined Payloads:** Body parsers enforce a strict `1MB` payload limit to protect against denial-of-service memory exhaustion attacks.
- **Optimized SQL Pagination & Index Usage:** `LIMIT` and `OFFSET` queries run alongside indexed fields to guarantee efficient lookups even with thousands of records.
- **Fail-Fast Runtime Validation:** Runtime schema parsing via Zod stops invalid requests before any database connections or business logic are executed.
- **Graceful Process Lifecycle:** `SIGINT` and `SIGTERM` signals close active HTTP connections and cleanly close SQLite database handles to prevent database corruption.

---

## 4. Impacted Files
- `src/problem5/package.json`: Project manifest, scripts, and production/dev dependencies.
- `src/problem5/tsconfig.json`: Strict TypeScript compiler settings targeting modern ES2022.
- `src/problem5/jest.config.ts`: Automated test framework configuration.
- `src/problem5/.env.example` & `src/problem5/.env`: Environment variable templates and defaults.
- `src/problem5/.gitignore`: Source control rules ignoring `node_modules`, `dist`, and database files.
- `src/problem5/src/types/resource.ts`: TypeScript domain models, DTOs, query filters, and response contracts.
- `src/problem5/src/config/index.ts`: Typed environment variable loader.
- `src/problem5/src/database/db.ts`: SQLite database connection lifecycle, schema initialization, and WAL mode configuration.
- `src/problem5/src/database/seed.ts`: Seed script populating initial sample data for demonstration.
- `src/problem5/src/validators/resourceValidator.ts`: Zod validation schemas and request validation middleware.
- `src/problem5/src/repositories/resourceRepository.ts`: Data access layer executing safe SQL queries with dynamic filters.
- `src/problem5/src/services/resourceService.ts`: Business logic layer and domain error definitions.
- `src/problem5/src/controllers/resourceController.ts`: Express controllers mapping HTTP requests to responses.
- `src/problem5/src/middlewares/errorHandler.ts`: Global error handler and 404 middleware.
- `src/problem5/src/routes/resourceRoutes.ts`: REST route declarations.
- `src/problem5/src/app.ts`: Express application factory.
- `src/problem5/src/server.ts`: Server entry point with shutdown listeners.
- `src/problem5/tests/resource.test.ts`: Integration test suite covering all CRUD endpoints, filters, pagination, and error cases.
- `src/problem5/Dockerfile`: Multi-stage build container specification.
- `src/problem5/docker-compose.yml`: Standalone container orchestration configuration.
- `src/problem5/README.md`: Complete problem documentation, setup instructions, and cURL examples.
- `docker-compose.yml`: Updated root Docker Compose orchestration.
- `docs/features/problem5-crud-server.md`: Dedicated technical documentation for Problem 5.
