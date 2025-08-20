"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import { usePodStore } from "@/lib/podStore";

export default function PodsDirectoryPage() {
  const pods = usePodStore((s) => s.pods);

  return (
    <section>
      <h1 className="text-2xl font-bold">Pods Directory</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {pods.map((p) => (
          <Link key={p.id} href={`/pods/${p.slug}`}>
            <Card
              className="rounded-2xl border py-2 grid gap-2 hover:shadow-md transition"
              aria-labelledby={`${p.slug}-title`}
            >
              <CardHeader className="flex items-start justify-between">
                <div>
                  <h2 id={`${p.slug}-title`} className="font-semibold">
                    {p.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-mono">{p.slug}</span>
                  </p>
                </div>

                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
                  {p.channel}
                </span>
              </CardHeader>

              <CardContent className="text-sm text-muted-foreground">
                Area: {p.area}
              </CardContent>

              <CardFooter className="pt-1">
                {p.channelLink ? (
                  <span className="inline-flex items-center text-sm underline underline-offset-4 hover:opacity-90">
                    Join / Public Vetting Link →
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Public link not published
                  </span>
                )}
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
