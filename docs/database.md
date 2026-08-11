# MediEase — Database Design

## 1. Overview

The MediEase database stores information required for:

* Patients
* Staff members
* Doctors
* Appointments
* Queue management
* Hospitals/clinics
* Consultation status

The backend is responsible for reading and modifying database records.

Patients, staff, and IoT devices must not directly access the database.

---

# 2. Entities

The initial MediEase MVP contains the following entities:

```text
Patient
Doctor
Staff
Appointment
Queue
Hospital
```

---

# 3. Patient

Stores basic patient information.

| Field      | Type           | Description           |
| ---------- | -------------- | --------------------- |
| id         | UUID / Integer | Unique patient ID     |
| name       | String         | Patient name          |
| phone      | String         | Patient phone number  |
| created_at | DateTime       | Account creation time |

### Example

```json
{
  "id": 101,
  "name": "Ravi Kumar",
  "phone": "XXXXXXXXXX"
}
```

---

# 4. Doctor

Stores doctor information.

| Field        | Type           | Description         |
| ------------ | -------------- | ------------------- |
| id           | UUID / Integer | Unique doctor ID    |
| name         | String         | Doctor name         |
| department   | String         | Medical department  |
| room_number  | String         | Consultation room   |
| hospital_id  | UUID / Integer | Hospital/clinic     |
| is_available | Boolean        | Doctor availability |

### Example

```json
{
  "id": 1,
  "name": "Dr. Kumar",
  "department": "General Medicine",
  "room_number": "204",
  "hospital_id": 1,
  "is_available": true
}
```

---

# 5. Staff

Stores staff accounts.

| Field         | Type           | Description     |
| ------------- | -------------- | --------------- |
| id            | UUID / Integer | Unique staff ID |
| name          | String         | Staff name      |
| phone         | String         | Staff phone     |
| password_hash | String         | Hashed password |
| hospital_id   | UUID / Integer | Hospital/clinic |

Staff members use the Staff Dashboard.

---

# 6. Hospital

Stores hospital information.

| Field         | Type           | Description                    |
| ------------- | -------------- | ------------------------------ |
| id            | UUID / Integer | Unique hospital ID             |
| name          | String         | Hospital name                  |
| address       | String         | Hospital address               |
| qr_identifier | String         | Identifier used by hospital QR |

The QR identifies the hospital or configured entry point.

The QR itself does not contain patient information.

---

# 7. Appointment

The Appointment table is the core table of MediEase.

| Field            | Type           | Description                  |
| ---------------- | -------------- | ---------------------------- |
| id               | UUID / Integer | Unique appointment ID        |
| patient_id       | Foreign Key    | Patient                      |
| doctor_id        | Foreign Key    | Doctor                       |
| appointment_date | Date           | Appointment date             |
| token            | String         | Queue token                  |
| status           | Enum           | Appointment status           |
| priority         | Integer        | Queue priority               |
| checked_in_at    | DateTime       | Check-in time                |
| created_at       | DateTime       | Appointment creation time    |
| completed_at     | DateTime       | Consultation completion time |

### Appointment statuses

```text
WAITING
IN_PROGRESS
COMPLETED
SKIPPED
CANCELLED
```

### Example

```json
{
  "id": 1001,
  "patient_id": 101,
  "doctor_id": 1,
  "appointment_date": "2026-08-11",
  "token": "A-27",
  "status": "WAITING",
  "priority": 0
}
```

---

# 8. Queue

The Queue represents the active queue for a doctor.

| Field                  | Type           | Description          |
| ---------------------- | -------------- | -------------------- |
| id                     | UUID / Integer | Unique queue ID      |
| doctor_id              | Foreign Key    | Doctor               |
| current_appointment_id | Foreign Key    | Current consultation |
| is_paused              | Boolean        | Queue pause status   |
| updated_at             | DateTime       | Last queue update    |

The queue should not independently store every patient's position.

The backend derives the queue from eligible appointments.

---

# 9. Relationships

```text
Hospital
   │
   ├──────────────┐
   │              │
   ▼              ▼
Doctor          Staff
   │
   │
   ▼
Appointment
   │
   ▼
Patient
```

More specifically:

```text
Hospital 1 ──── * Doctor

Hospital 1 ──── * Staff

Doctor 1 ──── * Appointment

Patient 1 ──── * Appointment

Doctor 1 ──── 1 Queue
```

---

# 10. Queue State Rules

The database must enforce the following logical rules:

### Normal flow

```text
WAITING
   ↓
IN_PROGRESS
   ↓
COMPLETED
```

### Exception flow

```text
WAITING → SKIPPED
WAITING → CANCELLED
```

Only one appointment can be `IN_PROGRESS` for a doctor at a time.

---

# 11. Queue Advancement

When the doctor presses the IoT button:

The backend performs a transaction:

```text
1. Find current IN_PROGRESS appointment.

2. Mark current appointment as COMPLETED.

3. Find the next eligible WAITING appointment.

4. Mark the next appointment as IN_PROGRESS.

5. Update queue.current_appointment_id.

6. Record timestamps.

7. Notify connected clients.
```

If there is no eligible waiting appointment:

```text
Current → COMPLETED

Queue → No active appointment
```

---

# 12. Priority

Each appointment contains a `priority` value.

Example:

```text
Normal patient     → priority 0
Senior priority    → priority 1
Emergency          → priority 10
```

The exact priority rules will be finalized before implementation.

The backend, not the patient, decides queue ordering.

---

# 13. Security Rules

### Patient

A patient can access only their own appointment information.

### Staff

Staff can access appointments belonging to their hospital.

### IoT Device

An IoT device must be associated with a specific hospital/doctor/room and authenticated before sending queue commands.

### Database

The database is never directly exposed to:

* Patient browser
* Staff browser
* IoT device

All access goes through the backend API.

---

# 14. Future Extensions

The following may be added after the MVP:

* Notifications
* Caregiver accounts
* Multiple hospital branches
* Consultation history
* Doctor schedules
* Appointment cancellation by patient
* Audit logs
* IoT device management
* Analytics

These are not required for the initial MVP.
