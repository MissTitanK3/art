import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes } from "react";

type LinkButtonProps = {
  label: string;
  variant?: "primary" | "secondary" | "red";
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
} & AnchorHTMLAttributes<HTMLAnchorElement> &
  Omit<LinkProps, "href"> & {
    href?: string;
  };

export default function LinkButton({
  label,
  href = "https://ko-fi.com/techwitch",
  variant = "primary",
  size = "md",
  ...rest
}: LinkButtonProps) {
  const base =
    "inline-block rounded-xl backdrop-blur-md shadow border transition-all";

  const sizeVariants = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2",
    lg: "text-lg px-5 py-3",
    xl: "text-xl px-6 py-3.5",
    "2xl": "text-2xl px-8 py-4",
  };

  const colorVariants = {
    primary:
      "bg-blue-500/20 text-white border-blue-300 hover:bg-blue-500/30 focus:ring-2 focus:ring-blue-400/50",
    secondary:
      "bg-white/10 text-white/90 border-white/20 hover:bg-white/20 focus:ring-2 focus:ring-white/30",
    red: "bg-red-500/20 text-white border-red-400 hover:bg-red-500/30 focus:ring-2 focus:ring-red-400/50",
  };

  return (
    <Link
      href={href}
      {...(rest as any)}
      className={`${base} ${sizeVariants[size]} ${colorVariants[variant]} ${rest.className ?? ""}`}
    >
      {label}
    </Link>
  );
}
