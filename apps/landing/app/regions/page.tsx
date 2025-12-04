import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Badge } from "@workspace/ui/primitives/badge";
import { Button } from "@workspace/ui/primitives/button";
import { ExternalLink, MapPin, MessagesSquare } from "lucide-react";
import { REGIONS, regionUrl } from "./regions";

export default function RegionsPage() {
  const live = REGIONS.filter((r) => !r.disabled).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const planned = REGIONS.filter((r) => r.disabled).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="h-6 w-6 text-muted-foreground" /> Regions
          </h1>
          <Link
            href="/"
            className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground"
          >
            Back to landing
          </Link>
        </div>

        <h2 className="text-xl font-semibold mb-3">Live Regions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {live.map((r) => {
            const href = regionUrl(r.subdomain);
            return (
              <Card key={r.subdomain} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="truncate">{r.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="text-muted-foreground">
                    <span className="text-foreground font-medium">
                      Subdomain:{" "}
                    </span>
                    <code className="text-xs">{r.subdomain}</code>
                  </div>
                  <div className="text-muted-foreground">
                    <span className="text-foreground font-medium">
                      Coverage:{" "}
                    </span>
                    {r.coverage}
                  </div>
                  {r.notes ? (
                    <div className="text-xs text-muted-foreground">
                      {r.notes}
                    </div>
                  ) : null}
                  {r.signals && r.signals.length ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {r.signals.map((s) => (
                        <Button key={s.url} asChild size="sm" variant="outline">
                          <a href={s.url} target="_blank" rel="noreferrer">
                            <MessagesSquare className="mr-1.5 h-3.5 w-3.5" />{" "}
                            {s.name}
                          </a>
                        </Button>
                      ))}
                    </div>
                  ) : null}
                  <div className="pt-2">
                    <Button asChild size="sm">
                      <a href={href} target="_blank" rel="noreferrer">
                        Open <ExternalLink className="ml-1 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <h2 className="text-xl font-semibold mt-10 mb-3">Planned Regions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {planned.map((r) => (
            <Card key={r.subdomain} className="h-full opacity-90">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className="truncate">{r.name}</span>
                  <Badge variant="secondary">coming soon</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="text-muted-foreground">
                  <span className="text-foreground font-medium">
                    Coverage:{" "}
                  </span>
                  {r.coverage}
                </div>
                {r.notes ? (
                  <div className="text-xs text-muted-foreground">{r.notes}</div>
                ) : null}
                {r.signals && r.signals.length ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {r.signals.map((s) => (
                      <Button
                        key={s.url}
                        asChild
                        size="sm"
                        variant="outline"
                        disabled
                      >
                        <a href={s.url} target="_blank" rel="noreferrer">
                          <MessagesSquare className="mr-1.5 h-3.5 w-3.5" />{" "}
                          {s.name}
                        </a>
                      </Button>
                    ))}
                  </div>
                ) : null}
                <div className="pt-2">
                  <Button size="sm" variant="outline" disabled>
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
