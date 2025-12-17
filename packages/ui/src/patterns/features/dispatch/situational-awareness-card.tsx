"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Button } from "@workspace/ui/primitives/button";
import { Badge } from "@workspace/ui/primitives/badge";
import { Alert, AlertDescription } from "@workspace/ui/primitives/alert";
import { TooltipInfo } from "@workspace/ui/patterns/common/tooltip-info";
import {
  STATUS_EXPLANATIONS,
  RISK_EXPLANATIONS,
  VISIBILITY_EXPLANATIONS,
} from "@workspace/ui/lib/constants/dispatch";
import { humanize } from "@workspace/ui/lib/utils";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";
import { Eye, AlertCircle } from "lucide-react";
import { RISK_LEVEL_DETAILS } from "../impact";
import DispatchStatusUpdater from "@workspace/ui/patterns/features/status/dispatch-status-updater";

export type SituationalAwarenessCardProps = {
  submission: DispatchSubmission;
  onEditSummary?: () => void;
  canEditSummary?: boolean;
};

/**
 * Layer A: Situational Awareness
 * Always visible, read-only default view showing:
 * - summary, status, priority, risk_level, location_label, date_of_event, visibility_scope
 *
 * Enforces rule: "No user should ever see more than one responsibility layer at once"
 */
export function SituationalAwarenessCard({
  submission,
  onEditSummary,
  canEditSummary = false,
}: SituationalAwarenessCardProps) {
  const riskLevel = submission.risk_level ?? "unknown";
  const visibilityScope = (submission.visibility_scope ??
    "org_and_region_masked") as keyof typeof VISIBILITY_EXPLANATIONS;
  const statusExplanation = STATUS_EXPLANATIONS[submission.status];
  const riskExplanation = RISK_EXPLANATIONS[riskLevel];
  const visibilityExplanation = VISIBILITY_EXPLANATIONS[visibilityScope];

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          What's Happening
        </CardTitle>
        <CardDescription>
          Core information everyone should know before engaging
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status - Read-only display with explanation */}
        <div className="flex flex-col md:flex-row gap-3 w-full justify-between">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold">Status</h4>
              <TooltipInfo>
                <div className="space-y-1">
                  <p className="font-semibold">{statusExplanation.definition}</p>
                  <p className="text-xs">
                    <strong>Impact:</strong> {statusExplanation.consequence}
                  </p>
                  <p className="text-xs">
                    <strong>Next:</strong> {statusExplanation.action}
                  </p>
                  {!statusExplanation.reversible && (
                    <p className="text-xs text-red-300">
                      ⚠️ This status change is not reversible
                    </p>
                  )}
                </div>
              </TooltipInfo>
            </div>
            <div>
              <DispatchStatusUpdater submission={submission} readOnly />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Location</h4>
            <p className="text-sm text-foreground">
              {submission.location_label || "Not specified"}
              {submission.state && (
                <span className="text-muted-foreground">, {submission.state}</span>
              )}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Event Date</h4>
            <p className="text-sm text-foreground" suppressHydrationWarning>
              {submission.date_of_event
                ? new Date(submission.date_of_event).toLocaleString()
                : new Date(submission.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold">Summary</h4>
            </div>
            {canEditSummary && onEditSummary ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={onEditSummary}
              >
                Edit
              </Button>
            ) : null}
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {submission.summary || (
              <span className="text-muted-foreground italic">
                No summary provided yet
              </span>
            )}
          </p>
        </div>

        {/* Visibility Scope - Critical privacy information */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold">Who Can See This</h4>
            <TooltipInfo>
              <div className="space-y-1">
                <p className="font-semibold">{visibilityExplanation.definition}</p>
                <p className="text-xs">
                  <strong>Privacy:</strong> {visibilityExplanation.privacyLevel}
                </p>
                <p className="text-xs">
                  <strong>Use when:</strong> {visibilityExplanation.useWhen}
                </p>
              </div>
            </TooltipInfo>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {visibilityExplanation.whoCanSee}
            </p>
            {visibilityScope === "public" && (
              <Alert variant="destructive" className="text-xs">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This dispatch is publicly visible. Do not include sensitive
                  location details or personal information.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Location & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        </div>

        {/* Training flag */}
        {submission.training && (
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-xs flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-100">
                Training Exercise
              </Badge>
              This is a practice scenario for training purposes
            </AlertDescription>
          </Alert>
        )}

        {/* Risk Level */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex items-center gap-2 mb-1 w-1/3">
            <h4 className="text-sm font-semibold">Risk Level</h4>
            <TooltipInfo>
              <div className="space-y-1">
                <p className="font-semibold">{riskExplanation.definition}</p>
                <p className="text-xs">
                  <strong>Impact:</strong> {riskExplanation.consequence}
                </p>
                <p className="text-xs">
                  <strong>Action:</strong> {riskExplanation.action}
                </p>
              </div>
            </TooltipInfo>
            <Badge
              variant="outline"
              className={`capitalize ${riskExplanation.color}`}
            >
              {humanize(riskLevel)}
            </Badge>
          </div>
          {riskLevel === "unknown" ? (
            <Alert variant="default" className="mt-2 max-w-2/3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                No safety assessment completed. Volunteers may decline without
                context.
              </AlertDescription>
            </Alert>
          ) : null}

          {RISK_LEVEL_DETAILS.find(detail => detail.value === riskLevel)?.description ? (
            <div className={`${RISK_LEVEL_DETAILS.find(detail => detail.value === riskLevel)?.tone} mt-2 max-w-2/3 rounded-md p-2 text-sm`}>
              {RISK_LEVEL_DETAILS.find(detail => detail.value === riskLevel)?.description}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
