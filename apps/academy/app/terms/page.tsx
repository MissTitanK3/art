import Link from "next/link";

// ------------------------------
// Terms Page
// ------------------------------

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-20 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl border border-input bg-background shadow hover:bg-accent hover:text-accent-foreground"
        >
          Home
        </Link>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground">
          By accessing or using Always Ready Tools (&quot;ART&quot;), you agree to be bound by these Terms & Conditions.
          If you do not agree, you may not use the services. ART reserves the right to update these Terms at any time,
          and continued use constitutes acceptance of the changes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">2. Services Provided</h2>
        <p className="text-muted-foreground">
          ART is a decentralized suite of tools for regional dispatch, volunteer coordination, training, and
          public incident reporting. Regions are independently operated, and ART makes no guarantees about
          uptime, accuracy, or availability of any regional service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">3. Proper Use</h2>
        <p className="text-muted-foreground">
          You agree to use ART services only for lawful, community-supportive purposes. Misuse for harassment,
          disinformation, surveillance, or unlawful activity is strictly prohibited and may result in suspension
          or termination of access.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">4. Accounts and Access</h2>
        <p className="text-muted-foreground">
          Regional volunteers and admins are responsible for maintaining the confidentiality of their login
          information and any activity under their accounts. ART is not responsible for unauthorized access
          arising from negligence or insecure practices.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">5. Privacy</h2>
        <p className="text-muted-foreground">
          ART prioritizes privacy and minimizes data collection. Personal identifying information (PII) is siloed
          within regional databases and never centralized. Use of ART is subject to the accompanying Privacy Policy.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">6. Security</h2>
        <p className="text-muted-foreground">
          Users are expected to follow operational security guidelines. Any attempt to compromise the
          infrastructure, breach regional silos, or access unauthorized data is prohibited and may be
          reported to relevant authorities.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">7. Limitation of Liability</h2>
        <p className="text-muted-foreground">
          ART is provided on an “as-is” basis. We do not warrant that the services will be uninterrupted,
          error-free, or completely secure. ART is not liable for any direct, indirect, incidental, or
          consequential damages resulting from use of the services.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">8. Termination</h2>
        <p className="text-muted-foreground">
          ART reserves the right to suspend or terminate access to services at its discretion, especially
          in cases of security concerns, violations of these Terms, or misuse of the platform.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">9. Governing Law</h2>
        <p className="text-muted-foreground">
          These Terms are intended as community governance guidelines, not as a legal contract enforceable
          in a specific jurisdiction. In cases of dispute, ART encourages resolution through community
          dialogue and restorative practices.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">10. Contact</h2>
        <p className="text-muted-foreground">
          Questions about these Terms may be directed through the admin portal or to your regional admin team.
        </p>
      </section>
    </main>
  );
}