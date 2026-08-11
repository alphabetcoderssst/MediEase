import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type DoctorStatus = "active" | "not_started" | "unavailable";
export type PatientStatus = "in_progress" | "waiting" | "completed" | "skipped";
export type Priority = "critical" | "urgent" | "standard";

export type Patient = {
  id: string;
  token: string;
  name: string;
  time: string;
  status: PatientStatus;
  priority?: Priority;
  emergency?: boolean;
  reason?: string;
  contact?: string;
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  room: string;
  hours: string;
  status: DoctorStatus;
  patients: Patient[];
  paused: boolean;
  pauseReason?: string | undefined;
};

export type StaffAccount = {
  staffId: string;
  fullName: string;
  mobile: string;
  role: string;
  password: string;
};

type PendingSignup = {
  fullName: string;
  mobile: string;
  role: string;
  password: string;
  otp: string;
  attempts: number;
};

type State = {
  accounts: StaffAccount[];
  session: string | null;
  pending: PendingSignup | null;
  createdStaffId: string | null;
  selectedDoctorId: string | null;
  doctors: Doctor[];
};

const STORAGE_KEY = "mediease.state.v1";

const seedPatients = (base: number, list: Array<[string, string, PatientStatus]>): Patient[] =>
  list.map(([name, time, status], i) => ({
    id: `p-${base}-${i}`,
    token: `A-${base + i}`,
    name,
    time,
    status,
  }));

const initialDoctors: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Arun Kumar",
    specialty: "General Medicine",
    room: "Room 204",
    hours: "9:00 AM - 1:00 PM",
    status: "active",
    paused: false,
    patients: seedPatients(20, [
      ["Suresh Kumar", "10:00 AM", "completed"],
      ["Ravi Kumar", "10:30 AM", "in_progress"],
      ["Priya Sharma", "10:45 AM", "waiting"],
      ["Arun Raj", "11:00 AM", "waiting"],
      ["Lakshmi Devi", "11:15 AM", "waiting"],
      ["Kavya Nair", "11:30 AM", "waiting"],
      ["Mohan Das", "11:45 AM", "waiting"],
      ["Zoya Khan", "12:00 PM", "waiting"],
    ]),
  },
  {
    id: "d2",
    name: "Dr. Priya Sharma",
    specialty: "Cardiology",
    room: "Room 301",
    hours: "10:00 AM - 2:00 PM",
    status: "active",
    paused: false,
    patients: seedPatients(40, [
      ["Ganesh Iyer", "10:10 AM", "completed"],
      ["Meera Joshi", "10:40 AM", "in_progress"],
      ["Rahul Verma", "11:00 AM", "waiting"],
      ["Sneha Rao", "11:20 AM", "waiting"],
      ["Imran Ali", "11:40 AM", "waiting"],
    ]),
  },
  {
    id: "d3",
    name: "Dr. Rajesh Kumar",
    specialty: "Orthopedics",
    room: "Room 205",
    hours: "9:30 AM - 1:00 PM",
    status: "not_started",
    paused: false,
    patients: seedPatients(60, [
      ["Ajay Menon", "9:40 AM", "waiting"],
      ["Deepa Pillai", "10:00 AM", "waiting"],
      ["Sanjay Gupta", "10:20 AM", "waiting"],
    ]),
  },
  {
    id: "d4",
    name: "Dr. Meena Devi",
    specialty: "Pediatrics",
    room: "Room 302",
    hours: "10:00 AM - 2:00 PM",
    status: "unavailable",
    paused: false,
    patients: [],
  },
];

const initialState: State = {
  accounts: [
    {
      staffId: "ME-7824",
      fullName: "Dr. Jane Doe",
      mobile: "9876543210",
      role: "Front Desk",
      password: "demo1234",
    },
  ],
  session: null,
  pending: null,
  createdStaffId: null,
  selectedDoctorId: null,
  doctors: initialDoctors,
};

