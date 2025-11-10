"use client";

import ScriptBuilderDataLayer from "@/components/dataLayer/present/ScriptBuilderDataLayer";

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl p-1 md:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        Teleprompter Script Builder
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Build teleprompter scripts line by line with cues, reordering, and
        guidance. Export, save, and share.
      </p>
      <div className="mt-6">
        <ScriptBuilderDataLayer />
      </div>
    </div>
  );
}
