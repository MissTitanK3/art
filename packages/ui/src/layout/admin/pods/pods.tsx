"use client";
import { useMemo, useState } from "react";
import type { Pod } from "@workspace/store/types/pod.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/primitives/table";
import { Button } from "@workspace/ui/primitives/button";
import { Badge } from "@workspace/ui/primitives/badge";
import { Input } from "@workspace/ui/primitives/input";
import { toast } from "sonner";
import { slugify } from "@workspace/store/types/pod.ts";
import { Plus, Archive, Edit, Users } from "lucide-react";
import { safeErrorMessage } from "@workspace/ui/lib/http";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/primitives/dialog";
import { Label } from "@workspace/ui/primitives/label";
type Props = {
  initialPods: Pod[];
};
export default function PodsClient({ initialPods }: Props) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Pod[]>(() => initialPods);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) =>
      [p.name, p.area, p.slug].join("\n").toLowerCase().includes(q),
    );
  }, [rows, query]);
  async function createPod() {
    const name = prompt("Pod name");
    if (!name || !name.trim()) return;
    try {
      const res = await fetch("/api/admin/pods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error(await safeErrorMessage(res));
      const json = (await res.json()) as {
        pod: any;
      };
      const p = json.pod;
      const pod: Pod = {
        id: String(p.id),
        slug: String(p.slug),
        name: String(p.name),
        area: String(p.area ?? ""),
        channels: Array.isArray(p.channels) ? p.channels : [],
        team: [],
      };
      setRows((prev) => [pod, ...prev]);
      toast.success("Pod created");
    } catch (e: any) {
      toast.error(e?.message ?? "Create failed");
    }
  }
  function openRename(pod: Pod) {
    setRenameId(pod.id);
    setRenameValue(pod.name);
    setRenameOpen(true);
  }
  async function submitRename() {
    const id = renameId;
    const nextName = renameValue.trim();
    if (!id || !nextName) return setRenameOpen(false);
    const current = rows.find((p) => p.id === id);
    try {
      const res = await fetch(`/api/admin/pods/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName }),
      });
      if (!res.ok) throw new Error(await safeErrorMessage(res));
      const json = (await res.json()) as {
        pod?: any;
      };
      const p = json.pod ?? {
        id,
        name: nextName,
        slug: slugify(nextName),
        area: current?.area,
        channels: current?.channels,
      };
      setRows((prev) =>
        prev.map((x) =>
          x.id === id
            ? { ...x, name: String(p.name), slug: String(p.slug) }
            : x,
        ),
      );
      toast.success("Pod renamed");
      setRenameOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Rename failed");
    }
  }
  async function archivePod(id: string) {
    const p = rows.find((x) => x.id === id);
    if (!p) return;
    if (!confirm(`Archive pod “${p.name}”?`)) return;
    try {
      const res = await fetch(`/api/admin/pods/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await safeErrorMessage(res));
      setRows((prev) => prev.filter((x) => x.id !== id));
      toast.success("Pod archived");
    } catch (e: any) {
      toast.error(e?.message ?? "Archive failed");
    }
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
          <CardDescription>
            Search, rename, or archive pods. Manage membership in pod detail.
          </CardDescription>
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
                        <span className="text-xs text-muted-foreground">
                          {pod.slug}
                        </span>
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
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openRename(pod)}
                        >
                          <Edit className="h-4 w-4 mr-2" /> Rename
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => archivePod(pod.id)}
                        >
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

      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        value={renameValue}
        onChange={setRenameValue}
        onSubmit={submitRename}
      />
    </section>
  );
}
// Rename dialog modal
function RenameDialog({
  open,
  onOpenChange,
  value,
  onChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-4 max-w-3xl m-auto bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Rename Pod</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor="pod-name">Name</Label>
          <Input
            id="pod-name"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
