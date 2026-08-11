# MediEase — System Architecture

## 1. Overview

MediEase is an app-less, QR-enabled hospital appointment and real-time queue management web application.

The system connects:

* Patients
* Hospital staff
* Doctors
* IoT consultation-room devices

through a centralized backend and database.

The doctor does not require a separate dashboard for the normal consultation workflow.

The doctor uses an IoT button to advance the queue.

---

# 2. High-Level Architecture

```text
                         MEDIEASE
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
   Patient Web App    Staff Dashboard    IoT Device
          │                 │                 │
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
                     Backend API
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
          Queue Engine              Database
                │
                │
                ▼
         Real-Time Updates
                │
          ┌─────┴─────┐
          ▼           ▼
       Patient       Staff
        Screen       Dashboard
```

---

# 3. Patient Web Application

The Patient Web App is a mobile-first web interface.

Patients do not need to install a mobile application.

Patients can access MediEase through:

* Hospital QR code
* Secure appointment link

### Patient functions

* Book appointment
* View appointment
* Check in
* View token
* View queue status
* View estimated waiting time
* View doctor information
* View room number
* Receive "Your Turn" status
* View consultation completion

The interface should support Senior Mode with:

* Large text
* Large buttons
* Simple navigation
* High readability
* Minimal information
* Clear icons

---

# 4. Staff Dashboard

The Staff Dashboard is a web interface for hospital staff.

### Staff responsibilities

* Monitor appointments
* View queue
* Check in patients
* Handle absent patients
* Skip patients
* Handle priority/emergency cases
* Pause queue
* Resume queue
* Monitor doctor/room status
* Perform manual intervention when required

Staff normally does not need to advance the queue after every consultation.

The IoT doctor button handles normal queue advancement.

---

# 5. IoT Consultation Device

The doctor uses a physical button connected to an ESP32.

For the MVP, the device will be simulated using Wokwi.

### Device flow

```text
Doctor
  │
  │ presses button
  ▼
ESP32
  │
  │ Wi-Fi
  ▼
MediEase Backend
  │
  ▼
Queue Engine
```

The device sends an authenticated API request.

Example:

```http
POST /api/iot/next
```

The IoT device does not directly access the database.

---

# 6. Backend

The backend is the central controller of the system.

Recommended MVP technology:

**FastAPI + Python**

### Backend responsibilities

* Authentication
* Appointment management
* Patient management
* Queue management
* Token generation
* Business rules
* IoT authentication
* Staff authorization
* Queue state transitions
* Real-time event handling
* Database communication

---

# 7. Queue Engine

The Queue Engine is part of the backend.

It controls the state of appointments.

### Normal state

```text
WAITING
   │
   ▼
IN_PROGRESS
   │
   ▼
COMPLETED
```

### Exception states

```text
WAITING → SKIPPED
WAITING → CANCELLED
```

The queue engine determines the next eligible patient.

Patients cannot directly modify queue state.

---

# 8. IoT Queue Advancement

The normal consultation cycle is:

```text
Patient A
IN_PROGRESS
     │
     │ Doctor finishes consultation
     ▼
Doctor presses IoT button
     │
     ▼
ESP32
     │
     ▼
Backend
     │
     ▼
Queue Engine
     │
     ├───────────────┐
     ▼               ▼
Patient A         Patient B
COMPLETED         IN_PROGRESS
                     │
                     ▼
               Patient B phone
                 "YOUR TURN"
```

This eliminates the need for staff to manually update the queue after every consultation.

---

# 9. Database

The database stores persistent MediEase data.

Main entities:

```text
Hospital
Patient
Doctor
Staff
Appointment
Queue
```

The backend is the only component that directly communicates with the database.

```text
Patient Web App ──┐
Staff Dashboard ──┼──> Backend ──> Database
IoT Device ───────┘
```

---

# 10. Authentication and Authorization

The system has different roles.

### Patient

Can access their own appointment information.

### Staff

Can access and manage appointments and queues belonging to their hospital.

### IoT Device

Can perform only authorized IoT operations for its assigned room/doctor.

The backend validates permissions before performing operations.

---

# 11. Security Architecture

The system follows a backend-controlled architecture.

```text
                    Backend
                       │
              ┌────────┼────────┐
              │        │        │
              ▼        ▼        ▼
           Patient   Staff     IoT
           Access    Access    Access
```

No client directly modifies the database.

### Important security principles

* Authentication
* Role-based authorization
* Secure patient appointment access
* IoT device authentication
* Server-side queue validation
* Atomic queue transitions
* No direct database access from clients

---

# 12. Real-Time Communication

When the queue changes, connected clients should receive an updated status.

Example:

```text
IoT Button
    ↓
Backend
    ↓
Database
    ↓
Queue Updated
    ↓
Real-Time Event
    ├──> Patient Web App
    └──> Staff Dashboard
```

For the MVP, real-time updates can be implemented using:

* WebSockets

If necessary, polling can be used as a temporary fallback during early development.

---

# 13. QR Architecture

The QR code is an entry mechanism, not the queue engine.

Example:

```text
Hospital QR
     ↓
Patient Web App
     ↓
MediEase
```

The QR can identify:

* Hospital
* Department
* Entry point

The QR must not contain sensitive patient information.

After the initial access, patients can continue using their secure appointment link/session rather than repeatedly scanning the hospital QR.

---

# 14. Complete System Flow

```text
                    PATIENT
                       │
                 QR / Secure Link
                       │
                       ▼
                Patient Web App
                       │
                 Book Appointment
                       │
                       ▼
                   Backend
                       │
                       ▼
                   Database
                       │
                       ▼
                    WAITING
                       │
                       │
              Doctor finishes patient
                       │
                       ▼
                  IoT Button
                       │
                       ▼
                     ESP32
                       │
                       ▼
                   Backend
                       │
                       ▼
                  Queue Engine
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        Current Patient      Next Patient
           COMPLETED          IN_PROGRESS
                                   │
                                   ▼
                              Patient Phone
                              "YOUR TURN"
                                   │
                                   ▼
                              Consultation
                                   │
                                   ▼
                              IoT Button
                                   │
                                   ▼
                              Next Patient
```

---

# 15. MVP Components

The first MediEase MVP will contain:

```text
1. Patient Web App
2. Staff Dashboard
3. FastAPI Backend
4. Database
5. Queue Engine
6. Wokwi ESP32 IoT simulation
7. QR access
8. Real-time queue updates
```

---

# 16. Future Hardware

For the hackathon MVP:

```text
Wokwi ESP32 Simulation
```

For future deployment:

```text
ESP32
+
Physical Push Button
+
LED/Buzzer
+
Wi-Fi
```

The backend API remains the same, allowing the simulated IoT device to be replaced by a physical device later.

---

# 17. Technology Stack

### Frontend

* HTML/CSS/JavaScript or chosen frontend framework
* Mobile-first responsive design

### Backend

* Python
* FastAPI

### Database

* PostgreSQL

### IoT

* ESP32
* Wokwi for simulation
* Wi-Fi
* HTTP/HTTPS API

### Development Tools

* GitHub
* Git
* Postman
* VS Code

---

# 18. Architecture Principle

The central principle of MediEase is:

> **The physical consultation room and digital queue remain synchronized through the backend.**

The doctor performs one simple physical action.

```text
Press Button
     ↓
Queue Automatically Advances
     ↓
Patient + Staff Automatically Updated
```

This reduces repetitive staff work while keeping the hospital queue controlled by the backend.
