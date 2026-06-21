import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { FileBarChart, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTable, usePlants } from "@/lib/data-hooks";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — CropCare" }] }),
  component: ReportsPage,
});

function toCSV(rows: any[]): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [keys.join(","), ...rows.map(r => keys.map(k => escape(r[k])).join(","))].join("\n");
}
function download(name: string, content: string) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

const COLORS = ["var(--color-primary)", "var(--color-water)", "var(--color-sun)", "var(--color-destructive)"];

function ReportsPage() {
  const { data: plants = [] } = usePlants();
  const { data: water = [] } = useTable<any>("watering_schedules");
  const { data: pest = [] } = useTable<any>("pesticide_schedules");
  const { data: fert = [] } = useTable<any>("fertilizer_schedules");
  const { data: harvests = [] } = useTable<any>("harvests", "harvest_date");

  const monthly = useMemo(() => {
    const buckets: Record<string, { month: string; water: number; pest: number; fert: number; harvest: number }> = {};
    const add = (date: string, key: "water"|"pest"|"fert"|"harvest") => {
      const m = date.slice(0,7);
      buckets[m] ??= { month: m, water: 0, pest: 0, fert: 0, harvest: 0 };
      buckets[m][key]++;
    };
    water.forEach(w => add(w.scheduled_at, "water"));
    pest.forEach(w => add(w.scheduled_at, "pest"));
    fert.forEach(w => add(w.scheduled_at, "fert"));
    harvests.forEach(h => add(h.harvest_date, "harvest"));
    return Object.values(buckets).sort((a,b) => a.month.localeCompare(b.month));
  }, [water, pest, fert, harvests]);

  const byCrop = useMemo(() => {
    const m: Record<string, number> = {};
    harvests.forEach(h => {
      const p = plants.find(p => p.id === h.plant_id);
      const k = p?.crop_type || "Other";
      m[k] = (m[k] || 0) + Number(h.quantity || 0);
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [harvests, plants]);

  const taskCompletion = useMemo(() => {
    const all = [...water, ...pest, ...fert];
    const done = all.filter(x => x.status === "completed").length;
    return { done, total: all.length, pct: all.length ? Math.round((done/all.length)*100) : 0 };
  }, [water, pest, fert]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><FileBarChart className="size-7 text-primary"/> Reports & Analytics</h1>
          <p className="text-muted-foreground">Yields, usage, and performance</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => download("harvests.csv", toCSV(harvests))}><Download className="size-4"/> Harvests CSV</Button>
          <Button variant="outline" onClick={() => download("watering.csv", toCSV(water))}><Download className="size-4"/> Watering CSV</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Task completion</div><div className="text-3xl font-bold">{taskCompletion.pct}%</div><div className="text-xs text-muted-foreground">{taskCompletion.done}/{taskCompletion.total} tasks</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Total yield</div><div className="text-3xl font-bold">{harvests.reduce((s,h)=>s+Number(h.quantity||0),0).toFixed(1)}kg</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-sm text-muted-foreground">Active crops</div><div className="text-3xl font-bold">{plants.length}</div></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Monthly activity</CardTitle></CardHeader>
          <CardContent className="h-72">
            {monthly.length === 0 ? <div className="h-full grid place-items-center text-sm text-muted-foreground">No data yet</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)"/>
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12}/>
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12}/>
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}/>
                  <Legend/>
                  <Bar dataKey="water" fill="var(--color-water)" />
                  <Bar dataKey="pest" fill="var(--color-destructive)" />
                  <Bar dataKey="fert" fill="var(--color-sun)" />
                  <Bar dataKey="harvest" fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Yield by crop</CardTitle></CardHeader>
          <CardContent className="h-72">
            {byCrop.length === 0 ? <div className="h-full grid place-items-center text-sm text-muted-foreground">No harvests yet</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCrop} dataKey="value" nameKey="name" outerRadius={90} label>
                    {byCrop.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}/>
                  <Legend/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
