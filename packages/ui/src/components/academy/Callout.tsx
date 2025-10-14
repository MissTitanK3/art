import type { ReactNode } from "react"
import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  Flame,
  Info,
  Lightbulb,
} from "lucide-react"

export type CalloutType =
  | "info"
  | "warning"
  | "success"
  | "hint"
  | "important"
  | "rabbit-hole"

type CalloutStyle = {
  icon: ReactNode
  label: string
  border: string
  bg: string
  text: string
}

const CALLOUT_STYLES: Record<CalloutType, CalloutStyle> = {
  info: {
    icon: <Info className="h-11 w-11 text-blue-800" />,
    label: "Info",
    border: "border-l-[55px] border-blue-300",
    bg: "bg-blue-800",
    text: "text-blue-50 [&_strong]:text-gray-400",
  },
  warning: {
    icon: <AlertCircle className="h-11 w-11 text-yellow-800" />,
    label: "Warning",
    border: "border-l-[55px] border-yellow-300",
    bg: "bg-yellow-800",
    text: "text-yellow-50 [&_strong]:text-gray-400",
  },
  success: {
    icon: <CheckCircle2 className="h-11 w-11 text-green-800" />,
    label: "Success",
    border: "border-l-[55px] border-green-300",
    bg: "bg-green-800",
    text: "text-green-50 [&_strong]:text-gray-400",
  },
  hint: {
    icon: <Lightbulb className="h-11 w-11 text-purple-800" />,
    label: "Hint",
    border: "border-l-[55px] border-purple-300",
    bg: "bg-purple-800",
    text: "text-purple-50 [&_strong]:text-gray-400",
  },
  important: {
    icon: <Flame className="h-11 w-11 text-red-800" />,
    label: "Important",
    border: "border-l-[55px] border-red-300",
    bg: "bg-red-800",
    text: "text-red-50 [&_strong]:text-gray-400",
  },
  "rabbit-hole": {
    icon: <BookOpenCheck className="h-11 w-11 text-gray-800" />,
    label: "Rabbit Hole",
    border: "border-l-[55px] border-gray-300",
    bg: "bg-gray-800",
    text: "text-gray-50 italic [&_strong]:text-gray-400",
  },
}

export function Callout({
  type = "info",
  children,
}: {
  type?: CalloutType
  children: ReactNode
}) {
  const style = CALLOUT_STYLES[type] ?? CALLOUT_STYLES.info

  return (
    <div className={`flex rounded p-4 ${style.border} ${style.bg}`}>
      <div className="-ml-[66px] mr-3 mt-1 flex w-11 items-center justify-center">
        {style.icon}
      </div>
      <div className={`space-y-1 ${style.text}`}>
        <p className="font-semibold">{style.label}</p>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}
