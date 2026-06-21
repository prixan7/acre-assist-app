import { useState, type ReactNode } from "react";
import { Plus, Check, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlants, useTable, useInsert, useUpdate, useDelete } from "@/lib/data-hooks";

type FreqOption = { value: string; label: string };

const FREQ_DEFAULT: FreqOption[] = [
  { value: "daily", label: "Daily" },
  { value: "alternate", label: "Alternate days" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

type ScheduleConfig = {
  table: string;
  title: string;
  description: string;
  icon: ReactNode;
  itemLabel: (row: any) => string;
  extraFields?: { name: string; label: string; type?: string; required?: boolean; textarea?: boolean }[];
  defaultFrequency: string;
};

export function SchedulePage({ table, title, description, icon, itemLabel, extraFields = [], defaultFrequency }: ScheduleConfig) {
  const { data: plants = [] } = usePlants();
  const { data: rows = [], isLoading } = useTable<any>(table);
  const insert = useInsert(table);
  const update = useUpdate(table);
  const del = useDelete(table);
  const [open, setOpen] = useState(false);
  const [plantId, setPlantId] = useState<string>("");
  const [freq, setFreq] = useState(defaultFrequency);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!plantId) return;
    const row: any = {
      plant_id: plantId,
      scheduled_at: new Date(String(fd.get("scheduled_at"))).toISOString(),
      frequency: freq,
      status: "pending",
    };
    if (extraFields.some(f => f.name === "amount")) row.amount = fd.get("amount");
    for (const f of extraFields) row[f.name] = fd.get(f.name) || null;
    await insert.mutateAsync(row);
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">{icon} {title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button disabled={plants.length === 0}><Plus className="size-4"/> Add schedule</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New {title.toLowerCase()} schedule</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Plant</Label>
                <Select value={plantId} onValueChange={setPlantId}>
                  <SelectTrigger><SelectValue placeholder="Select plant"/></SelectTrigger>
                  <SelectContent>
                    {plants.map(p => <SelectItem key={p.id} value={p.id}>{p.name} · {p.crop_type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {extraFields.map(f => (
                <div key={f.name} className="space-y-1.5">
                  <Label>{f.label}</Label>
                  {f.textarea
                    ? <Textarea name={f.name} required={f.required} rows={2}/>
                    : <Input name={f.name} type={f.type || "text"} required={f.required}/>}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date & time</Label>
                  <Input name="scheduled_at" type="datetime-local" required defaultValue={new Date().toISOString().slice(0,16)}/>
                </div>
                <div className="space-y-1.5">
                  <Label>Frequency</Label>
                  <Select value={freq} onValueChange={setFreq}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {FREQ_DEFAULT.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button type="submit" disabled={insert.isPending}>Save</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {plants.length === 0 && (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">
          Add a plant first to create schedules.
        </CardContent></Card>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      <div className="space-y-3">
        {rows.map((r) => {
          const plant = plants.find(p => p.id === r.plant_id);
          const due = new Date(r.scheduled_at);
          const isOverdue = r.status === "pending" && due < new Date();
          return (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{plant?.name || "Unknown"} · <span className="text-muted-foreground">{itemLabel(r)}</span></div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                    <Clock className="size-3"/> {due.toLocaleString()} · {r.frequency}
                  </div>
                </div>
                <Badge variant={r.status === "completed" ? "secondary" : isOverdue ? "destructive" : "default"} className="capitalize">
                  {isOverdue ? "missed" : r.status}
                </Badge>
                <div className="flex gap-1">
                  {r.status !== "completed" && (
                    <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: r.id, patch: { status: "completed" }})}>
                      <Check className="size-4"/>
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => del.mutate(r.id)}>
                    <Trash2 className="size-4"/>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!isLoading && rows.length === 0 && plants.length > 0 && (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No schedules yet.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
