import { createFileRoute } from "@tanstack/react-router";
import { StaffLayout } from "@/components/mediease/AppShell";
import { useMediEase } from "@/lib/mediease-store";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Today's Schedule — MediEase" },
      {
        name: "description",
        content: "Consultation hours and room allocation for every doctor on duty today.",
      },
      { property: "og:title", content: "Today's Schedule — MediEase" },
      { property: "og:description", content: "Doctor hours and rooms for today." },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  const { state } = useMediEase();
  return (
    <StaffLayout>
      <h1 className="text-lg font-bold text-foreground">Schedule</h1>
      <p className="text-sm text-muted-foreground">Consultation hours for today</p>
      <ul className="mt-4 space-y-2">
        {state.doctors.map((d) => (
          <li
            key={d.id}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-card"
          >
            <span>
              <span className="block text-sm font-semibold text-foreground">{d.name}</span>
              <span className="block text-[11px] text-muted-foreground">
                {d.specialty} · {d.room}
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground">{d.hours}</span>
          </li>
        ))}
      </ul>
    </StaffLayout>
  );
}
