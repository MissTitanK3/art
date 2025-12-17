# Dispatch Submission Page: Accessibility & Complexity Review

**File Under Review:** `apps/region-stg/app/(authed)/dispatches/submission/[id]/page.tsx`  
**Layout Component:** `packages/ui/src/layout/dispatch/dispatch-submission-layout.tsx`  
**Date:** December 17, 2025

---

## Executive Summary

The current dispatch submission page violates multiple cognitive load and role-based accessibility principles by:
1. **Mixing all 6 operational layers in a single "Details" tab** (Overview)
2. **No role-based UI filtering** - everyone sees everything
3. **Exposing raw technical fields** without human-readable context
4. **Cognitive overload** - 8 sections with 20+ interactive elements visible simultaneously
5. **Missing progressive disclosure patterns** for expert/power user features

**Impact:** First-time volunteers are overwhelmed. Dispatchers lose context switching between 8 different mental models.

---

## Layer Taxonomy Analysis

### Current Schema → Layer Mapping

#### ✅ Layer A: Situational Awareness (Should be DEFAULT view)
**Current Location:** Header + scattered in Overview
- `summary` ❌ **MISSING from UI**
- `status` ✅ Header (but as button, not read-only)
- `priority` ❌ **Computed from risk_level, not shown explicitly**
- `risk_level` ✅ Header badge
- `location_label` ✅ Header
- `date_of_event` ✅ Header
- `visibility_scope` ❌ **NOT SHOWN** (privacy-critical field!)

**Violations:**
- No unified "What's Happening" view
- Status is editable by default (should be read-only for most)
- Missing visibility implications

---

#### ⚠️ Layer B: Actionability (Should be "Mobilize/Plan" section)
**Current Location:** Buried in "Intended Action" card in Overview tab
- `type` ❌ **NOT SHOWN** (only in submission form, not detail view)
- `intended_action_preset` ✅ Shown
- `intended_actions` ✅ Shown as badges
- `intended_actions_custom` ✅ Editable
- `required_roles` ⚠️ In separate "Roles" tab (disconnected from actions)
- `required_roles_by_type` ⚠️ In separate "Roles" tab

**Violations:**
- Actions and roles are separated (should be viewed together for planning)
- No "why this action" explanation inline
- Raw action arrays shown without decision structure

---

#### 🚨 Layer C: Coordination (Should be gated by role/state)
**Current Location:** Mixed across Overview + Roles tab
- `assigned_volunteers` ✅ Roles tab (but no availability shown)
- `point_of_contact` ❌ **NOT SHOWN IN UI**
- `signal_link` ✅ Overview → Signal Links card
- `public_signal_link` ✅ Overview → Signal Links card

**Violations:**
- POC field completely absent (critical coordination data)
- Signal links have no "why this channel" explanation
- No presence/availability indication before assignment
- Links shown as raw URLs, not contextual

---

#### 🔒 Layer D: Sensitive / Operational Detail (Should be "Operational Details" gate)
**Current Location:** Some in Overview, some hidden, some missing entirely
- `location` ✅ Overview → Location card (map pin)
- `location_geog` ❌ **Database-only** (correct)
- `visibility_radius_km` ❌ **NOT SHOWN** (should show impact radius)
- `encrypted_payload` ❌ **Database-only** (correct)
- `integrity_hash` ❌ **Database-only** (correct)
- `invited_user_ids` ❌ **NOT SHOWN** (should show visibility list)

**Violations:**
- Location coordinates exposed without visibility warning
- No "who can see this" indicator
- Missing visibility radius visualization

---

#### 📅 Layer E: Lifecycle & Governance (Should be timeline, not forms)
**Current Location:** Scattered/hidden
- `timestamp` ✅ Header (small text)
- `updated_at` ⚠️ Only shown in Impact Metrics
- `updated_by` ⚠️ Only shown in Impact Metrics
- `state` ❌ **NOT SHOWN** (internal state machine)
- `source` ❌ **NOT SHOWN** (dispatch/manual/system)
- `training` ❌ **NOT SHOWN** (critical for filtering)
- `flagged` ✅ Header alert (good!)
- `deleted_at` ❌ **Database-only**
- `auto_delete_after` ❌ **NOT SHOWN** (privacy-critical)

