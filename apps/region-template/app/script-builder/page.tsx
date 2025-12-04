"use client";

import React from "react";
import TeleprompterScriptBuilder from "@workspace/ui/patterns/features/teleprompter/teleprompter-script-builder";
import {
  TELEPROMPTER_SCRIPTS,
  TELEPROMPTER_SCRIPT_META,
} from "@workspace/ui/data/teleprompter-scripts";

export default function ScriptBuilderPage() {
  return (
    <>
      <TeleprompterScriptBuilder
        builtinScripts={TELEPROMPTER_SCRIPTS}
        builtinMeta={TELEPROMPTER_SCRIPT_META}
        storageNamespace="teleprompter.builder"
      />
    </>
  );
}
