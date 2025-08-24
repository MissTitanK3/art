'use client';

import { useState } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { FIELD_ROLE_DETAILS, FIELD_ROLE_LABELS, FIELD_ROLE_OPTIONS, FieldRole } from '@workspace/store/types/roles.ts';

export default function RoleSelector({
  selected = [],
  onChange,
}: {
  selected: FieldRole[];
  onChange: (roles: FieldRole[]) => void;
}) {
  const [expanded, setExpanded] = useState<Partial<Record<FieldRole, boolean>>>({});

  const toggle = (role: FieldRole) => {
    onChange(selected.includes(role) ? selected.filter((r) => r !== role) : [...selected, role]);
  };

  const toggleExpand = (role: FieldRole) => {
    setExpanded((prev) => ({ ...prev, [role]: !prev[role] }));
  };

  const detailMap = Object.fromEntries(FIELD_ROLE_DETAILS.map((d) => [d.role, d])) as Record<
    FieldRole,
    (typeof FIELD_ROLE_DETAILS)[number]
  >;

  const riskIcons: Record<string, string> = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
  };

  return (
    <div data-slot="field-role-selector">
      <label className="block font-medium mb-2">Your Field Roles</label>
      <p className="text-sm mb-4">
        Select the roles you&apos;re able to perform in the field. Tap or click a role to expand details. Risk level is
        indicated with color.
      </p>
      <div className="grid grid-cols-1 gap-4">
        {FIELD_ROLE_OPTIONS.map((role) => {
          const isSelected = selected.includes(role);
          const detail = detailMap[role];
          const isOpen = expanded[role];

          return (
            <div key={role} className="border rounded-lg transition">
              <div
                onClick={() => toggle(role)}
                className={`cursor-pointer w-full flex items-center justify-between px-4 py-2 rounded-t-lg font-medium transition ${isSelected ? 'bg-gray-900 text-slate-100' : 'bg-slate-300 text-slate-900 hover:bg-gray-50'
                  }`}>
                <div className="flex flex-col text-left">
                  <span className="flex items-center gap-2">
                    {detail?.riskLevel && (
                      <span title={`Risk: ${detail.riskLevel}`}>{riskIcons[detail.riskLevel]}</span>
                    )}
                    {FIELD_ROLE_LABELS[role]}
                  </span>
                  {detail?.description && (
                    <span className={`${isSelected ? 'text-xs text-gray-200' : 'text-xs text-gray-900'}`}>
                      {detail.description.slice(0, 60)}...
                    </span>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  {isSelected ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-500" />
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(role);
                    }}
                    className="ml-2"
                    aria-label="Expand role details">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isOpen && detail && (
                <div className="px-4 py-3 text-sm bg-gray-700 rounded-b-lg text-gray-100 space-y-2">
                  <p>
                    <strong>Description:</strong> {detail.description}
                  </p>
                  <p>
                    <strong>Best Suited For:</strong> {detail.bestSuitedFor}
                  </p>
                  <div>
                    <strong>Required Skills:</strong>
                    <ul className="list-disc list-inside ml-2">
                      {detail.requiredSkills.map((skill, i) => (
                        <li key={i}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
