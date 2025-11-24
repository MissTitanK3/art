"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import type { Pod } from "@workspace/store/types/pod";

type PodsPreviewProps = {
    pods: Pod[];
};

export function PodsPreview({ pods }: PodsPreviewProps) {
    const snippets = useMemo(() => pods.slice(0, 4), [pods]);
    const totalRoster = pods.reduce(
        (sum, pod) => sum + (pod.team?.length ?? 0),
        0,
    );

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                    <CardTitle>Pods at a glance</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {pods.length === 0
                            ? "Pods sync once you connect to your real data layer."
                            : `${totalRoster} volunteers across ${pods.length} pods.`}
                    </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/pods">Pods directory</Link>
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {snippets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No pods yet. Use the pods tools to add your first coverage team.
                    </p>
                ) : (
                    snippets.map((pod) => (
                        <div
                            key={pod.id}
                            className="rounded-md border border-border/60 bg-muted/40 p-4 shadow-xs"
                        >
                            <div className="flex items-center justify-between text-sm font-medium">
                                <span>{pod.name}</span>
                                <Badge
                                    variant="secondary"
                                    className="px-2 py-1 text-xs font-medium"
                                >
                                    {(pod.team?.length ?? 0).toString()} members
                                </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{pod.area}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                {(pod.channels ?? []).slice(0, 3).map((channel) => (
                                    <Badge
                                        key={`${pod.id}-${channel.type}`}
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {channel.type}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
