import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Badge } from "@workspace/ui/primitives/badge";
import { humanize } from "@workspace/ui/lib/utils";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";
import { DispatchTypeBadge } from "@workspace/ui/patterns/common/dispatch-type-badge";
import { bucketFor, bucketEmoji } from "./dispatch-buckets";

type LinkWrapperProps = {
  href: string;
  children: React.ReactNode;
};

type DispatchCardProps = {
  submission: DispatchSubmission;
  LinkComponent: React.ComponentType<LinkWrapperProps>;
  href: string;
};

export function DispatchCard({
  submission,
  LinkComponent,
  href,
}: DispatchCardProps) {
  const urgency = bucketFor(submission);
  const urgencyIcon = bucketEmoji(urgency);

  return (
    <LinkComponent href={href}>
      <Card
        className="h-full transition hover:shadow-lg hover:ring-2 hover:ring-primary/40 dark:hover:shadow-[0_0_15px_rgba(0,0,0,0.6)]"
        suppressHydrationWarning
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2 w-full">
            <Badge className="shrink-0 whitespace-nowrap">
              {humanize(submission.status)}
            </Badge>
            {submission.state ? (
              <CardDescription className="text-xs line-clamp-1 text-right">
                {submission.type ? (
                  <DispatchTypeBadge type={submission.type} />
                ) : null}
                {submission.type ? " • " : null}
                {submission.state}
              </CardDescription>
            ) : null}
          </div>
          <CardTitle className="w-full break-words">
            {submission.location_label ?? "Unknown Location"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {submission.required_roles_by_type &&
          Object.keys(submission.required_roles_by_type).length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-medium uppercase">Roles Needed</p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {Object.entries(submission.required_roles_by_type).map(
                  ([role, count]) => (
                    <Badge key={role} variant="outline" className="text-xs">
                      {humanize(role)} ({count})
                    </Badge>
                  )
                )}
              </div>
            </div>
          ) : null}
          {submission.intended_actions &&
          submission.intended_actions.length > 0 ? (
            <div>
              <p className="mb-1 text-xs font-medium uppercase">
                Intended Actions
              </p>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                {submission.intended_actions.slice(0, 3).map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
              {submission.intended_actions.length > 3 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  +{submission.intended_actions.length - 3} more
                </p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
        <CardFooter
          className="text-xs text-muted-foreground flex-col items-start gap-2"
          suppressHydrationWarning
        >
          <Badge variant="outline" className="text-xs font-normal">
            {urgencyIcon} {urgency}
          </Badge>
          <div className="flex flex-col gap-0.5 w-full">
            {submission.date_of_event ? (
              <span>
                <span className="font-medium">Date of event:</span>{" "}
                {new Date(submission.date_of_event).toLocaleString()}
              </span>
            ) : null}
            <span>
              <span className="font-medium">Created:</span>{" "}
              {new Date(submission.timestamp).toLocaleString()}
            </span>
          </div>
        </CardFooter>
      </Card>
    </LinkComponent>
  );
}
