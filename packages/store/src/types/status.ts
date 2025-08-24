// components/status/options.ts
export type StatusValue = 'active' | 'inactive' | 'suspended';

export type StatusOption = {
  value: StatusValue;
  label: string;
  dotClass: string; // Tailwind class for the dot color
};

export const STATUS_OPTIONS: StatusOption[] = [
  { value: 'inactive', label: 'Inactive', dotClass: 'bg-gray-400' },
  { value: 'suspended', label: 'Suspended', dotClass: 'bg-amber-500' },
  { value: 'active', label: 'Active', dotClass: 'bg-emerald-500' },
];

export const STATUS_BY_VALUE = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o] as const));