**Violations:**
- No audit trail or timeline view
- Source/training flags hidden (affects how users interpret data)
- Auto-deletion timeline not communicated

---

#### 📊 Layer F: Outcomes & Reporting (Should be post-completion only)
**Current Location:** Overview → Impact Metrics card
- `people_served` ✅ Impact Metrics panel
- `resources_distributed` ✅ Impact Metrics panel
- `notes` ✅ Overview → Notes card
- `briefing` ❌ **NOT IN SCHEMA** (might be in updates?)

**Violations:**
- Metrics shown before dispatch is active (premature)
- No progressive prompting (all fields shown together)
- Numeric fields required together (cognitive burden)

---

## Critical UI Violations

### 1. Cognitive Overload in "Details" Tab

**Current Structure:**
```
Overview Tab:
  1. Location & Coverage (3 controls)
  2. Logistics (complex table)
  3. Intended Action (2 controls + badges)
  4. Notes & Context (1 textarea)
  5. Signal Links (2 text inputs)
  6. Volunteer Attribution (roster management)
  7. Impact Metrics (3 numeric inputs + dropdown)
```

**Problem:** 7 distinct mental models in one scrollable view.  
**Rule Violation:** "No screen exceeds 7 interactive elements"

---

### 2. No Role-Based Filtering

**Current Behavior:** Every user sees every section, regardless of:
- Their access role (volunteer vs dispatcher vs admin)
- Dispatch state (planning vs active vs completed)
- Cognitive need (awareness vs coordination)

**Required Rules:**
```typescript
// Example: What a first-time volunteer should see
if (user.access_role === 'volunteer' && user.experience === 'low') {
  show: ['awareness', 'actionability']
  hide: ['coordination', 'sensitive', 'lifecycle', 'outcomes']
}

// Example: What a dispatcher should see
if (user.access_role === 'coordinator' && dispatch.status === 'planning') {
  show: ['awareness', 'actionability', 'coordination']
  hide: ['outcomes']
}
```

---

### 3. Enum Values Without Context

**Examples from code:**
```typescript
// Risk level - shows "unknown" but doesn't explain what that means
<Badge className={RISK_LEVEL_COLORS[riskLevel]}>
  Risk: {humanize(riskLevel)}
</Badge>

// Status - editable dropdown with no consequence explanation
<DispatchStatusUpdater submission={submission} onUpdate={onUpdateSubmission} />
```

**Required for Each Enum:**
- One-line definition: "Unknown = no safety assessment completed"
- Consequence: "Volunteers may decline without context"
- Reversibility: "Can be updated anytime by coordinators"

---

### 4. JSONB Field Exposure

**Current Issues:**
- `intended_actions` shown as badges (good) but editing shows raw checkboxes (bad)
- `logistics` rendered as table but structure feels database-y
- `required_roles_by_type` object shown as key-value pairs

**Rule Violation:** "If a user sees brackets, the UI failed"

---

### 5. Hidden Defaults

**Examples:**
```typescript
// From schema:
risk_level = 'unknown'  // NOT explained why this is default
visibility_scope = 'org_and_region_masked'  // NOT SHOWN AT ALL

// From code:
assigned_volunteers = []  // Empty state not explained
```

**Required:**
- "Risk is 'unknown' until assessed → volunteers may need extra briefing"
- "Visibility: Only your org + region coordinators → [Learn More]"

---

## Specific Component Issues

### DispatchSubmissionLayout Component

**File:** `packages/ui/src/layout/dispatch/dispatch-submission-layout.tsx`

#### Problem 1: Tab Structure Doesn't Match Mental Models
```typescript
// Current tabs:
- Details (EVERYTHING mixed together)
- Roles
- Updates
- Public Engagement
- Radio Comms
```

