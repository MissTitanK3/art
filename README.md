# ART: Always Ready Tools

Always Ready Tools (ART) is a decentralized suite for community defense, dispatch, and training.  
Its purpose is to keep regions operational, secure, and autonomous — while allowing selective collaboration across regions without centralizing sensitive data.

**Mantra:** Don’t be a spark. Be the system they can’t extinguish.

---

## Core Principles

- **Decentralization** — Each region runs its own database; no mass centralization of sensitive info.  
- **Security & Privacy** — Personal identifiers never leave a region. Admin only sees anonymized signals.  
- **Resilience** — Regions continue operating offline with PocketServer; outages at the national level do not stop local dispatch.  
- **Training First** — Pods and volunteers are onboarded only after meeting minimum certification standards through the Academy.  
- **Scalability** — Shared codebase + per-region deployments make it easy to grow without compromising independence.  

---

## High-Level Structure

| Subdomain              | Purpose                                | Data Scope                       | Access |
|------------------------|----------------------------------------|----------------------------------|--------|
| watch.[domain].org     | Public reporting & heatmap             | Non-PII reports (geo + time)     | Public |
| academy.[domain].org   | Training portal + certifications       | Course content + user progress   | Public + Auth |
| admin.[domain].org     | National-level coordination            | Minimal region metadata only     | National admins & trainers |
| [region].[domain].org  | Regional dispatch ops, onboarding, shifts | Regional DB only (volunteers, shifts, trust, alerts) | Regional admins, pod leaders, vetted volunteers |

---

## Repositories

### 1. Admin Dispatch (admin-dispatch)  
National-level visibility and trainer collaboration.  
Deployed at **admin.[domain].org**

- Region Map & Directory (active/inactive/needs admin/support overdue)  
- Support Requests Inbox (skills + urgency, never PII)  
- Trainer Collaboration Hub (resources, events, cross-region trainer chat)  
- Health Dashboard (aggregated KPIs from regions)  

Admin DB only stores **operational signals**: counts, skill gaps, region status.  
_No volunteer rosters, contact info, or incident logs are ever stored here._

---

### 2. Regional Dispatch Template (regional-dispatch-template)  
Per-region operations.  
Forked/instantiated for **[region].[domain].org**

- Regional Admin Console (pods, roster, shifts, trust list, alerts)  
- Volunteer Onboarding (account creation + Academy cert gate)  
- Trust List Management (signer role, rotation, inactivity rules)  
- Status Reporting (monthly, anonymized signals only)  
- Offline sync via PocketServer  

Regional DB tables include: volunteers, pods, roster, dispatches, assignments, shifts, alerts, trust_list, ops_signals_queue.

---

## Data Flow

watch.domain.org → Regional DB ←→ region.domain.org → (metadata only) → admin.domain.org  
                           ↑  
               academy.domain.org  

- Public reports stream only to the correct regional DB.  
- Academy sends certification signals region-by-region.  
- Regions POST anonymized “ops signals” (counts, flags, skill needs) to Admin.  
- Cross-region collaboration happens only through Admin (skills, training, support), never raw data.  

---

## Security Controls

- **Silo Enforcement:** Each region DB has unique credentials & keys. No cross-reads.  
- **Data Minimization:** Admin DB schema excludes PII by design.  
- **PocketServer:** Regions remain operational offline and sync later.  
- **Guardrails:** Attempts to share PII across regions are blocked at system level.  

---

## Onboarding a New Region

1. **Infrastructure Setup**  
   - Provision isolated DB, apply baseline schema, deploy [region].[domain].org.  
   - Securely issue regional admin credentials.  

2. **Regional Admin Onboarding**  
   - Complete required Academy tracks (Admin Workflow, OPSEC, Trust List Mgmt).  
   - Gain access to region console + Admin panel.  

3. **Pod Activation**  
   - Pod Creator completes *How to Create a Pod*.  
   - Regional Admin promotes them to Pod Leader.  

4. **Volunteer Intake**  
   - Volunteers onboard via [region] portal.  
   - Require baseline Academy cert + vetting before joining roster.  

5. **Status Reporting**  
   - Initial Region Report within 2 weeks.  
   - Monthly reports thereafter (counts, skills gaps, capacity).  

---

## Phased Build Plan

- **MVP (Phase 1)**  
  - Region Map & Directory  
  - Support Requests Inbox  
  - Regional Admin Console  
  - Volunteer Onboarding + Trust Mgmt  
  - Status Reporting Uplink  
  - PocketServer offline sync  
  - Monorepo multi-tenant deployment  

- **Scale (Phase 2)**  
  - Region Health Dashboard  
  - Cross-Region Deployment Coordinator (skills only)  
  - Pod Activation gated by Academy certs  
  - DNS Orchestrator  

- **Hardening & Handover (Phase 3)**  
  - One-click breach workflow  
  - Handover Kit Generator (non-PII)  
  - Regional trainer pipeline  

---

## Open-Source Hygiene

- LICENSE (permissive or copyleft, intentional)  
- CODE_OF_CONDUCT.md  
- CONTRIBUTING.md (safe schema proposals, PR process)  
- SECURITY.md (vulnerability reporting)  
- DATA_POLICY.md (crystal-clear PII boundaries)  
- CODEOWNERS (protect migrations/auth/security docs)  
- .env.example (no secrets)  

---

## Getting Started

Clone the repo(s) you need:

Follow infra/setup docs in each repo:

- infra/migrations/ — baseline schema  
- scripts/init-region.ts — scaffold new region env + DB  
- .env.example — copy and configure per region  

Run locally:

pnpm install  
pnpm dev  

Deploy via CI/CD pipeline (Vercel, Docker, etc.), with per-region environment configs.

---

## License

Copyright © [2025] Always Ready Tools contributors.  
Released under [chosen license].  
See LICENSE for details.  
