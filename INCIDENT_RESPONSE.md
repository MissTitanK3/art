# Incident Response Playbook

This document defines the steps that **Always Ready Tools (ART)** regions and admins must follow when a security breach or suspected compromise occurs.  
The goal is to contain threats quickly, minimize data exposure, and restore safe operations without disrupting community defense capacity.

**Principle:** Default to *containment and minimization*. Never spread PII outside the region.  

---

## When to Trigger This Playbook

- Suspicion of infiltration or compromised accounts  
- Unauthorized DB access or anomaly in audit logs  
- Attempted cross-region data sharing (volunteer PII)  
- Breach of PocketServer sync integrity  
- Reports of harassment, impersonation, or trust list abuse  
- Any incident where confidentiality, integrity, or availability is at risk  

---

## Step 1: Contain

Immediately take these actions at the **regional level**:

1. **Freeze Volunteer Onboarding**  
   - Temporarily disable new registrations in `[region].[domain].org`.  

2. **Audit Trust List**  
   - Review the most recent trust list additions.  
   - Revoke any suspicious or unverified entries.  

3. **Lock Down Access**  
   - Rotate region DB credentials and API keys using `scripts/rotate-keys.ts`.  
   - Revoke sessions for all accounts flagged as compromised.  

4. **Secure Comms**  
   - Notify Pod Leaders via secure channel (Signal/Matrix).  
   - Do not use compromised accounts to communicate.  

---

## Step 2: Report

At the **admin level**:

1. File a **Breach Flag** in `admin.[domain].org` → Support Requests → “Security Breach”.  
   - Include summary of incident (no PII).  
   - Mark urgency as *Immediate*.  
   - Specify suspected vectors (e.g., credential theft, infiltration attempt).  

2. Send encrypted notice to:  
   - security@alwaysreadytools.org (PGP required).  

---

## Step 3: Investigate

Regional Admin + Pod Leaders:

- Review **audit logs** (`alerts`, `assignments`, `trust_list`).  
- Confirm scope: which volunteers, pods, or dispatches are potentially affected.  
- Check for signs of lateral movement across pods or comms channels.  

National Admin (support role):

- Correlate region’s signals with other regions (without PII).  
- Verify no abnormal cross-region metadata flows.  

---

## Step 4: Mitigate

- **Rebuild Trust List**  
  - Remove inactive or suspicious accounts.  
  - Require re-verification for any account flagged in audit.  

- **Patch Systems**  
  - Apply security updates to region instance.  
  - Deploy schema or code hotfixes if exploit identified.  

- **Isolate Data**  
  - Move sensitive logs to encrypted offline storage for analysis.  
  - Never upload raw volunteer/dispatch data to Admin.  

---

## Step 5: Recover

- Restore onboarding once trust list is stable.  
- Re-issue credentials to verified admins, pod leaders, and volunteers.  
- Re-open dispatch board and shift scheduling.  
- Submit a **Recovery Report** to `admin.[domain].org`:  
  - Cause (if known)  
  - Scope of impact  
  - Steps taken to mitigate  
  - Current operational capacity  

---

## Step 6: Post-Incident Review

Within 2 weeks:

1. Regional Admin hosts a debrief with Pod Leaders.  
2. File a **Post-Incident Review** with Admin:  
   - Timeline of events  
   - Root cause analysis  
   - Lessons learned  
   - Action items (technical + training)  

3. Share non-PII lessons with other regions via Admin → Trainer Collaboration Hub.  

---

## Roles & Responsibilities

- **Regional Admin**: Lead response, contain breach, file reports.  
- **Pod Leaders**: Communicate with volunteers, enforce containment.  
- **National Admin**: Provide cross-region support, verify no systemic compromise.  
- **Academy Team**: Update OPSEC & training modules based on lessons learned.  

---

## Tools & References

- `scripts/rotate-keys.ts` → reset region DB credentials.  
- `scripts/export-ops-snapshot.ts` → safe anonymized snapshot for analysis.  
- [DATA_POLICY.md] → data boundaries that must never be crossed.  
- [SECURITY.md] → vulnerability categories & reporting.  

---

## Quick Reference: One-Click Breach Workflow (MVP Goal)

In `[region].[domain].org`, the **“Suspected Breach”** button should:  
1. Freeze onboarding  
2. Trigger trust list audit  
3. Rotate keys  
4. Flag Admin with breach notice  

---

## Contact

- **security@alwaysreadytools.org** (PGP required)  
- Emergency secure comms channel: published in regional admin console  

---

**Remember:**  
Contain locally.  
Report without PII.  
Recover with trust.  
