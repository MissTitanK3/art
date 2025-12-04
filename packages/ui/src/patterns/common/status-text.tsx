type Props = {
  children?: React.ReactNode;
  className?: string;
};
export function LoadingText({ children = "Loading…", className }: Props) {
  return (
    <div
      className={["text-muted-foreground text-sm", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
export function ErrorText({ children, className }: Props) {
  return (
    <div
      className={["text-red-600 text-sm", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
export function EmptyText({ children = "No results.", className }: Props) {
  return (
    <div
      className={["text-muted-foreground text-sm", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
