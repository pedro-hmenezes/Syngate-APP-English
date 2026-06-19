# Syngate — Backend

**Syngate Application Backend Repository:**
*Physical Access Control System with IoT Integration*

---

*Capstone Project for Class 43 at Senac Pernambuco College.*

### Main Framework & Environment
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

### Database & Cache
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

### Infrastructure & Observability
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

### Validation, Tools & Documentation
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black) ![Scalar](https://img.shields.io/badge/Scalar-101827?style=for-the-badge&logo=openapiinitiative&logoColor=white) ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

---

## Overview

This repository contains the source code for the backend of the **Syngate** application, a modular **RESTful API** designed to manage physical access control in institutional environments with IoT hardware integration (ESP32 + RFID/NFC).

The system authenticates users via RFID cards, validates time shifts and access profiles in real-time, records audit logs, and emits events via Socket.IO to the web dashboard.

**Live API:** [https://syngate-api.onrender.com](https://syngate-api.onrender.com)

**Interactive Documentation:** available only in the local environment at `http://localhost:3333/docs` (Scalar) and `http://localhost:3333/swagger` (Swagger UI). Disabled in production for security reasons.

---

## Syngate Ecosystem

The application is divided into three modular and integrated components. Browse the repositories to explore each layer of the system:

| Component | Repository | Technical Scope |
| --- | --- | --- |
| **Backend API** | [syngate-backend](https://github.com/Molimpion/syngate-backend) | RESTful API, business rules (RBAC), WebSockets, and persistence. |
| **Web Frontend** | [syngate-frontend](https://github.com/Molimpion/syngate-frontend) | Administrative interface, consumption charts, and real-time monitoring. |
| **IoT Hardware** | [syngate-iot](https://github.com/Molimpion/syngate-iot) | C++ firmware for ESP32, ultrasonic sensor, and secure RFID reading. |

---

## Architecture & Design Decisions

The application follows a **Module**-based architecture, separating logical domains to maximize maintainability, with a clear separation between `schemas`, `middlewares`, `services`, and `controllers`.

```text
src/
├── config/          # Swagger and Scalar
├── lib/             # Prisma, Redis, and Socket.IO Clients
├── modules/         # Domains: access, auth, devices, reports, rooms, shifts, users
├── schemas/         # Zod validation per domain
└── shared/
    ├── middlewares/ # Auth JWT, Device, Rate Limit, Role, Validate, Error
    ├── types/       # Global types and Express augmentations
    └── utils/       # Utilities: device-key, events, hash, shift-validator

```

**Relevant technical decisions:**

* **Dual authentication:** users via JWT (Bearer token, 15min) + rotating refresh token (7 days, SHA-256 hash in DB); IoT devices via headers `x-device-mac` + `x-device-key` (SHA-256), no JWT.
* **Rate limiting:** global via Redis (100 req/15min); auth endpoints have their own limit (10 req/15min).
* **Token blacklist:** logout invalidates the access token immediately via Redis with a TTL equal to the remaining time.
* **Shift validation:** supports night shifts crossing midnight; times stored in minutes since midnight.
* **Report caching:** dashboard cached in Redis for 5 minutes.
* **Soft delete:** deactivated users have `ativo = false`, preserving data and logs.
* **Protected documentation:** Swagger/Scalar disabled when `NODE_ENV=production`.

---

## Production Infrastructure

| Service | Provider | Note |
| --- | --- | --- |
| API (Node.js) | Render (Web Service) | Free tier — hibernates after 15min of inactivity |
| Database | Neon (PostgreSQL 18) | Region: São Paulo |
| Cache | Upstash (Redis) | Region: São Paulo — 500k commands/month |

---

## Getting Started (Local Development)

### Prerequisites

* Git
* Docker and Docker Compose
* Node.js v18 or higher

### Initialization

1. Clone the repository
2. Create the `.env` file based on `.env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/syngate"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="generate_a_strong_secret_key"
PORT=3333
NODE_ENV=development

```

3. Spin up the local services (PostgreSQL + Redis):

```bash
npm run services:up

```

4. Install dependencies and apply migrations:

```bash
npm install
npx prisma generate
npx prisma migrate dev

```

5. Start the server:

```bash
npm run dev

```

The server will be available at `http://localhost:3333`.

The interactive documentation will be available at `http://localhost:3333/docs`.

---

## 5. Database Seeding

```bash
npx prisma db seed

```

---

## Environment Variables

| Variable | Description | Required |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `JWT_SECRET` | JWT signature key | ✅ (no fallback — API will not start without it) |
| `PORT` | Server port | ✅ |
| `NODE_ENV` | `development` or `production` | ✅ |
| `ALLOWED_ORIGINS` | Allowed CORS origins (comma-separated) | ❌ (default: `*`) |

---

## Authentication

### Users (Web Dashboard)

All administrative routes require `Authorization: Bearer <accessToken>`.

Available roles: `ALUNO`, `PROFESSOR`, `FUNCIONARIO`, `COORDENADOR`, `GESTOR`, `VISITANTE`.

Routes restricted to `GESTOR` and `COORDENADOR`: creation/editing of users, devices, rooms, and shifts.

### IoT Devices (ESP32)

The `POST /api/v1/access` endpoint **does not accept JWT**. It authenticates exclusively via:

```text
x-device-mac: AA:BB:CC:DD:EE:FF
x-device-key: <raw key generated during provisioning>

```

The raw key is displayed **only once** at the time of provisioning — it must be flashed into the firmware immediately.

---

## Endpoints

### System

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | API health check |

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/cadastro` | User registration (e-mail requires verification) |
| `GET` | `/verificar-email` | Activates the account via e-mail token |
| `POST` | `/login` | Login — returns access token + refresh token |
| `POST` | `/refresh` | Renews tokens (refresh token is rotated) |
| `POST` | `/logout` | Invalidates the access token via Redis blacklist |

### Users (`/api/v1/users`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/me` | Authenticated user profile | Authenticated |
| `GET` | `/` | Paginated user list | GESTOR / COORDENADOR |
| `POST` | `/` | Creates user administratively | GESTOR / COORDENADOR |
| `GET` | `/:id` | Fetches user by ID | GESTOR / COORDENADOR |
| `PUT` | `/:id` | Updates user data | GESTOR / COORDENADOR |
| `DELETE` | `/:id` | Deactivates user (soft delete) | GESTOR / COORDENADOR |
| `PATCH` | `/:id/cartao` | Links / unlinks RFID card | GESTOR / COORDENADOR |

### Rooms (`/api/v1/rooms`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/` | Paginated room list | Authenticated |
| `POST` | `/` | Creates room | GESTOR / COORDENADOR |
| `GET` | `/:id` | Fetches room by ID | Authenticated |
| `PUT` | `/:id` | Updates room | GESTOR / COORDENADOR |
| `DELETE` | `/:id` | Removes room | GESTOR / COORDENADOR |

### Shifts (`/api/v1/shifts`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/` | Paginated shift list | Authenticated |
| `POST` | `/` | Creates shift | GESTOR / COORDENADOR |
| `GET` | `/:id` | Fetches shift by ID | Authenticated |
| `PUT` | `/:id` | Updates shift | GESTOR / COORDENADOR |
| `DELETE` | `/:id` | Removes shift | GESTOR / COORDENADOR |

### IoT Devices (`/api/v1/devices`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/` | Paginated device list | GESTOR / COORDENADOR |
| `POST` | `/` | Provisions device and generates key | GESTOR / COORDENADOR |
| `GET` | `/:id` | Fetches device by ID | GESTOR / COORDENADOR |
| `PUT` | `/:id` | Updates device | GESTOR / COORDENADOR |
| `DELETE` | `/:id` | Removes device | GESTOR / COORDENADOR |

### Physical Access Validation (`/api/v1/access`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/` | Validates RFID card, logs event, and emits Socket.IO event | IoT Device |

### Reports (`/api/v1/reports`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/stats` | Consolidated dashboard statistics (Redis Cache 60s) | GESTOR / COORDENADOR |
| `GET` | `/dashboard` | Access aggregation (Redis Cache 5min) | GESTOR / COORDENADOR |
| `GET` | `/export/csv` | Exports history as CSV | GESTOR / COORDENADOR |

---

## Socket.IO Events

| Event | Triggered by | Purpose |
| --- | --- | --- |
| `access:new` | `POST /api/v1/access` | Notifies in real-time any physical access attempt (granted or denied). The authorization status is returned within the event payload. |

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

```

Current coverage: unit tests (`shift-validator`) and security tests (`auth`).

---

## Hardware Integration (ESP32)

The board's firmware reads the RFID card UID via the MFRC522 sensor, detects presence via the HC-SR04 ultrasonic sensor, and calls `POST /api/v1/access` with hardware header authentication.

The device must be provisioned via the API before operating — the `POST /api/v1/devices` endpoint generates the `rawKey` that is flashed into the firmware.

> **Note:** Render's free tier hibernates after 15 minutes of inactivity. The first request after hibernation may take up to 30 seconds.

---

## Contribution & Quality Guidelines (DX)

### Commit Standardization

This project uses **Husky** and **Commitlint** to ensure history traceability. All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

> `feat: adds report route`
> `fix: fixes night shift validation`

### Dynamic Auditing (AI Agents)

To ensure architecture health, the project features specialized prompts for local Artificial Intelligence tools located in `.agents/skills/`. During development, use slash commands (e.g., `/architecture-audit`, `/security-audit`, `/database-architect-audit`) in your IDE to run integrity checks.

| Agent Skill | Main Goal |
| --- | --- |
| **API Architect Audit** | Validates REST endpoint design, OpenAPI/Swagger, and HTTP status standardization. |
| **Architecture Audit** | Ensures strict separation of concerns (SOLID and Clean Architecture) between Controllers and Services. |
| **Database Architect Audit** | Analyzes the Prisma schema looking for normalization gaps, missing indexes, and N+1 queries. |
| **Observability Lead Audit** | Checks structured logs, unhandled error catching, and possible sensitive data exposure. |
| **Performance Audit** | Focused on high concurrency, identifies asynchronous bottlenecks and memory leaks. |
| **Security Audit** | Deep vulnerability scan (XSS, IDOR, Secrets) based on the exact versions in `package.json` and lockfile. |
| **Testing Lead Audit** | Evaluates true coverage, test fragility, and the testing pyramid balance. |

### Support Tools

In case it is necessary to perform an emergency reset of local environment passwords, run the break-glass utility included in the repository:

```bash
npx tsx reset-senha.ts

```

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
