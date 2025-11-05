"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { ArrowLeft } from "lucide-react";

import PodRosterDataLayer from "@/components/dataLayer/pods/PodRosterDataLayer";
import { usePodStore } from "@/providers/PodStoreProvider";

export default function PodRosterPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const podId = decodeURIComponent(id ?? "");

  const pods = usePodStore((state) => state.pods);
  const pod = pods.find((candidate) => candidate.slug === podId);

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-l font-bold">{pod?.name} Pod Roster</h1>
      </div>
      <Separator className="my-4" />
      <PodRosterDataLayer />
    </section>
  );
}
