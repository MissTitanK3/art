import Link from "next/link";
import { Separator } from "@workspace/ui/primitives/separator";
import ThemeToggle from "@workspace/ui/patterns/common/theme-toggle";
import BackToTopButton from "../components/BackToTopButton";
import {
  GraduationCap,
  Eye,
  ClipboardList,
  Github,
  Coffee,
  Shield,
  Users,
  TrendingUp,
  Flame,
} from "lucide-react";
import { NGC_V15, type NGCBlock } from "@/lib/ngc_v_15";

export default function LandingPage() {
  const preambleNode = NGC_V15.root.children.find(
    (child) => child.kind === "preamble"
  );
  const preambleParagraphs = (preambleNode?.blocks ?? []).filter(
    (b): b is Extract<NGCBlock, { type: "p" }> => b.type === "p"
  );
  const preambleList = (preambleNode?.blocks ?? []).find(
    (b): b is Extract<NGCBlock, { type: "list" }> => b.type === "list"
  );

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-4 pt-4 flex justify-end">
        <ThemeToggle />
      </div>

      {/* Hero */}
      <section className="w-full min-h-[100dvh] flex items-center">
        <div className="mx-auto w-full max-w-4xl px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Always Ready Tools
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6">
            Decentralized dispatch, training, and incident reporting. Secure.
            Volunteer-run.
          </p>
          <p className="text-base sm:text-lg text-muted-foreground">
            Always Ready Tools should look like tomorrow's emergency system
            built by the people. No marketing gloss—just clarity, security, and
            confidence. The goal is to make a donor say, "This is what real
            infrastructure looks like," and make an organizer say, "We can use
            this today."
          </p>
          <div className="mt-8 flex flex-col items-center gap-2">
            <Link
              href="https://ko-fi.com/techwitch"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Donate on Ko-fi"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-base sm:text-lg font-semibold shadow-lg hover:opacity-90"
            >
              <Coffee className="h-5 w-5" aria-hidden />
              Donate on Ko-fi
            </Link>
            <p className="text-sm text-muted-foreground">
              Help fund hosting, existence, and training resources.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Chaos kills impact
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 text-left">
            <div className="rounded-xl border border-input bg-card p-6">
              <p className="text-muted-foreground">Fragmented communication</p>
            </div>
            <div className="rounded-xl border border-input bg-card p-6">
              <p className="text-muted-foreground">Lost volunteers and supplies</p>
            </div>
            <div className="rounded-xl border border-input bg-card p-6">
              <p className="text-muted-foreground">No shared situational awareness</p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Most tools work until they don't, especially in crisis.
          </p>
        </div>
      </section>

      {/* What Organizations Get */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-semibold tracking-tight">
            More impact with the people you already have
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-muted flex items-center justify-center" aria-hidden="true">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Safer coordination</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-muted flex items-center justify-center" aria-hidden="true">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Higher volunteer retention</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-muted flex items-center justify-center" aria-hidden="true">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Fundable proof of outcomes</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-muted flex items-center justify-center" aria-hidden="true">
                <Flame className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Less lead burnout</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Toolset */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-semibold tracking-tight text-center mb-12">
          The Toolset
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-input bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <h3 className="text-xl font-semibold">Watch</h3>
            </div>
            <p className="text-base font-medium">
              Real-time visibility into community needs
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Community reports</li>
              <li>• Smart filters</li>
              <li>• Dispatch handoff</li>
            </ul>
            <Link
              href="https://watch.alwaysreadytools.org"
              target="_blank"
              className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm shadow hover:opacity-90"
            >
              Explore Watch
            </Link>
          </div>

          <div className="rounded-2xl border border-input bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <h3 className="text-xl font-semibold">Dispatch</h3>
            </div>
            <p className="text-base font-medium">
              Coordinate volunteers without losing people
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Role assignment</li>
              <li>• Live status tracking</li>
              <li>• Accountability without surveillance</li>
            </ul>
            <Link
              href="https://demo.alwaysreadytools.org"
              target="_blank"
              className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm shadow hover:opacity-90"
            >
              Demo Region
            </Link>
          </div>

          <div className="rounded-2xl border border-input bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <h3 className="text-xl font-semibold">Academy</h3>
            </div>
            <p className="text-base font-medium">
              Shared training foundations built from frontline experience
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Certify volunteers</li>
              <li>• Grow leaders</li>
              <li>• Consistent safety rules</li>
            </ul>
            <Link
              href="https://academy.alwaysreadytools.org"
              target="_blank"
              className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm shadow hover:opacity-90"
            >
              Start Training
            </Link>
          </div>
        </div>
      </section>

      {/* The Toolset (Airplane Mode) */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-semibold tracking-tight text-center mb-12">
          The Toolset (Offline First)
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-input bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <h3 className="text-xl font-semibold">Region Responder</h3>
            </div>
            <p className="text-base font-medium">
              Offline-first field intake and situation tracking
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Installable PWA with local-only drafts</li>
              <li>• Intake + situation history (edit/delete)</li>
              <li>• Export, print, and share summaries</li>
            </ul>
            <Link
              href="https://responder.alwaysreadytools.org"
              target="_blank"
              className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm shadow hover:opacity-90"
            >
              Open Region Responder
            </Link>
          </div>
          <div className="rounded-2xl border border-input bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <h3 className="text-xl font-semibold">The Commons Game</h3>
            </div>
            <p className="text-base font-medium">
              Offline-first self-care game where you grow your Commons by completing real-life actions.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Works fully offline with background sync when you’re back online.</li>
              <li>• Track needs, self-care actions, and progress toward new stars.</li>
              <li>• Built-in daily/weekly check-ins to keep you on pace.</li>
            </ul>
            <Link
              href="https://love.alwaysreadytools.org"
              target="_blank"
              className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm shadow hover:opacity-90"
            >
              Open The Commons
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Autonomy */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-input bg-card p-8 space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Regional autonomy by design
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <p>• Region-siloed data</p>
            <p>• No national database of vulnerable people</p>
            <p>• You control what is shared</p>
          </div>
          <Link
            href="/regions"
            className="inline-block mt-4 px-4 py-2 rounded-lg border border-input bg-background text-sm shadow hover:bg-accent hover:text-accent-foreground"
          >
            Browse regions
          </Link>
        </div>
      </section>

      {/* Inter-Org Coordination */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-input bg-card p-8 space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Coordinate without merging systems
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <p>• Share when you choose</p>
            <p>• Pods keep independence</p>
            <p>• Coalitions scale without bureaucracy</p>
          </div>
        </div>
      </section>

      {/* Outcomes & Funding */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-input bg-card p-8 space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Your work becomes grant-ready automatically
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <p>• Volunteer hours</p>
            <p>• People supported</p>
            <p>• Resources distributed</p>
            <p>• Field logs</p>
          </div>
        </div>
      </section>

      {/* Volunteer Retention */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-input bg-card p-8 space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            People stay when they are not overwhelmed
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <p>• Clear tasks</p>
            <p>• Visible contribution</p>
            <p>• Safer structure</p>
          </div>
        </div>
      </section>

      {/* Safety & Role Clarity */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-input bg-card p-8 space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Right people. Right information. Right time.
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <p>• Verified roles</p>
            <p>• Controlled visibility</p>
            <p>• Confident field leadership</p>
          </div>
        </div>
      </section>

      {/* Accessibility */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-input bg-card p-8 space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Designed for high-stress environments
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <p>• Low-stress UI</p>
            <p>• Neurodivergent-friendly design</p>
            <p>• Fast onboarding</p>
          </div>
        </div>
      </section>

      {/* Proof */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-input bg-card p-8 space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Tested under real pressure
          </h2>
          <p className="text-muted-foreground">
            Tacoma CDC outcomes:
          </p>
          <div className="space-y-3 text-muted-foreground">
            <p>• Zero lost volunteers</p>
            <p>• Reduced lead overload</p>
            <p>• Immediate reporting</p>
          </div>
        </div>
      </section>

      {/* Where ART Fits */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-semibold tracking-tight">
            Where ART fits
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="rounded-xl border border-input bg-card p-6">
              <p className="font-medium">Distributions</p>
            </div>
            <div className="rounded-xl border border-input bg-card p-6">
              <p className="font-medium">Rapid response</p>
            </div>
            <div className="rounded-xl border border-input bg-card p-6">
              <p className="font-medium">Safety ops</p>
            </div>
            <div className="rounded-xl border border-input bg-card p-6">
              <p className="font-medium">Patrols</p>
            </div>
            <div className="rounded-xl border border-input bg-card p-6">
              <p className="font-medium">Intake</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Philosophy */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-input bg-card p-8 space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Cooperative pricing
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <p>• Based on active volunteers</p>
            <p>• No license traps</p>
            <p>• Free for vulnerable communities</p>
          </div>
        </div>
      </section>

      {/* Partnership Cohort */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-input bg-card p-8 space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Early partners shape the system
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <p>• Limited onboarding</p>
            <p>• Training included</p>
            <p>• Roadmap influence</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <div className="rounded-2xl border-2 border-primary bg-card p-8 md:p-12 text-center space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Let's map your operations into ART
          </h2>
          <p className="text-lg text-muted-foreground">
            Bring ops and field leads.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="https://signal.group/#CjQKIADTv-8bQiCFQ9uNpqdZVe8ngPlj8O4XSd1hnMBhdg-lEhAKlOr9EvjsnlQh9RXActF-"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 rounded-xl bg-primary text-primary-foreground text-lg font-semibold shadow-lg hover:opacity-90"
            >
              Join Signal Group
            </Link>
            <Link
              href="mailto:info@alwaysreadytools.org?subject=Schedule%2030-minute%20walkthrough"
              className="inline-block px-8 py-4 rounded-xl border-2 border-primary bg-background text-lg font-semibold shadow-lg hover:bg-accent hover:text-accent-foreground"
            >
              Email us
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            info@alwaysreadytools.org
          </p>
        </div>
      </section>

      {/* Closing Statement */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <div className="text-center">
          <p className="text-2xl font-medium text-muted-foreground">
            Community care deserves high-grade tools.
          </p>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-3xl mx-auto px-4">
          <div className="rounded-2xl border border-input bg-card p-8 text-left space-y-6">
            <div className="flex items-center gap-3">
              <Github className="h-6 w-6" aria-hidden="true" />
              <h2 className="text-2xl font-semibold">Open source</h2>
            </div>
            <p className="text-muted-foreground">
              Open source means the software's code is public and free to use.
              Anyone can see how it works, help improve it, and hold us
              accountable.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <strong>Transparency:</strong> Read the code yourself or ask a
                trusted tech friend to review it.
              </li>
              <li>
                <strong>Safety:</strong> Many eyes can spot issues and help fix
                them quickly.
              </li>
              <li>
                <strong>Participation:</strong> Share ideas or report issues — no
                coding required (a free GitHub account helps).
              </li>
            </ul>
            <div className="flex gap-3 flex-wrap pt-4">
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

      {/* NGC Origins */}
      <section
        id="origins"
        className="py-16 px-4 sm:px-6 lg:px-8 bg-background text-muted-foreground"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground text-center">
            Origins of the Next Generation Constitution
          </h2>

          <Separator className="mx-auto mb-8 w-24" />

          <div className="rounded-2xl border border-input bg-card p-8 space-y-4 leading-relaxed">
            <p>
              In February 2025, while fleeing the South and pausing in
              Colorado, I (T) witnessed what felt like the disintegration of
              the United States Constitution. As a military member, I was
              torn between my oath to protect citizens from all enemies,
              foreign and domestic, and my inability to act within that
              moment's limits.
            </p>

            <p>
              I turned to writing as a means of grounding myself. From that
              struggle came the idea of the{" "}
              <span className="font-semibold">
                Next Generation Constitution (NGC)
              </span>
              . A document outlining what I would fight for in 2025 and
              beyond.
            </p>

            <p>
              The NGC became a tool for mental stability and purpose. If I
              can envision a future where it exists, then working toward
              that future makes the fight worthwhile.
            </p>

            <p>
              The NGC is what motivates the work I'm doing here, but
              adopting it is not required to participate in or use these
              tools. I include it for transparency, so you understand why I
              build the way I do and the future I hope we can reach.
            </p>
          </div>
        </div>
      </section>

      {/* NGC Intro Section */}
      <section
        aria-labelledby="ngc-intro"
        className="mx-auto mt-14 max-w-5xl px-4 pb-20"
      >
        <div className="rounded-2xl border border-input bg-card p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
            {preambleParagraphs.map((p, idx) => (
              <p key={idx} className="leading-relaxed">
                {p.text}
              </p>
            ))}

            {preambleList && (
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
                {preambleList.items.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {item.text}
                  </li>
                ))}
              </ul>
            )}

            <div className="pt-2">
              <Link
                href="/ngc"
                className="text-sm font-medium underline underline-offset-4"
              >
                Continue to the complete text →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <section className="py-20 bg-muted text-center">
        <h2 className="text-2xl font-semibold mb-8">Additional Resources</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 flex-wrap max-w-4xl mx-auto px-4">
          <Link
            href="https://demo.alwaysreadytools.org"
            target="_blank"
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground shadow hover:opacity-90"
          >
            Try the Demo Region
          </Link>
          <Link
            href="/regions"
            className="px-6 py-3 rounded-xl border border-input bg-background shadow hover:bg-accent hover:text-accent-foreground"
          >
            Region Directory
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

      <BackToTopButton />
    </main>
  );
}
