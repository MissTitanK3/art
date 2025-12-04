"use client";
import {
  TELEPROMPTER_SCRIPTS,
  TELEPROMPTER_SCRIPT_META,
} from "@workspace/ui/data/teleprompter-scripts";
import TeleprompterScriptBuilder from "@workspace/ui/patterns/features/teleprompter/teleprompter-script-builder";
export default function ScriptBuilderPage() {
  return (
    <TeleprompterScriptBuilder
      builtinScripts={TELEPROMPTER_SCRIPTS}
      builtinMeta={TELEPROMPTER_SCRIPT_META}
      storageNamespace="teleprompter.builder"
    />
  );
}
