import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./drawer";
import { Button } from "./button";
import TeleprompterSettings, {
  TeleprompterSettingsProps,
} from "./TeleprompterSettings";

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
