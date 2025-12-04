import { cn } from "@workspace/ui/lib/utils";
type PageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};
/**
 * Simple page header with title, optional description, and an actions slot.
 * Keeps page chrome consistent across apps.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col md:flex-row items-center justify-between gap-3",
        className,
      )}
    >
      <div className="space-y-1 md:space-y-0">
        <h1 className="text-2xl font-bold text-center md:text-left">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground text-center md:text-left">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex gap-2 flex-wrap">{actions}</div> : null}
    </header>
  );
}
