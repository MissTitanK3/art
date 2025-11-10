import { Plus } from "lucide-react";

export default function AddReportButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="Add Report">
      <Plus className="w-14 h-14 rounded-full bg-green-600 text-white text-2xl shadow-xl hover:bg-green-700" />
    </button>
  );
}
