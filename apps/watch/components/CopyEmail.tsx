"use client";
import { useTranslations } from "@/lib/il8n/useTranslations";
import { useState } from "react";
import { FrostedButton } from "./ui/FrostedButton";

export default function CopyEmail({
  email = "info@alwaysreadytools.org",
}: {
  email?: string;
}) {
  const { t } = useTranslations();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg shadow-sm w-fit">
      <span className="text-xl font-mono text-gray-800 dark:text-gray-200">
        {email}
      </span>
      <FrostedButton variant="red" onClick={handleCopy}>
        {copied ? t("copiedToClipboard") : t("copyToClipboard")}
      </FrostedButton>
    </div>
  );
}
