import { Separator } from "@workspace/ui/primitives/separator";
import { PublicImpactSummary } from "@workspace/ui/patterns/features/impact/public-impact-summary";

export default function ImpactPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">
        🧠 Understanding Impact: Your Presence, Your Choices
      </h1>

      <p className="text-muted-foreground">
        Even when our intentions are good, the way we show up can have deep
        consequences, especially for those who carry more risk.
        <br />
        <br />
        This guide invites you to reflect on your presence and your decisions
        before, during, and after response efforts. No one sees everything. But
        we all shape the outcome.
      </p>

      <PublicImpactSummary regionId="region-stg" />

      <Separator />

      <section>
        <h2 className="text-xl font-semibold">💥 Power, Presence, and Risk</h2>
        <ul className="list-disc list-inside mt-2 space-y-2 text-muted-foreground">
          <li>
            Who holds the most <strong>power</strong> in this situation and who
            holds the most <strong>risk</strong>?
          </li>
          <li>
            How might my body, voice, or decisions increase{" "}
            <strong>tension</strong> or <strong>pressure</strong>?
          </li>
          <li>
            Am I centering <strong>my need to help</strong>, or{" "}
            <strong>their need to feel safe</strong>?
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">👣 Before You Step In</h2>
        <ul className="list-disc list-inside mt-2 space-y-2 text-muted-foreground">
          <li>
            Do I understand the <strong>community context</strong>? Who’s
            already doing this work?
          </li>
          <li>
            Have I reviewed the{" "}
            <a href="/roles" className="underline text-blue-600">
              Roles
            </a>
            &nbsp;&&nbsp;
            <a href="/intents" className="underline text-blue-600">
              Intents
            </a>
            ?
          </li>
          <li>
            Who do I need to <strong>defer to</strong> if this becomes
            high-stakes or high-risk?
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">👀 During the Action</h2>
        <ul className="list-disc list-inside mt-2 space-y-2 text-muted-foreground">
          <li>
            Who’s <strong>watching</strong> me? How might I be seen by law
            enforcement, media, or others?
          </li>
          <li>
            Am I creating <strong>visibility or anonymity</strong> for those who
            need it?
          </li>
          <li>
            Am I helping others <strong>de-escalate</strong> or making things
            more tense?
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">💬 After the Action</h2>
        <ul className="list-disc list-inside mt-2 space-y-2 text-muted-foreground">
          <li>
            Who needs <strong>follow-up</strong>, and who might be retraumatized
            by recounting it?
          </li>
          <li>
            Am I <strong>sharing stories</strong> that could put people at risk?
            (e.g., photos, locations, identities)
          </li>
          <li>
            What info should I <strong>anonymize and record</strong> for legal
            follow-up or reflection?
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          ⚠️ When Children, Elders, or Undocumented Folks Are Present
        </h2>
        <ul className="list-disc list-inside mt-2 space-y-2 text-muted-foreground">
          <li>
            What’s the <strong>worst-case scenario</strong> for them if things
            go badly?
          </li>
          <li>
            How can I reduce their <strong>visibility</strong> and{" "}
            <strong>exposure</strong>?
          </li>
          <li>
            What backup or <strong>soft exit</strong> plans are in place?
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">🧰 Suggested Practices</h2>
        <ul className="list-disc list-inside mt-2 space-y-2 text-muted-foreground">
          <li>
            <strong>Step Back Briefing:</strong> Pause before jumping in. Ask:
            &quot;What’s actually needed here?&quot;
          </li>
          <li>
            <strong>Impact Mapping:</strong> Imagine each outcome from the lens
            of someone more vulnerable than you.
          </li>
          <li>
            <strong>Quiet Roles:</strong> Support doesn’t have to be loud or
            centered water runs silently.
          </li>
          <li>
            <strong>Group Check-Outs:</strong> End with a team reflection:
            &quot;What went well? What should we change next time?&quot;
          </li>
        </ul>
      </section>
    </div>
  );
}
