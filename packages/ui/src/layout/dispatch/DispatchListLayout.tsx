import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { DispatchTypeBadge } from "@workspace/ui/components/client/DispatchTypeBadge";
import { humanize } from "@workspace/ui/lib/utils";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";

type LinkWrapperProps = {
  href: string;
  children: React.ReactNode;
};

export type DispatchListLayoutProps = {
  submissions: DispatchSubmission[];
  title?: React.ReactNode;
  getHref?: (submission: DispatchSubmission) => string;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  LinkComponent?: React.ComponentType<LinkWrapperProps>;
};

const DefaultLinkComponent: React.FC<LinkWrapperProps> = ({ href, children }) => (
  <a href={href} className="block hover:no-underline">
    {children}
  </a>
);

export function DispatchListLayout({
  submissions,
  title = <h1 className="text-2xl font-bold">Dispatch List</h1>,
  getHref = (submission) => `/dispatches/submission/${submission.id}`,
  emptyState = (
    <p className="text-sm text-muted-foreground">No dispatch submissions yet.</p>
  ),
  loadingState,
  LinkComponent = DefaultLinkComponent,
}: DispatchListLayoutProps) {
  const content = submissions.length === 0 ? (
    <div className="mt-4">{loadingState ?? emptyState}</div>
  ) : (
    <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {submissions.map((submission) => (
        <LinkComponent key={submission.id} href={getHref(submission)}>
          <Card
            className="h-full transition hover:shadow-lg hover:ring-2 hover:ring-primary/40 dark:hover:shadow-[0_0_15px_rgba(0,0,0,0.6)]"
            suppressHydrationWarning
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{submission.location_label ?? "Unknown Location"}</span>
                <Badge>{humanize(submission.status)}</Badge>
              </CardTitle>
              {submission.state ? (
                <CardDescription className="text-xs">
                  {submission.type ? <DispatchTypeBadge type={submission.type} /> : null}
                  {submission.type ? " • " : null}
                  {submission.state}
                </CardDescription>
              ) : null}
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              {submission.required_roles_by_type &&
                Object.keys(submission.required_roles_by_type).length > 0 ? (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase">Roles Needed</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(submission.required_roles_by_type).map(
                      ([role, count]) => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role} ({count})
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              ) : null}

              {submission.intended_actions && submission.intended_actions.length > 0 ? (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase">Intended Actions</p>
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

            <CardFooter className="text-xs text-muted-foreground" suppressHydrationWarning>
              {new Date(submission.timestamp).toLocaleString()}
            </CardFooter>
          </Card>
        </LinkComponent>
      ))}
    </div>
  );

  return (
    <section suppressHydrationWarning>
      {title}
      {content}
    </section>
  );
}

export default DispatchListLayout;
