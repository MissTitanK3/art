import Link from "next/link";
import { FC } from "react";
import { ngcData } from "../lib/ngc";

interface ToolCardProps {
  title: string;
  emoji: string;
  description: string;
  href: string;
  cta: string;
  secondaryHref?: string;
  secondaryCta?: string;
  target?: string;
}

const ToolCard: FC<ToolCardProps> = ({ title, emoji, description, href, cta, secondaryHref, secondaryCta, target = undefined }) => {
  return (
    <div className="rounded-2xl shadow p-6 bg-card flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold mb-2">{emoji} {title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <Link
          href={href}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm shadow hover:opacity-90"
        >
          {cta}
        </Link>
        {secondaryHref && secondaryCta && (
          <Link
            href={secondaryHref}
            target={target}
            className="px-4 py-2 rounded-lg border border-input bg-background text-sm shadow hover:bg-accent hover:text-accent-foreground"
          >
            {secondaryCta}
          </Link>
        )}
      </div>
    </div>
  );
};

export default function LandingPage() {
  const { preamble } = ngcData;

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Always Ready Tools</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Decentralized dispatch, training, and incident reporting.<br />
          Secure. Volunteer-run.
        </p>
      </section>

      {/* Tools Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
        <ToolCard
          title="Watch"
          emoji="🗺️"
          target="_blank"
          href="https://watch.alwaysreadytools.org"
          description="Public incident reporting & heatmaps. Anonymous, timestamped reports — no personal data."
          cta="Explore Watch"
        />
        <ToolCard
          title="Dispatch (Regions)"
          emoji="📟"
          target="_blank"
          href="https://demo.alwaysreadytools.org"
          description="Regional volunteer coordination. Each region runs its own secure database for rosters, shifts, alerts, and trust lists."
          cta="Demo Region"
        />
        <ToolCard
          title="Academy"
          emoji="🎓"
          target="_blank"
          href="https://academy.alwaysreadytools.org"
          description="Training & certifications. Learn skills, earn certifications, and onboard into local Pods."
          cta="Start Training"
        />
        <ToolCard
          title="Admin"
          emoji="📊"
          target="_blank"
          href="https://admin.alwaysreadytools.org"
          description="National admin & trainer hub. Metadata only — skills gaps, support requests, and training resources."
          cta="Admin Overview"
        />
      </section>

      {/* NGC Intro Section */}
      <section aria-labelledby="ngc-intro" className="mx-auto mt-14 max-w-5xl px-4">
        <div className="rounded-2xl border border-input bg-card p-6 shadow">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="ngc-intro" className="text-2xl font-semibold">
              Next-Generation Constitution (NGC)
            </h2>
            <Link
              href="/ngc"
              className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium shadow hover:bg-accent hover:text-accent-foreground"
            >
              Read the full NGC
            </Link>
          </div>

          <div className="space-y-4">
            <p className="leading-relaxed">{preamble.forward}</p>
            <p className="text-sm text-muted-foreground">{preamble.subTitle}</p>

            <ol className="mt-2 list-decimal space-y-2 pl-6 text-sm">
              {preamble.points.map((p) => (
                <li key={p.id} className="leading-relaxed">
                  {p.content}
                </li>
              ))}
            </ol>

            <div className="pt-2">
              <Link href="/ngc" className="text-sm font-medium underline underline-offset-4">
                Continue to the complete text →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Privacy */}
      <section className="py-20 text-center max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6">Why Always Ready Tools?</h2>
        <ul className="space-y-4 text-muted-foreground text-lg">
          <li>🔐 <strong>Privacy First:</strong> Each region has its own database; no personal info is centralized.</li>
          <li>🌍 <strong>Decentralized:</strong> Regions operate independently, sharing only anonymized signals upward.</li>
          <li>🤝 <strong>Volunteer-Powered:</strong> Built by and for grassroots mutual aid & rapid response networks.</li>
        </ul>

        {/* Open Source Banner */}
        <div className="mt-10">
          <div className="rounded-2xl border border-input bg-card p-6 shadow flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
            <div className="text-left">
              <p className="text-sm uppercase tracking-wide text-muted-foreground">Open Source</p>
              <h3 className="text-lg font-semibold mt-1">This project lives in the public repo</h3>
              <p className="text-muted-foreground mt-1">
                Open source means the software’s “recipe” (the code) is public and free to use. Anyone can see how it
                works, help improve it, and hold us accountable.
              </p>
              <ul className="mt-3 text-sm text-muted-foreground space-y-2">
                <li>👀 <strong>Transparency:</strong> Read the code yourself or ask a trusted tech friend to review it.</li>
                <li>🛡️ <strong>Safety:</strong> Many eyes can spot issues and help fix them quickly.</li>
                <li>🙋 <strong>Participation:</strong> Share ideas or report issues — no coding required (a free GitHub account helps).</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                Free to use under the {""}
                <Link href="https://github.com/MissTitanK3/art/blob/main/LICENSE" className="underline underline-offset-4">
                  LICENSE
                </Link>.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="https://github.com/MissTitanK3/art"
                target="_blank"
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm shadow hover:opacity-90"
              >
                View on GitHub
              </Link>
              <Link
                href="https://github.com/MissTitanK3/art/blob/main/CONTRIBUTING.md"
                target="_blank"
                className="px-4 py-2 rounded-lg border border-input bg-background text-sm shadow hover:bg-accent hover:text-accent-foreground"
              >
                Contributing Guide
              </Link>
              <Link
                href="https://github.com/MissTitanK3/art/issues"
                target="_blank"
                className="px-4 py-2 rounded-lg border border-input bg-background text-sm shadow hover:bg-accent hover:text-accent-foreground"
              >
                Report an Issue
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted text-center">
        <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Link
            href="https://demo.alwaysreadytools.org"
            target="_blank"
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground shadow hover:opacity-90"
          >
            Try the Demo Region
          </Link>
          <Link
            href="https://github.com/MissTitanK3/art"
            target="_blank"
            className="px-6 py-3 rounded-xl border border-input bg-background shadow hover:bg-accent hover:text-accent-foreground"
          >
            View on GitHub
          </Link>
          <Link
            href="/terms"
            className="px-6 py-3 rounded-xl border border-input bg-background shadow hover:bg-accent hover:text-accent-foreground"
          >
            Terms & Conditions
          </Link>
          <Link
            href="/privacy"
            className="px-6 py-3 rounded-xl border border-input bg-background shadow hover:bg-accent hover:text-accent-foreground"
          >
            Privacy Policy
          </Link>
          <Link
            href="/guidelines"
            className="px-6 py-3 rounded-xl border border-input bg-background shadow hover:bg-accent hover:text-accent-foreground"
          >
            Community Guidelines
          </Link>
        </div>
      </section>
    </main>
  );
};

