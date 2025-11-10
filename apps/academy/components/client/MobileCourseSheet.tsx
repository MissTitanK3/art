"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerFooter,
} from "@workspace/ui/components/drawer";
import { BookOpen } from "lucide-react";
import ScrollAreaPersist from "@/components/client/ScrollAreaPersist";

export default function MobileCourseSheet({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button size="sm" variant="outline" className="xl:hidden">
          <BookOpen className="mr-2 h-4 w-4" /> Courses
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-card text-card-foreground w-[85vw] max-w-sm p-0">
        <DrawerHeader className="px-4 pt-4 pb-2">
          <DrawerTitle>Courses</DrawerTitle>
          <DrawerDescription>Select a course to view</DrawerDescription>
        </DrawerHeader>
        <ScrollAreaPersist
          storageKey="academy.sidebar.mobile.scroll"
          className="h-[80vh] overflow-y-auto px-2 pb-4"
        >
          {children}
        </ScrollAreaPersist>
        <DrawerFooter className="px-4 py-3">
          <DrawerClose asChild>
            <Button size="sm" variant="secondary">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
