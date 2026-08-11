import { Link, useRouter } from "@tanstack/react-router";
import { CalendarDays, LayoutDashboard, ListOrdered, LogOut, Stethoscope, User } from "lucide-react";
import type { ReactNode } from "react";
import { useMediEase } from "@/lib/mediease-store";

export function BrandMark({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Stethoscope className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold text-primary">MediEase</span>
        {subtitle ? (
          <span className="block text-[11px] text-muted-foreground">Hospital Queue System</span>
        ) : null}
      </span>
    </div>
  );
}

export function AuthLayout({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-5 flex justify-center">
          <BrandMark />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h1 className="text-center text-xl font-bold text-foreground">{title}</h1>
          {description ? (
            <p className="mt-1 text-center text-sm text-muted-foreground">{description}</p>
          ) : null}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}

const navItems = [
  { to: "/select-doctor", label: "Select", icon: Stethoscope },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/queue", label: "Queue", icon: ListOrdered },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function StaffLayout({ children }: { children: ReactNode }) {
  const { currentStaff, logout } = useMediEase();
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <BrandMark />
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {currentStaff?.fullName ?? "Guest"}
          </span>
          <button
            type="button"
            aria-label="Sign out"
            onClick={() => {
              logout();
              router.navigate({ to: "/", replace: true });
            }}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>
      <div className="flex-1 px-4 py-4 pb-24">{children}</div>
      <nav className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 justify-between border-t border-border bg-card px-2 py-2">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex flex-1 flex-col items-center gap-1 rounded-md py-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-primary font-semibold bg-brand-soft" }}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
