import { ButtonHTMLAttributes, ReactNode } from "react";

type FrostedButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "red";
  size?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "altSm"
    | "altMd"
    | "altLg"
    | "altXl"
    | "alt2xl";
  visualSize?: "default" | "big-sm-text" | "xl-text" | "caption";
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function FrostedButton({
  children,
  variant = "primary",
  size = "md",
  ...rest
}: FrostedButtonProps) {
  const base =
    "text-base rounded-lg backdrop-blur-md shadow border transition-all focus:outline-none";

  const sizeVariants = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2",
    lg: "text-lg px-5 py-3",
    xl: "text-xl px-6 py-3.5",
    "2xl": "text-2xl px-8 py-4",

    altSm: "text-xs px-3 py-1.5",
    altMd: "text-sm px-4 py-2",
    altLg: "text-base px-5 py-3",
    altXl: "text-lg px-6 py-3.5",
    alt2xl: "text-xl px-8 py-4",
  } as const;

  const colorVariants = {
    primary:
      "bg-blue-500/20 text-white border-blue-300 hover:bg-blue-500/30 focus:ring-2 focus:ring-blue-400/50",
    secondary:
      "bg-white/10 text-white/90 border-white/20 hover:bg-white/20 focus:ring-2 focus:ring-white/30",
    red: "bg-red-500/20 text-white border-red-400 hover:bg-red-500/30 focus:ring-2 focus:ring-red-400/50",
  };

  return (
    <button
      {...(rest as any)}
      className={`${base} ${sizeVariants[size]} ${colorVariants[variant]}  ${rest.className ?? ""}`}
    >
      {children}
    </button>
  );
}
