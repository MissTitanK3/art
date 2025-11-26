"use client";

import { useMemo, useState } from "react";
import { Clock3, Lock, Megaphone, Plus, RefreshCcw, ShieldAlert, X } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";

import type { OrgPoll } from "../types";

type OrgPollsPanelProps = {
  polls: OrgPoll[];
  privacyNote: string;
  onCreatePoll?: (input: {
    title: string;
    options: Array<{ label: string; emoji?: string | null }>;
    closesAt?: string | null;
    allowMultiple?: boolean;
  }) => void;
  onVote?: (pollId: string, optionId: string) => void;
  onClosePoll?: (pollId: string) => void;
  onReopenPoll?: (pollId: string) => void;
  onDeletePoll?: (pollId: string) => void;
};

const closingPresets = [
  { value: "24h", label: "24 hours" },
  { value: "72h", label: "3 days" },
  { value: "168h", label: "7 days" },
  { value: "none", label: "No auto close" },
] as const;

const resolveClosingDate = (preset: (typeof closingPresets)[number]["value"]) => {
  if (preset === "none") return null;
  const hours = Number(preset.replace("h", ""));
  const ms = Number.isFinite(hours) ? hours * 60 * 60 * 1000 : 0;
  return ms > 0 ? new Date(Date.now() + ms).toISOString() : null;
};

