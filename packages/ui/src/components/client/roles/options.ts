// components/role/options.ts
export type RoleValue = "lead" | "member" | "trainee";

export type RoleOption = {
  value: RoleValue;
  label: string;
  dotClass: string; // Tailwind color for a small dot
  description?: string;
};

export const ROLE_OPTIONS: RoleOption[] = [
  { value: "lead",    label: "Lead",    dotClass: "bg-indigo-500",  description: "Coordinates the pod" },
  { value: "member",  label: "Member",  dotClass: "bg-emerald-500", description: "Active volunteer" },
  { value: "trainee", label: "Trainee", dotClass: "bg-amber-500",   description: "In training / shadowing" },
];

export const ROLE_BY_VALUE = Object.fromEntries(
  ROLE_OPTIONS.map(o => [o.value, o] as const)
);
