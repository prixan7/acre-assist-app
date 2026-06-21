import type { ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Sprout, Droplets, Bug, FlaskConical, LineChart,
  Wheat, CalendarDays, FileBarChart, Settings, LogOut, Leaf,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/plants", label: "Plants", icon: Sprout },
  { to: "/watering", label: "Watering", icon: Droplets },
  { to: "/pesticide", label: "Pesticides", icon: Bug },
  { to: "/fertilizer", label: "Fertilizers", icon: FlaskConical },
  { to: "/growth", label: "Growth", icon: LineChart },
  { to: "/harvest", label: "Harvest", icon: Wheat },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="px-6 py-5 flex items-center gap-2 border-b border-sidebar-border">
          <div className="size-9 rounded-lg bg-primary grid place-items-center text-primary-foreground">
            <Leaf className="size-5" />
          </div>
          <div>
            <div className="font-semibold leading-tight">CropCare</div>
            <div className="text-xs text-muted-foreground">Smart Farm OS</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Leaf className="size-5 text-primary" />
            <span className="font-semibold">CropCare</span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="size-4" /></Button>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
        <nav className="md:hidden border-t bg-sidebar grid grid-cols-5 text-xs">
          {nav.slice(0, 5).map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className={`flex flex-col items-center gap-1 py-2 ${active ? "text-primary" : "text-muted-foreground"}`}>
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
