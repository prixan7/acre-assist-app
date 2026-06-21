import { createFileRoute } from "@tanstack/react-router";
import { Bug } from "lucide-react";
import { SchedulePage } from "@/components/schedule-page";

export const Route = createFileRoute("/_authenticated/pesticide")({
  head: () => ({ meta: [{ title: "Pesticides — CropCare" }] }),
  component: () => (
    <SchedulePage
      table="pesticide_schedules"
      title="Pesticides"
      description="Schedule applications and track safety notes"
      icon={<Bug className="size-7 text-destructive"/>}
      defaultFrequency="weekly"
      itemLabel={(r) => r.pesticide_name}
      extraFields={[
        { name: "pesticide_name", label: "Pesticide name", required: true },
        { name: "quantity", label: "Quantity" },
        { name: "instructions", label: "Instructions", textarea: true },
      ]}
    />
  ),
});
