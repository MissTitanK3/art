import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/primitives/drawer";
import { Button } from "@workspace/ui/primitives/button";
import TeleprompterImportContent from "./teleprompter-import-content";

export interface TeleprompterImportDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyText: (text: string) => void;
  cacheEnabled: boolean;
  onCacheEnabledChange: (enabled: boolean) => void;
  onSaveNow: () => void;
  builtinScripts: { id: string; label: string; content: string }[];
  onApplyBuiltin: (id: string, text: string) => void;
  onFetchDispatch: (
    dispatchId: string
  ) => Promise<{ text?: string; title?: string }>;
  onFetchAcademy: (slug: string) => Promise<{ text?: string; title?: string }>;
  onScriptBuilderOpen: () => void;
}

export function TeleprompterImportDrawer({
  open,
  onOpenChange,
  onApplyText,
  cacheEnabled,
  onCacheEnabledChange,
  onSaveNow,
  builtinScripts,
  onApplyBuiltin,
  onFetchDispatch,
  onFetchAcademy,
  onScriptBuilderOpen,
}: TeleprompterImportDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-3xl bg-card text-card-foreground m-auto">
        <DrawerHeader>
          <DrawerTitle>Load Script</DrawerTitle>
          <DrawerDescription>
            Import a script from a file or paste text. Markdown and TXT
            supported.
          </DrawerDescription>
        </DrawerHeader>
        <TeleprompterImportContent
          onApplyText={onApplyText}
          cacheEnabled={cacheEnabled}
          onCacheEnabledChange={onCacheEnabledChange}
          onSaveNow={onSaveNow}
          builtinScripts={builtinScripts}
          onApplyBuiltin={onApplyBuiltin}
          onFetchDispatch={onFetchDispatch}
          onFetchAcademy={onFetchAcademy}
        />
        <DrawerFooter>
          <div className="flex w-full items-center justify-between gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              variant="secondary"
              onClick={onScriptBuilderOpen}
              title="Open the Script Builder in a new tab"
            >
              Create Script ↗
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
