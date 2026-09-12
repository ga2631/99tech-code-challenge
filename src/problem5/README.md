# Problem 5: ExpressJS TypeScript CRUD Server

A production-grade, extensible RESTful backend service built with **Express.js**, **TypeScript**, and **SQLite** for robust data persistence. Features layered clean architecture, parameter validation using **Zod**, flexible dynamic filtering, pagination, sorting, centralized error handling, automated integration tests, and Docker containerization.

---

## 🌟 Features

- **Full-Featured CRUD Interface:**
  - **Create:** Add new resources with strict schema validation and auto-generated UUIDs.
  - **List & Filter:** Query resources with multi-field search, exact category match, status filter, price range bounds (`minPrice`, `maxPrice`), sorting, and pagination metadata.
  - **Get Details:** Fetch individual resource details by ID.
  - **Update Details:** Safe partial and complete updates with validation.
  - **Delete:** Remove resources with confirmation and automatic cascade cleanups.
- **Data Persistence:** Embedded SQLite with Write-Ahead Logging (`WAL`) mode for optimal I/O throughput and zero external database setup requirements.
- **Type Safety & Validation:** End-to-end TypeScript types and runtime request body/query/param parsing via **Zod**.
- **Clean Layered Architecture:** Strict separation of concerns (Routes $\rightarrow$ Middlewares $\rightarrow$ Controllers $\rightarrow$ Services $\rightarrow$ Repositories $\rightarrow$ Database).
- **Comprehensive Test Suite:** Automated integration testing using **Jest** and **Supertest** covering positive, negative, and edge test cases.
- **Production Ready:** Security headers via `helmet`, configurable CORS, HTTP logging via `morgan`, graceful shutdown hooks (`SIGINT`/`SIGTERM`), and multi-stage Docker builds.

---

## 🛠 Tech Stack

| Component | Technology |
|---|---|
| **Runtime & Language** | Node.js (v18+) & TypeScript (v5+) |
| **Web Framework** | Express.js |
| **Database & Driver** | SQLite via `better-sqlite3` (WAL Mode enabled) |
| **Validation** | Zod |
| **Security & Utilities** | Helmet, CORS, Morgan, dotenv, UUID |
| **Testing** | Jest, Supertest, ts-jest |
| **Containerization** | Docker, Docker Compose |

---

## 📁 Directory Structure

```text
src/problem5/
├── src/
│   ├── config/             # Environment variable loader & typed defaults
│   │   └── index.ts
│   ├── controllers/        # HTTP Request Handlers & Response mapping
│   │   └── resourceController.ts
│   ├── database/           # SQLite connection lifecycle & schema migrations
│   │   ├── db.ts
│   │   └── seed.ts         # Sample data seeding script
│   ├── middlewares/        # Error handlers, CORS, 404 handler
│   │   └── errorHandler.ts
│   ├── repositories/       # Data Access Layer & parameterized SQL queries
│   │   └── resourceRepository.ts
│   ├── routes/             # REST Route definitions
│   │   └── resourceRoutes.ts
│   ├── services/           # Business logic & Domain error triggers
│   │   └── resourceService.ts
│   ├── types/              # Domain models, DTOs & API response interfaces
│   │   └── resource.ts
│   ├── validators/         # Zod schemas & request validation middleware
│   │   └── resourceValidator.ts
│   ├── app.ts              # Express App factory
│   └── server.ts           # HTTP Server bootstrap & graceful shutdown
├── tests/                  # Integration tests
│   └── resource.test.ts
├── data/                   # Persistent SQLite database file directory
├── Dockerfile              # Multi-stage production container build
├── docker-compose.yml      # Standalone Docker Compose file
├── jest.config.ts          # Jest configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
├── .env.example            # Environment variable template
└── README.md               # Documentation (this file)
```

---

## ⚙️ Configuration & Environment Variables

Copy `.env.example` to `.env` or adjust configuration parameters:

```bash
cp .env.example .env
```

| Variable | Description | Default Value |
|---|---|---|
| `PORT` | HTTP Server port | `3000` |
| `NODE_ENV` | Application environment (`development`, `production`, `test`) | `development` |
| `API_PREFIX` | REST API routing prefix | `/api/v1` |
| `DB_PATH` | Path to SQLite database file (or `:memory:`) | `data/database.sqlite` |
| `CORS_ORIGIN` | Allowed CORS origins | `*` |

---

## 🚀 Running the Application

### Option A: Local Development (Node.js)

1. **Navigate to the problem directory:**
   ```bash
   cd src/problem5
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **(Optional) Seed sample data:**
   ```bash
   npm run seed
   ```

4. **Start the development server with live reload:**
   ```bash
   npm run dev
   ```

5. **Build and run for production:**
   ```bash
   npm run build
   npm start
   ```

The server will be available at `http://localhost:3000`.

---

### Option B: Docker / Docker Compose

#### Standalone Problem 5 Container:
```bash
cd src/problem5
docker compose up --build -d
```

#### Monorepo Root Orchestration:
```bash
# From the repository root
docker compose up problem5 --build -d
```

---

## 🧪 Running Automated Tests

Run the integration test suite using Jest:

```bash
cd src/problem5
npm test
```

To run tests in watch mode during development:
```bash
npm run test:watch
```

---

## 📚 API Reference & cURL Examples

Base URL: `http://localhost:3000/api/v1`

### 1. Healthcheck
- **Endpoint:** `GET /health`
- **Description:** Verifies server uptime and status.

