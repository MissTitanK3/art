import { cn } from "@workspace/ui/lib/utils";
import {
  Compass,
  Gavel,
  Heart,
  Languages,
  Package,
  Radio,
  Scale,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import type { ElementType } from "react";

export const TRACK_VARIANTS = [
  "default",
  "admin",
  "observation-legal",
  "field-safety",
  "community-care",
  "direct-action",
  "tech-comms",
  "dispatch",
  "field-coordination",
  "logistics",
  "court-support",
  "leadership",
  "pod-leadership",
  "movement-strategy",
  "security",
  "legal-support",
  "media-awareness",
  "network",
  "translator",
  "asl",
  "faith-support",
  "survivor-escort",
  "vehicle-specialist",
  "specialized-role",
] as const;

export type TrackVariant = (typeof TRACK_VARIANTS)[number];

type TrackConfig = {
  label: string;
  icon: ElementType;
  color: string;
};

const trackConfig: Record<TrackVariant, TrackConfig> = {
  default: {
    label: "Core Module (All Tracks)",
    icon: Compass,
    color: "bg-gray-100 text-gray-700",
  },
  admin: {
    label: "Admin & Systems",
    icon: Compass,
    color: "bg-slate-200 text-slate-800",
  },
  "observation-legal": {
    label: "Observation & Legal Track",
    icon: Scale,
    color: "bg-purple-200 text-purple-800",
  },
  "field-safety": {
    label: "Field Safety & Stabilization Track",
    icon: ShieldCheck,
    color: "bg-blue-200 text-blue-800",
  },
  "community-care": {
    label: "Community Care & Emotional Support",
    icon: Heart,
    color: "bg-pink-200 text-pink-800",
  },
  "direct-action": {
    label: "Direct Action & Protective Roles",
    icon: Zap,
    color: "bg-red-200 text-red-800",
  },
  "tech-comms": {
    label: "Tech & Comms Track",
    icon: Radio,
    color: "bg-green-200 text-green-800",
  },
  dispatch: {
    label: "Dispatch",
    icon: Radio,
    color: "bg-indigo-200 text-indigo-800",
  },
  "field-coordination": {
    label: "Field Coordination",
    icon: Users,
    color: "bg-blue-200 text-blue-800",
  },
  logistics: {
    label: "Logistics & Mutual Aid Operations",
    icon: Package,
    color: "bg-yellow-200 text-yellow-800",
  },
  "court-support": {
    label: "Court & Post-Raid Support",
    icon: Gavel,
    color: "bg-indigo-200 text-indigo-800",
  },
  leadership: {
    label: "Leadership",
    icon: Users,
    color: "bg-orange-200 text-orange-800",
  },
  "pod-leadership": {
    label: "Pod Leadership & Organizing",
    icon: Users,
    color: "bg-orange-200 text-orange-800",
  },
  "movement-strategy": {
    label: "Movement Strategy & Ethics",
    icon: Compass,
    color: "bg-gray-200 text-gray-800",
  },
  security: {
    label: "Security & Protective Roles",
    icon: ShieldCheck,
    color: "bg-slate-200 text-slate-800",
  },
  translator: {
    label: "Translator (Micro-Badge)",
    icon: Languages,
    color: "bg-teal-200 text-teal-800",
  },
  asl: {
    label: "ASL Interpreter (Micro-Badge)",
    icon: Languages,
    color: "bg-teal-200 text-teal-800",
  },
  "legal-support": {
    label: "Legal Support",
    icon: Gavel,
    color: "bg-purple-200 text-purple-800",
  },
  "media-awareness": {
    label: "Media Awareness",
    icon: Radio,
    color: "bg-slate-200 text-slate-800",
  },
  network: {
    label: "Network Coordination",
    icon: Radio,
    color: "bg-slate-200 text-slate-800",
  },
  "faith-support": {
    label: "Faith & Cultural Support (Micro-Badge)",
    icon: Heart,
    color: "bg-pink-200 text-pink-800",
  },
  "survivor-escort": {
    label: "Survivor Escort (Micro-Badge)",
    icon: ShieldCheck,
    color: "bg-blue-200 text-blue-800",
  },
  "vehicle-specialist": {
    label: "Vehicle Specialist (Micro-Badge)",
    icon: Package,
    color: "bg-yellow-200 text-yellow-800",
  },
  "specialized-role": {
    label: "Specialized Role",
    icon: Users,
    color: "bg-emerald-200 text-emerald-800",
  },
};

export function TrackBadge({
  variant,
  className,
}: {
  variant: TrackVariant;
  className?: string;
}) {
  const cfg = trackConfig[variant] ?? trackConfig.default;
  const { label, icon: Icon, color } = cfg;

  return (
    <div className="my-4 flex w-full justify-center">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium shadow-sm",
          color,
          className,
        )}
      >
        <Icon size={14} strokeWidth={2} />
        {label}
      </span>
    </div>
  );
}
