import { createFileRoute, Link } from "@tanstack/react-router";
import { StaffLayout } from "@/components/mediease/AppShell";
import { queueStats, useMediEase } from "@/lib/mediease-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Staff Dashboard — MediEase" },
      {
        name: "description",
        content: "Overview of today's doctors, active consultations and waiting patients at a glance.",
      },
      { property: "og:title", content: "Staff Dashboard — MediEase" },
      { property: "og:description", content: "Today's queue overview across all doctors." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { state } = useMediEase();
  const totals = state.doctors.reduce(
    (acc, d) => {
      const s = queueStats(d);
      return {
        total: acc.total + s.total,
        waiting: acc.waiting + s.waiting,
        completed: acc.completed + s.completed,
      };
    },
    { total: 0, waiting: 0, completed: 0 },
  );

  return (
    <StaffLayout>
      <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Today's activity across all clinics</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          ["Appointments", totals.total],
          ["Waiting", totals.waiting],
          ["Completed", totals.completed],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-border bg-card p-3 text-center shadow-card">
            <p className="text-lg font-bold text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {state.doctors.map((d) => {
          const s = queueStats(d);
          return (
            <li key={d.id} className="rounded-xl border border-border bg-card p-3 shadow-card">
              <p className="text-sm font-semibold text-foreground">{d.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {d.specialty} · {s.waiting} waiting · {s.completed} completed
                {d.paused ? " · paused" : ""}
              </p>
            </li>
          );
        })}
      </ul>

      <Link
        to="/select-doctor"
        className="mt-4 block rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
      >
        Manage a queue
      </Link>
    </StaffLayout>
  );
}
