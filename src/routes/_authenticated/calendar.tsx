import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTable } from "@/lib/data-hooks";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({ meta: [{ title: "Calendar — CropCare" }] }),
  component: CalendarPage,
});

const TYPES = [
  { key: "water", label: "Watering", color: "bg-water text-white" },
  { key: "pest", label: "Pesticides", color: "bg-destructive text-white" },
  { key: "fert", label: "Fertilizers", color: "bg-sun text-foreground" },
  { key: "harvest", label: "Harvest", color: "bg-primary text-primary-foreground" },
];

function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const { data: water = [] } = useTable<any>("watering_schedules");
  const { data: pest = [] } = useTable<any>("pesticide_schedules");
  const { data: fert = [] } = useTable<any>("fertilizer_schedules");
  const { data: harvests = [] } = useTable<any>("harvests", "harvest_date");

  const events = useMemo(() => {
    const map = new Map<string, { type: string; label: string }[]>();
    const push = (date: string, type: string, label: string) => {
      const k = date.slice(0, 10);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push({ type, label });
    };
    water.forEach(w => push(w.scheduled_at, "water", "Water"));
    pest.forEach(p => push(p.scheduled_at, "pest", p.pesticide_name));
    fert.forEach(f => push(f.scheduled_at, "fert", f.fertilizer_name));
    harvests.forEach(h => push(h.harvest_date, "harvest", "Harvest"));
    return map;
  }, [water, pest, fert, harvests]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(startDay).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const color = (t: string) => TYPES.find(x => x.key === t)?.color ?? "bg-muted";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><CalendarDays className="size-7 text-primary"/> Calendar</h1>
          <p className="text-muted-foreground">All farm activities at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="size-4"/></Button>
          <div className="w-40 text-center font-medium">{cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}</div>
          <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight className="size-4"/></Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap text-xs">
        {TYPES.map(t => <span key={t.key} className={`px-2 py-1 rounded ${t.color}`}>{t.label}</span>)}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-px bg-border rounded overflow-hidden">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="bg-muted text-center text-xs font-medium py-2">{d}</div>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <div key={i} className="bg-background h-24"/>;
              const dateKey = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const ev = events.get(dateKey) || [];
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              return (
                <div key={i} className="bg-background min-h-24 p-1.5 text-xs">
                  <div className={`size-6 grid place-items-center rounded-full text-xs ${isToday ? "bg-primary text-primary-foreground" : ""}`}>{day}</div>
                  <div className="space-y-0.5 mt-1">
                    {ev.slice(0,3).map((e, k) => (
                      <div key={k} className={`px-1.5 py-0.5 rounded text-[10px] truncate ${color(e.type)}`}>{e.label}</div>
                    ))}
                    {ev.length > 3 && <div className="text-[10px] text-muted-foreground">+{ev.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
