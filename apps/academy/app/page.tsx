'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@workspace/ui/components/button';
import ThemeToggle from '@workspace/ui/components/client/ThemeToggle';

export default function Home() {

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-20 gap-16 bg-background">
      <div className="text-center max-w-xl space-y-4">
        <div className="flex w-full justify-center">
          <Image src="/logo.png" alt="logo" width={200} height={150} />
        </div>
        <p className="text-base text-muted-foreground">Choose where you&apos;d like to go next.</p>
        <p className="text-sm text-muted-foreground">
          The <strong>Academy</strong> helps you learn and get certified.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full flex justify-center gap-3 flex-col md:flex-row">
          <Button asChild className="transition-transform hover:scale-105">
            <Link href="/courses">Enter Academy</Link>
          </Button>
          <Button asChild className="transition-transform hover:scale-105">
            <Link target="_blank" href="https://demo.alwaysreadytools.org">
              Go To Dispatch
            </Link>
          </Button>
          <Button asChild className="transition-transform hover:scale-105">
            <Link target="_blank" href="https://watch.alwaysreadytools.org">
              Go To Watch
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-2xl text-sm text-muted-foreground text-center space-y-3 mt-8 px-2">
        <p>
          <strong>The Academy</strong> is a self-paced, community-powered learning hub. It equips everyday people with
          the tools, skills, and situational awareness needed to respond to state violence, protect vulnerable
          neighbors, and coordinate effective resistance.
        </p>

        <p>
          Whether you&apos;re joining a field team, dispatching reports, or just want to understand your rights—this is
          where you start.
        </p>
      </div>

      <footer className="mt-24 text-sm text-muted-foreground">
        <ThemeToggle />
      </footer>
    </main>
  );
}
