import React, { FC, ReactNode } from 'react'
import Carousel from './Carousel'
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, CheckCircle2, ChevronDown, ClipboardList, Eye, GraduationCap, LifeBuoy, Search, User, Users } from 'lucide-react';

type Props = {}

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
}

const CorePlatform = (props: Props) => {
  return (
    <div>
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
      </section></div>
  )
}

export default CorePlatform