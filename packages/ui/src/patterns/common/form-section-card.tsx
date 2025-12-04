import { cn } from "@workspace/ui/lib/utils";
import { Button, type ButtonProps } from "@workspace/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
interface FormSectionCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  onSave?: () => void;
  sectionName?: string;
  saveLabel?: React.ReactNode;
  saveButtonProps?: ButtonProps;
  footerContent?: React.ReactNode;
  footerClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
}
/**
 * Structured card for form sections with header metadata and a consistent footer action.
 * Consumers supply the inner content and can opt into the default save button or custom footer content.
 */
export function FormSectionCard({
  title,
  description,
  children,
  onSave,
  sectionName,
  saveLabel,
  saveButtonProps,
  footerContent,
  footerClassName = "flex justify-end",
  headerClassName,
  contentClassName = "grid gap-6",
}: FormSectionCardProps) {
  const computedSaveLabel =
    saveLabel ?? (sectionName ? <>Save {sectionName}</> : "Save Section");
  return (
    <Card>
      <CardHeader className={cn("pb-4", headerClassName)}>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
      {(footerContent || onSave) && (
        <CardFooter className={footerClassName}>
          {footerContent ??
            (onSave ? (
              <Button type="button" onClick={onSave} {...saveButtonProps}>
                {computedSaveLabel}
              </Button>
            ) : null)}
        </CardFooter>
      )}
    </Card>
  );
}
