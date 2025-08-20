# Data Policy

This document defines how **Always Ready Tools (ART)** handles data across its ecosystem.  
Our goal is to maximize operational effectiveness **without ever centralizing sensitive information**.  

**Principle:** The safest data is the data that never leaves your region.  

---

## Data Boundaries

### Regional DBs (`[region].[domain].org`)
- **Contains:**  
  - Volunteer rosters (encrypted contact info, skills, language, status)  
  - Pods (name, area, comms channels)  
  - Dispatches & assignments (operational logs)  
  - Shifts & schedules  
  - Alerts (region-local, auditable)  
  - Trust list (signer role, signer rot, signed hash, timestamps)  

- **Does Not Leave Region:**  
  - Names, phone numbers, Signal/Matrix handles, or any volunteer identifiers  
  - Dispatch-level logs or notes  
  - Raw trust list entries  

**Rule:** Volunteer and incident-level data stay siloed. No raw DB dumps, no cross-region exports.  

---

### Admin DB (`admin.[domain].org`)
- **Contains only anonymized operational signals:**  
  - Region status (active/inactive/needs admin/support overdue)  
  - Counts of active pods & volunteers (no identities)  
  - Skills shortages (languages, medics, legal, etc.)  
  - Support requests (urgency, skills needed, summary without PII)  
  - Training resource metadata (title, tags, URL)  
  - Calendar events for trainer collaboration  

- **Never Contains:**  
  - Volunteer names, rosters, or contact info  
  - Incident logs or transcripts  
  - Raw regional trust lists  

**Rule:** Admin sees only signals, not people.  

---

### Academy DB (`academy.[domain].org`)
- **Contains:**  
  - Training content (public)  
  - Certification progress (per-user, scoped to region)  

- **Signals to Regions:**  
  - Minimal webhook flags: e.g., “Volunteer X has completed Level 1”  
  - Regions verify completion **without pulling personal details**  

- **Never Contains:**  
  - Regional dispatch logs  
  - Cross-region rosters  

**Rule:** Academy certifies skills, not identities.  

---

### Watch (`watch.[domain].org`)
- **Contains:**  
  - Public incident reports (geo + timestamp only)  
  - Heatmap data  

- **Automatic Redaction:**  
  - Names, phone numbers, or other identifiers stripped on submission  
  - Free-text sanitized before storage  

**Rule:** Public submissions must remain safe and anonymous.  

---

## Data Retention

- **Regional Data:** Retained locally as long as the region deems necessary for ops.  
- **Admin Metadata:** Aggregates and signals retained for strategic analysis; no PII stored.  
- **Public Reports (Watch):** Geo/time markers may be retained indefinitely; personal identifiers are never stored.  

---

## Encryption & Security

- Each region DB has unique credentials and keys.  
- All PII fields must be encrypted at rest.  
- All traffic between apps and DBs is TLS-secured.  
- PocketServer ensures offline-first operations with encrypted sync.  

---

## Sharing Rules

✅ Allowed to share:  
- Counts, flags, skills gaps, anonymized signals  
- Training resources and curricula  
- Non-PII operational summaries  

❌ Not allowed to share:  
- Volunteer rosters  
- Incident-level activity logs  
- Contact info or identifiers  
- Raw trust lists  

---

## Breach Response

If a breach is suspected:  
1. Freeze volunteer onboarding  
2. Audit recent trust list additions  
3. File a breach flag in `admin.[domain].org`  
4. Follow Academy’s **Operational Security 101** protocol  

---

## Accountability

- Every region is responsible for its own DB security and compliance with this policy.  
- Admin cannot override regional boundaries.  
- Contributors who attempt to centralize PII will have commits rejected and access revoked.  

---

## Contact

For questions or concerns about data handling:  
**data@alwaysreadytools.org**  

---

## Summary

ART exists to protect communities, not to endanger them.  
That means:  
- No centralized volunteer logs.  
- No hidden backdoors.  
- No exceptions.  

**What happens in your region, stays in your region.**
