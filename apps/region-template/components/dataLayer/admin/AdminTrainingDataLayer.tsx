// apps/region-template/components/dataLayer/admin/AdminTrainingDataLayer.tsx
import TrainingClient from "@workspace/ui/layout/admin/training/training";
import { TraingingSessionsDemoData } from "@/data/demoAcademy";

export default async function AdminTrainingDataLayer() {
  const sessions = TraingingSessionsDemoData;
  return <TrainingClient initialSessions={sessions} />;
}

