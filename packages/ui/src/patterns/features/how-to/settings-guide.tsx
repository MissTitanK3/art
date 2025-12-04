import { Button } from "@workspace/ui/primitives/button";

export function SettingsGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Settings</h2>
      <p>Access account and regional settings.</p>
      <div className="my-4">
        <Button asChild>
          <a href="/settings">Open Settings</a>
        </Button>
      </div>
      <p>Adjust preferences and review regional notices as needed.</p>
    </section>
  );
}
