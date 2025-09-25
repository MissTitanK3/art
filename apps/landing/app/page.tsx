import Link from "next/link";
import { FC } from "react";

interface ToolCardProps {
  title: string;
  emoji: string;
  description: string;
  href: string;
  cta: string;
  secondaryHref?: string;
  secondaryCta?: string;
}

const ToolCard: FC<ToolCardProps> = ({ title, emoji, description, href, cta, secondaryHref, secondaryCta }) => {
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
            className="px-4 py-2 rounded-lg border border-input bg-background text-sm shadow hover:bg-accent hover:text-accent-foreground"
          >
            {secondaryCta}
          </Link>
        )}
      </div>
    </div>
  );
};

const LandingPage: FC = () => {
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
          href="https://watch.alwaysreadytools.org"
          description="Public incident reporting & heatmaps. Anonymous, timestamped reports — no personal data."
          cta="Explore Watch"
        />
        <ToolCard
          title="Dispatch (Regions)"
          emoji="📟"
          href="https://demo.alwaysreadytools.org"
          description="Regional volunteer coordination. Each region runs its own secure database for rosters, shifts, alerts, and trust lists."
          cta="Demo Region"
        />
        <ToolCard
          title="Academy"
          emoji="🎓"
          href="https://academy.alwaysreadytools.org"
          description="Training & certifications. Learn skills, earn certifications, and onboard into local Pods."
          cta="Start Training"
        />
        <ToolCard
          title="Admin"
          emoji="📊"
          href="https://admin.alwaysreadytools.org"
          description="National admin & trainer hub. Metadata only — skills gaps, support requests, and training resources."
          cta="Admin Overview"
        />
      </section>

      {/* Trust & Privacy */}
      <section className="py-20 text-center max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6">Why Always Ready Tools?</h2>
        <ul className="space-y-4 text-muted-foreground text-lg">
          <li>🔐 <strong>Privacy First:</strong> Each region has its own database; no personal info is centralized.</li>
          <li>🌍 <strong>Decentralized:</strong> Regions operate independently, sharing only anonymized signals upward.</li>
          <li>🤝 <strong>Volunteer-Powered:</strong> Built by and for grassroots mutual aid & rapid response networks.</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted text-center">
        <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Link
            href="https://demo.alwaysreadytools.org"
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground shadow hover:opacity-90"
          >
            Try the Demo Region
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

export default LandingPage;