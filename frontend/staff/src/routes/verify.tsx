import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/mediease/AppShell";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useMediEase } from "@/lib/mediease-store";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify Mobile Number — MediEase" },
      {
        name: "description",
        content: "Enter the 6-digit OTP sent to your mobile number to finish creating your MediEase staff account.",
      },
      { property: "og:title", content: "Verify Mobile Number — MediEase" },
      { property: "og:description", content: "Confirm your mobile number with a one-time password." },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const { state, verifyOtp, resendOtp, clearPending } = useMediEase();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const pending = state.pending;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (pending) toast.info(`Demo OTP: ${pending.otp}`, { id: "otp-demo" });
  }, [pending?.otp, pending]);

  if (!pending) {
    return (
      <AuthLayout title="No pending verification" description="Start a new registration to continue.">
        <Button className="w-full" onClick={() => router.navigate({ to: "/register" })}>
          Go to Registration
        </Button>
      </AuthLayout>
    );
  }

  const masked = `+91 XXXXX X${pending.mobile.slice(-4)}`;

  const verify = () => {
    if (busy) return;
    if (otp.length !== 6) {
      setError("Enter all 6 digits of the OTP.");
      return;
    }
    setBusy(true);
    const res = verifyOtp(otp);
    if (!res.ok) {
      setBusy(false);
      setOtp("");
      setError(res.error ?? "Verification failed");
      toast.error(res.error ?? "Verification failed");
      return;
    }
    toast.success("Mobile verified");
    router.navigate({ to: "/account-created" });
  };

  return (
    <AuthLayout title="Verify Mobile Number" description={`We've sent an OTP to ${masked}`}>
      <div className="space-y-5">
        <div className="flex justify-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-primary">
            <Smartphone className="size-6" />
          </span>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(v) => {
              setOtp(v);
              setError("");
            }}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error ? <p className="text-center text-xs text-destructive">{error}</p> : null}

        <Button className="w-full" onClick={verify} disabled={busy || otp.length !== 6}>
          {busy ? "Verifying..." : "Verify & Create Account"}
        </Button>

        <button
          type="button"
          disabled={cooldown > 0}
          onClick={() => {
            const code = resendOtp();
            setOtp("");
            setError("");
            setCooldown(30);
            toast.info(`New OTP sent. Demo OTP: ${code}`);
          }}
          className="w-full text-center text-xs font-semibold text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
        </button>

        <button
          type="button"
          onClick={() => {
            clearPending();
            router.navigate({ to: "/register" });
          }}
          className="flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3" /> Change mobile number
        </button>
      </div>
    </AuthLayout>
  );
}