const formatTimeLeft = (closesAt?: string | null) => {
  if (!closesAt) return "No auto close";
  const ts = new Date(closesAt).getTime();
  if (Number.isNaN(ts)) return "Unknown close time";
  const diff = ts - Date.now();
  if (diff <= 0) return "Closed";
  const minutes = Math.round(diff / 60000);
  if (minutes < 60) return `${minutes}m left`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h left`;
  const days = Math.round(hours / 24);
  return `${days}d left`;
};

const getEffectiveStatus = (poll: OrgPoll) => {
  const expired = poll.closesAt
    ? new Date(poll.closesAt).getTime() < Date.now()
    : false;
  if (poll.status === "archived") return "archived";
  if (poll.status === "closed" || expired) return "closed";
  return "open";
};

const EMOJI_CHOICES = ["👍", "👎", "🤝", "✅", "❌", "🤷", "🔥", "🌱", "💡", "🚀"];
const EMOJI_NONE = "none";

type OptionDraft = {
  id: string;
  label: string;
  emoji?: string | null;
};

export function OrgPollsPanel({
  polls,
  privacyNote,
  onCreatePoll,
  onVote,
  onClosePoll,
  onReopenPoll,
  onDeletePoll,
}: OrgPollsPanelProps) {
  const [title, setTitle] = useState("");
  const [closingPreset, setClosingPreset] = useState<(typeof closingPresets)[number]["value"]>("72h");
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [options, setOptions] = useState<OptionDraft[]>([
    { id: "opt-1", label: "Yes", emoji: "👍" },
    { id: "opt-2", label: "No", emoji: "👎" },
    { id: "opt-3", label: "Abstain", emoji: "🤷" },
  ]);

  const stats = useMemo(() => {
    const open = polls.filter((poll) => getEffectiveStatus(poll) === "open").length;
    const closed = polls.length - open;
    return { open, closed };
  }, [polls]);

  const sortedPolls = useMemo(
    () =>
      [...polls].sort((a, b) => {
        const statusA = getEffectiveStatus(a);
        const statusB = getEffectiveStatus(b);
        if (statusA === statusB) {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        }
        if (statusA === "open") return -1;
        if (statusB === "open") return 1;
        return 0;
      }),
    [polls],
  );

  const handleCreate = () => {
    const trimmedTitle = title.trim();
    const parsedOptions = options
      .map((opt) => ({ ...opt, label: opt.label.trim() }))
      .filter((opt) => Boolean(opt.label));
    const closesAt = resolveClosingDate(closingPreset);

    if (!trimmedTitle || parsedOptions.length === 0) return;

    onCreatePoll?.({ title: trimmedTitle, options: parsedOptions, closesAt, allowMultiple });
    setTitle("");
    setOptions([
      { id: "opt-1", label: "Yes", emoji: "👍" },
      { id: "opt-2", label: "No", emoji: "👎" },
      { id: "opt-3", label: "Abstain", emoji: "🤷" },
    ]);
    setClosingPreset("72h");
    setAllowMultiple(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-medium">Polls</h3>
          <p className="text-sm text-muted-foreground">
            Decision snapshots that stay out of Signal churn. Titles and votes only.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Megaphone className="h-3 w-3" />
            {stats.open} open
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            {stats.closed} closed
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create a poll</CardTitle>
          <CardDescription>
            Keep sensitive context out of the poll. Use secure channels for details and record in org docs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="poll-title">Title</Label>
            <Input
              id="poll-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Where should we focus this week?"
            />
          </div>
          <div className="space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              {options.map((option, idx) => (
                <div
                  key={option.id}
                  className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3 md:flex-row md:items-center"
                >
                  <div className="flex items-center justify-between gap-4">
                    <Select
                      value={option.emoji ?? ""}
                      onValueChange={(value) =>
                        setOptions((prev) =>
                          prev.map((opt) =>
                            opt.id === option.id
                              ? { ...opt, emoji: value === EMOJI_NONE ? null : value }
                              : opt,
                          ),
                        )
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="😀" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMOJI_CHOICES.map((emoji) => (
                          <SelectItem key={emoji} value={emoji}>
                            {emoji}
                          </SelectItem>
                        ))}
                        <SelectItem value={EMOJI_NONE}>No emoji</SelectItem>
                      </SelectContent>
                    </Select>
                    {options.length > 1 && (
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-9 w-9"
                        onClick={() =>
                          setOptions((prev) => prev.filter((opt) => opt.id !== option.id))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    className="md:flex-1 md:ml-3"
                    value={option.label}
                    onChange={(e) =>
                      setOptions((prev) =>
                        prev.map((opt) =>
                          opt.id === option.id ? { ...opt, label: e.target.value } : opt,
                        ),
                      )
                    }
                    placeholder={`Option ${idx + 1}`}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() =>
                  setOptions((prev) => [
                    ...prev,
                    {
                      id: `opt-${typeof crypto !== "undefined" && crypto.randomUUID
                        ? crypto.randomUUID()
                        : Date.now().toString()
                        }`,
                      label: `Option ${prev.length + 1}`,
                      emoji: EMOJI_CHOICES[prev.length % EMOJI_CHOICES.length] ?? "🆕",
                    },
                  ])
                }
              >
                <Plus className="h-4 w-4" />
                Add option
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Auto-close</Label>
            <Select
              value={closingPreset}
              onValueChange={(value) =>
                setClosingPreset(value as (typeof closingPresets)[number]["value"])
              }
            >
              <SelectTrigger className="w-full md:w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {closingPresets.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
            <div className="space-y-1">
              <Label className="text-sm">Allow multiple selections</Label>
              <p className="text-xs text-muted-foreground">
                Let voters choose more than one option. Disable to enforce a single choice.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{allowMultiple ? "Multi-vote" : "Single vote"}</span>
              <Switch
                checked={allowMultiple}
                onCheckedChange={(checked) => setAllowMultiple(Boolean(checked))}
              />
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-md border border-dashed bg-muted/40 p-2 text-xs text-muted-foreground">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500" />
            <span>{privacyNote}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button size="sm" onClick={handleCreate} disabled={!title.trim()}>
            Post poll
          </Button>
        </CardFooter>
      </Card>

      {polls.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No polls yet</CardTitle>
            <CardDescription>
              Use polls to capture lightweight decisions. The reminder about keeping PII out of
              polls is attached to every poll automatically.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-3">
          {sortedPolls.map((poll) => {
            const status = getEffectiveStatus(poll);
            const isOpen = status === "open";
            const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
            const closesLabel = formatTimeLeft(poll.closesAt);
            const allowMulti = !!poll.allowMultiple;

            return (
              <Card key={poll.id}>
                <CardHeader className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-lg">{poll.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={isOpen ? "default" : "secondary"} className="flex items-center gap-1">
                        {isOpen ? <Megaphone className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        {isOpen ? "Open" : "Closed"}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {closesLabel}
                      </Badge>
                      {allowMulti && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          Multi-vote
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="flex flex-wrap items-center gap-3 text-xs">
                    <span>Votes are recorded here; coordinate context in a secure channel.</span>
                    {poll.createdAt && (
                      <span className="text-muted-foreground">
                        Created {new Date(poll.createdAt).toLocaleString()}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 rounded-md border border-dashed bg-muted/40 p-2 text-xs text-muted-foreground">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500" />
                    <span>{poll.note || privacyNote}</span>
                  </div>
                  <div className="space-y-2">
                    {poll.options.map((option) => {
                      const percent =
                        totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
                      return (
                        <div
                          key={option.id}
                          className="space-y-2 rounded-md border bg-muted/30 p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="space-y-1">
                              <p className="font-medium leading-none flex items-center gap-2">
                                {option.emoji && <span className="text-lg">{option.emoji}</span>}
                                <span>{option.label}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {option.votes} vote{option.votes === 1 ? "" : "s"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{percent}%</span>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!isOpen}
                                onClick={() => onVote?.(poll.id, option.id)}
                              >
                                Vote
                              </Button>
                            </div>
                          </div>
                          <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="absolute left-0 top-0 h-2 rounded-full bg-primary transition-[width]"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Total votes: {totalVotes}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => onDeletePoll?.(poll.id)}
                    >
                      Delete
                    </Button>
                    {isOpen ? (
                      <Button size="sm" variant="ghost" onClick={() => onClosePoll?.(poll.id)}>
                        Close poll
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => onReopenPoll?.(poll.id)}>
                        <RefreshCcw className="mr-1 h-3 w-3" />
                        Reopen
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
