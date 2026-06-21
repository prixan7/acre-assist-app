import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlants, useInsert, useDelete } from "@/lib/data-hooks";
import { CROP_DATABASE, predictHarvest } from "@/lib/crop-database";

export const Route = createFileRoute("/_authenticated/plants")({
  head: () => ({ meta: [{ title: "Plants — CropCare" }] }),
  component: PlantsPage,
});

function PlantsPage() {
  const { data: plants = [], isLoading } = usePlants();
  const insert = useInsert("plants");
  const del = useDelete("plants");
  const [open, setOpen] = useState(false);
  const [crop, setCrop] = useState("Tomato");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const planting_date = String(fd.get("planting_date"));
    const pr = predictHarvest(crop, planting_date);
    await insert.mutateAsync({
      name: String(fd.get("name") || crop),
      crop_type: crop,
      variety: fd.get("variety") || null,
      planting_date,
      quantity: Number(fd.get("quantity") || 1),
      location: fd.get("location") || null,
      notes: fd.get("notes") || null,
      estimated_harvest_date: pr.harvestDate.toISOString().slice(0, 10),
      status: pr.status,
    });
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Plants</h1>
          <p className="text-muted-foreground">Register and track every crop</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="size-4"/> Add Plant</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add a new plant</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Crop type</Label>
                <Select value={crop} onValueChange={setCrop}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {CROP_DATABASE.map(c => <SelectItem key={c.name} value={c.name}>{c.name} · {c.type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Plant name</Label><Input name="name" placeholder={crop}/></div>
                <div className="space-y-1.5"><Label>Variety</Label><Input name="variety"/></div>
                <div className="space-y-1.5"><Label>Planting date</Label><Input name="planting_date" type="date" required defaultValue={new Date().toISOString().slice(0,10)}/></div>
                <div className="space-y-1.5"><Label>Quantity</Label><Input name="quantity" type="number" defaultValue={1} min={1}/></div>
              </div>
              <div className="space-y-1.5"><Label>Location</Label><Input name="location" placeholder="Field A"/></div>
              <div className="space-y-1.5"><Label>Notes</Label><Textarea name="notes" rows={2}/></div>
              <DialogFooter><Button type="submit" disabled={insert.isPending}>Save plant</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && plants.length === 0 && (
        <Card><CardContent className="py-12 text-center">
          <Sprout className="size-10 mx-auto text-primary mb-2"/>
          <p className="font-medium">No plants registered yet</p>
          <p className="text-sm text-muted-foreground">Add your first crop to start tracking its lifecycle.</p>
        </CardContent></Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plants.map((p) => {
          const pr = predictHarvest(p.crop_type, p.planting_date);
          return (
            <Card key={p.id}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-lg">{p.name}</div>
                    <div className="text-sm text-muted-foreground">{p.crop_type}{p.variety ? ` · ${p.variety}` : ""}</div>
                  </div>
                  <Badge variant="secondary" className="capitalize">{pr.status.replace("_"," ")}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Planted</span><div>{p.planting_date}</div></div>
                  <div><span className="text-muted-foreground">Harvest est.</span><div>{p.estimated_harvest_date || "—"}</div></div>
                  <div><span className="text-muted-foreground">Quantity</span><div>{p.quantity}</div></div>
                  <div><span className="text-muted-foreground">Location</span><div>{p.location || "—"}</div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Growth</span><span>{pr.percent}% · {pr.daysRemaining}d left</span>
                  </div>
                  <Progress value={pr.percent}/>
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => del.mutate(p.id)}><Trash2 className="size-4"/></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
