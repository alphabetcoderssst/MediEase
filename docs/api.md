# MediEase — API Specification

## 1. Overview

The MediEase backend provides REST APIs for:

* Patient appointments
* Patient queue status
* Staff queue management
* IoT doctor button
* Authentication

The frontend and IoT device communicate with the backend only through APIs.

The database is never accessed directly by the frontend or IoT device.

---

# 2. Base URL

During development:

```text
http://localhost:8000
```

The production URL will be configured later.

---

# 3. API Response Format

Successful responses should use a consistent structure.

Example:

```json
{
  "success": true,
  "data": {}
}
```

Errors:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

---

# 4. Patient APIs

## 4.1 Create Appointment

```http
POST /api/appointments
```

### Request

```json
{
  "patient_name": "Ravi Kumar",
  "phone": "XXXXXXXXXX",
  "doctor_id": 1,
  "appointment_date": "2026-08-11"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "appointment_id": 1001,
    "token": "A-27",
    "status": "WAITING",
    "doctor": {
      "id": 1,
      "name": "Dr. Kumar",
      "room_number": "204"
    }
  }
}
```

---

# 5. Get Appointment

```http
GET /api/appointments/{appointment_id}
```

Returns the patient's appointment information.

### Response

```json
{
  "success": true,
  "data": {
    "appointment_id": 1001,
    "token": "A-27",
    "status": "WAITING",
    "doctor_name": "Dr. Kumar",
    "room_number": "204"
  }
}
```

The backend must verify that the requester is authorized to view the appointment.

---

# 6. Check-In

```http
POST /api/appointments/{appointment_id}/check-in
```

Marks the patient as checked in.

### State change

```text
Appointment
    ↓
WAITING
```

The backend must verify that the appointment is valid for check-in.

---

# 7. Get Queue Status

```http
GET /api/queue/{doctor_id}
```

Returns the current queue for a doctor.

### Response

```json
{
  "success": true,
  "data": {
    "doctor_id": 1,
    "current_token": "A-23",
    "queue": [
      {
        "token": "A-23",
        "status": "IN_PROGRESS"
      },
      {
        "token": "A-24",
        "status": "WAITING"
      },
      {
        "token": "A-25",
        "status": "WAITING"
      }
    ]
  }
}
```

Patients should not receive other patients' private information.

The patient-facing API should return only information necessary to show the patient's queue position.

---

# 8. Patient Status

```http
GET /api/patient/appointments/{appointment_id}/status
```

Returns information needed by the patient's screen.

### Waiting response

```json
{
  "success": true,
  "data": {
    "token": "A-27",
    "status": "WAITING",
    "patients_ahead": 3,
    "estimated_wait_minutes": 15,
    "doctor_name": "Dr. Kumar",
    "room_number": "204"
  }
}
```

### In-progress response

```json
{
  "success": true,
  "data": {
    "token": "A-27",
    "status": "IN_PROGRESS",
    "doctor_name": "Dr. Kumar",
    "room_number": "204"
  }
}
```

### Completed response

```json
{
  "success": true,
  "data": {
    "token": "A-27",
    "status": "COMPLETED"
  }
}
```

---

# 9. IoT API

The IoT device is used by the doctor to advance the queue.

## 9.1 Complete Current & Call Next

```http
POST /api/iot/next
```

The IoT device sends an authenticated request.

### Request

```json
{
  "device_id": "ROOM204-ESP32"
}
```

### Backend operation

The backend performs:

```text
1. Authenticate IoT device
2. Identify associated doctor/room
3. Find current IN_PROGRESS appointment
4. Mark it COMPLETED
5. Find next eligible WAITING appointment
6. Mark next appointment IN_PROGRESS
7. Update queue
8. Notify connected clients
```

### Success response

```json
{
  "success": true,
  "data": {
    "completed_token": "A-21",
    "next_token": "A-22",
    "next_status": "IN_PROGRESS"
  }
}
```

### No next patient

```json
{
  "success": true,
  "data": {
    "completed_token": "A-21",
    "next_token": null,
    "message": "No waiting patient"
  }
}
```

---

# 10. Staff APIs

## 10.1 Staff Queue

```http
GET /api/staff/queue/{doctor_id}
```

Returns the queue information required by the Staff Dashboard.

---

## 10.2 Check In Patient

```http
POST /api/staff/appointments/{appointment_id}/check-in
```

Used when staff checks in a patient manually.

---

## 10.3 Skip Patient

```http
POST /api/staff/appointments/{appointment_id}/skip
```

Changes:

```text
WAITING → SKIPPED
```

The backend should require staff authentication.

---

## 10.4 Pause Queue

```http
POST /api/staff/queue/{doctor_id}/pause
```

Pauses automatic queue advancement.

---

## 10.5 Resume Queue

```http
POST /api/staff/queue/{doctor_id}/resume
```

Resumes queue processing.

---

# 11. Authentication

Different users have different permissions.

```text
PATIENT
STAFF
IOT_DEVICE
```

Authentication will be handled by the backend.

### Patient

The patient should receive a secure session or appointment access mechanism.

The system must not rely only on:

```text
phone number → appointment access
```

because another person could enter the phone number.

---

### Staff

Staff requires authenticated login.

Example:

```text
POST /api/auth/staff/login
```

---

### IoT

Each IoT device must have a unique identity.

Example:

```text
ROOM204-ESP32
```

The backend must verify that the device is authorized before allowing:

```text
POST /api/iot/next
```

---

# 12. Error Handling

Common errors:

```text
401 UNAUTHORIZED
403 FORBIDDEN
404 NOT_FOUND
409 CONFLICT
422 VALIDATION_ERROR
500 INTERNAL_SERVER_ERROR
```

Example:

If the doctor presses the IoT button while no consultation is active:

```json
{
  "success": false,
  "error": {
    "code": "NO_ACTIVE_CONSULTATION",
    "message": "There is no active consultation to complete."
  }
}
```

---

# 13. Important Business Rules

The backend must enforce:

1. Only one appointment can be `IN_PROGRESS` for a doctor.
2. Patients cannot change appointment status.
3. IoT devices cannot directly modify the database.
4. IoT devices can only call authorized endpoints.
5. Staff can perform authorized queue interventions.
6. Completed appointments cannot be reactivated.
7. The backend decides which patient is next.
8. The patient API must not expose another patient's private information.
9. Queue advancement must be atomic.
10. Two simultaneous IoT requests must not advance the queue twice.

---

# 14. Future APIs

These can be added later:

```text
Notifications
Caregiver access
Appointment cancellation
Doctor schedules
Hospital management
Audit logs
IoT device management
Analytics
```

They are not required for the first MVP.
