import { humanize } from "@workspace/ui/lib/utils";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";
import { FIELD_ROLE_LABELS } from "@workspace/store/types/roles.ts";

// --- urgency emoji ---
export function urgencyEmoji(urgency: string): string {
  switch (urgency) {
    case "Immediately":
      return "🚨🚨🚨";
    case "Within 30 Minutes":
    case "Within 1 Hour":
      return "🚨🚨";
    case "Within 2 Hours":
      return "🚨";
    case "Later Today":
    case "Within A Day":
    case "Within 3 Days":
      return "⚠️";
    case "Within the Week":
      return "🪴";
    case "Beyond Next Week":
      return "🌱";
    default:
      return "🚨";
  }
}

function extractCityState(locationLabel?: string | null): string {
  if (!locationLabel) return "your area";
  const parts = locationLabel.split(",").map((p) => p.trim());
  if (parts.length === 1) return parts[0] ?? "your area";
  if (parts.length === 2) return `${parts[0]}, ${parts[1]}`;
  if (parts.length >= 3) {
    const city = parts[parts.length - 2];
    const state = parts[parts.length - 1];
    return `${city}, ${state}`;
  }
  return locationLabel;
}

function formatRoles(dispatch: DispatchSubmission): string {
  // Prefer structured counts when available
  if (
    dispatch.required_roles_by_type &&
    Object.keys(dispatch.required_roles_by_type).length > 0
  ) {
    const assignedCounts: Record<string, number> = {};
    for (const v of dispatch.assigned_volunteers ?? []) {
      const key = (v as any)?.role as string | undefined; // assigned with field role key in UI
      if (!key) continue;
      assignedCounts[key] = (assignedCounts[key] ?? 0) + 1;
    }

    const lines = Object.entries(dispatch.required_roles_by_type)
      .filter(([, required]) => required > 0)
      .map(([role, required]) => {
        const assigned = assignedCounts[role] ?? 0;
        const remaining = Math.max(0, required - assigned);
        return { role, required, assigned, remaining };
      })
      .filter(({ remaining }) => remaining > 0)
      .map(({ role, remaining }) => {
        const label =
          FIELD_ROLE_LABELS[role as keyof typeof FIELD_ROLE_LABELS] ||
          humanize(role);
        return `• ${label} (${remaining} needed)`;
      });

    if (lines.length > 0) return lines.join("\n");
    return "• All listed roles filled";
  }

  // Fallback to simple list when only an array is provided
  if (dispatch.required_roles?.length) {
    return dispatch.required_roles
      .map(
        (r) =>
          FIELD_ROLE_LABELS[r as keyof typeof FIELD_ROLE_LABELS] || humanize(r),
      )
      .join(", ");
  }

  return "• Support roles";
}

function formatActions(dispatch: DispatchSubmission): string {
  return (
    dispatch.intended_actions
      ?.map((action) => `• ${humanize(action)}`)
      .join("\n") || "• Community presence"
  );
}

function getCounts(dispatch: DispatchSubmission) {
  const requiredCount = dispatch.required_roles_by_type
    ? Object.values(dispatch.required_roles_by_type).reduce(
        (sum, count) => sum + count,
        0,
      )
    : dispatch.required_roles?.length || 0;

  const assignedCount = dispatch.assigned_volunteers
    ? Object.values(dispatch.assigned_volunteers).reduce((sum, entry) => {
        if (Array.isArray(entry)) return sum + entry.length;
        return entry ? sum + 1 : sum;
      }, 0)
    : 0;

  return { requiredCount, assignedCount };
}

export function generateMessages(
  dispatch: DispatchSubmission,
  urgency: string,
) {
  const emoji = urgencyEmoji(urgency);
  const { requiredCount, assignedCount } = getCounts(dispatch);
  const volunteerLine =
    requiredCount > 0
      ? `${requiredCount} needed (${assignedCount} assigned)`
      : "Open volunteer call (no minimum set)";

  const payload = (() => {
    try {
      return JSON.parse(dispatch.encrypted_payload || "{}");
    } catch {
      return {};
    }
  })();

  const cityState = extractCityState(dispatch.location_label);

  // Include notes alongside intended actions where applicable
  const actionsWithOptionalNotes = () => {
    const base = formatActions(dispatch);
    const notes = dispatch.intended_action_notes?.trim();
    return notes ? `${base}\n\n📝 Notes:\n${notes}` : base;
  };

  // --- Grouped cards for detailed ---
  const detailedSections = [
    {
      title: `${emoji} CALL FOR COMMUNITY SUPPORT ${emoji}`,
      body: `🕓 Timing:\n${urgency}\n\n📍 Location:\n${cityState}`,
    },
    {
      title: "📨 Dispatch Message",
      body: payload.message || "Message not available",
    },
    {
      title: "📋 Intended Actions",
      body: actionsWithOptionalNotes(),
    },
    {
      title: "💡 Roles Needed",
      body: formatRoles(dispatch),
    },
    {
      title: "👥 Volunteers",
      body: `${volunteerLine}\n\n✅ After Volunteering:\n– When assigned, you’ll be added to a temporary Signal group\n– Groups are created per dispatch for coordination and safety\n\n📲 How to Join:\nReply in this group if available.`,
    },
  ];

  // --- Grouped cards for callout ---
  const calloutSections = [
    {
      title: "🧡 CALL FOR COMMUNITY SUPPORT 🧡",
      body: `🕓 Timing:\n${urgency.toUpperCase()}\n\n📍 Location:\n${cityState}`,
    },
    {
      title: "📨 Event Details",
      body:
        payload.message ||
        "Join us for a community event bringing people together for culture, safety, and solidarity.",
    },
    {
      title: "📋 Intended Actions",
      body: actionsWithOptionalNotes(),
    },
    {
      title: "💡 Roles Needed",
      body: formatRoles(dispatch),
    },
    {
      title: "👥 Volunteers",
      body: `${volunteerLine}\n\n📲 How to Join:\nDM if you can respond so we can add you to the closed Dispatch chat for coordination and safety`,
    },
  ];

  return {
    callout: calloutSections.map((s) => `${s.title}\n${s.body}`).join("\n\n"),
    calloutSections,

    detailed: detailedSections.map((s) => `${s.title}\n${s.body}`).join("\n\n"),
    detailedSections,

    medium: `
${emoji} Community support needed in ${cityState}!

Roles: ${formatRoles(dispatch).replace(/\n/g, ", ")}
Volunteers: ${volunteerLine}
Timing: ${urgency}

${dispatch.intended_action_notes ? `\n📝 Notes: ${dispatch.intended_action_notes}` : ""}
\n📲 Reply in this group if available.
`.trim(),

    tldr: `${emoji} ${cityState}: ${volunteerLine}. Roles: ${formatRoles(
      dispatch,
    ).replace(
      /\n/g,
      ", ",
    )}. ${dispatch.intended_action_notes ? `Notes: ${dispatch.intended_action_notes}. ` : ""}📲 Reply in this group if available.`,
  };
}
