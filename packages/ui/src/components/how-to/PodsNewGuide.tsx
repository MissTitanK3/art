import { Button } from "@workspace/ui/components/button";

export default function PodsNewGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Create Pod</h2>
      <p>Create a new pod and assign initial members and roles.</p>
      <div className="my-4">
        <Button asChild>
          <a href="/pods/new">Open Create Pod</a>
        </Button>
      </div>
      <ul>
        <li>Name pods clearly by geography and function.</li>
        <li>Invite members and set expected coverage.</li>
      </ul>
    </section>
  );
}

