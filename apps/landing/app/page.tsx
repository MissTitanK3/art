import Link from "next/link";
import Image from "next/image";
import { FC, ReactNode } from "react";
import { ngcData } from "../lib/ngc";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import ThemeToggle from "@workspace/ui/components/client/ThemeToggle";
import BackToTopButton from "../components/BackToTopButton";
import {
  GraduationCap,
  Shield,
  Eye,
  CheckCircle2,
  ClipboardList,
  BookOpen,
  LifeBuoy,
  Search,
  User,
  Users,
  Calendar,
  MessagesSquare,
  Github,
  ChevronDown,
  Coffee,
} from "lucide-react";

type FeatureVariant = "card" | "inline" | "section" | "tile";

interface FeatureItemProps {
  title: string;
  description?: string;
  children?: ReactNode;
  icon?: ReactNode;
  emoji?: string;
  href?: string;
  cta?: string;
  secondaryHref?: string;
  secondaryCta?: string;
  target?: string;
  variant?: FeatureVariant;
  reverse?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  media?: ReactNode;
  id?: string;
  nextId?: string;
  className?: string;
  imageFit?: 'cover' | 'contain';
  imageVariant?: 'default' | 'phone';
}

const FeatureItem: FC<FeatureItemProps> = ({
  title,
  description,
  children,
  icon,
  emoji,
  href,
  cta,
  secondaryHref,
  secondaryCta,
  target,
  variant = "card",
  reverse = false,
  imageSrc,
  imageAlt,
  media,
  id,
  nextId,
  className,
  imageFit = 'cover',
  imageVariant = 'default',
}) => {
  const titlePrefix = (
    <span className="mr-2 inline-block align-middle">
      {icon ? icon : emoji}
    </span>
  );

  if (variant === "inline") {
    return (
      <div className="flex gap-3">
        <div className="mt-0.5 text-muted-foreground">{icon ? icon : emoji}</div>
        <div>
          <h3 className="font-semibold leading-6 text-foreground">{title}</h3>
          <div className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {children ?? description}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "tile") {
    return (
      <div className={`h-full rounded-xl border border-input bg-card p-5 transition hover:shadow ${className ?? ""}`}>
        <div className="mb-3 flex items-center gap-2 text-muted-foreground">
          {icon ? icon : emoji}
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        {(description || children) && (
          <div className="text-sm text-muted-foreground">
            {children ?? description}
          </div>
        )}
        {(href && cta) || (secondaryHref && secondaryCta) ? (
          <div className="mt-4 flex gap-3 flex-wrap">
            {href && cta ? (
              <Link
                href={href}
                className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs shadow hover:opacity-90"
              >
                {cta}
              </Link>
            ) : null}
            {secondaryHref && secondaryCta ? (
              <Link
                href={secondaryHref}
                target={target}
                className="px-3 py-2 rounded-md border border-input bg-background text-xs shadow hover:bg-accent hover:text-accent-foreground"
              >
                {secondaryCta}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === "section") {
    return (
      <section id={id} data-feature-section className={`relative w-full min-h-[90dvh] flex items-center snap-start snap-always pb-20 md:pb-24 ${className ?? ""}`}>
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <div className={`flex flex-col-reverse ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 md:gap-12`}>
            <div className="w-full md:w-1/2">
              <div className="mb-3 flex items-center gap-3">
                <div className="text-muted-foreground">{icon ? icon : emoji}</div>
                <h3 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h3>
              </div>
              {(description || children) && (
                <div className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {children ?? description}
                </div>
              )}
              {(href && cta) || (secondaryHref && secondaryCta) ? (
                <div className="mt-6 flex gap-3 flex-wrap">
                  {href && cta ? (
                    <Link
                      href={href}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm shadow hover:opacity-90"
                    >
                      {cta}
                    </Link>
                  ) : null}
                  {secondaryHref && secondaryCta ? (
                    <Link
                      href={secondaryHref}
                      target={target}
                      className="px-4 py-2 rounded-lg border border-input bg-background text-sm shadow hover:bg-accent hover:text-accent-foreground"
                    >
                      {secondaryCta}
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="w-full md:w-1/2">
              {media ? (
                <div
                  className={
                    imageVariant === 'phone'
                      ? 'relative mx-auto aspect-[9/19] w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px] overflow-hidden rounded-2xl border border-input bg-muted'
                      : 'relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-input bg-muted'
                  }
                >
                  {media}
                </div>
              ) : imageSrc ? (
                <div
                  className={
                    imageVariant === 'phone'
                      ? 'relative mx-auto aspect-[9/19] w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px] overflow-hidden rounded-2xl border border-input bg-muted'
                      : 'relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-input bg-muted'
                  }
                >
                  <Image
                    src={imageSrc}
                    alt={imageAlt ?? title}
                    fill
                    className={imageFit === 'contain' ? 'object-contain' : 'object-cover'}
                    sizes={
                      imageVariant === 'phone'
                        ? '(min-width: 1280px) 380px, (min-width: 768px) 340px, (min-width: 640px) 300px, 260px'
                        : '(min-width: 1024px) 50vw, 100vw'
                    }
                    priority={false}
                  />
                </div>
              ) : (
                <div
                  className={
                    imageVariant === 'phone'
                      ? 'relative mx-auto aspect-[9/19] w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px] overflow-hidden rounded-2xl border border-input bg-gradient-to-br from-muted to-muted-foreground/10'
                      : 'relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-input bg-gradient-to-br from-muted to-muted-foreground/10'
                  }
                />
              )}
            </div>
          </div>
        </div>
        {nextId ? (
          <a
            href={`#${nextId}`}
            className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-input bg-background/80 backdrop-blur text-muted-foreground shadow hover:bg-accent hover:text-accent-foreground"
            aria-label="Scroll to next section"
          >
            <ChevronDown className="h-5 w-5" />
          </a>
        ) : null}
      </section>
    );
  }

  return (
    <div className={`rounded-2xl shadow p-6 bg-card flex flex-col justify-between ${className ?? ""}`}>
      <div>
        <h3 className="text-xl font-semibold mb-2">
          {titlePrefix}
          {title}
        </h3>
        {(description || children) && (
          <div className="text-muted-foreground mb-4">
            {children ?? description}
          </div>
        )}
      </div>
      {(href && cta) || (secondaryHref && secondaryCta) ? (
        <div className="flex gap-3 flex-wrap">
          {href && cta ? (
            <Link
              href={href}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm shadow hover:opacity-90"
            >
              {cta}
            </Link>
          ) : null}
          {secondaryHref && secondaryCta ? (
            <Link
              href={secondaryHref}
              target={target}
              className="px-4 py-2 rounded-lg border border-input bg-background text-sm shadow hover:bg-accent hover:text-accent-foreground"
            >
              {secondaryCta}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default function LandingPage() {
  const { preamble } = ngcData;

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-4 pt-4 flex justify-end">
        <ThemeToggle />
      </div>
      {/* Hero */}
      <section className="w-full min-h-[100dvh] flex items-center">
        <div className="mx-auto w-full max-w-4xl px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Always Ready Tools</h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6">
            Decentralized dispatch, training, and incident reporting. Secure. Volunteer-run.
          </p>
          <p className="text-base sm:text-lg text-muted-foreground">
            Always Ready Tools should look like tomorrow’s emergency system built by the people. No marketing gloss—just clarity, security, and confidence. The goal is to make a donor say, “This is what real infrastructure looks like,” and make an organizer say, “We can use this today.”
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

      {/* Tools Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-6xl mx-auto px-4 mb-4">
        <FeatureItem
          variant="tile"
          title="Watch"
          emoji="🗺️"
          target="_blank"
          href="https://watch.alwaysreadytools.org"
          description="Public incident reporting & heatmaps. Anonymous, timestamped reports — no personal data."
          cta="Explore Watch"
        />
        <FeatureItem
          variant="tile"
          title="Dispatch (Regions)"
          emoji="📟"
          target="_blank"
          href="https://demo.alwaysreadytools.org"
          description="Regional volunteer coordination. Each region runs its own secure database for rosters, shifts, alerts, and trust lists."
          cta="Demo Region"
        />
        <FeatureItem
          variant="tile"
          title="Academy"
          emoji="🎓"
          target="_blank"
          href="https://academy.alwaysreadytools.org"
          description="Training & certifications. Learn skills, earn certifications, and onboard into local Pods."
          cta="Start Training"
        />
        <FeatureItem
          variant="tile"
          title="Admin"
          emoji="📊"
          target="_blank"
          href="https://admin.alwaysreadytools.org"
          description="National admin & trainer hub. Metadata only — skills gaps, support requests, and training resources."
          cta="Admin Overview"
        />
        <FeatureItem
          variant="tile"
          title="Region Directory"
          emoji="🧭"
          href="/regions"
          description="Browse active and demo regions across the U.S."
          cta="Browse Regions"
        />
      </section>

      {/* Core Platforms (Showcase) */}
      <section className="w-full">
        <FeatureItem imageSrc="/how-to-use.png" imageAlt="how to use screenshot" imageVariant="phone" imageFit="contain" id="feature-howto" nextId="feature-need" variant="section" icon={<BookOpen className="h-6 w-6" />} title="How to Use">
          The How‑to guide is a built‑in reference for new and experienced users.
          It explains common workflows step by step and links concepts across the platform so you can learn in context.
          Short sections are designed for quick reading during live operations when time is limited.
          Use it to discover features, clarify terminology, and share consistent practices across teams.
        </FeatureItem>

        <FeatureItem imageSrc="/watch.png" imageAlt="watch screenshot" imageVariant="phone" imageFit="contain" id="feature-watch" nextId="feature-confirmed-watch" variant="section" reverse icon={<Eye className="h-6 w-6" />} title="Watch">
          Watch is a live map for situational awareness across your region.
          Layers and filters help you focus on relevant reports, signals, and activity as conditions change.
          It’s useful for real‑time monitoring, early triage, and spotting patterns before they turn into dispatches.
          Teams can use Watch during operations briefings to align on what’s happening right now.
        </FeatureItem>

        <FeatureItem imageSrc="/confirmed-watch.png" imageAlt="confirmed watch screenshot" imageVariant="phone" imageFit="contain" id="feature-confirmed-watch" nextId="feature-dispatches" variant="section" icon={<CheckCircle2 className="h-6 w-6" />} title="Confirmed Watch">
          Confirmed Watch highlights reports that coordinators have reviewed and verified for accuracy.
          This view reduces noise and uncertainty so on‑the‑ground teams can act with confidence.
          It lives inside Watch as a filter or dedicated layer rather than a separate tool.
          Use it when you need a trusted baseline for decisions or public communication.
        </FeatureItem>

        <FeatureItem imageSrc="/pods.png" imageAlt="pods screenshot" imageVariant="phone" imageFit="contain" id="feature-pods" nextId="feature-schedules" variant="section" reverse icon={<Users className="h-6 w-6" />} title="Pods">
          Pods are teams organized around people, skills, and geography.
          Use them to maintain rosters, define communication channels, and assign responsibilities to specific areas.
          Pods make it easier to see who is available and how coverage changes over time.
          Well‑structured pods reduce confusion during incidents and improve handoffs.
        </FeatureItem>

        <FeatureItem imageSrc="/dispatch.png" imageAlt="dispatches screenshot" imageVariant="phone" imageFit="contain" id="feature-dispatches" nextId="feature-howto" variant="section" icon={<ClipboardList className="h-6 w-6" />} title="Dispatches">
          Dispatches is the intake‑to‑action pipeline that moves a report from first contact to resolution.
          Coordinators triage submissions, set status, and record intended actions so everyone sees the current plan.
          Roles and staffing needs are tracked here, and updates form the running incident log for handoffs.
          Use Dispatches to keep decisions visible, responsibilities clear, and progress easy to audit.
        </FeatureItem>

        <FeatureItem imageSrc="/meet-a-need.png" imageAlt="meet a need screenshot" imageVariant="phone" imageFit="contain" id="feature-need" nextId="feature-missing" variant="section" reverse icon={<LifeBuoy className="h-6 w-6" />} title="Meet a Need">
          Meet a Need is a guided intake for community requests that feeds directly into Dispatches.
          The form collects the essential context up front so coordinators can prioritize quickly and respond appropriately.
          It is suitable for demos and training, but it also supports real‑world requests when enabled.
          Clear intake reduces back‑and‑forth and helps volunteers show up prepared.
        </FeatureItem>

        <FeatureItem imageSrc="/missing-persons.png" imageAlt="missing persons screenshot" imageVariant="phone" imageFit="contain" id="feature-missing" nextId="feature-profile" variant="section" icon={<Search className="h-6 w-6" />} title="Missing Persons">
          Missing Persons provides structured intake and case tracking when someone is unaccounted for.
          It captures critical details, contact information, and consent, then centralizes updates in one timeline.
          The module supports coordination among pods and external partners while protecting sensitive data.
          Use it to keep search efforts organized and to avoid duplicating work.
        </FeatureItem>

        <FeatureItem imageSrc="/academy.png" imageVariant="phone" imageAlt="academy screenshot" imageFit="contain" id="feature-academy" nextId="feature-admin" variant="section" reverse icon={<GraduationCap className="h-6 w-6" />} title="Academy Hub">
          The Academy Hub is your training hub for learning how this platform and your region operate.
          Courses are self‑paced and cover both fundamentals and role‑specific practices so you can onboard quickly.
          As you complete modules, you earn credentials that unlock permissions and responsibilities in other areas of the app.
          Returning users can use the Academy Hub for refreshers or to track progress toward advanced qualifications.
        </FeatureItem>

        <FeatureItem imageSrc="/my-profile.png" imageAlt="my profile screenshot" imageVariant="phone" imageFit="contain" id="feature-profile" nextId="feature-pods" variant="section" icon={<User className="h-6 w-6" />} title="My Profile">
          My Profile is where you keep your information accurate and discoverable.
          Update contact details, languages, and skills so coordinators can match you to the right roles.
          You control map visibility and availability preferences to respect your boundaries.
          Keeping this current improves response speed and reduces coordination overhead.
        </FeatureItem>

        {/* <FeatureItem imageSrc="/admin.png" imageAlt="admin screenshot" imageVariant="phone" id="feature-admin" nextId="feature-watch" variant="section" reverse icon={<Shield className="h-6 w-6" />} title="Admin">
          The Admin area provides region‑level oversight and configuration tools for authorized administrators.
          Use it to review activity, access audit trails, manage reports, and keep operations compliant with local policies.
          From here you can tune integrations, branding, and feature availability so the platform matches your needs.
          Access is restricted to protect sensitive settings while preserving transparency for coordinators.
        </FeatureItem> */}

        {/* <FeatureItem imageSrc="/schedules.png" imageAlt="schedules screenshot" imageVariant="phone" id="feature-schedules" nextId="feature-team-request" variant="section" icon={<Calendar className="h-6 w-6" />} title="Schedules">
          Schedules help you plan shifts, roles, and coverage windows across pods.
          Coordinators can align staffing with expected demand and adjust as conditions change.
          Clear schedules reduce gaps, prevent burnout, and make accountability visible.
          Combined with Dispatches, they provide a day‑to‑day rhythm for operations.
        </FeatureItem> */}

        {/* <FeatureItem imageSrc="/team-req.png" imageAlt="team request screenshot" imageVariant="phone" id="feature-team-request" variant="section" reverse icon={<MessagesSquare className="h-6 w-6" />} title="Team Request">
          Team Request is a structured way to ask for help from specific teams or roles.
          You can specify what skills are needed, where support is required, and any time constraints.
          Clear requests make routing and staffing faster because coordinators have the key details up front.
          It also creates a record that can be tracked to completion or handed off between shifts.
        </FeatureItem> */}
      </section>

      {/* Trust & Privacy */}
      <section className="py-20 text-center max-w-3xl mx-auto px-4">
        {/* Open Source Banner */}
        <div className="mt-10">
          <FeatureItem
            variant="card"
            className="border border-input"
            icon={<Github className="h-5 w-5" />}
            title="This project lives in the public repo"
          >
            <div className="text-left">
              <p className="text-sm uppercase tracking-wide text-muted-foreground">Open Source</p>
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
            <div className="flex gap-3 flex-wrap mt-4">
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
          </FeatureItem>
        </div>
      </section>


      {/* Project Overview */}
      <section className="mx-auto mt-16 max-w-3xl px-4">
        <h2 className="text-2xl font-semibold mb-4">Why Always Ready Tools</h2>

        <div className="space-y-4">
          <FeatureItem variant="card" emoji="🎯" title="Purpose">
            <p>
              Always Ready Tools (ART) is an open-source, decentralized suite for real-world community defense, mutual aid, and rapid response.
              It provides secure coordination, reporting, and training infrastructure for networks that already exist on the ground — activists, medics, organizers, and neighbors.
              It’s live and usable today, with public demos and deployable regional instances.
            </p>
          </FeatureItem>

          <FeatureItem variant="card" emoji="⚙️" title="Design Philosophy">
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Privacy First:</strong> Each region owns its database; nothing is centralized.</li>
              <li><strong>Transparency:</strong> The code is public and auditable.</li>
              <li><strong>Resilience:</strong> Works offline, syncs when possible.</li>
              <li><strong>Autonomy:</strong> Volunteer-run and community-governed.</li>
              <li><strong>Extensible:</strong> Modular React and Supabase stack, ready for forks and integrations.</li>
            </ul>
          </FeatureItem>

          <FeatureItem variant="card" emoji="📣" title="Why It Matters">
            <p>
              Grassroots networks already protect communities. They just need reliable infrastructure. ART replaces chaos — lost spreadsheets, fragmented chats — with tools designed for crisis-ready collaboration.
              It’s not hypothetical. You can log in and use it now.
            </p>
          </FeatureItem>

          <FeatureItem variant="card" emoji="❤️" title="Support">
            <p>
              Funding keeps hosting sustainable and ensures regional independence. Donations cover infrastructure, training content, and hardware for field deployment (PocketServer mesh nodes). Supporting ART means building civil resilience and data sovereignty from the ground up.
            </p>
          </FeatureItem>

          <FeatureItem variant="card" emoji="🌐" title="Open Access">
            <ul className="space-y-1">
              <li>Code: <Link href="https://github.com/MissTitanK3/art" className="underline underline-offset-4">github.com/MissTitanK3/art</Link></li>
              <li>Demo Region: <Link href="https://demo.alwaysreadytools.org" className="underline underline-offset-4">demo.alwaysreadytools.org</Link></li>
              <li>Watch: <Link href="https://watch.alwaysreadytools.org" className="underline underline-offset-4">watch.alwaysreadytools.org</Link></li>
              <li>Academy Hub: <Link href="https://academy.alwaysreadytools.org" className="underline underline-offset-4">academy.alwaysreadytools.org</Link></li>
            </ul>
          </FeatureItem>


        </div>
      </section>


      <section
        id="origins"
        className="py-16 px-4 sm:px-6 lg:px-8 bg-background text-muted-foreground"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground">
            Origins of the Next Generation Constitution
          </h2>

          <Separator className="mx-auto mb-8 w-24" />

          <div className="text-left">
            <Card className="bg-muted/30 border-none shadow-sm">
              <CardContent className="p-6 sm:p-8 space-y-4 leading-relaxed">
                <p>
                  In February 2025, while fleeing the South and pausing in
                  Colorado, I (T) witnessed what felt like the disintegration of the
                  United States Constitution. As a military member, I was torn
                  between my oath to protect citizens from all enemies, foreign
                  and domestic, and my inability to act within that moment’s
                  limits.
                </p>

                <p>
                  I turned to writing as a means of grounding myself. From that
                  struggle came the idea of the{" "}
                  <span className="font-semibold">
                    Next Generation Constitution (NGC)
                  </span>
                  . A document outlining what I would fight for in 2025 and beyond.
                </p>

                <p>
                  The NGC became a tool for mental stability and purpose. If I can
                  envision a future where it exists, then working toward that
                  future makes the fight worthwhile.
                </p>

                <p>
                  The NGC is what motivates the work I’m doing here, but
                  adopting it is not required to participate in or use these
                  tools. I include it for transparency, so you understand why I
                  build the way I do and the future I hope we can reach.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* NGC Intro Section */}
      <section aria-labelledby="ngc-intro" className="mx-auto mt-14 max-w-5xl px-4">
        <div className="rounded-2xl border border-input bg-card p-6 shadow">
          <div className="mb-4 flex-col md:flex-row items-center justify-between gap-4">
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

          <div>
            <p>Background on this document.</p>

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

      {/* CTA */}
      <section className="py-20 bg-muted text-center mt-16">
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

      <BackToTopButton />

    </main>
  );
};

// FeatureItem component above unifies both card and inline presentations
