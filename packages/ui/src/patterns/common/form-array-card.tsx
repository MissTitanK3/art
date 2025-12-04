import { cn } from "@workspace/ui/lib/utils";
import { Button, type ButtonProps } from "@workspace/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
interface FormArrayCardProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  addLabel: React.ReactNode;
  onAdd: () => void;
  emptyMessage?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  addButtonProps?: ButtonProps;
  headerContent?: React.ReactNode;
}
/**
 * Renders a Card wrapper for dynamic array fields that share the same
 * structure across multiple forms. Consumers provide the item content
 * and drive the field-array logic while the component handles the
 * consistent layout used in the region template intake flows.
 */
export function FormArrayCard({
  label,
  description,
  addLabel,
  onAdd,
  emptyMessage,
  children,
  className,
  addButtonProps,
  headerContent,
}: FormArrayCardProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm">{label}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onAdd}
            className="w-fit"
            {...addButtonProps}
          >
            {addLabel}
          </Button>
          {headerContent}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {emptyMessage}
        {children}
      </CardContent>
    </Card>
  );
}
