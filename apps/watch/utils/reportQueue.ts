import { ReportFormData } from "@/types/wizard";
import { v4 as uuidv4 } from "uuid";

export type QueuedReport = ReportFormData & {
  id: string;
  timestamp: string;
  synced?: boolean;
};

const STORAGE_KEY = "reportQueue";

export const getQueuedReports = (): QueuedReport[] => {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const addReportToQueue = (report: ReportFormData) => {
  const queue = getQueuedReports();
  const newReport: QueuedReport = {
    ...report,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    synced: false,
  };
  queue.push(newReport);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
};

export const clearQueue = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const markReportAsSynced = (id: string) => {
  const queue = getQueuedReports();
  const updated = queue.map((r) => (r.id === id ? { ...r, synced: true } : r));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

// Simulated upload to server or Supabase
export const syncQueuedReports = async () => {
  const queue = getQueuedReports();
  for (const report of queue) {
    if (!report.synced) {
      try {
        // TODO: Replace with real Supabase/API logic
        console.log("Syncing report:", report);
        // Simulate network delay
        await new Promise((res) => setTimeout(res, 500));
        markReportAsSynced(report.id);
      } catch (err) {
        console.error(`Failed to sync report ${report.id}`, err);
      }
    }
  }
};
