import { cn } from "@workspace/ui/lib/utils";
import { Button } from "../button";
import { Drawer, DrawerContent, DrawerTrigger } from "../drawer";

type RegionHeroProps = {
  brandHeadline: string;
  descriptionLines?: string[];
  quickStartContent?: React.ReactNode;
  quickStartLabel?: string;
  className?: string;
};

export function RegionHero({
  brandHeadline,
  descriptionLines = [
    "Welcome to your region’s centralized platform for collaboration and response coordination.",
    "Use the tools below to manage your region’s operations and support your community effectively.",
  ],
  quickStartContent,
  quickStartLabel = "Quick Start Understanding",
  className,
}: RegionHeroProps) {
  return (
    <header className={cn("text-center", className)}>
      <h1 className="text-4xl font-bold tracking-tight">{brandHeadline}</h1>
      {descriptionLines.map((line, idx) => (
        <p
          key={idx}
          className="mt-2 max-w-2xl text-balance text-muted-foreground"
        >
          {line}
        </p>
      ))}
      {quickStartContent ? (
        <div className="mt-4 flex justify-center">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">{quickStartLabel}</Button>
            </DrawerTrigger>
            <DrawerContent className="bg-card text-card-foreground max-w-xl m-auto">
              {quickStartContent}
            </DrawerContent>
          </Drawer>
        </div>
      ) : null}
    </header>
  );
}
