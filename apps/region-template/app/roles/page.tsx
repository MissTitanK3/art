import { Card, CardContent } from "@workspace/ui/components/card";
import { FIELD_ROLE_DETAILS, FIELD_ROLE_LABELS } from "@workspace/ui/components/client/roles/roles";

const riskOrder = {
  high: 0,
  medium: 1,
  low: 2,
  unknown: 3,
} as const;

export default function RolesPage() {
  const sortedDetails = [...FIELD_ROLE_DETAILS].sort((a, b) => {
    const riskA = riskOrder[a.riskLevel as keyof typeof riskOrder] ?? 3;
    const riskB = riskOrder[b.riskLevel as keyof typeof riskOrder] ?? 3;

    if (riskA !== riskB) return riskA - riskB;

    const labelA = FIELD_ROLE_LABELS[a.role] ?? a.role;
    const labelB = FIELD_ROLE_LABELS[b.role] ?? b.role;

    return labelA.localeCompare(labelB);
  });
  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">Field Roles & Responsibilities</h1>
      <p className="text-muted-foreground">
        Each role supports safe, coordinated response. Use this guide to understand expectations and match volunteers to
        appropriate roles.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedDetails.map(({ role, description, requiredSkills, riskLevel, bestSuitedFor }) => (
          <Card key={role}>
            <CardContent className="p-4 space-y-2">
              <div className="flex flex-col mb-5 md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
                <h2 className="font-semibold text-lg break-words">{FIELD_ROLE_LABELS[role]}</h2>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded w-fit ${riskLevel === 'high'
                    ? 'bg-red-100 text-red-800'
                    : riskLevel === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : riskLevel === 'low'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                  {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
              <div>
                <p className="text-sm font-semibold mt-2">Required Skills:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {requiredSkills.map((skill, idx) => (
                    <li key={idx}>{skill}</li>
                  ))}
                </ul>
              </div>
              <p className="text-sm italic text-muted-foreground">Best suited for: {bestSuitedFor}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}