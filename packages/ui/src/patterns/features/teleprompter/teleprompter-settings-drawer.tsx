import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/primitives/drawer";
import { Button } from "@workspace/ui/primitives/button";
import TeleprompterSettings, {
  TeleprompterSettingsProps,
} from "./teleprompter-settings";

export interface TeleprompterSettingsDrawerProps
  extends TeleprompterSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeleprompterSettingsDrawer({
  open,
  onOpenChange,
  ...settingsProps
}: TeleprompterSettingsDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-3xl bg-card text-card-foreground m-auto">
        <DrawerHeader>
          <DrawerTitle>Teleprompter settings</DrawerTitle>
          <DrawerDescription>
            Font face, colors, overlay, defaults.
          </DrawerDescription>
        </DrawerHeader>
        <div className="grid gap-4 p-4">
          <TeleprompterSettings {...settingsProps} />
        </div>
        <DrawerFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