```bash
curl -X GET http://localhost:3000/health
```

**Response (200 OK):**
```json
{
  "status": "UP",
  "timestamp": "2026-09-12T14:40:00.000Z",
  "uptime": 45.2,
  "environment": "development"
}
```

---

### 2. Create Resource
- **Endpoint:** `POST /api/v1/resources`
- **Body Schema:**
  - `title` (string, required, 1-255 chars)
  - `category` (string, required, 1-100 chars)
  - `price` (number $\ge 0$, required)
  - `description` (string, optional)
  - `status` (`"draft"` | `"active"` | `"archived"`, default: `"active"`)
  - `stock` (integer $\ge 0$, default: `0`)

```bash
curl -X POST http://localhost:3000/api/v1/resources \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Logitech MX Master 3S",
    "description": "Ergonomic wireless performance mouse with 8K DPI sensor",
    "category": "electronics",
    "price": 99.99,
    "status": "active",
    "stock": 25
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "e4b2d37f-94ad-4d1a-8c8d-3c6f112e4f50",
    "title": "Logitech MX Master 3S",
    "description": "Ergonomic wireless performance mouse with 8K DPI sensor",
    "category": "electronics",
    "price": 99.99,
    "status": "active",
    "stock": 25,
    "createdAt": "2026-09-12T14:40:00.000Z",
    "updatedAt": "2026-09-12T14:40:00.000Z"
  },
  "message": "Resource created successfully"
}
```

---

### 3. List Resources with Filters & Pagination
- **Endpoint:** `GET /api/v1/resources`
- **Query Parameters:**
  - `search`: Case-insensitive keyword matching in `title` or `description`.
  - `category`: Exact category match (e.g. `electronics`, `books`).
  - `status`: Status filter (`draft`, `active`, `archived`).
  - `minPrice` / `maxPrice`: Numerical price range filter.
  - `sortBy`: Field to sort by (`createdAt`, `updatedAt`, `price`, `title`, `stock`).
  - `sortOrder`: `asc` or `desc` (default: `desc`).
  - `page`: Page number (default: `1`).
  - `limit`: Items per page (default: `10`, max: `100`).

#### Example: Search electronics under $200 sorted by price ascending:
```bash
curl -X GET "http://localhost:3000/api/v1/resources?category=electronics&maxPrice=200&sortBy=price&sortOrder=asc&page=1&limit=5"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "e4b2d37f-94ad-4d1a-8c8d-3c6f112e4f50",
      "title": "Logitech MX Master 3S",
      "description": "Ergonomic wireless performance mouse with 8K DPI sensor",
      "category": "electronics",
      "price": 99.99,
      "status": "active",
      "stock": 25,
      "createdAt": "2026-09-12T14:40:00.000Z",
      "updatedAt": "2026-09-12T14:40:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 4. Get Resource Details
- **Endpoint:** `GET /api/v1/resources/:id`

```bash
curl -X GET http://localhost:3000/api/v1/resources/e4b2d37f-94ad-4d1a-8c8d-3c6f112e4f50
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "e4b2d37f-94ad-4d1a-8c8d-3c6f112e4f50",
    "title": "Logitech MX Master 3S",
    "description": "Ergonomic wireless performance mouse with 8K DPI sensor",
    "category": "electronics",
    "price": 99.99,
    "status": "active",
    "stock": 25,
    "createdAt": "2026-09-12T14:40:00.000Z",
    "updatedAt": "2026-09-12T14:40:00.000Z"
  }
}
```

---

### 5. Update Resource Details
- **Endpoint:** `PUT /api/v1/resources/:id` or `PATCH /api/v1/resources/:id`

```bash
curl -X PUT http://localhost:3000/api/v1/resources/e4b2d37f-94ad-4d1a-8c8d-3c6f112e4f50 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 89.99,
    "stock": 40
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "e4b2d37f-94ad-4d1a-8c8d-3c6f112e4f50",
    "title": "Logitech MX Master 3S",
    "description": "Ergonomic wireless performance mouse with 8K DPI sensor",
    "category": "electronics",
    "price": 89.99,
    "status": "active",
    "stock": 40,
    "createdAt": "2026-09-12T14:40:00.000Z",
    "updatedAt": "2026-09-12T14:45:12.000Z"
  },
  "message": "Resource updated successfully"
}
```

---

### 6. Delete Resource
- **Endpoint:** `DELETE /api/v1/resources/:id`

```bash
curl -X DELETE http://localhost:3000/api/v1/resources/e4b2d37f-94ad-4d1a-8c8d-3c6f112e4f50
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Resource with ID 'e4b2d37f-94ad-4d1a-8c8d-3c6f112e4f50' deleted successfully"
}
```

---

## 🛑 Error Handling Schema

All error responses adhere to a consistent structure:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "price",
        "message": "Price must be greater than or equal to 0"
      }
    ]
  }
}
```

| HTTP Status | Error Code | Description |
|---|---|---|
| `400 Bad Request` | `VALIDATION_ERROR` | Request body or query parameters failed schema validation |
| `400 Bad Request` | `INVALID_JSON` | Malformed JSON in request payload |
| `404 Not Found` | `NOT_FOUND` | Resource with the specified ID does not exist |
| `404 Not Found` | `ROUTE_NOT_FOUND` | Endpoint does not match any registered route |
| `500 Internal Error`| `INTERNAL_SERVER_ERROR`| Unhandled server exception |
