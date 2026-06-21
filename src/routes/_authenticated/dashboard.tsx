import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Sprout, Droplets, Bug, FlaskConical, Wheat, CalendarDays, TrendingUp, Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePlants, useTable } from "@/lib/data-hooks";
import { predictHarvest } from "@/lib/crop-database";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CropCare" }] }),
  component: Dashboard,
});

function isToday(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  return d.toDateString() === n.toDateString();
}
function isPastDue(iso: string) { return new Date(iso) < new Date(); }
function withinDays(iso: string, n: number) {
  const diff = (new Date(iso).getTime() - Date.now()) / 86400000;
  return diff >= 0 && diff <= n;
}

function Dashboard() {
  const { data: plants = [] } = usePlants();
  const { data: water = [] } = useTable<any>("watering_schedules");
  const { data: pest = [] } = useTable<any>("pesticide_schedules");
  const { data: fert = [] } = useTable<any>("fertilizer_schedules");

  const stats = useMemo(() => {
    const totalQty = plants.reduce((s, p) => s + (p.quantity || 0), 0);
    const waterDue = water.filter((w) => w.status === "pending" && (isPastDue(w.scheduled_at) || withinDays(w.scheduled_at, 1))).length;
    const pestUpcoming = pest.filter((p) => p.status === "pending" && withinDays(p.scheduled_at, 7)).length;
    const fertUpcoming = fert.filter((f) => f.status === "pending" && withinDays(f.scheduled_at, 7)).length;
    const readyHarvest = plants.filter((p) => {
      const pr = predictHarvest(p.crop_type, p.planting_date);
      return pr.status === "ready" || pr.status === "nearly_ready";
    }).length;
    return { totalPlants: plants.length, totalQty, waterDue, pestUpcoming, fertUpcoming, readyHarvest };
  }, [plants, water, pest, fert]);

  const today = useMemo(() => {
    const items: { type: string; label: string; at: string }[] = [];
    water.filter(w => isToday(w.scheduled_at)).forEach(w => items.push({ type: "water", label: `Water plant`, at: w.scheduled_at }));
    pest.filter(w => isToday(w.scheduled_at)).forEach(w => items.push({ type: "pest", label: `Apply ${w.pesticide_name}`, at: w.scheduled_at }));
    fert.filter(w => isToday(w.scheduled_at)).forEach(w => items.push({ type: "fert", label: `Apply ${w.fertilizer_name}`, at: w.scheduled_at }));
    return items;
  }, [water, pest, fert]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Farm Dashboard</h1>
          <p className="text-muted-foreground">Overview of your crops and today's activities</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild><Link to="/plants"><Plus className="size-4"/> Add Plant</Link></Button>
          <Button variant="outline" asChild><Link to="/watering">Schedule Water</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Sprout} label="Total Plants" value={stats.totalPlants} sub={`${stats.totalQty} units`} accent="text-primary"/>
        <StatCard icon={Droplets} label="Watering Due" value={stats.waterDue} sub="next 24h" accent="text-water"/>
        <StatCard icon={Bug} label="Pesticide Tasks" value={stats.pestUpcoming} sub="next 7 days" accent="text-destructive"/>
        <StatCard icon={FlaskConical} label="Fertilizer Tasks" value={stats.fertUpcoming} sub="next 7 days" accent="text-sun"/>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><TrendingUp className="size-4"/> Crops in progress</CardTitle>
            <Badge variant="secondary">{plants.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {plants.length === 0 && <p className="text-sm text-muted-foreground">No plants yet. Add your first crop to get started.</p>}
            {plants.slice(0, 6).map((p) => {
              const pr = predictHarvest(p.crop_type, p.planting_date);
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="size-10 rounded-md bg-accent grid place-items-center"><Sprout className="size-5 text-primary"/></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium truncate">{p.name} <span className="text-muted-foreground text-sm">· {p.crop_type}</span></div>
                      <span className="text-xs text-muted-foreground">{pr.daysRemaining}d to harvest</span>
                    </div>
                    <Progress value={pr.percent} className="mt-1"/>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="size-4"/> Today</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {today.length === 0 && <p className="text-sm text-muted-foreground">Nothing scheduled today. 🌿</p>}
            {today.map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Badge variant={t.type === "water" ? "default" : "secondary"} className="capitalize">{t.type}</Badge>
                <span className="flex-1 truncate">{t.label}</span>
                <span className="text-muted-foreground text-xs">{new Date(t.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit"})}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Wheat className="size-4"/> Ready for harvest</CardTitle></CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.readyHarvest}</div>
          <p className="text-sm text-muted-foreground">crops nearly or fully ready</p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent }: any) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </div>
          <div className={`size-10 rounded-md bg-accent grid place-items-center ${accent}`}><Icon className="size-5"/></div>
        </div>
      </CardContent>
    </Card>
  );
}