**Proposed Layer-Based Tabs:**
```typescript
- Overview (Layer A: Awareness only)
- Planning (Layer B: Actionability)
- Coordination (Layer C: Team management)
- Timeline (Layer E: Lifecycle)
- Outcomes (Layer F: Post-action reporting)
- Advanced (Layer D: Operational details, role-gated)
```

#### Problem 2: No Progressive Disclosure
All 7 cards in Overview are expanded by default. Should be:
- Awareness card: Always expanded
- Planning card: Collapsed if status is 'draft'
- Coordination card: Collapsed until status is 'active'
- Outcomes card: Hidden until status is 'completed'

#### Problem 3: Missing Explanatory Text
```typescript
// Current:
<CardTitle>Signal Links</CardTitle>
<CardDescription>
  Set the Signal channels: public link invites...
</CardDescription>

// Should be:
<CardTitle>Signal Links</CardTitle>
<CardDescription>
  <strong>Why two links?</strong> Public link builds future capacity.
  Private link protects operational security.
</CardDescription>
<InlineAlert>
  ⚠️ Only share private link with confirmed participants
</InlineAlert>
```

---

### DispatchIntendedActionsUpdater Component

**File:** `packages/ui/src/patterns/features/actions/dispatch-intended-actions-updater.tsx`

#### Problem 1: Drawer Hides Context
Actions are shown as badges, but editing opens a drawer that loses spatial context.

**Better Pattern:**
- Inline expansion with grouped checkboxes
- Show action → required roles mapping immediately
- Estimated effort/time for each action visible

#### Problem 2: No Decision Support
```typescript
// Current: Just a list of checkboxes
{ACTION_PRESETS_GROUPED.flat().map((action) => (
  <Checkbox>{action}</Checkbox>
))}

// Should include:
<ActionCard action="Food Distribution">
  <RequiredRoles>2 coordinators, 5 volunteers</RequiredRoles>
  <EstimatedTime>2-4 hours</EstimatedTime>
  <Dependencies>Requires: Transportation secured</Dependencies>
</ActionCard>
```

---

## Actionable Recommendations

### Phase 1: Immediate Wins (Low Effort, High Impact)

#### 1.1 Add Layer A "Situational Awareness" Card
**Location:** Top of Overview tab, always visible

```typescript
<Card className="border-2 border-primary">
  <CardHeader>
    <CardTitle>What's Happening</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2 text-sm">
      <div>
        <strong>Summary:</strong> {submission.summary || 'No summary provided'}
      </div>
      <div>
        <strong>Status:</strong> {humanize(submission.status)}
        <TooltipInfo>
          {STATUS_EXPLANATIONS[submission.status]}
        </TooltipInfo>
      </div>
      <div>
        <strong>Risk Level:</strong> {humanize(submission.risk_level)}
        <TooltipInfo>
          {RISK_EXPLANATIONS[submission.risk_level]}
        </TooltipInfo>
      </div>
      <div>
        <strong>Visibility:</strong> {humanize(submission.visibility_scope)}
        <TooltipInfo>
          Who can see this: {VISIBILITY_EXPLANATIONS[submission.visibility_scope]}
        </TooltipInfo>
      </div>
    </div>
  </CardContent>
</Card>
```

#### 1.2 Collapse Non-Critical Sections by Default
```typescript
const [expandedSections, setExpandedSections] = useState<string[]>(() => {
  // Only expand awareness by default
  return ['awareness', 'status'];
});
```

#### 1.3 Add Inline Tooltips for All Enums
```typescript
const RISK_EXPLANATIONS = {
  unknown: {
    definition: "No safety assessment completed",
    consequence: "Volunteers may decline without context",
    action: "Complete risk assessment before mobilizing"
  },
  low: {
    definition: "Minimal safety concerns",
    consequence: "Standard protocols apply",
    action: "Monitor for changes"
  },
  // ... etc
};
```

