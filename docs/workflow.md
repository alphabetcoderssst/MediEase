# MediEase — System Workflow

## 1. Patient Workflow

### Step 1 — Access MediEase

The patient can access MediEase through:

* Hospital QR code
* Personal appointment link

No mobile application installation is required.

### Step 2 — Book Appointment

The patient:

1. Selects the doctor.
2. Selects an available appointment.
3. Enters required patient information.
4. Confirms the appointment.

MediEase generates a unique appointment and token.

Example:

**Token: A-27**

### Step 3 — Check-in

When the patient arrives at the hospital, they check in for their appointment.

The appointment becomes:

`WAITING`

### Step 4 — Waiting

The patient can view:

* Token number
* Current token being served
* Number of patients ahead
* Estimated waiting time
* Doctor name
* Room number
* Appointment status

### Step 5 — Doctor Calls Next Patient

The doctor completes the current consultation and presses the physical IoT button.

The IoT device sends a request to the MediEase backend.

The backend automatically:

1. Marks the current consultation as `COMPLETED`.
2. Selects the next eligible patient.
3. Changes the next patient's status to `IN_PROGRESS`.
4. Updates the queue.
5. Updates the patient's screen.
6. Updates the staff dashboard.

### Step 6 — Patient's Turn

The next patient's screen changes to:

`YOUR TURN`

The patient sees:

* Doctor name
* Room number
* Token number
* Large "YOUR TURN" message

The interface should use Senior Mode principles:

* Large text
* Minimal information
* Clear icons
* Simple language
* High readability

### Step 7 — Consultation

The patient enters the consultation room.

The appointment remains:

`IN_PROGRESS`

### Step 8 — Consultation Completion

When the doctor finishes:

The doctor presses the IoT button again.

The backend:

`Current Patient → COMPLETED`

and automatically starts the next eligible patient.

---

# 2. Staff Workflow

Staff members use the MediEase Staff Dashboard.

Staff can:

* View today's appointments
* View the current queue
* Check in patients
* Monitor consultation status
* View doctor/room status
* Handle skipped patients
* Handle absent patients
* Handle emergency/priority patients
* Pause the queue
* Resume the queue
* Perform manual intervention when required

### Normal Consultation

Staff does NOT need to manually change the status after every consultation.

The IoT button handles the normal:

`IN_PROGRESS → COMPLETED`

and:

`WAITING → IN_PROGRESS`

transition.

Staff only intervenes when an exception occurs.

---

# 3. IoT Doctor Workflow

The doctor has a physical IoT button inside the consultation room.

### Normal operation

```text
Doctor finishes consultation
        ↓
Presses IoT button
        ↓
ESP32 sends authenticated request
        ↓
MediEase Backend
        ↓
Queue Engine
        ↓
Current patient → COMPLETED
Next patient → IN_PROGRESS
```

The IoT device does not contain the queue logic.

The backend is responsible for deciding which patient is next.

---

# 4. Queue States

An appointment can have the following states:

* `WAITING`
* `IN_PROGRESS`
* `COMPLETED`
* `SKIPPED`
* `CANCELLED`

### Normal state transition

```text
WAITING
   ↓
IN_PROGRESS
   ↓
COMPLETED
```

### Exception transitions

```text
WAITING → SKIPPED
WAITING → CANCELLED
```

Completed appointments cannot be reactivated.

---

# 5. Queue Rules

1. Only one appointment can be `IN_PROGRESS` for a doctor at a time.
2. Patients cannot directly modify their queue status.
3. The backend controls all queue state transitions.
4. The doctor IoT button triggers the normal queue advancement.
5. Staff can perform manual intervention when necessary.
6. The next patient is selected by the backend according to queue and priority rules.
7. A completed appointment cannot become active again.
8. The system must not skip patients automatically without applying the defined queue rules.
9. Emergency/priority patients are handled according to the configured priority rules.
10. If there is no eligible next patient, the queue remains without an active patient.

---

# 6. Patient Information Visibility

A patient should only be able to access their own appointment information.

The system must not allow a patient to view another patient's appointment simply by entering that patient's phone number.

Patient identity/session verification must therefore be handled by the backend.

---

# 7. Real-Time Updates

When the queue changes, the following should be updated:

* Patient's appointment screen
* Staff dashboard
* Queue status
* Current consultation
* Next patient status

The system should support real-time or near-real-time updates.

---

# 8. High-Level Flow

```text
Patient
   ↓
Book Appointment
   ↓
Receive Token
   ↓
Check-in
   ↓
WAITING
   ↓
Doctor finishes current consultation
   ↓
IoT Button
   ↓
Backend
   ↓
Queue Engine
   ↓
Current → COMPLETED
Next → IN_PROGRESS
   ↓
Patient receives update
   ↓
YOUR TURN
   ↓
Consultation
   ↓
IoT Button
   ↓
Next Patient
```
