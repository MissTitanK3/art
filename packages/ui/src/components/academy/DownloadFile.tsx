"use client";

import { Button } from "@workspace/ui/components/button";
import { Download } from "lucide-react";

export function DownloadFile({
  file,
  label,
}: {
  file: string;
  label?: string;
}) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file;
    link.download = file.split("/").pop() ?? "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const inferredLabel =
    label ?? `Download ${file.toUpperCase().includes(".ZIP") ? "ZIP" : "File"}`;

  return (
    <Button
      onClick={handleDownload}
      className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white shadow-md transition hover:bg-blue-700"
    >
      <Download className="h-4 w-4" />
      {inferredLabel}
    </Button>
  );
}