#### 1.4 Show Field Context, Not Just Values
```typescript
// Before:
<Input value={submission.signal_link} onChange={...} />

// After:
<div>
  <Label>Private Signal Link</Label>
  <Input value={submission.signal_link} onChange={...} />
  <HelperText>
    Share only with confirmed participants.
    <Link href="/docs/signal-security">Security guidelines →</Link>
  </HelperText>
  {submission.signal_link && (
    <Alert variant="warning">
      <AlertDescription>
        This link grants operational access. Do not post publicly.
      </AlertDescription>
    </Alert>
  )}
</div>
```

---

### Phase 2: Role-Based Views (Medium Effort, High Impact)

#### 2.1 Create Role-Based Section Visibility Hook
```typescript
// hooks/useDispatchSectionVisibility.ts
export function useDispatchSectionVisibility(
  submission: DispatchSubmission,
  userRole: AccessRole,
  userExperience?: 'new' | 'experienced' | 'expert'
) {
  return {
    showAwareness: true, // Always visible
    showActionability: ['coordinator', 'field_lead'].includes(userRole),
    showCoordination: ['coordinator', 'field_lead'].includes(userRole) 
                     && submission.status !== 'draft',
    showSensitive: ['coordinator', 'admin'].includes(userRole),
    showLifecycle: ['coordinator', 'admin'].includes(userRole),
    showOutcomes: submission.status === 'completed',
    expertMode: userExperience === 'expert',
  };
}
```

#### 2.2 Implement Layered Tab Structure
```typescript
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    {visibility.showActionability && (
      <TabsTrigger value="planning">Planning</TabsTrigger>
    )}
    {visibility.showCoordination && (
      <TabsTrigger value="coordination">Coordination</TabsTrigger>
    )}
    <TabsTrigger value="timeline">Timeline</TabsTrigger>
    {visibility.showOutcomes && (
      <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
    )}
  </TabsList>
  
  <TabsContent value="overview">
    <AwarenessCard submission={submission} />
    {visibility.expertMode && <QuickActionsPanel />}
  </TabsContent>
  
  <TabsContent value="planning">
    <ActionabilitySection
      submission={submission}
      onUpdate={onUpdateSubmission}
      showRoleMapping={true}
    />
  </TabsContent>
  
  {/* ... */}
</Tabs>
```

---

### Phase 3: Cognitive Load Reduction (High Effort, High Impact)

#### 3.1 Create "Decision Wizard" for Actions
Instead of showing all possible actions, guide through decisions:

```typescript
<ActionWizard>
  <Step1_TypeOfEvent>
    What happened?
    [ ] Natural disaster
    [ ] Immigration action
    [ ] Community event
    [ ] Emergency response
  </Step1_TypeOfEvent>
  
  <Step2_Urgency>
    How urgent?
    [ ] Rapid response (hours)
    [ ] Planned action (days)
    [ ] Ongoing support (weeks)
  </Step2_Urgency>
  
  <Step3_Capacity>
    What capacity do you have?
    Available volunteers: {roster.length}
    Available coordinators: {coordinatorCount}
    
    Recommended actions for your capacity:
    [Auto-filtered list based on previous answers]
  </Step3_Capacity>
</ActionWizard>
```

#### 3.2 Implement Progressive Field Disclosure
```typescript
<ImpactMetricsPanel>
  {/* Show only relevant fields based on dispatch type */}
  {submission.type === 'food_distribution' && (
    <>
      <NumberField label="Households Served" />
      <NumberField label="Meals Distributed" />
    </>
  )}
  
  {submission.type === 'legal_observer' && (
    <>
      <NumberField label="Volunteers Deployed" />
      <TextField label="Incident Types Observed" />
    </>
  )}
  
  {/* Don't show all possible fields to everyone */}
</ImpactMetricsPanel>
```

#### 3.3 Add Contextual Onboarding
```typescript
{userExperience === 'new' && (
  <OnboardingOverlay>
    <h3>Your First Dispatch</h3>
    <p>This page shows everything happening with this event.</p>
    <p>Right now, you only need to know:</p>
    <ul>
      <li>✓ Where it is (see map above)</li>
      <li>✓ When it's happening (see date)</li>
      <li>✓ What help is needed (see roles)</li>
    </ul>
    <p>Coordinators will handle the rest.</p>
    <Button onClick={dismissOnboarding}>Got it</Button>
  </OnboardingOverlay>
)}
```

