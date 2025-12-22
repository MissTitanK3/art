import Link from "next/link";
import Image from "next/image";
import { FC, ReactNode } from "react";
import Carousel from "../components/Carousel";
import { ngcData } from "../lib/ngc";
import { Card, CardContent } from "@workspace/ui/primitives/card";
import { Separator } from "@workspace/ui/primitives/separator";
import ThemeToggle from "@workspace/ui/patterns/common/theme-toggle";
import BackToTopButton from "../components/BackToTopButton";
import {
  GraduationCap,
  Eye,
  CheckCircle2,
  ClipboardList,
  BookOpen,
  LifeBuoy,
  Search,
  User,
  Users,
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
  imageFit?: "cover" | "contain";
  imageVariant?: "default" | "phone";
  imagePriority?: boolean;
  imageLoading?: "eager" | "lazy";
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
  imageFit = "cover",
  imageVariant = "default",
  imagePriority = false,
  imageLoading,
}) => {
  const titlePrefix = (
    <span className="mr-2 inline-block align-middle">
      {icon ? icon : emoji}
    </span>
  );

  if (variant === "inline") {
    return (
      <div className="flex gap-3">
        <div className="mt-0.5 text-muted-foreground">
          {icon ? icon : emoji}
        </div>
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
      <div
        className={`h-full rounded-xl border border-input bg-card transition hover:shadow ${className ?? ""}`}
      >
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
      <section
        id={id}
        data-feature-section
        className={`relative w-full min-h-[90dvh] flex items-center snap-start snap-always ${className ?? ""}`}
      >
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <div
            className={`flex flex-col-reverse ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 md:gap-12`}
          >
            <div className="w-full md:w-1/2">
              <div className="mb-3 flex items-center gap-3">
                <div className="text-muted-foreground">
                  {icon ? icon : emoji}
                </div>
                <h3 className="text-3xl font-semibold tracking-tight text-foreground">
                  {title}
                </h3>
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
                    imageVariant === "phone"
                      ? "relative mx-auto aspect-[9/19] w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px] overflow-hidden rounded-2xl border border-input bg-muted"
                      : "relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-input bg-muted"
                  }
                >
                  {media}
                </div>
              ) : imageSrc ? (
                <div
                  className={
                    imageVariant === "phone"
                      ? "relative mx-auto aspect-[9/19] w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px] overflow-hidden rounded-2xl border border-input bg-muted"
                      : "relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-input bg-muted"
                  }
                >
                  <Image
                    src={imageSrc}
                    alt={imageAlt ?? title}
                    fill
                    className={
                      imageFit === "contain" ? "object-contain" : "object-cover"
                    }
                    sizes={
                      imageVariant === "phone"
                        ? "(min-width: 1280px) 380px, (min-width: 768px) 340px, (min-width: 640px) 300px, 260px"
                        : "(min-width: 1024px) 50vw, 100vw"
                    }
                    priority={imagePriority}
                    loading={imageLoading}
                  />
                </div>
              ) : (
                <div
                  className={
                    imageVariant === "phone"
                      ? "relative mx-auto aspect-[9/19] w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px] overflow-hidden rounded-2xl border border-input bg-gradient-to-br from-muted to-muted-foreground/10"
                      : "relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-input bg-gradient-to-br from-muted to-muted-foreground/10"
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
    <div
      className={`rounded-2xl shadow p-6 bg-card flex flex-col justify-between ${className ?? ""}`}
    >
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

  const presentationSlides = [
    {
      title: "Slide 1 - Title & Snap Intro",
      heading: "ART: Operational power for community care networks",
      bullets: [
        "Tools: Watch, Dispatch, Academy",
        "Strength: Trusted coordination across pods and orgs",
      ],
      speaking: "ART gives grassroots community organizations the operational power they need to respond faster, safer, and with less burnout.",
      footer: "Purpose: Set confidence and clarity immediately.",
    },
    {
      title: "Slide 2 - The Problem (Systemic)",
      heading: "Chaos kills impact",
      bullets: [
        "Fragmented communication",
        "Lost volunteers and supplies",
        "No shared situational awareness",
      ],
      speaking:
        "Everyone is drowning in scattered group chats, spreadsheets, and memory. It works until it does not, especially in crisis.",
      footer: "Pain Question: What tools are you juggling during your busiest actions?",
    },
    {
      title: "Slide 3 - What They Get (Incentive Overview)",
      heading: "The org benefits first",
      bullets: [
        "More impact with the same volunteers",
        "Fundable proof of outcomes",
        "Less chaos, safer ops, higher retention",
      ],
      speaking:
        "The incentive is simple: you get measurable impact with the same number of volunteers, less chaos, safer coordination, and better funding outcomes.",
      footer: "Presenter Note: Pause and check body language.",
    },
    {
      title: "Slide 4 - The Toolset: Watch",
      heading: "Watch — Real-time needs and visibility",
      bullets: [
        "Community-submitted reports",
        "Filters to prevent overload",
        "Quick intake → Dispatch handoff",
      ],
      speaking:
        "Watch turns community reports and team intel into a real-time picture of what is happening, so you know where help is needed right now.",
      footer: "Benefit: Visibility replaces guesswork.",
    },
    {
      title: "Slide 5 - The Toolset: Dispatch",
      heading: "Dispatch — Coordinated volunteer response",
      bullets: [
        "Assign roles, routes, and tasks fast",
        "Track field status live",
        "Accountability without surveillance",
      ],
      speaking:
        "With Dispatch, you assign roles and routes in seconds and track status live. No one gets lost, stuck, or overloaded.",
      footer: "Tacoma Proof: ~25% less lead overload during deployments.",
    },
    {
      title: "Slide 6 - The Toolset: Academy",
      heading: "Academy — Nationwide shared foundations",
      bullets: [
        "Training built from frontline expertise",
        "Certify volunteers and build leaders",
        "Everyone follows the same safety rules",
      ],
      speaking:
        "Every volunteer starts with the same structure, safety knowledge, and expectations. We grow volunteers into leaders without burning them out.",
      footer: "Incentive: Low training cost. High role reliability.",
    },
    {
      title: "Slide 7 - Regional Siloing",
      heading: "Regional siloing by design",
      bullets: [
        "Each region has its own data silo",
        "No national database of vulnerable people",
        "Autonomy protected by design",
      ],
      speaking:
        "All data stays in your region. There is no national database of vulnerable people. You maintain local trust and autonomy.",
      footer: "Incentive: Safety, compliance, and reputation protection.",
    },
    {
      title: "Slide 8 - Inter-Org Coordination",
      heading: "Inter-org coordination without merging systems",
      bullets: [
        "Share requests and resources when you choose",
        "Pods keep independence",
        "Coalitions scale without bureaucracy",
      ],
      speaking:
        "You can collaborate between organizations without merging systems or losing independence. You share what you choose, when you choose.",
      footer: "Incentive: Your reach expands while keeping confidence.",
    },
    {
      title: "Slide 9 - Data → Funding",
      heading: "Outcomes tracked automatically",
      bullets: [
        "Volunteer hours",
        "Needs met and supplies distributed",
        "Field logs for audits",
      ],
      speaking:
        "ART turns your everyday work into the grant reporting funders ask for. Volunteer hours, needs met, and distribution counts are all tracked automatically.",
      footer:
        "Tacoma Example: 20+ neighbors supported in 3 hours with grant-ready breakdown.",
    },
    {
      title: "Slide 10 - Volunteer Retention",
      heading: "People stay when they are not overwhelmed",
      bullets: ["Clear tasks", "Visible contribution", "Safer, structured action"],
      speaking:
        "When expectations are clear and wins are visible, volunteers keep showing up. ART keeps people energized instead of overwhelmed.",
      footer: "Incentive: More impact with the same people.",
    },
    {
      title: "Slide 11 - Safety and Trust",
      heading: "Right people, right information, right time",
      bullets: [
        "Verified roles prevent infiltration",
        "Field leads get confidence, not guesswork",
      ],
      speaking:
        "Correct people, Correct information, Correct time. Clear role verification protects volunteers and the people you serve.",
      footer: "Incentive: Reduced risk of PR and legal disasters.",
    },
    {
      title: "Slide 12 - Real-World Proof: Tacoma CDC",
      heading: "Tacoma CDC results",
      bullets: [
        "20+ neighbors supported in 3 hours",
        "About 25% less lead overload",
        "Zero lost volunteers",
        "Grant-ready reporting produced instantly",
      ],
      speaking:
        "We have tested this under real pressure. No theory. This works in live community defense and mutual aid operations.",
      footer:
        "Proof: Zero lost volunteers, smooth handoff, real outcomes. Hilltop is moving toward independent ops.",
    },
    {
      title: "Slide 13 - Incentives by Role",
      heading: "What each leader wins",
      bullets: [
        "Executive: Scale impact",
        "Ops: Less fire-fighting",
        "Grant lead: More funding",
        "Volunteer coord: Better retention",
        "Field lead: Safer deployments",
        "Board/funder: More value per dollar",
      ],
      speaking:
        "Each of you gets less pain and more progress.",
      footer:
        "Soft Close: Does that line up with what you’ve been struggling with?",
    },
    {
      title: "Slide 14 - Built for Accessibility",
      heading: "Built for accessibility",
      bullets: [
        "Low-stress UI for high-stress environments",
        "Neurodivergent-friendly design",
        "Easy onboarding for new volunteers",
      ],
      speaking:
        "We design for low-stress usability in high-stress environments. Accessibility is core, not an add-on.",
      footer: "Incentive: Recruit wider, onboard faster, less friction.",
    },
    {
      title: "Slide 15 - Roadmap",
      heading: "Roadmap",
      bullets: [
        "Continuous improvements",
        "Offline and low-connectivity support coming",
        "Early partners influence direction",
      ],
      speaking:
        "We build from frontline input, not SV fantasies. Offline/low-connectivity in development; early partners help shape it.",
      footer: "Expectation: Be honest about now vs. in progress.",
    },
    {
      title: "Slide 16 - Deployment Fit",
      heading: "Where ART shines",
      bullets: [
        "Distributions",
        "Protests and safety operations",
        "Neighborhood patrols",
        "Intake and needs response",
      ],
      speaking:
        "ART is purpose-built where chaos hits hardest: distributions, events, patrols, rapid needs response.",
      footer: "Probe: Where does your coordination break most often?",
    },
    {
      title: "Slide 17 - Pricing",
      heading: "Cooperative pricing model",
      bullets: [
        "Based on active volunteers",
        "No expensive licenses",
        "Free access for vulnerable communities",
      ],
      speaking:
        "We keep this affordable. Pricing scales with active volunteers; free access remains for vulnerable populations.",
      footer: "Ethos: We grow with you, not off of you.",
    },
    {
      title: "Slide 18 - Partnership",
      heading: "Partnership cohort",
      bullets: [
        "Limited onboarding slots",
        "Setup and training included",
        "Early adopter influence",
      ],
      speaking:
        "We onboard a limited number of partners each quarter to provide direct support.",
      footer: "Urgency: You’re early enough to influence direction.",
    },
    {
      title: "Slide 19 - Call To Action",
      heading: "Next step: Schedule Walkthrough",
      bullets: [
        "Schedule a 30 minute workflow walkthrough",
        "Map your ops into ART",
        "Lock a date now",
      ],
      speaking:
        "Let’s schedule a 30-minute walkthrough with ops/field leads to map your coordination into ART.",
      footer:
        "Action: Hand them your phone. Ask: Which day this week works best?",
    },
    {
      title: "Slide 20 - Closing",
      heading: "Community care deserves high-grade tools",
      bullets: ["Who should join the walkthrough?"],
      speaking:
        "We’re building with people like you. Who else should join the next conversation?",
      footer: "Close: Get names. Get commitment.",
    },
  ] as const;

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
            Always Ready Tools should look like tomorrow’s emergency system
            built by the people. No marketing gloss—just clarity, security, and
            confidence. The goal is to make a donor say, “This is what real
            infrastructure looks like,” and make an organizer say, “We can use
            this today.”
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

      {/* Content Outline (derived from presentation slides) */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-semibold">Content Outline</h2>
        <div className="space-y-6">
          {presentationSlides.map((s, i) => (
            <section
              key={i}
              id={`content-outline-${i + 1}`}
              className="rounded-2xl border border-input bg-card p-6 shadow"
            >
              <h3 className="text-2xl font-semibold text-foreground">{s.heading}</h3>
              <p className="mt-3 text-sm text-foreground">{s.speaking}</p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {s.bullets.map((b, bi) => (
                  <li key={bi}>{b}</li>
                ))}
              </ul>
              {s.footer ? (
                <p className="mt-3 text-xs text-muted-foreground">{s.footer}</p>
              ) : null}
            </section>
          ))}
        </div>
      </section>

      {/* Core Platforms (Carousel) */}
      <section className="mx-auto w-full max-w-6xl py-6">
        <h2 className="mb-4 text-2xl font-semibold">Core Platforms</h2>
        <Carousel className="min-h-[60dvh]" autoPlay autoPlayInterval={7000} ariaLabel="Core platform features">
          <FeatureItem
            className="min-h-[60dvh]"
            imageSrc="/how-to-use.png"
            imageAlt="how to use screenshot"
            imageVariant="phone"
            imageFit="contain"
            imagePriority
            variant="section"
            icon={<BookOpen className="h-6 w-6" />}
            title="How to Use"
          >
            The How‑to guide is a built‑in reference for new and experienced
            users. It explains common workflows step by step and links concepts
            across the platform so you can learn in context. Short sections are
            designed for quick reading during live operations when time is
            limited. Use it to discover features, clarify terminology, and share
            consistent practices across teams.
          </FeatureItem>

          <FeatureItem
            className="min-h-[60dvh]"
            imageSrc="/watch.png"
            imageAlt="watch screenshot"
            imageVariant="phone"
            imageFit="contain"
            imageLoading="eager"
            variant="section"
            reverse
            icon={<Eye className="h-6 w-6" />}
            title="Watch"
          >
            Watch is a live map for situational awareness across your region.
            Layers and filters help you focus on relevant reports, signals, and
            activity as conditions change. It’s useful for real‑time monitoring,
            early triage, and spotting patterns before they turn into dispatches.
            Teams can use Watch during operations briefings to align on what’s
            happening right now.
          </FeatureItem>

          <FeatureItem
            className="min-h-[60dvh]"
            imageSrc="/confirmed-watch.png"
            imageAlt="confirmed watch screenshot"
            imageVariant="phone"
            imageFit="contain"
            imageLoading="eager"
            variant="section"
            icon={<CheckCircle2 className="h-6 w-6" />}
            title="Confirmed Watch"
          >
            Confirmed Watch highlights reports that coordinators have reviewed and
            verified for accuracy. This view reduces noise and uncertainty so
            on‑the‑ground teams can act with confidence. It lives inside Watch as
            a filter or dedicated layer rather than a separate tool. Use it when
            you need a trusted baseline for decisions or public communication.
          </FeatureItem>

          <FeatureItem
            className="min-h-[60dvh]"
            imageSrc="/pods.png"
            imageAlt="pods screenshot"
            imageVariant="phone"
            imageFit="contain"
            imageLoading="eager"
            variant="section"
            reverse
            icon={<Users className="h-6 w-6" />}
            title="Pods"
          >
            Pods are teams organized around people, skills, and geography. Use
            them to maintain rosters, define communication channels, and assign
            responsibilities to specific areas. Pods make it easier to see who is
            available and how coverage changes over time. Well‑structured pods
            reduce confusion during incidents and improve handoffs.
          </FeatureItem>

          <FeatureItem
            className="min-h-[60dvh]"
            imageSrc="/dispatch.png"
            imageAlt="dispatches screenshot"
            imageVariant="phone"
            imageFit="contain"
            imageLoading="eager"
            variant="section"
            icon={<ClipboardList className="h-6 w-6" />}
            title="Dispatches"
          >
            Dispatches is the intake‑to‑action pipeline that moves a report from
            first contact to resolution. Coordinators triage submissions, set
            status, and record intended actions so everyone sees the current plan.
            Roles and staffing needs are tracked here, and updates form the
            running incident log for handoffs. Use Dispatches to keep decisions
            visible, responsibilities clear, and progress easy to audit.
          </FeatureItem>

          <FeatureItem
            className="min-h-[60dvh]"
            imageSrc="/meet-a-need.png"
            imageAlt="meet a need screenshot"
            imageVariant="phone"
            imageFit="contain"
            imageLoading="eager"
            variant="section"
            reverse
            icon={<LifeBuoy className="h-6 w-6" />}
            title="Meet a Need"
          >
            Meet a Need is a guided intake for community requests that feeds
            directly into Dispatches. The form collects the essential context up
            front so coordinators can prioritize quickly and respond
            appropriately. It is suitable for demos and training, but it also
            supports real‑world requests when enabled. Clear intake reduces
            back‑and‑forth and helps volunteers show up prepared.
          </FeatureItem>

          <FeatureItem
            className="min-h-[60dvh]"
            imageSrc="/missing-persons.png"
            imageAlt="missing persons screenshot"
            imageVariant="phone"
            imageFit="contain"
            imageLoading="eager"
            variant="section"
            icon={<Search className="h-6 w-6" />}
            title="Missing Persons"
          >
            Missing Persons provides structured intake and case tracking when
            someone is unaccounted for. It captures critical details, contact
            information, and consent, then centralizes updates in one timeline.
            The module supports coordination among pods and external partners
            while protecting sensitive data. Use it to keep search efforts
            organized and to avoid duplicating work.
          </FeatureItem>

          <FeatureItem
            className="min-h-[60dvh]"
            imageSrc="/academy.png"
            imageVariant="phone"
            imageAlt="academy screenshot"
            imageFit="contain"
            imageLoading="eager"
            variant="section"
            reverse
            icon={<GraduationCap className="h-6 w-6" />}
            title="Academy Hub"
          >
            The Academy Hub is your training hub for learning how this platform
            and your region operate. Courses are self‑paced and cover both
            fundamentals and role‑specific practices so you can onboard quickly.
            As you complete modules, you earn credentials that unlock permissions
            and responsibilities in other areas of the app. Returning users can
            use the Academy Hub for refreshers or to track progress toward
            advanced qualifications.
          </FeatureItem>

          <FeatureItem
            className="min-h-[60dvh]"
            imageSrc="/my-profile.png"
            imageAlt="my profile screenshot"
            imageVariant="phone"
            imageFit="contain"
            imageLoading="eager"
            variant="section"
            icon={<User className="h-6 w-6" />}
            title="My Profile"
          >
            My Profile is where you keep your information accurate and
            discoverable. Update contact details, languages, and skills so
            coordinators can match you to the right roles. You control map
            visibility and availability preferences to respect your boundaries.
            Keeping this current improves response speed and reduces coordination
            overhead.
          </FeatureItem>
        </Carousel>
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
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                Open Source
              </p>
              <p className="text-muted-foreground mt-1">
                Open source means the software’s “recipe” (the code) is public
                and free to use. Anyone can see how it works, help improve it,
                and hold us accountable.
              </p>
              <ul className="mt-3 text-sm text-muted-foreground space-y-2">
                <li>
                  👀 <strong>Transparency:</strong> Read the code yourself or
                  ask a trusted tech friend to review it.
                </li>
                <li>
                  🛡️ <strong>Safety:</strong> Many eyes can spot issues and help
                  fix them quickly.
                </li>
                <li>
                  🙋 <strong>Participation:</strong> Share ideas or report
                  issues — no coding required (a free GitHub account helps).
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                Free to use under the {""}
                <Link
                  href="https://github.com/MissTitanK3/art/blob/main/LICENSE"
                  className="underline underline-offset-4"
                >
                  LICENSE
                </Link>
                .
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
              Always Ready Tools (ART) is an open-source, decentralized suite
              for real-world community defense, mutual aid, and rapid response.
              It provides secure coordination, reporting, and training
              infrastructure for networks that already exist on the ground —
              activists, medics, organizers, and neighbors. It’s live and usable
              today, with public demos and deployable regional instances.
            </p>
          </FeatureItem>

          <FeatureItem variant="card" emoji="⚙️" title="Design Philosophy">
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Privacy First:</strong> Each region owns its database;
                nothing is centralized.
              </li>
              <li>
                <strong>Transparency:</strong> The code is public and auditable.
              </li>
              <li>
                <strong>Resilience:</strong> Works offline, syncs when possible.
              </li>
              <li>
                <strong>Autonomy:</strong> Volunteer-run and community-governed.
              </li>
              <li>
                <strong>Extensible:</strong> Modular React and Supabase stack,
                ready for forks and integrations.
              </li>
            </ul>
          </FeatureItem>

          <FeatureItem variant="card" emoji="📣" title="Why It Matters">
            <p>
              Grassroots networks already protect communities. They just need
              reliable infrastructure. ART replaces chaos — lost spreadsheets,
              fragmented chats — with tools designed for crisis-ready
              collaboration. It’s not hypothetical. You can log in and use it
              now.
            </p>
          </FeatureItem>

          <FeatureItem variant="card" emoji="❤️" title="Support">
            <p>
              Funding keeps hosting sustainable and ensures regional
              independence. Donations cover infrastructure, training content,
              and hardware for field deployment (PocketServer mesh nodes).
              Supporting ART means building civil resilience and data
              sovereignty from the ground up.
            </p>
          </FeatureItem>

          <FeatureItem variant="card" emoji="🌐" title="Open Access">
            <ul className="space-y-1">
              <li>
                Code:{" "}
                <Link
                  href="https://github.com/MissTitanK3/art"
                  className="underline underline-offset-4"
                >
                  github.com/MissTitanK3/art
                </Link>
              </li>
              <li>
                Demo Region:{" "}
                <Link
                  href="https://demo.alwaysreadytools.org"
                  className="underline underline-offset-4"
                >
                  demo.alwaysreadytools.org
                </Link>
              </li>
              <li>
                Watch:{" "}
                <Link
                  href="https://watch.alwaysreadytools.org"
                  className="underline underline-offset-4"
                >
                  watch.alwaysreadytools.org
                </Link>
              </li>
              <li>
                Academy Hub:{" "}
                <Link
                  href="https://academy.alwaysreadytools.org"
                  className="underline underline-offset-4"
                >
                  academy.alwaysreadytools.org
                </Link>
              </li>
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
                  Colorado, I (T) witnessed what felt like the disintegration of
                  the United States Constitution. As a military member, I was
                  torn between my oath to protect citizens from all enemies,
                  foreign and domestic, and my inability to act within that
                  moment’s limits.
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
      <section
        aria-labelledby="ngc-intro"
        className="mx-auto mt-14 max-w-5xl px-4"
      >
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
}

// FeatureItem component above unifies both card and inline presentations
