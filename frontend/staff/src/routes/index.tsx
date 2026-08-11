import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, IdCard, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/mediease/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMediEase } from "@/lib/mediease-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Staff Login — MediEase Hospital Queue System" },
      {
        name: "description",
        content:
          "Sign in with your MediEase staff ID to manage doctor queues, consultations and emergency patients.",
      },
      { property: "og:title", content: "Staff Login — MediEase Hospital Queue System" },
      {
        property: "og:description",
        content: "Sign in to manage hospital patient queues with MediEase.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useMediEase();
  const router = useRouter();
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ staffId?: string | undefined; password?: string | undefined }>({});
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const next: typeof errors = {};
    if (!staffId.trim()) next.staffId = "Staff ID is required.";
    else if (!/^[A-Za-z]{2}-?\d{3,5}$/.test(staffId.trim()))
      next.staffId = "Staff ID looks invalid (e.g. ME-7824).";
    if (!password) next.password = "Password is required.";
    else if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    const normalized = staffId.trim().toUpperCase().replace(/^([A-Z]{2})(\d)/, "$1-$2");
    const res = login(normalized, password);
    if (!res.ok) {
      setBusy(false);
      setErrors({ password: res.error });
      toast.error(res.error ?? "Login failed");
      return;
    }
    toast.success("Signed in to MediEase");
    router.navigate({ to: "/select-doctor" });
  };

  return (
    <AuthLayout title="Staff Login" description="Sign in to manage the hospital queue">
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="staffId">Staff ID</Label>
          <div className="relative">
            <IdCard className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="staffId"
              className="pl-9"
              placeholder="Enter Staff ID"
              value={staffId}
              autoComplete="username"
              onChange={(e) => setStaffId(e.target.value)}
              aria-invalid={!!errors.staffId}
            />
          </div>
          {errors.staffId ? <p className="text-xs text-destructive">{errors.staffId}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={show ? "text" : "password"}
              className="pl-9 pr-10"
              placeholder="Enter Password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
          <div className="text-right">
            <button
              type="button"
              onClick={() =>
                toast.info("Password reset link sent to your registered mobile number.")
              }
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Signing in..." : "Login"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          New to MediEase?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Sign Up
          </Link>
        </p>
        <p className="rounded-md bg-muted p-2 text-center text-[11px] text-muted-foreground">
          Demo account — Staff ID <span className="font-semibold">ME-7824</span>, password{" "}
          <span className="font-semibold">demo1234</span>
        </p>
      </form>
    </AuthLayout>
  );
}
