# Syngate — IoT Hardware (ESP32)

**Syngate Application IoT Firmware Repository**
*Physical Access Control System with Cloud Validation*

---

*Capstone Project for Class 43 at Senac Pernambuco College.*

### Platform & Language
![C++](https://img.shields.io/badge/C++-00599C?style=for-the-badge&logo=c%2B%2B&logoColor=white) ![Arduino](https://img.shields.io/badge/Arduino-00979D?style=for-the-badge&logo=Arduino&logoColor=white) ![ESP32](https://img.shields.io/badge/ESP32-000000?style=for-the-badge&logo=espressif&logoColor=white)

### Communication & Libraries
![Wi-Fi](https://img.shields.io/badge/Wi--Fi-000000?style=for-the-badge&logo=wi-fi&logoColor=white) ![JSON](https://img.shields.io/badge/ArduinoJson-000000?style=for-the-badge&logo=json&logoColor=white) ![SPI](https://img.shields.io/badge/SPI-Bus-blue?style=for-the-badge)

---

## Overview

This repository contains the C++ firmware developed for the **ESP32 DevKit** board, which acts as the physical terminal (Edge/IoT) of the **Syngate** system.

The device is responsible for detecting user presence, securely reading RFID/NFC cards (MFRC522), determining the flow direction (Entry or Exit), and validating access in real-time through direct HTTP communication with the Syngate RESTful API.

---

## Syngate Ecosystem

The application is divided into three modular and integrated components. Browse the repositories to explore each layer of the system:

| Component | Repository | Technical Scope |
| --- | --- | --- |
| **Backend API** | [syngate-backend](https://github.com/Molimpion/syngate-backend) | RESTful API, business rules (RBAC), WebSockets, and persistence. |
| **Web Frontend** | [syngate-frontend](https://github.com/Molimpion/syngate-frontend) | Administrative interface, consumption charts, and real-time monitoring. |
| **IoT Hardware** | [syngate-iot](https://github.com/Molimpion/syngate-iot) | C++ firmware for ESP32, ultrasonic sensor, and secure RFID reading. |

---

## Operation Logic & Edge Computing

To optimize power consumption and prevent accidental readings on the RFID module, the firmware implements a **Presence State Machine**:

1. **Idle Mode:** LEDs remain off. The ultrasonic sensor sweeps the environment. The RFID reader is passive.
2. **Detection (30cm Radius):** When a user enters the ultrasonic range (`< 30cm`), the system wakes up, turns on the Red LED (standby mode), and activates the RFID antenna.
3. **Reading & Direction:** The card is read and its UID is extracted. The device maintains an in-memory map (`std::map`) to logically alternate the direction for each user (the first read is logged as `ENTRY`, the subsequent as `EXIT`, and so on).
4. **Cloud Validation:** The ESP32 sends a JSON payload to the API via HTTP POST containing the machine's security headers.
5. **Visual Feedback:** * **Granted:** Green LED turns on for 3 seconds. The user's logical direction is alternated.
* **Denied:** Red LED blinks rapidly 3 times. The logical direction remains unchanged.



---

## Hardware & Pinout (Wiring Diagram)

The project was built using the following ESP32 pins:

| Component | ESP32 Pin | Function |
| --- | --- | --- |
| **RFID MFRC522** | `GPIO 5` | SS / SDA (Slave Select) |
| **RFID MFRC522** | `GPIO 4` | RST (Reset) |
| **RFID MFRC522** | `GPIO 23` | MOSI (Standard SPI) |
| **RFID MFRC522** | `GPIO 19` | MISO (Standard SPI) |
| **RFID MFRC522** | `GPIO 18` | SCK (Standard SPI) |
| **HC-SR04** | `GPIO 12` | TRIG (Pulse emitter) |
| **HC-SR04** | `GPIO 14` | ECHO (Echo receiver) |
| **Indicator LED** | `GPIO 32` | Green LED (Success) |
| **Indicator LED** | `GPIO 33` | Red LED (Standby / Error) |

---

## Security & Authentication (Zero Trust)

The device does **not** use conventional JWT tokens, as they are vulnerable if extracted from the firmware. Authentication is based on immutable credentials generated during provisioning on the Web Dashboard.

In HTTP requests to the API, the following headers are mandatory:

```http
x-device-mac: 80:F3:DA:A9:A3:6C
x-device-key: <sha256_key_generated_on_dashboard>

```

*Any request with a MAC that does not match the key, or coming from a device with an `INACTIVE` status in the database, will be denied by the API at the middleware layer (even before evaluating the card).*

---

## Getting Started & Flashing the Firmware

### Prerequisites

* Arduino IDE (v2.x recommended) or VS Code with PlatformIO.
* ESP32 board support installed in the Boards Manager.

### Required Libraries

Install the following libraries through the IDE Library Manager:

1. `MFRC522` by GithubCommunity
2. `ArduinoJson` by Benoit Blanchon (v6.x)

### Initial Configuration

Before compiling and uploading (`ESP32D_devkit_Syngate.cpp`), adjust the environment constants at the top of the code:

```cpp
// ===== WiFi Credentials =====
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// ===== Syngate API Configuration =====
const char* API_URL    = "https://syngate-api.onrender.com/api/v1/access";
const char* DEVICE_MAC = "YOUR_ESP32_MAC_ADDRESS";
const char* DEVICE_KEY = "KEY_GENERATED_ON_WEB_DASHBOARD";

```

### Offline Test Modes

The project folder includes debug versions that do not rely on the cloud to function. These are ideal for testing solders and jumpers:

* `ESP32D.cpp`: Basic RFID test with a hardcoded authorized UID and LED control.
* `ESP32D-cor.cpp`: Integrates the RFID with the HC-SR04, saving energy, but still relying on local validation.

---

## Failure Handling (Resilience)

* **Auto-Reconnect Wi-Fi:** If the connection drops, the main loop blocks operation, turns on the red LED to prevent false flow control, and attempts to reconnect at 5-second intervals (`WIFI_TIMEOUT_MS`).
* **HTTP Timeouts:** To prevent the device from "freezing" while waiting for a delayed API response, a strict 8-second response limit (`HTTP_TIMEOUT_MS`) has been established. Failures result in immediate access denial.

---

## 7. License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
