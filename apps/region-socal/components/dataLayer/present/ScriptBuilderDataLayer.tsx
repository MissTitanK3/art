"use client";

import React from "react";
import TeleprompterScriptBuilder from "@workspace/ui/components/teleprompter-script-builder";
import {
  TELEPROMPTER_SCRIPTS,
  TELEPROMPTER_SCRIPT_META,
} from "@workspace/ui/data/teleprompter-scripts";

export default function ScriptBuilderDataLayer() {
  return (
    <TeleprompterScriptBuilder
      builtinScripts={TELEPROMPTER_SCRIPTS}
      builtinMeta={TELEPROMPTER_SCRIPT_META}
      storageNamespace="teleprompter.builder"
    />
  );
}
