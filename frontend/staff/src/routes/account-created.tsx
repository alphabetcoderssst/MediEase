import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/mediease/AppShell";
import { Button } from "@/components/ui/button";
import { useMediEase } from "@/lib/mediease-store";

export const Route = createFileRoute("/account-created")({
  head: () => ({
    meta: [
      { title: "Account Created — MediEase" },
      {
        name: "description",
        content: "Your MediEase staff account is ready. Note your Staff ID and sign in to manage queues.",
      },
      { property: "og:title", content: "Account Created — MediEase" },
      { property: "og:description", content: "Your MediEase staff account has been created." },
    ],
  }),
  component: AccountCreatedPage,
});

function AccountCreatedPage() {
  const { state } = useMediEase();
  const router = useRouter();
  const staffId = state.createdStaffId;

  if (!staffId) {
    return (
      <AuthLayout title="Nothing to show here" description="No account was created in this session.">
        <Button className="w-full" onClick={() => router.navigate({ to: "/register" })}>
          Create an account
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Account Created Successfully"
      description="Your MediEase staff account is ready. You can now access patient queues and system tools."
    >
      <div className="space-y-5">
        <div className="flex justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
            <CheckCircle2 className="size-8" />
          </span>
        </div>

        <div className="rounded-lg bg-muted px-4 py-3 text-center text-sm">
          <span className="text-muted-foreground">Staff ID: </span>
          <span className="font-bold text-foreground">{staffId}</span>
        </div>

        <Button className="w-full" onClick={() => router.navigate({ to: "/" })}>
          Go to Staff Login <ArrowRight className="size-4" />
        </Button>

        <p className="text-center text-[11px] text-muted-foreground">
          Having trouble?{" "}
          <button
            type="button"
            onClick={() => toast.info("Support: +91 1800 200 4567 · support@mediease.health")}
            className="font-semibold text-primary hover:underline"
          >
            Contact Support
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
