# Security Policy

## Supported Versions

Always Ready Tools (ART) follows a rolling-release model.  
We support only the **latest deployed version** of each subdomain (`admin`, `academy`, `watch`, `[region]`) and the **current schema version** of the regional and admin databases.  

Security patches will be prioritized for:
- Admin Dispatch (admin.[domain].org)  
- Regional Dispatch Template ([region].[domain].org)  
- PocketServer offline sync  
- Academy touchpoints (academy.[domain].org)  

---

## Reporting a Vulnerability

If you discover a security vulnerability in ART:

- **Email:** security@alwaysreadytools.org  
- **Encrypted Reports:** PGP key available at https://alwaysreadytools.org/security  

Please include:
- A clear description of the issue  
- Steps to reproduce (if possible)  
- Potential impact assessment  
- Any suggested fixes or mitigations  

We ask that you **do not publicly disclose** the vulnerability until we have confirmed and released a patch.

---

## Data Boundaries & Privacy

Our architecture is designed with strict data minimization:

- **Regional DBs**  
  - Contain volunteer rosters, dispatch logs, trust lists, and alerts.  
  - Stay siloed — no cross-region reads or raw data exports.  

- **Admin DB**  
  - Stores **only anonymized operational signals** (counts, skills gaps, activity status).  
  - **Never** stores PII (names, contact info, incident logs).  

- **Academy DB**  
  - Stores training content and per-user certification progress.  
  - Certification signals sent to regions contain **only completion flags**, not personal data.  

- **Watch**  
  - Accepts only **non-PII public reports** (geo + timestamp).  
  - Automatically redacts any user-provided identifiers before storing.  

---

## Vulnerability Categories

We consider the following **critical vulnerabilities**:

- Leakage of PII across regional boundaries  
- Unauthorized cross-region DB access  
- Circumvention of Academy certification gating for volunteer onboarding  
- Breach of PocketServer offline sync resulting in exposure of logs  
- Insecure credential or key handling  

**High priority vulnerabilities** also include:  
- Cross-Site Scripting (XSS) or SQL Injection  
- Privilege escalation across roles (volunteer → admin, etc.)  
- Bypass of Trust List enforcement  
- Data persistence without encryption at rest  

---

## Response Process

1. **Acknowledge** — We aim to confirm receipt of vulnerability reports within **48 hours**.  
2. **Investigate** — Severity assessment and reproducibility check.  
3. **Mitigate** — Hotfix or temporary workaround applied.  
4. **Patch** — Release a security update to all maintained repos.  
5. **Credit** — Public acknowledgment of reporters (if desired) after disclosure window ends.  

---

## Responsible Disclosure

We ask researchers and contributors to:

- Give us reasonable time to patch before publicizing vulnerabilities.  
- Avoid accessing or modifying PII in the course of discovery.  
- Refrain from DoS testing against production instances.  

In return, we commit to:

- Treat reports confidentially and respectfully.  
- Not pursue legal action against good-faith security research.  
- Prioritize fixes according to community safety impact.  

---

## Contact

For all security-related communications:  
**security@alwaysreadytools.org**  
PGP key fingerprint: `TBD` (will be published on our site and repo)  

---

## Additional Resources

- [DATA_POLICY.md] — Details PII boundaries in ART.  
- [INCIDENT_RESPONSE.md] — Steps for regions to take during a suspected breach.  
- [TRUST_LIST_GUIDE.md] — Best practices for vetting and maintaining secure rosters.  
