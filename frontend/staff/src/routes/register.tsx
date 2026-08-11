import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, Phone, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/mediease/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediEase } from "@/lib/mediease-store";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Staff Registration — MediEase Hospital Queue System" },
      {
        name: "description",
        content:
          "Create a MediEase staff account with mobile verification to manage hospital patient queues.",
      },
      { property: "og:title", content: "Staff Registration — MediEase" },
      {
        property: "og:description",
        content: "Create your MediEase hospital staff account in a few steps.",
      },
    ],
  }),
  component: RegisterPage,
});

const roles = ["Front Desk", "Nurse", "Queue Manager", "Doctor Assistant", "Administrator"];

type Errors = Partial<
  Record<"fullName" | "mobile" | "role" | "password" | "confirm", string | undefined>
>;


function RegisterPage() {
  const { startSignup } = useMediEase();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const next: Errors = {};
    if (!fullName.trim()) next.fullName = "Full name is required.";
    else if (fullName.trim().length < 3) next.fullName = "Enter your full name.";
    const digits = mobile.replace(/\D/g, "");
    if (!digits) next.mobile = "Mobile number is required.";
    else if (!/^[6-9]\d{9}$/.test(digits)) next.mobile = "Enter a valid 10-digit Indian number.";
    if (!role) next.role = "Please select your role.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Use at least 8 characters.";
    else if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
      next.password = "Include both letters and numbers.";
    if (!confirm) next.confirm = "Please confirm your password.";
    else if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    const res = startSignup({ fullName: fullName.trim(), mobile: digits, role, password });
    if (!res.ok) {
      setBusy(false);
      setErrors({ mobile: res.error });
      toast.error(res.error ?? "Registration failed");
      return;
    }
    toast.success("OTP sent to +91 " + digits);
    router.navigate({ to: "/verify" });
  };

  return (
    <AuthLayout title="MediEase Hospital Queue System" description="Create Staff Account">
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Full Name" error={errors.fullName} htmlFor="fullName">
          <div className="relative">
            <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="fullName"
              className="pl-9"
              placeholder="Dr. Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </Field>

        <Field label="Mobile Number" error={errors.mobile} htmlFor="mobile">
          <div className="flex items-stretch gap-2">
            <span className="flex items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
              +91
            </span>
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="mobile"
                inputMode="numeric"
                maxLength={10}
                className="pl-9"
                placeholder="98765 43210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              />
            </div>
          </div>
        </Field>

        <Field label="Role" error={errors.role} htmlFor="role">
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="role" className="w-full">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Password" error={errors.password} htmlFor="pw">
          <PasswordInput
            id="pw"
            value={password}
            onChange={setPassword}
            show={showPw}
            toggle={() => setShowPw((v) => !v)}
          />
        </Field>

        <Field label="Confirm Password" error={errors.confirm} htmlFor="pw2">
          <PasswordInput
            id="pw2"
            value={confirm}
            onChange={setConfirm}
            show={showConfirm}
            toggle={() => setShowConfirm((v) => !v)}
          />
        </Field>

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Sending OTP..." : "Create Account"}
        </Button>

        <div className="flex gap-2 rounded-md border border-border bg-brand-soft p-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-[11px] leading-snug text-muted-foreground">
            <span className="font-semibold text-foreground">Security Note:</span> Staff registration
            may require hospital authorization before full system access is granted.
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/" className="font-semibold text-primary hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string | undefined;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  show,
  toggle,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  toggle: () => void;
}) {
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        type={show ? "text" : "password"}
        className="pl-9 pr-10"
        placeholder="••••••••"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        onClick={toggle}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
