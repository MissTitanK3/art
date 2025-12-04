import type { Metadata } from "next";
import Link from "next/link";
import PrintButton from "@workspace/ui/patterns/common/print-button";

export default function CommunityGuidelinesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-20 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold mb-6">Community Guidelines</h1>
        <div className="flex items-center gap-2">
          <PrintButton />
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-input bg-background shadow hover:bg-accent hover:text-accent-foreground no-print"
          >
            Home
          </Link>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-2">1. Purpose</h2>
        <p className="text-muted-foreground">
          Always Ready Tools (&quot;ART&quot;) exists to support decentralized,
          volunteer-driven coordination for mutual aid, community defense, and
          emergency response. These guidelines define the expected standards of
          behavior for all participants.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">2. Respect & Solidarity</h2>
        <p className="text-muted-foreground">
          All users are expected to treat each other with dignity, respect, and
          care. ART spaces are dedicated to fostering solidarity and collective
          resilience, not division.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">3. Prohibited Conduct</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li>Harassment, discrimination, or hate speech of any kind.</li>
          <li>Sharing of personal data without consent.</li>
          <li>
            Attempts to infiltrate, surveil, or otherwise compromise community
            trust.
          </li>
          <li>
            Spreading disinformation or content designed to undermine safety.
          </li>
          <li>Using ART for unlawful or violent purposes.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">
          4. Volunteer Responsibilities
        </h2>
        <p className="text-muted-foreground">
          Volunteers are expected to honor their commitments, communicate
          clearly with their Pods or regional admins, and uphold operational
          security best practices. Trust lists depend on individual reliability
          and accountability.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">
          5. Regional Admin Responsibilities
        </h2>
        <p className="text-muted-foreground">
          Regional Admins are responsible for maintaining safe spaces, auditing
          trust lists, and ensuring local Pods operate with transparency and
          fairness. Admins must never share raw rosters or logs outside their
          region.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">6. Conflict Resolution</h2>
        <p className="text-muted-foreground">
          Disputes should be addressed first within Pods or regions through
          dialogue and restorative practices. Escalation to the Admin portal may
          be appropriate in cases of severe misconduct or repeated violations.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">7. Enforcement</h2>
        <p className="text-muted-foreground">
          Violations of these guidelines may result in warnings, suspension, or
          permanent removal from regional trust lists. ART prioritizes safety
          and collective well-being over individual access.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">
          8. Continuous Improvement
        </h2>
        <p className="text-muted-foreground">
          These guidelines are living documents. Communities are encouraged to
          adapt, expand, and revise them to reflect local values and lessons
          learned.
        </p>
      </section>
    </main>
  );
}

export const metadata: Metadata = {
  title: "Community Guidelines · ART Academy",
  description:
    "Standards of behavior and expectations for participants in ART spaces.",
  openGraph: {
    title: "Community Guidelines · ART Academy",
    description:
      "Standards of behavior and expectations for participants in ART spaces.",
  },
  twitter: {
    title: "Community Guidelines · ART Academy",
    description:
      "Standards of behavior and expectations for participants in ART spaces.",
  },
};
