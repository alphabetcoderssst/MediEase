import { createFileRoute, useRouter } from "@tanstack/react-router";
import { CalendarDays, Clock, DoorOpen, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { StaffLayout } from "@/components/mediease/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMediEase, type Doctor } from "@/lib/mediease-store";

export const Route = createFileRoute("/select-doctor")({
  head: () => ({
    meta: [
      { title: "Select Doctor — MediEase Queue" },
      {
        name: "description",
        content:
          "Pick the doctor whose patient queue you are managing today, with live availability and appointment counts.",
      },
      { property: "og:title", content: "Select Doctor — MediEase Queue" },
      { property: "og:description", content: "Choose a doctor to manage their patient queue." },
    ],
  }),
  component: SelectDoctorPage,
});

const statusMeta: Record<Doctor["status"], { label: string; dot: string; text: string }> = {
  active: { label: "Consultation Active", dot: "bg-success", text: "text-success" },
  not_started: { label: "Not Started", dot: "bg-warning", text: "text-warning" },
  unavailable: { label: "Unavailable", dot: "bg-muted-foreground", text: "text-muted-foreground" },
};

function SelectDoctorPage() {
  const { state, hydrated, selectDoctor } = useMediEase();
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (hydrated && !state.session) router.navigate({ to: "/", replace: true });
  }, [hydrated, state.session, router]);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  const doctors = state.doctors.filter((d) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q);
  });

  const anyAvailable = state.doctors.some((d) => d.status !== "unavailable");

  return (
    <StaffLayout>
      <h1 className="text-lg font-bold text-foreground">Select Doctor</h1>
      <p className="text-sm text-muted-foreground">Choose the doctor you are managing today</p>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
        <CalendarDays className="size-4 text-primary" />
        {today}
      </div>

      <div className="relative mt-3">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by doctor name or department"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {!anyAvailable ? (
        <p className="mt-4 rounded-lg border border-border bg-warning-soft p-3 text-xs text-warning-foreground">
          No doctors are available right now. Queue management is on hold until a doctor becomes
          available.
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {doctors.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No doctors match “{query}”.
          </p>
        ) : null}

        {doctors.map((doctor) => {
          const meta = statusMeta[doctor.status];
          const disabled = doctor.status === "unavailable";
          return (
            <article
              key={doctor.id}
              className={`rounded-xl border bg-card p-4 shadow-card ${
                disabled ? "border-border opacity-70" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{doctor.name}</h2>
                  <p className="text-xs text-primary">{doctor.specialty}</p>
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <DoorOpen className="size-3" /> {doctor.room}
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="size-3" /> {doctor.hours}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">{doctor.patients.length}</p>
                  <p className="text-[10px] text-muted-foreground">Appointments Today</p>
                </div>
              </div>

              <p className={`mt-3 flex items-center gap-1.5 text-[11px] font-medium ${meta.text}`}>
                <span className={`size-2 rounded-full ${meta.dot}`} /> {meta.label}
                {doctor.paused ? " · Paused" : ""}
              </p>

              <Button
                className="mt-3 w-full"
                disabled={disabled}
                onClick={() => {
                  selectDoctor(doctor.id);
                  toast.success(`Managing queue for ${doctor.name}`);
                  router.navigate({ to: "/queue" });
                }}
              >
                {disabled ? "Unavailable" : "Select Doctor"}
              </Button>
            </article>
          );
        })}
      </div>
    </StaffLayout>
  );
}
