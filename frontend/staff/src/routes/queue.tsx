import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronLeft,
  Clock,
  Pause,
  Play,
  Settings2,
  SkipForward,
  Timer,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StaffLayout } from "@/components/mediease/AppShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { queueStats, useMediEase, type Patient, type Priority } from "@/lib/mediease-store";

export const Route = createFileRoute("/queue")({
  head: () => ({
    meta: [
      { title: "Today's Patient Queue — MediEase" },
      {
        name: "description",
        content:
          "Live patient queue with consultation controls, emergency intake, pause/resume and queue statistics.",
      },
      { property: "og:title", content: "Today's Patient Queue — MediEase" },
      {
        property: "og:description",
        content: "Manage consultations, emergencies and queue exceptions in real time.",
      },
    ],
  }),
  component: QueuePage,
});

const pauseReasons = ["Doctor Unavailable", "Break", "Emergency", "Tech Issue", "Other"];

const statusChip: Record<Patient["status"], string> = {
  in_progress: "bg-brand-soft text-primary",
  waiting: "bg-warning-soft text-warning-foreground",
  completed: "bg-muted text-muted-foreground",
  skipped: "bg-danger-soft text-danger",
};

const statusLabel: Record<Patient["status"], string> = {
  in_progress: "IN PROGRESS",
  waiting: "WAITING",
  completed: "COMPLETED",
  skipped: "SKIPPED",
};

