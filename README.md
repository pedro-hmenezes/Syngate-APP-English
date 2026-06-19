# Syngate App

> **Abstract:** Syngate is an intelligent access control system leveraging IoT, Cloud Computing, and Edge processing. Designed to solve physical access limitations in academic environments, the MVP utilizes an ESP32 microcontroller, RFID authentication, and ultrasonic sensors to validate user entry. Connected to a RESTful Node.js API and a PostgreSQL database, the system ensures secure, automated, and fail-safe access management while adhering to data privacy principles.

## Repository & Live Links

* **Back-End Repository:** [Syngate-BackEnd](https://github.com/Molimpion/Syngate-BackEnd)
* **Front-End Repository:** [syngate-frontend](https://github.com/Molimpion/syngate-frontend)
* **IoT Repository:** [Syngate-IOT](https://github.com/Molimpion/Syngate-IOT)
* **Presentation (Slides):** [Access Presentation](https://github.com/Molimpion/Syngate-IOT/blob/main/docs/presentation/slide.pdf)
* **Live Solution:** [Access Web Platform](https://syngate-frontend.vercel.app/login)
* **Documentation & Management:** [Kanban Board (GitHub Projects)](https://github.com/users/Molimpion/projects/1)

---

## 1. Project & Team Identification

* **Project Name:** Syngate

**Team:**
* Pedro Menezes
* Camilla Vieira
* Manoel Olimpio
* José Fernando
* Maria Augusta
* Dayanni Rodrigues
* Muriel Bezerra


**Class / Term:** Class 43 ADS

**Integrated Courses:**
* IoT & Artifacts — Prof. Arnott Caiado
* Consumer Behavior — Prof. Paulo Guimarães
* Cloud Computing — Prof. Alisson Vinicius
* Information Security & LGPD — Prof. Paulo Pimentel
* Software Quality — Prof. Paulo Pimentel
* Systems Analysis and Design — Prof. Marcus Vinicius
* Tech English — Prof. Leonardo Trevas



---

## 1.1 Core Competencies Evidenced

The development of Syngate mobilized the following core competencies:

* **Technical-Scientific Mastery:** Evidenced in the ESP32 firmware structuring, the integration between RFID and ultrasonic sensors, HTTP communication with the API, and the relational database modeling in PostgreSQL using Prisma ORM.
* **Digital Autonomy in Problem Solving:** Demonstrated in the hardware-software integration, implementation of automatic Wi-Fi reconnection routines, API communication failure handling, and debugging of JSON payloads transmitted between devices and the backend.
* **Critical, Ethical, and Security Vision:** Applied in the protection of credentials through `.env` files, device authentication via exclusive keys (`Device Key`), and the adoption of data minimization principles mandated by the LGPD.
* **Communication and Collaboration:** Reflected in the project's technical documentation, GitHub repository organization, division of team responsibilities, and the structured presentation of the solution.
* **Entrepreneurial and Innovative Attitude:** Materialized in identifying a real pain point regarding academic access control and proposing a low-cost, scalable MVP based on widely used market technologies.

---

## 2. Simplified Requirements Document

### 2.1 Problem Description

Currently, the academic environment presents limitations related to access control and management. The main entrance lacks an automated mechanism to identify students, professors, or visitors, hindering the control of people's circulation within the institution.

Furthermore, access to classrooms often relies on the presence of professors or coordinators to unlock the rooms, causing delays, operational dependence, and negatively impacting the user experience.

Given this scenario, there is a need for an intelligent solution capable of securely, automatically, and contextually controlling access, considering not only user identity but also information such as location, time, and associated permissions.

The Syngate project was designed to meet this need by integrating IoT devices, cloud computing, and web applications, providing a safer, more efficient, and modern access experience.

### 2.2 MVP Scope (Minimum Viable Product)

The Syngate MVP aims to validate the technical and functional viability of a smart access control system using IoT, Web Development, and Cloud Computing. The initial version includes:

* User identification reading via RFID cards/tags.
* Proximity detection using the HC-SR04 ultrasonic sensor.
* Embedded local processing using the ESP32.
* Wi-Fi communication with a Node.js/TypeScript API.
* Access validation based on authorization rules defined in the backend.
* Logging access events in a PostgreSQL database.
* Data management through Prisma ORM.
* Local visual feedback using status LEDs.
* Resilient operation with automatic reconnection mechanisms and failure handling.

> **Out of MVP scope:** facial recognition, integration with official academic systems, biometrics, and automated physical door opening (electronic locks).

### 2.3 Functional Requirements (FR)

| ID | Description |
| --- | --- |
| FR-001 | The system must identify users via RFID cards using the MFRC522 module. |
| FR-002 | The ESP32 must periodically read the identification devices connected to the system. |
| FR-003 | The firmware must encapsulate the collected data in JSON format. |
| FR-004 | The ESP32 must send the access data to the API via HTTP requests. |
| FR-005 | The API must validate the user's access permissions. |
| FR-006 | The system must log access events in the PostgreSQL database, including date, time, and location. |
| FR-007 | The system must locally indicate the validation result via status LEDs. |
| FR-008 | The cloud dashboard must display received logs in real-time. |
| FR-009 | The system must allow degraded mode operation (Edge Computing) in case of temporary internet unavailability. |

### 2.4 Measurable Non-Functional Requirements (NFR)

| ID | Category | Description |
| --- | --- | --- |
| NFR-001 | Response Time | The total time between ID reading and validation return must not exceed 2 seconds under normal network conditions. |
| NFR-002 | Sampling Interval | The firmware must check for new access attempts at maximum intervals of 500 milliseconds. |
| NFR-003 | Network Reliability | The ESP32 must perform automatic Wi-Fi reconnection attempts every 10 seconds in case of connectivity loss. |
| NFR-004 | Availability | The system must remain operational for at least 95% of the time during MVP testing. |
| NFR-005 | Security | Access credentials, API keys, and sensitive information must not be directly exposed in the versioned source code. |
| NFR-006 | Scalability | The architecture must allow the addition of new ESP32 devices without requiring significant changes to the API. |

---

## 3. Course Integration Mapping

| Concept / Competency | Integrated Course | Where it is evidenced in the project |
| --- | --- | --- |
| Embedded firmware programming | IoT & Artifacts | Firmware developed for ESP32, device reading, local processing, and communication. |
| Edge Computing and resilient systems | IoT & Artifacts | Local operation rules (fail-safe) and degraded offline functioning. |
| Pain point identification and User Journey | Consumer Behavior | Mapping the access problem, defining the persona, and Syngate usage flow. |
| Cloud Integration and Persistence | Cloud Computing | ESP32 > API communication and PostgreSQL usage with Prisma ORM for history logs. |
| Credential protection and LGPD | Information Security & LGPD | Use of `.env`, data minimization collected for auditing. |
| Reliability and Requirements | Software Quality | Error handling, auto-reconnection, FR and NFR document. |
| Architecture and REST Integration | Systems Analysis and Design | Logical modeling (IoT > API > DB > Dashboard) and HTTP/JSON requests. |
| Documentation and Technical Vocabulary | Tech English | Use of English nomenclatures (API, Edge Computing, Payload, Endpoint) and README structuring. |

---

## 4. Technical Diagrams & Schematics

### 4.1 Logical Architecture Diagram

| Layer | Components |
| --- | --- |
| **Perception (Hardware)** | ESP32 DevKit V1, MFRC522 RFID Reader, HC-SR04 Ultrasonic Sensor, Status LEDs |
| **Network (Communication)** | Wi-Fi IEEE 802.11, HTTP/HTTPS, JSON Payloads, Device MAC/Key Authentication |
| **Cloud (Application)** | Node.js/TypeScript Backend, REST API, PostgreSQL, Prisma ORM, Hosting (Render) |

### 4.2 Firmware Decision Flowchart

```text
Initialization
     │
     ▼
Read ultrasonic sensor
     │
     ▼
Proximity detected? ──NO──► Wait
     │ YES
     ▼
Read RFID card (UID)
     │
     ▼
Determine direction (Entry / Exit)
     │
     ▼
Build JSON payload and send HTTP to API
     │
     ▼
Receive backend response
     │
     ▼
Authorized? ──YES──► Green LED
     │ NO
     ▼
Red LED
     │
     ▼
Return to main loop

```

### 4.3 Wiring Schematic

| Component | Pin | ESP32 |
| --- | --- | --- |
| **RFID MFRC522** | SDA | GPIO 5 |
|  | RST | GPIO 4 |
|  | MOSI | GPIO 23 |
|  | MISO | GPIO 19 |
|  | SCK | GPIO 18 |
| **HC-SR04** | TRIG | GPIO 12 |
|  | ECHO | GPIO 14 |
| **Green LED** | — | GPIO 32 |
| **Red LED** | — | GPIO 33 |

> VCC/3.3V and GND connected to the corresponding power and ground pins.

---

## 5. Evidence Dossier

### 5.1 Physical Circuit or Simulated Environment

![Evidência do Circuito](Docs/Images/Circuit2.jpeg)

### 5.2 Serial Monitor and JSON Payload

![Evidência do Serial Monitor](Docs/Images/SimulatedEnvironment.jpeg)

### 5.3 Cloud Dashboards

![Evidência do Dashboard](Docs/Images/Dashboard.jpeg)

---

## 6. Getting Started / Execution Instructions

### 6.1 Prerequisites

* ESP32 DevKit V1 + sensors (RFID MFRC522 and HC-SR04) + Arduino IDE 2.x
* Node.js 20+
* PostgreSQL + Prisma ORM
* Git

### 6.2 Running the Backend

```bash
# Clone the repository
git clone <repository>
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit the .env file with your database and JWT credentials

# Generate the Prisma client and run migrations
npx prisma generate
npx prisma migrate deploy

# Start the server
npm run dev

```

### 6.3 Running the Firmware (ESP32)

1. Open the project in the Arduino IDE.
2. Install the required libraries: `MFRC522` and `ArduinoJson`.
3. Configure Wi-Fi credentials (SSID and Password) and the API URL in the code.
4. Compile and upload to the ESP32.

---

## 7. Security & Academic Integrity

### Credential Management & LGPD

The credentials used are not stored in the versioned source code (isolated via `.gitignore`). The environment is configured via `.env.example`. The project adopts the LGPD's data minimization principle, storing only what is strictly necessary for access auditing.

### Artificial Intelligence Usage

Generative AI tools were used as support for research, documentation formatting, brainstorming, and review. All implemented code was analyzed, understood, and architecturally validated by the team.
