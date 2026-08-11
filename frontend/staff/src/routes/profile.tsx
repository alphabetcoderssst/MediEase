import { createFileRoute, useRouter } from "@tanstack/react-router";
import { StaffLayout } from "@/components/mediease/AppShell";
import { Button } from "@/components/ui/button";
import { useMediEase } from "@/lib/mediease-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Staff Profile — MediEase" },
      {
        name: "description",
        content: "Your MediEase staff details, role and session controls.",
      },
      { property: "og:title", content: "Staff Profile — MediEase" },
      { property: "og:description", content: "View your staff account details and sign out." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { currentStaff, logout } = useMediEase();
  const router = useRouter();

  return (
    <StaffLayout>
      <h1 className="text-lg font-bold text-foreground">Profile</h1>
      {currentStaff ? (
        <dl className="mt-4 space-y-2 rounded-xl border border-border bg-card p-4 text-sm shadow-card">
          {[
            ["Staff ID", currentStaff.staffId],
            ["Name", currentStaff.fullName],
            ["Mobile", `+91 ${currentStaff.mobile}`],
            ["Role", currentStaff.role],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-medium text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">You are not signed in.</p>
      )}
      <Button
        variant="outline"
        className="mt-4 w-full"
        onClick={() => {
          logout();
          router.navigate({ to: "/", replace: true });
        }}
      >
        Sign out
      </Button>
    </StaffLayout>
  );
}
