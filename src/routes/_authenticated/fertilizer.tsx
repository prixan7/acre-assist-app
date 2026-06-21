import { createFileRoute } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import { SchedulePage } from "@/components/schedule-page";

export const Route = createFileRoute("/_authenticated/fertilizer")({
  head: () => ({ meta: [{ title: "Fertilizers — CropCare" }] }),
  component: () => (
    <SchedulePage
      table="fertilizer_schedules"
      title="Fertilizers"
      description="Plan fertilizer applications per crop"
      icon={<FlaskConical className="size-7 text-sun"/>}
      defaultFrequency="monthly"
      itemLabel={(r) => r.fertilizer_name}
      extraFields={[
        { name: "fertilizer_name", label: "Fertilizer name", required: true },
        { name: "quantity", label: "Quantity" },
      ]}
    />
  ),
});
