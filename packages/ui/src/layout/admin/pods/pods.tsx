"use client";

import * as React from "react";
import type { Pod } from "@workspace/store/types/pod.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { toast } from "sonner";
import { fakeUUID } from "@workspace/ui/lib/utils";
import { slugify } from "@workspace/store/types/pod.ts";
import { Plus, Archive, Edit, Users } from "lucide-react";

type Props = {
  initialPods: Pod[];
};

export default function PodsClient({ initialPods }: Props) {
  const [query, setQuery] = React.useState("");
  const [rows, setRows] = React.useState<Pod[]>(() => initialPods);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) => [p.name, p.area, p.slug].join("\n").toLowerCase().includes(q));
  }, [rows, query]);

  function createPod() {
    const name = prompt("Pod name");
    if (!name || !name.trim()) return;
    const id = fakeUUID();
    const slug = slugify(name);
    const pod: Pod = { id, slug, name: name.trim(), area: "Unassigned", channels: [], team: [] };
    setRows((prev) => [pod, ...prev]);
    toast.success("Pod created — demo-only");
  }

  function renamePod(id: string) {
    const current = rows.find((p) => p.id === id);
    if (!current) return;
    const nextName = prompt("Rename pod", current.name);
    if (!nextName || !nextName.trim()) return;
    setRows((prev) => prev.map((p) => (p.id === id ? { ...p, name: nextName.trim(), slug: slugify(nextName) } : p)));
    toast.success("Pod renamed — demo-only");
  }

  function archivePod(id: string) {
    const p = rows.find((x) => x.id === id);
    if (!p) return;
    if (!confirm(`Archive pod “${p.name}”?`)) return;
    setRows((prev) => prev.filter((x) => x.id !== id));
    toast.success("Pod archived — demo-only");
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pods</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={createPod}>
            <Plus className="h-4 w-4 mr-2" /> Create Pod
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organize pods and membership</CardTitle>
          <CardDescription>Search, rename, or archive pods. Manage membership in pod detail.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-center mb-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, area, slug..."
              className="w-[280px]"
            />
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pod</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Channels</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((pod) => (
                  <TableRow key={pod.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{pod.name}</span>
                        <span className="text-xs text-muted-foreground">{pod.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>{pod.area}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{pod.team.length} members</Badge>
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate">
                      {pod.channels.map((c, i) => (
                        <Badge key={i} variant="outline" className="mr-1">
                          {c.type}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <a href={`/pods/${pod.id}/roster`}>
                            <Users className="h-4 w-4 mr-2" /> Members
                          </a>
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => renamePod(pod.id)}>
                          <Edit className="h-4 w-4 mr-2" /> Rename
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => archivePod(pod.id)}>
                          <Archive className="h-4 w-4 mr-2" /> Archive
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