function QueuePage() {
  const {
    state,
    hydrated,
    selectedDoctor,
    startPatient,
    completePatient,
    skipPatient,
    requeuePatient,
    pauseQueue,
    resumeQueue,
    addEmergency,
  } = useMediEase();
  const router = useRouter();
  const [pauseOpen, setPauseOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [exceptionsOpen, setExceptionsOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.session) {
      router.navigate({ to: "/", replace: true });
      return;
    }
    if (!state.selectedDoctorId) router.navigate({ to: "/select-doctor", replace: true });
  }, [hydrated, state.session, state.selectedDoctorId, router]);

  if (!selectedDoctor) {
    return (
      <StaffLayout>
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No doctor selected.{" "}
          <Link to="/select-doctor" className="font-semibold text-primary hover:underline">
            Select a doctor
          </Link>
        </p>
      </StaffLayout>
    );
  }

  const doctor = selectedDoctor;
  const stats = queueStats(doctor);
  const current = doctor.patients.find((p) => p.status === "in_progress") ?? null;
  const next = doctor.patients.find((p) => p.status === "waiting") ?? null;
  const skipped = doctor.patients.filter((p) => p.status === "skipped");

  return (
    <StaffLayout>
      <button
        type="button"
        onClick={() => router.navigate({ to: "/select-doctor" })}
        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        <ChevronLeft className="size-3" /> Change Doctor
      </button>

      <h1 className="mt-2 text-base font-bold text-foreground">{doctor.name}</h1>
      <p className="text-xs text-muted-foreground">
        {doctor.specialty} · {doctor.room}
      </p>
      <p className="text-xs text-muted-foreground">
        {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </p>

      {doctor.paused ? (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-warning-soft p-3 text-xs text-warning-foreground">
          <Pause className="mt-0.5 size-3.5 shrink-0" />
          <span>
            Queue paused — <span className="font-semibold">{doctor.pauseReason}</span>. Resume to
            continue calling patients.
          </span>
        </div>
      ) : null}

      {/* Current consultation */}
      <section className="mt-4 rounded-xl border border-border bg-card p-4 shadow-card">
        {current ? (
          <>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-success">
                <span className="size-2 rounded-full bg-success" /> CURRENTLY IN CONSULTATION
              </span>
              <span className="text-xs font-semibold text-primary">{current.token}</span>
            </div>
            <h2 className="mt-2 text-base font-bold text-foreground">{current.name}</h2>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="size-3" /> Started {current.time}
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                className="flex-1"
                variant="secondary"
                onClick={() => {
                  completePatient(current.id);
                  toast.success(`${current.name} marked as completed`);
                }}
              >
                Complete
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => {
                  skipPatient(current.id);
                  toast.info(`${current.name} skipped`);
                }}
              >
                <SkipForward className="size-4" /> Skip Patient
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[10px] font-bold tracking-wide text-muted-foreground">
              NO ACTIVE CONSULTATION
            </p>
            {next ? (
              <>
                <h2 className="mt-2 text-base font-bold text-foreground">{next.name}</h2>
                <p className="text-[11px] text-muted-foreground">Ready to be called · {next.token}</p>
                <Button
                  className="mt-3 w-full"
                  disabled={doctor.paused || doctor.status === "unavailable"}
                  onClick={() => {
                    startPatient(next.id);
                    toast.success(`Consultation started for ${next.name}`);
                  }}
                >
                  <Play className="size-4" /> Start Patient
                </Button>
                {doctor.paused ? (
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Resume the queue to start the next consultation.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {stats.total === 0
                  ? "No appointments booked for today."
                  : "All patients have been seen. The queue is clear."}
              </p>
            )}
          </>
        )}
      </section>

      {/* Next patient */}
      {current && next ? (
        <section className="mt-3 rounded-xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wide text-muted-foreground">
              NEXT PATIENT
            </span>
            {next.emergency ? (
              <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[10px] font-bold text-danger">
                PRIORITY
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{next.name}</h3>
              <p className="text-[11px] text-muted-foreground">Est. {next.time}</p>
            </div>
            <span className="text-xs font-semibold text-primary">{next.token}</span>
          </div>
        </section>
      ) : null}

      {/* Queue list */}
      <section className="mt-3 rounded-xl border border-border bg-card p-4 shadow-card">
        <h3 className="text-sm font-semibold text-foreground">Today's Queue</h3>
        <ul className="mt-2 divide-y divide-border">
          {doctor.patients.length === 0 ? (
            <li className="py-6 text-center text-xs text-muted-foreground">
              The queue is empty. Add an emergency patient or wait for appointments.
            </li>
          ) : null}
          {doctor.patients.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-2.5">
              <span className="w-10 shrink-0 text-[11px] font-bold text-primary">{p.token}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-foreground">
                  {p.name}
                  {p.emergency ? " ★" : ""}
                </span>
                <span className="block text-[10px] text-muted-foreground">{p.time}</span>
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusChip[p.status]}`}
              >
                {statusLabel[p.status]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Summary */}
      <section className="mt-3 rounded-xl border border-border bg-card p-4 shadow-card">
        <h3 className="text-[10px] font-bold tracking-wide text-muted-foreground">QUEUE SUMMARY</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat value={stats.total} label="Total" tone="bg-brand-soft text-primary" />
          <Stat value={stats.inConsult} label="In Consult" tone="bg-success-soft text-success" />
          <Stat value={stats.waiting} label="Waiting" tone="bg-warning-soft text-warning-foreground" />
          <Stat value={stats.completed} label="Completed" tone="bg-muted text-muted-foreground" />
        </div>
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-[11px] text-muted-foreground">
          <Timer className="size-3.5" /> Estimated wait: {stats.estWait} mins
        </p>
      </section>

      {/* Staff controls */}
      <section className="mt-3 space-y-2">
        <h3 className="text-[10px] font-bold tracking-wide text-muted-foreground">STAFF CONTROLS</h3>
        <Button variant="destructive" className="w-full" onClick={() => setEmergencyOpen(true)}>
          <AlertTriangle className="size-4" /> Emergency
        </Button>
        <Button className="w-full" disabled={doctor.paused} onClick={() => setPauseOpen(true)}>
          <Pause className="size-4" /> Pause Queue
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          disabled={!doctor.paused}
          onClick={() => {
            resumeQueue();
            toast.success("Queue resumed");
          }}
        >
          <Play className="size-4" /> Resume Queue
        </Button>
        <Button variant="outline" className="w-full" onClick={() => setExceptionsOpen(true)}>
          <Settings2 className="size-4" /> Manage Exceptions
        </Button>
      </section>

      <PauseDialog
        open={pauseOpen}
        onOpenChange={setPauseOpen}
        onConfirm={(reason) => {
          pauseQueue(reason);
          toast.success(`Queue paused — ${reason}`);
          setPauseOpen(false);
        }}
      />

      <EmergencyDialog
        open={emergencyOpen}
        onOpenChange={setEmergencyOpen}
        onSubmit={(data) => {
          const res = addEmergency(data);
          if (!res.ok) {
            toast.error(res.error ?? "Could not add emergency patient");
            return false;
          }
          toast.success(`${data.name} added to the front of the queue`);
          return true;
        }}
      />

      <Dialog open={exceptionsOpen} onOpenChange={setExceptionsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Manage Exceptions</DialogTitle>
            <DialogDescription>Skipped patients can be returned to the queue.</DialogDescription>
          </DialogHeader>
          {skipped.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No exceptions to manage right now.
            </p>
          ) : (
            <ul className="space-y-2">
              {skipped.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <span className="text-xs">
                    <span className="font-semibold">{p.token}</span> · {p.name}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      requeuePatient(p.id);
                      toast.success(`${p.name} returned to the queue`);
                    }}
                  >
                    Re-queue
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </StaffLayout>
  );
}

function Stat({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <div className={`rounded-lg px-3 py-3 text-center ${tone}`}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] opacity-80">{label}</p>
    </div>
  );
}

function PauseDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
      setNote("");
      setError("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pause className="size-4" /> Pause Queue
          </DialogTitle>
          <DialogDescription>Select reason for pausing the queue:</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {pauseReasons.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setReason(r);
                setError("");
              }}
              className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                reason === r
                  ? "border-primary bg-brand-soft font-semibold text-primary"
                  : "border-border bg-muted/40 text-foreground hover:bg-accent"
              }`}
            >
              {r}
            </button>
          ))}
          {reason === "Other" ? (
            <Textarea
              placeholder="Describe the reason"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          ) : null}
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!reason) {
                setError("Please select a reason.");
                return;
              }
              if (reason === "Other" && note.trim().length < 3) {
                setError("Please describe the reason (min 3 characters).");
                return;
              }
              onConfirm(reason === "Other" ? `Other — ${note.trim()}` : reason);
            }}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type EmergencyInput = { name: string; contact: string; reason: string; priority: Priority };

function EmergencyDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: EmergencyInput) => boolean;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState<Priority>("critical");
  const [errors, setErrors] = useState<{ name?: string; contact?: string; reason?: string }>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setContact("");
      setReason("");
      setPriority("critical");
      setErrors({});
      setBusy(false);
    }
  }, [open]);

  const submit = () => {
    if (busy) return;
    const next: { name?: string; contact?: string; reason?: string } = {};
    if (!name.trim()) next.name = "Patient name is required.";
    else if (name.trim().length < 2) next.name = "Enter a valid name.";
    if (!contact.trim()) next.contact = "ID or phone number is required.";
    else if (!/^[A-Za-z0-9+\-/ ]{4,20}$/.test(contact.trim()))
      next.contact = "Enter a valid ID or 10-digit phone number.";
    if (!reason.trim()) next.reason = "A brief reason is required.";
    else if (reason.trim().length > 300) next.reason = "Keep the reason under 300 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    const ok = onSubmit({
      name: name.trim(),
      contact: contact.trim(),
      reason: reason.trim(),
      priority,
    });
    if (ok) onOpenChange(false);
    else setBusy(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-4" /> New Emergency
          </DialogTitle>
          <DialogDescription>Emergency patients are placed ahead of the queue.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ename">Patient Name</Label>
            <Input
              id="ename"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="econtact">ID / Phone</Label>
            <Input
              id="econtact"
              placeholder="Enter ID or phone number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            {errors.contact ? <p className="text-xs text-destructive">{errors.contact}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ereason">Reason</Label>
            <Textarea
              id="ereason"
              placeholder="Brief description"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            {errors.reason ? <p className="text-xs text-destructive">{errors.reason}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="epriority">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger id="epriority" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            <X className="size-4" /> Cancel
          </Button>
          <Button variant="destructive" onClick={submit} disabled={busy}>
            {busy ? "Adding..." : "Add to Queue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
