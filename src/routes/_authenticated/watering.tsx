import { createFileRoute } from "@tanstack/react-router";
import { Droplets } from "lucide-react";
import { SchedulePage } from "@/components/schedule-page";

export const Route = createFileRoute("/_authenticated/watering")({
  head: () => ({ meta: [{ title: "Watering — CropCare" }] }),
  component: () => (
    <SchedulePage
      table="watering_schedules"
      title="Watering"
      description="Plan and track every watering session"
      icon={<Droplets className="size-7 text-water"/>}
      defaultFrequency="daily"
      itemLabel={(r) => r.amount ? `${r.amount}` : "Watering"}
      extraFields={[{ name: "amount", label: "Water amount", required: false }]}
    />
  ),
});
