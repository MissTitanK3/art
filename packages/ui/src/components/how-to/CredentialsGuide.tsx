import { Button } from "@workspace/ui/components/button";

export default function CredentialsGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Credentials</h2>
      <p>Access your credential card and verify status.</p>
      <div className="my-4">
        <Button asChild>
          <a href="/credentials">Open Credentials</a>
        </Button>
      </div>
      <p>Share when requested by coordinators and partners.</p>
    </section>
  );
}
