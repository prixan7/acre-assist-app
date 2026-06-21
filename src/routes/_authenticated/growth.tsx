import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LineChart as LineIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlants, useTable, useInsert } from "@/lib/data-hooks";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/growth")({
  head: () => ({ meta: [{ title: "Growth — CropCare" }] }),
  component: GrowthPage,
});

function GrowthPage() {
  const { data: plants = [] } = usePlants();
  const { data: logs = [] } = useTable<any>("growth_logs", "recorded_at");
  const insert = useInsert("growth_logs");
  const [open, setOpen] = useState(false);
  const [plantId, setPlantId] = useState("");
  const [health, setHealth] = useState("good");
  const [selected, setSelected] = useState<string>("");

  const chartData = logs.filter(l => l.plant_id === (selected || logs[0]?.plant_id)).map(l => ({
    date: l.recorded_at, height: Number(l.height_cm) || 0, leaves: l.leaf_count || 0,
  }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!plantId) return;
    const fd = new FormData(e.currentTarget);
    await insert.mutateAsync({
      plant_id: plantId,
      recorded_at: fd.get("recorded_at"),
      height_cm: Number(fd.get("height_cm")) || null,
      leaf_count: Number(fd.get("leaf_count")) || null,
      health,
      observation: fd.get("observation") || null,
    });
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><LineIcon className="size-7 text-primary"/> Growth Monitoring</h1>
          <p className="text-muted-foreground">Record measurements and observe trends</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button disabled={plants.length === 0}><Plus className="size-4"/> Log growth</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record growth observation</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Plant</Label>
                <Select value={plantId} onValueChange={setPlantId}>
                  <SelectTrigger><SelectValue placeholder="Select plant"/></SelectTrigger>
                  <SelectContent>{plants.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Date</Label><Input name="recorded_at" type="date" required defaultValue={new Date().toISOString().slice(0,10)}/></div>
                <div className="space-y-1.5"><Label>Height (cm)</Label><Input name="height_cm" type="number" step="0.1"/></div>
                <div className="space-y-1.5"><Label>Leaves</Label><Input name="leaf_count" type="number"/></div>
                <div className="space-y-1.5">
                  <Label>Health</Label>
                  <Select value={health} onValueChange={setHealth}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5"><Label>Observation</Label><Textarea name="observation" rows={2}/></div>
              <DialogFooter><Button type="submit" disabled={insert.isPending}>Save</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Height trend</CardTitle>
          <Select value={selected || plants[0]?.id || ""} onValueChange={setSelected}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Plant"/></SelectTrigger>
            <SelectContent>{plants.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="h-64">
          {chartData.length === 0 ? (
            <div className="h-full grid place-items-center text-sm text-muted-foreground">No measurements yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)"/>
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12}/>
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12}/>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}/>
                <Line type="monotone" dataKey="height" stroke="var(--color-primary)" strokeWidth={2}/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {logs.slice(-12).reverse().map(l => {
          const plant = plants.find(p => p.id === l.plant_id);
          return (
            <Card key={l.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between"><div className="font-medium">{plant?.name}</div><Badge variant="secondary" className="capitalize">{l.health}</Badge></div>
                <div className="text-xs text-muted-foreground">{l.recorded_at}</div>
                <div className="text-sm">{l.height_cm ?? "—"}cm · {l.leaf_count ?? "—"} leaves</div>
                {l.observation && <p className="text-sm text-muted-foreground">{l.observation}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
