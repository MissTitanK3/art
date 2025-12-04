import type { Metadata } from "next";
import Link from "next/link";
import PrintButton from "@workspace/ui/patterns/common/print-button";

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-20 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
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
        <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
        <p className="text-muted-foreground">
          Always Ready Tools (&quot;ART&quot;) is committed to protecting your
          privacy. This policy explains how we handle information across
          regional instances, the Academy, the Watch platform, and the Admin
          portal.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">
          2. Data Collection Principles
        </h2>
        <p className="text-muted-foreground">
          ART is designed with privacy and data minimization at its core. We
          collect only what is necessary to coordinate volunteer dispatch,
          training, and reporting, and we silo all personally identifying
          information (PII) within individual regional databases.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">
          3. Information We Collect
        </h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li>
            <strong>Regional Dispatch:</strong> Volunteer names or handles,
            skills, language preferences, and contact info (encrypted where
            applicable). Stored regionally only.
          </li>
          <li>
            <strong>Academy:</strong> Training progress, certifications earned,
            and user logins. Minimal linkage to regional accounts for
            verification.
          </li>
          <li>
            <strong>Watch:</strong> Public incident reports containing time,
            date, and geolocation only. No personal identifiers are accepted or
            stored.
          </li>
          <li>
            <strong>Admin Portal:</strong> Aggregated, anonymized operational
            signals (counts, open dispatches, skills shortages). No volunteer
            PII.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">
          4. How Information is Used
        </h2>
        <p className="text-muted-foreground">
          Regional admins use volunteer and shift data to coordinate local
          operations. Academy records ensure volunteers meet training standards.
          Watch reports inform public awareness and regional triage. Admin
          signals help allocate support between regions, but never expose
          individual data.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">5. Data Sharing</h2>
        <p className="text-muted-foreground">
          No raw regional data is shared outside its silo. The only information
          transmitted upward is anonymized metadata: counts, skill needs, and
          status signals. ART does not sell, rent, or trade user data.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">6. Data Retention</h2>
        <p className="text-muted-foreground">
          Regional data is retained only as long as necessary for active
          coordination. Inactive accounts may be flagged and removed after 90
          days. Anonymized metadata may be kept for system health and training
          statistics.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">7. Security Measures</h2>
        <p className="text-muted-foreground">
          Each regional database uses separate credentials and encryption keys.
          Access is role-based, and sensitive operations are logged.
          PocketServer sync ensures data integrity even in offline conditions.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">8. Your Rights</h2>
        <p className="text-muted-foreground">
          Volunteers may request review, correction, or deletion of their
          regional data by contacting their Regional Admin. Academy users may
          request deletion of training records. Because ART does not centralize
          PII, requests must be directed at the region where the account exists.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">9. Third-Party Services</h2>
        <p className="text-muted-foreground">
          ART avoids reliance on external analytics or trackers. If integrations
          are used (e.g., secure messaging bridges), they are configured to
          minimize exposure of user information.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">10. Updates</h2>
        <p className="text-muted-foreground">
          This Privacy Policy may be updated to reflect improvements in
          security, changes in operations, or community feedback. Updates will
          be posted here with the revision date.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">11. Contact</h2>
        <p className="text-muted-foreground">
          Questions or concerns about privacy may be directed through the Admin
          portal or your Regional Admin team.
        </p>
      </section>
    </main>
  );
}

export const metadata: Metadata = {
  title: "Privacy Policy · ART Academy",
  description:
    "How ART Academy and regional tools handle data with privacy and minimization.",
  openGraph: {
    title: "Privacy Policy · ART Academy",
    description:
      "How ART Academy and regional tools handle data with privacy and minimization.",
  },
  twitter: {
    title: "Privacy Policy · ART Academy",
    description:
      "How ART Academy and regional tools handle data with privacy and minimization.",
  },
};
