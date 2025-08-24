"use client";

import Link from "next/link";
import PodCard from "@workspace/ui/components/server/pods/PodCard";
import { usePodsStore } from "@workspace/store/podStore";

export default function PodsListDataLayer() {
  const pods = usePodsStore((s) => s.pods);

  return (
    <section>
      <h1 className="text-2xl font-bold">Pods Directory</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {pods.map((p) => (
          <Link key={p.id} href={`/pods/${p.slug}`}>
            <PodCard pod={p} />
          </Link>
        ))}
      </div>
    </section>
  );
}
