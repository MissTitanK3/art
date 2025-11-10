"use client";

import { Button } from "@workspace/ui/components/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export default function CopySignalHandleButton({
  handle,
}: {
  handle?: string;
}) {
  if (!handle) return null;

  const copyHandle = async () => {
    await navigator.clipboard.writeText(handle);
    toast.success("Signal handle copied to clipboard ✅");
  };

  return (
    <Button variant="secondary" onClick={copyHandle}>
      <Copy className="w-4 h-4" /> Signal Handle
    </Button>
  );
}
