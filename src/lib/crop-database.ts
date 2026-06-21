export type CropInfo = {
  name: string;
  type: string;
  waterEveryDays: number;
  harvestDaysMin: number;
  harvestDaysMax: number;
};

export const CROP_DATABASE: CropInfo[] = [
  { name: "Tomato", type: "Vegetable", waterEveryDays: 2, harvestDaysMin: 75, harvestDaysMax: 90 },
  { name: "Chili", type: "Vegetable", waterEveryDays: 2, harvestDaysMin: 90, harvestDaysMax: 120 },
  { name: "Brinjal", type: "Vegetable", waterEveryDays: 3, harvestDaysMin: 100, harvestDaysMax: 120 },
  { name: "Okra", type: "Vegetable", waterEveryDays: 2, harvestDaysMin: 50, harvestDaysMax: 65 },
  { name: "Coriander", type: "Herb", waterEveryDays: 1, harvestDaysMin: 30, harvestDaysMax: 45 },
  { name: "Onion", type: "Vegetable", waterEveryDays: 3, harvestDaysMin: 90, harvestDaysMax: 120 },
  { name: "Spinach", type: "Leafy", waterEveryDays: 2, harvestDaysMin: 30, harvestDaysMax: 45 },
  { name: "Carrot", type: "Root", waterEveryDays: 3, harvestDaysMin: 70, harvestDaysMax: 90 },
  { name: "Cabbage", type: "Vegetable", waterEveryDays: 3, harvestDaysMin: 80, harvestDaysMax: 110 },
];

export function findCrop(name: string): CropInfo | undefined {
  return CROP_DATABASE.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function predictHarvest(cropName: string, plantingDate: string | Date) {
  const crop = findCrop(cropName);
  const planted = new Date(plantingDate);
  const avgDays = crop ? Math.round((crop.harvestDaysMin + crop.harvestDaysMax) / 2) : 90;
  const harvestDate = new Date(planted);
  harvestDate.setDate(harvestDate.getDate() + avgDays);
  const today = new Date();
  const elapsed = Math.max(0, (today.getTime() - planted.getTime()) / 86400000);
  const total = avgDays;
  const percent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  const daysRemaining = Math.max(0, Math.round(total - elapsed));
  let status: "seeded" | "growing" | "nearly_ready" | "ready" | "harvested" = "seeded";
  if (percent >= 100) status = "ready";
  else if (percent >= 85) status = "nearly_ready";
  else if (percent >= 15) status = "growing";
  return { harvestDate, daysRemaining, percent, status, avgDays };
}