type Ctx = {
  state: State;
  hydrated: boolean;
  currentStaff: StaffAccount | null;
  selectedDoctor: Doctor | null;
  login: (staffId: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  startSignup: (data: Omit<PendingSignup, "otp" | "attempts">) => { ok: boolean; error?: string };
  verifyOtp: (otp: string) => { ok: boolean; error?: string; staffId?: string };
  resendOtp: () => string;
  clearPending: () => void;
  selectDoctor: (id: string) => void;
  startPatient: (patientId: string) => void;
  completePatient: (patientId: string) => void;
  skipPatient: (patientId: string) => void;
  requeuePatient: (patientId: string) => void;
  pauseQueue: (reason: string) => void;
  resumeQueue: () => void;
  addEmergency: (input: {
    name: string;
    contact: string;
    reason: string;
    priority: Priority;
  }) => { ok: boolean; error?: string };
};

const MediEaseContext = createContext<Ctx | null>(null);

function loadState(): State {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as State;
    return { ...initialState, ...parsed };
  } catch {
    return initialState;
  }
}

const randomOtp = () => String(Math.floor(100000 + Math.random() * 900000));

export const nowLabel = () =>
  new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export function MediEaseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const updateDoctor = useCallback((id: string, fn: (d: Doctor) => Doctor) => {
    setState((s) => ({
      ...s,
      doctors: s.doctors.map((d) => (d.id === id ? fn(d) : d)),
    }));
  }, []);

  const value = useMemo<Ctx>(() => {
    const selectedDoctor = state.doctors.find((d) => d.id === state.selectedDoctorId) ?? null;
    const currentStaff = state.accounts.find((a) => a.staffId === state.session) ?? null;
    const did = state.selectedDoctorId;

    return {
      state,
      hydrated,
      currentStaff,
      selectedDoctor,
      login: (staffId, password) => {
        const id = staffId.trim().toUpperCase();
        const acc = state.accounts.find((a) => a.staffId.toUpperCase() === id);
        if (!acc) return { ok: false, error: "No staff account found for this Staff ID." };
        if (acc.password !== password) return { ok: false, error: "Incorrect password." };
        setState((s) => ({ ...s, session: acc.staffId, selectedDoctorId: null }));
        return { ok: true };
      },
      logout: () => setState((s) => ({ ...s, session: null, selectedDoctorId: null })),
      startSignup: (data) => {
        const mobile = data.mobile.replace(/\D/g, "");
        if (state.accounts.some((a) => a.mobile === mobile)) {
          return { ok: false, error: "This mobile number is already registered." };
        }
        const otp = randomOtp();
        setState((s) => ({ ...s, pending: { ...data, mobile, otp, attempts: 0 } }));
        return { ok: true };
      },
      verifyOtp: (otp) => {
        const pending = state.pending;
        if (!pending) return { ok: false, error: "No pending registration. Please sign up again." };
        if (pending.attempts >= 5) {
          return { ok: false, error: "Too many incorrect attempts. Please resend a new OTP." };
        }
        if (otp !== pending.otp) {
          setState((s) => ({
            ...s,
            pending: s.pending ? { ...s.pending, attempts: s.pending.attempts + 1 } : null,
          }));
          const left = 5 - (pending.attempts + 1);
          return {
            ok: false,
            error: `Incorrect OTP. ${left > 0 ? `${left} attempt(s) left.` : "Please resend OTP."}`,
          };
        }
        const staffId = `ME-${Math.floor(1000 + Math.random() * 9000)}`;
        setState((s) => ({
          ...s,
          accounts: [
            ...s.accounts,
            {
              staffId,
              fullName: pending.fullName,
              mobile: pending.mobile,
              role: pending.role,
              password: pending.password,
            },
          ],
          pending: null,
          createdStaffId: staffId,
        }));
        return { ok: true, staffId };
      },
      resendOtp: () => {
        const otp = randomOtp();
        setState((s) => ({ ...s, pending: s.pending ? { ...s.pending, otp, attempts: 0 } : null }));
        return otp;
      },
      clearPending: () => setState((s) => ({ ...s, pending: null })),
      selectDoctor: (id) => setState((s) => ({ ...s, selectedDoctorId: id })),
      startPatient: (patientId) => {
        if (!did) return;
        updateDoctor(did, (d) => ({
          ...d,
          status: d.status === "not_started" ? "active" : d.status,
          patients: d.patients.map((p) =>
            p.id === patientId
              ? { ...p, status: "in_progress" as PatientStatus, time: nowLabel() }
              : p.status === "in_progress"
                ? { ...p, status: "completed" as PatientStatus }
                : p,
          ),
        }));
      },
      completePatient: (patientId) => {
        if (!did) return;
        updateDoctor(did, (d) => ({
          ...d,
          patients: d.patients.map((p) =>
            p.id === patientId ? { ...p, status: "completed" as PatientStatus } : p,
          ),
        }));
      },
      skipPatient: (patientId) => {
        if (!did) return;
        updateDoctor(did, (d) => ({
          ...d,
          patients: d.patients.map((p) =>
            p.id === patientId ? { ...p, status: "skipped" as PatientStatus } : p,
          ),
        }));
      },
      requeuePatient: (patientId) => {
        if (!did) return;
        updateDoctor(did, (d) => ({
          ...d,
          patients: d.patients.map((p) =>
            p.id === patientId ? { ...p, status: "waiting" as PatientStatus } : p,
          ),
        }));
      },
      pauseQueue: (reason) => {
        if (!did) return;
        updateDoctor(did, (d) => ({ ...d, paused: true, pauseReason: reason }));
      },
      resumeQueue: () => {
        if (!did) return;
        updateDoctor(did, (d) => ({ ...d, paused: false, pauseReason: undefined }));
      },
      addEmergency: ({ name, contact, reason, priority }) => {
        if (!did) return { ok: false, error: "Select a doctor first." };
        const doctor = state.doctors.find((d) => d.id === did);
        if (
          doctor?.patients.some(
            (p) =>
              p.emergency &&
              p.name.trim().toLowerCase() === name.trim().toLowerCase() &&
              p.status !== "completed",
          )
        ) {
          return { ok: false, error: "This emergency patient is already in the queue." };
        }
        const token = `E-${doctor ? doctor.patients.filter((p) => p.emergency).length + 1 : 1}`;
        const patient: Patient = {
          id: `e-${Date.now()}`,
          token,
          name: name.trim(),
          time: nowLabel(),
          status: "waiting",
          priority,
          emergency: true,
          reason: reason.trim(),
          contact: contact.trim(),
        };
        updateDoctor(did, (d) => {
          const idx = d.patients.findIndex((p) => p.status === "waiting");
          const next = [...d.patients];
          next.splice(idx === -1 ? next.length : idx, 0, patient);
          return { ...d, patients: next };
        });
        return { ok: true };
      },
    };
  }, [state, hydrated, updateDoctor]);

  return <MediEaseContext.Provider value={value}>{children}</MediEaseContext.Provider>;
}

export function useMediEase() {
  const ctx = useContext(MediEaseContext);
  if (!ctx) throw new Error("useMediEase must be used inside MediEaseProvider");
  return ctx;
}

export function queueStats(doctor: Doctor | null) {
  const patients = doctor?.patients ?? [];
  const waiting = patients.filter((p) => p.status === "waiting").length;
  const inConsult = patients.filter((p) => p.status === "in_progress").length;
  const completed = patients.filter((p) => p.status === "completed").length;
  const skipped = patients.filter((p) => p.status === "skipped").length;
  return {
    total: patients.length,
    waiting,
    inConsult,
    completed,
    skipped,
    estWait: waiting * 8,
  };
}