---

### Phase 4: Power User Features (Medium Effort, High Value for Experts)

#### 4.1 Command Palette for Bulk Actions
```typescript
// Keyboard shortcut: Cmd+K
<CommandPalette>
  <Command>Assign all Food Coordinators</Command>
  <Command>Copy dispatch summary</Command>
  <Command>Duplicate to new region</Command>
  <Command>Generate debrief template</Command>
  <Command>Export volunteer hours</Command>
</CommandPalette>
```

#### 4.2 Expert Mode Toggle
```typescript
<Settings>
  <Switch
    checked={expertMode}
    onCheckedChange={setExpertMode}
    label="Expert Mode"
    description="Show all fields and advanced options"
  />
</Settings>

{expertMode && (
  <Card>
    <CardHeader>
      <CardTitle>Advanced Controls</CardTitle>
    </CardHeader>
    <CardContent>
      <VisibilityRadiusControl />
      <AutoDeleteScheduler />
      <IntegrityHashVerification />
    </CardContent>
  </Card>
)}
```

---

## Implementation Priority Matrix

### Must Have (P0) - Blocks Accessibility
1. ✅ Add "Situational Awareness" card with all Layer A fields
2. ✅ Collapse non-critical sections by default
3. ✅ Add tooltips explaining all enum values
4. ✅ Show visibility scope with "who can see this" explanation

### Should Have (P1) - Significantly Improves UX
5. 🔄 Implement role-based section visibility
6. 🔄 Separate Planning tab from Overview
7. 🔄 Add "why this channel" to Signal Links
8. 🔄 Show presence/availability in Roles tab before assignment

### Nice to Have (P2) - Power User Enhancement
9. ⏳ Command palette for keyboard-first workflows
10. ⏳ Expert mode toggle
11. ⏳ Action decision wizard
12. ⏳ Timeline view for lifecycle events

---

## Litmus Test Results

### Can a first-time volunteer...

❌ **Understand what is happening?**  
No - too many fields, no clear "what's happening" summary

❌ **Decide whether to engage?**  
Partially - can see roles needed, but context is buried

❌ **See risk without fear?**  
No - risk level shown but not explained, creates uncertainty

✅ **Leave without breaking anything?**  
Yes - roles are opt-in, no accidental modifications

### Can a dispatcher...

⚠️ **Plan?**  
Partially - actions visible but disconnected from roles/capacity

⚠️ **Mobilize?**  
Partially - role assignment works but no availability visibility

❌ **Coordinate?**  
No - point of contact missing, signal links lack context

⚠️ **Audit?**  
Partially - updates log exists but no lifecycle timeline

---

## Recommended Next Steps

1. **Review this document with team** - ensure alignment on layer taxonomy
2. **Prioritize Phase 1 changes** - quick wins for immediate accessibility improvement
3. **Prototype role-based views** - test with both volunteers and coordinators
4. **User test with first-timers** - validate assumptions about cognitive load
5. **Iteratively roll out Phase 2-4** - don't try to fix everything at once

---

## Appendix: Field-by-Field Recommendations

| Field | Current | Recommended | Priority |
|-------|---------|-------------|----------|
| `summary` | Missing | Add to Awareness card, always visible | P0 |
| `visibility_scope` | Hidden | Show with explanation in Awareness card | P0 |
| `type` | Not shown in detail view | Show in Awareness card with icon | P1 |
| `point_of_contact` | Not shown | Show in Coordination tab with contact method | P1 |
| `training` | Hidden | Show as badge in header when true | P1 |
| `source` | Hidden | Show in Timeline tab with explanation | P2 |
| `auto_delete_after` | Hidden | Show privacy timer in Advanced section | P2 |
| `visibility_radius_km` | Hidden | Visualize on map in Operational Details | P2 |

---

**Document Version:** 1.0  
**Last Updated:** December 17, 2025  
**Review Status:** Awaiting team feedback

