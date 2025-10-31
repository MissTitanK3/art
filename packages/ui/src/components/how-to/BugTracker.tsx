import { Callout } from "@workspace/ui/components/academy/Callout";
import { Button } from "@workspace/ui/components/button";
import { ReactNode } from "react";

export interface HowToBugTrackerProps {
  quickReport?: ReactNode;
}

export default function HowToBugTracker({ quickReport }: HowToBugTrackerProps) {
  return (
    <section id="bug-tracker" className="prose dark:prose-invert max-w-none">
      <h2>Bug Tracker</h2>
      <p>
        If the platform does not behave as expected based on these guides, please file a bug so we can reproduce,
        triage, and fix it. You can use the quick links below or the detailed form.
      </p>

      <div className="flex flex-wrap gap-3 my-3">
        <Button asChild>
          <a href="https://github.com/MissTitanK3/art/issues" target="_blank" rel="noreferrer noopener">
            View Issues on Github
          </a>
        </Button>
        <Button asChild variant="secondary">
          <a href="https://github.com/MissTitanK3/art/issues/new/choose" target="_blank" rel="noreferrer noopener">
            Report a Bug on Github
          </a>
        </Button>
      </div>

      <Callout type="info">
        Tip: Include your browser, OS, steps to reproduce, what you expected to happen, and what actually happened.
      </Callout>

      <h3>Quick Bug Report</h3>
      {quickReport ?? null}
    </section>
  );
}
