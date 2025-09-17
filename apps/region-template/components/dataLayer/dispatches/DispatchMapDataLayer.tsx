"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { useDispatchStore } from "@workspace/store/dispatchStore";
import { DispatchTypeBadge } from "@workspace/ui/components/client/DispatchTypeBadge";
import { humanize } from "@workspace/ui/lib/utils";

export default function DispatchListDataLayer() {
  const submissions = useDispatchStore((s) => s.submissions);

  return (
    <section suppressHydrationWarning>
      <h1 className="text-2xl font-bold">Dispatch List</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {submissions.map((submission) => (
          <Link
            key={submission.id}
            href={`/dispatches/submission/${submission.id}`}
            className="block hover:no-underline"
          >
            <Card
              className="
                h-full transition
                hover:shadow-lg hover:ring-2 hover:ring-primary/40
                dark:hover:shadow-[0_0_15px_rgba(0,0,0,0.6)]
              "
              suppressHydrationWarning
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{submission.location_label ?? "Unknown Location"}</span>
                  <Badge>{humanize(submission.status)}</Badge>
                </CardTitle>
                {submission.state && (
                  <CardDescription className="text-xs">
                    {submission.type && <DispatchTypeBadge type={submission.type} />}
                    {submission.type && " • "}
                    {submission.state}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="text-sm space-y-3">
                {/* Roles by type */}
                {submission.required_roles_by_type &&
                  Object.keys(submission.required_roles_by_type).length > 0 && (
                    <div>
                      <p className="font-medium text-xs uppercase mb-1">
                        Roles Needed
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(submission.required_roles_by_type).map(
                          ([role, count]) => (
                            <Badge
                              key={role}
                              variant="outline"
                              className="text-xs"
                            >
                              {role} ({count})
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Intended actions */}
                {submission.intended_actions &&
                  submission.intended_actions.length > 0 && (
                    <div>
                      <p className="font-medium text-xs uppercase mb-1">
                        Intended Actions
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {submission.intended_actions.slice(0, 3).map((action) => (
                          <li key={action}>{action}</li>
                        ))}
                      </ul>
                      {submission.intended_actions.length > 3 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          +{submission.intended_actions.length - 3} more
                        </p>
                      )}
                    </div>
                  )}
              </CardContent>

              <CardFooter className="text-xs text-muted-foreground">
                {new Date(submission.timestamp).toLocaleString()}
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
