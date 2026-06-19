# Syngate — Web Frontend

**Syngate Application Frontend Repository:**
*Administrative Management and Physical Access Monitoring Dashboard*

---

*Capstone Project for Class 43 at Senac Pernambuco College.*

### Ecosystem & UI
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white)

### State & Data Management
![TanStack Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white) ![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white) ![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

### Tools & Observability
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white) ![Recharts](https://img.shields.io/badge/Recharts-22B573?style=for-the-badge&logo=recharts&logoColor=white)

---

## Overview

This repository contains the source code for the **Syngate** application's web dashboard. It serves as the main interface for coordinators and managers to administer users, IoT devices, rooms, academic shifts, and monitor the flow of physical access in real-time.

The system was developed using **Next.js (App Router)** and consumes data from the Syngate RESTful API, operating under an internal proxy architecture to maximize security.

---

## Syngate Ecosystem

The application is divided into three modular and integrated components. Browse the repositories to explore each layer of the system:

| Component | Repository | Technical Scope |
| --- | --- | --- |
| **Backend API** | [syngate-backend](https://github.com/Molimpion/syngate-backend) | RESTful API, business rules (RBAC), WebSockets, and persistence. |
| **Web Frontend** | [syngate-frontend](https://github.com/Molimpion/syngate-frontend) | Administrative interface, consumption charts, and real-time monitoring. |
| **IoT Hardware** | [syngate-iot](https://github.com/Molimpion/syngate-iot) | C++ firmware for ESP32, ultrasonic sensor, and secure RFID reading. |

---

## Architecture & Security Decisions (BFF)

To mitigate vulnerabilities such as XSS (Cross-Site Scripting) and token theft, this application implements the **BFF (Backend For Frontend)** pattern.

1. **Credential Isolation:** The JWT token (`syngate_token`) is never stored in the browser's `localStorage`. It resides exclusively in an `HttpOnly` and `Secure` cookie.
2. **Proxy Routes:** The client (React) does not make direct requests to the external API. All calls (via `apiFetch`) are routed to the Next.js *API Routes* located in `src/app/api/...`.
3. **Transparent Injection:** The Node.js server (Next.js) intercepts the call, attaches the cookie's JWT to the `Authorization` header, and forwards (proxies) it to the real backend (`API_URL`), returning the response to the frontend.

### Directory Structure

```text
src/
├── actions/         # Server Actions (Authentication, Login, Logout)
├── app/             # Application routes (App Router)
│   ├── (auth)/      # Public screens (Login, Email Verification)
│   ├── (dashboard)/ # Protected administrative dashboard
│   └── api/         # Proxy Routes (BFF) to the backend
├── components/      # UI Components (Shadcn) and domain fragments
├── hooks/           # Custom Hooks (useSession, useSocket, useDashboardStats)
├── lib/             # Utility clients (Fetch wrapper, QueryClient)
├── services/        # HTTP call abstractions organized by domain
└── types/           # TypeScript Types and Enums

```

---

## Features & Access Control (RBAC)

The navigation menu and routes are actively protected based on the role (`PapelUsuario`) decoded from the JWT:

| Feature | Description | Allowed Access Levels |
| --- | --- | --- |
| **Dashboard** | Consolidated metrics, charts (Recharts), and real-time access feed via WebSocket. | All |
| **Profile** | View personal data and password change. | All |
| **Users** | User CRUD, soft delete, and linking RFID tags/cards to the profile. | `GESTOR`, `COORDENADOR` |
| **Shifts** | Definition of block/release times and weekday rules. | `GESTOR`, `COORDENADOR` |
| **Rooms** | Management of blocks and physical environments integrated with hardware. | `GESTOR`, `COORDENADOR` |
| **Devices** | ESP32 (Turnstiles/Readers) registration and cryptographic key (`rawKey`) provisioning. | `GESTOR`, `COORDENADOR` |
| **Reports** | Advanced audit filters and log export in `.csv` format. | `GESTOR`, `COORDENADOR` |

---

## Getting Started (Local Development)

### Prerequisites

* Node.js v18 or higher
* Syngate backend running locally (or pointing to the staging URL)

### Initialization

1. Clone the repository
2. Install the dependencies:

```bash
npm install

```

3. Create the `.env` file in the root of the project with the following variables:

```env
# Node.js API URL (Backend) - Used by the server's Proxy routes
API_URL="http://localhost:3333/api/v1"

# Optional if using next.config.ts rewrites
NEXT_PUBLIC_API_URL="http://localhost:3333/api/v1"

# Socket.io server URL for real-time monitoring
NEXT_PUBLIC_SOCKET_URL="http://localhost:3333"

```

4. Start the development server:

```bash
npm run dev

```

The application will be available at `http://localhost:3000`.

---

## Real-Time Integration (WebSocket)

Real-time communication to feed the Dashboard's **Access Flow** is done through the custom `useSocket.ts` hook.

* The connection is established via packet transport using `socket.io-client`.
* The client listens to the `access:new` event to populate the interface (AnimatePresence with Framer Motion).
* **Important:** The socket connection uses `withCredentials: true` so the `syngate_token` cookie can be read by the backend gateway, allowing only authenticated connections.

---

## Contribution & Quality Guidelines (DX)

### Commit Standardization

This project uses **Husky** and **Commitlint** to ensure clarity and traceability of the Git history. All commits must be written following the [Conventional Commits](https://www.conventionalcommits.org/) standard:

> **Valid examples:**
> `feat: adds input mask to the shifts form`
> `fix: fixes cross-validation of passwords in the profile`
> `ui: updates dark theme primary color`

### Styling & Design System

Styling is based entirely on **Tailwind CSS v4** (via the `@tailwindcss/postcss` plugin) with design variables controlled in `src/styles/globals.css`.
Visual componentization follows the **Shadcn UI** philosophy (located in the `src/components/ui` folder), focusing on accessibility (Radix UI) and direct control over the component code.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
