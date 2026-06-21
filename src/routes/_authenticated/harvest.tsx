import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wheat, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlants, useTable, useInsert, useDelete } from "@/lib/data-hooks";

export const Route = createFileRoute("/_authenticated/harvest")({
  head: () => ({ meta: [{ title: "Harvest — CropCare" }] }),
  component: HarvestPage,
});

function HarvestPage() {
  const { data: plants = [] } = usePlants();
  const { data: harvests = [] } = useTable<any>("harvests", "harvest_date");
  const insert = useInsert("harvests", ["harvests", "plants"]);
  const del = useDelete("harvests");
  const [open, setOpen] = useState(false);
  const [plantId, setPlantId] = useState("");
  const [grade, setGrade] = useState("A");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!plantId) return;
    const fd = new FormData(e.currentTarget);
    await insert.mutateAsync({
      plant_id: plantId,
      harvest_date: fd.get("harvest_date"),
      quantity: Number(fd.get("quantity") || 0),
      unit: fd.get("unit") || "kg",
      grade,
      notes: fd.get("notes") || null,
    });
    setOpen(false);
  }

  const totalYield = harvests.reduce((s, h) => s + Number(h.quantity || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Wheat className="size-7 text-sun"/> Harvest</h1>
          <p className="text-muted-foreground">Record yields and quality grades</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button disabled={plants.length === 0}><Plus className="size-4"/> Mark harvest</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record a harvest</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Plant</Label>
                <Select value={plantId} onValueChange={setPlantId}>
                  <SelectTrigger><SelectValue placeholder="Select plant"/></SelectTrigger>
                  <SelectContent>{plants.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label>Date</Label><Input name="harvest_date" type="date" required defaultValue={new Date().toISOString().slice(0,10)}/></div>
                <div className="space-y-1.5"><Label>Quantity</Label><Input name="quantity" type="number" step="0.1" required/></div>
                <div className="space-y-1.5"><Label>Unit</Label><Input name="unit" defaultValue="kg"/></div>
              </div>
              <div className="space-y-1.5">
                <Label>Quality grade</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Grade A</SelectItem>
                    <SelectItem value="B">Grade B</SelectItem>
                    <SelectItem value="C">Grade C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Notes</Label><Input name="notes"/></div>
              <DialogFooter><Button type="submit" disabled={insert.isPending}>Save</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Total yield</div>
            <div className="text-3xl font-bold">{totalYield.toFixed(1)} kg</div>
          </div>
          <div className="text-sm text-muted-foreground">{harvests.length} records</div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {harvests.map(h => {
          const plant = plants.find(p => p.id === h.plant_id);
          return (
            <Card key={h.id}>
              <CardContent className="p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{plant?.name || "Unknown"}</div>
                  <div className="text-xs text-muted-foreground">{h.harvest_date} · {h.quantity}{h.unit}</div>
                </div>
                <Badge>Grade {h.grade}</Badge>
                <Button variant="ghost" size="sm" onClick={() => del.mutate(h.id)}><Trash2 className="size-4"/></Button>
              </CardContent>
            </Card>
          );
        })}
        {harvests.length === 0 && <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No harvests yet.</CardContent></Card>}
      </div>
    </div>
  );
}
