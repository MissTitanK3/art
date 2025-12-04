"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@workspace/ui/primitives/input";
import { Textarea } from "@workspace/ui/primitives/textarea";
import { Button } from "@workspace/ui/primitives/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { Switch } from "@workspace/ui/primitives/switch";
import { AccessRoles, roleLabel } from "@workspace/store/types/roles";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/primitives/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/primitives/command";
import { Badge } from "@workspace/ui/primitives/badge";
import { Checkbox } from "@workspace/ui/primitives/checkbox";
import { ChevronDown, X } from "lucide-react";
import type { Profile } from "@workspace/store/types/global";
import { humanize } from "@workspace/ui/lib/utils";
import { useProfileStore } from "@workspace/store/useProfileStore";
import { useUnifiedAccess } from "@workspace/store/utils/permissions/useUnifiedAccess";
import { NavRole } from "@workspace/store/utils/permissions/types";
import {
  NOTIFICATION_CHANNELS,
  type NotificationChannel,
  type NotificationLevel,
} from "@workspace/store/types/notifications";
import { type AdminNotificationTemplateKey } from "@workspace/store/admin/notifications/templates";
export type SendArgs = {
  template?: AdminNotificationTemplateKey;
  title?: string;
  body?: string;
  level?: NotificationLevel;
  channel?: NotificationChannel;
  link?: string;
  sticky?: boolean;
  ttlMinutes?: number | null;
  recipientUserIds?: string[];
  roles?: string[];
  groups?: ("dispatchers" | "admins" | "leaders")[];
};
export function AdminNotificationForm({
  onSend,
}: {
  onSend: (args: SendArgs) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [level, setLevel] = useState<NotificationLevel>("info");
  const [channel, setChannel] = useState<NotificationChannel>("dispatch");
  const [link, setLink] = useState("");
  const [sticky, setSticky] = useState(false);
  const [ttlMinutes, setTtlMinutes] = useState<number | "">("");
  const [selectedProfiles, setSelectedProfiles] = useState<
    Pick<Profile, "id" | "user_id" | "display_name" | "access_role">[]
  >([]);
  const profileFromStore = useProfileStore((s) => s.profile);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const profileRoles = useMemo(
    () =>
      profileFromStore?.access_role
        ? [String(profileFromStore.access_role)]
        : [],
    [profileFromStore?.access_role],
  );
  const ctx = useMemo(
    () => ({ navRole: profileRoles[0] as NavRole }),
    [profileRoles],
  );
  const { access: effectiveCanManage } = useUnifiedAccess(
    "manage_notifications",
    ctx,
  );
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<
    Pick<Profile, "user_id" | "display_name">[]
  >([]);
  const [roleGroups, setRoleGroups] = useState<{
    dispatchers: boolean;
    admins: boolean;
    leaders: boolean;
  }>({ dispatchers: false, admins: false, leaders: false });
  const [roleChecks, setRoleChecks] = useState<Record<string, boolean>>({});
  const selectedRoles = useMemo(
    () => AccessRoles.filter((r) => roleChecks[r]),
    [roleChecks],
  );
  const setChecksFor = useCallback((roles: string[]) => {
    const map: Record<string, boolean> = {};
    AccessRoles.forEach((r) => {
      map[r] = roles.includes(r);
    });
    setRoleChecks(map);
  }, []);
  const applyPreset = (
    preset:
      | "verified_dispatchers"
      | "all_dispatchers"
      | "admins_only"
      | "leaders_trainers"
      | "trainers_only"
      | "clear",
  ) => {
    switch (preset) {
      case "verified_dispatchers": {
        setRoleGroups({ dispatchers: false, admins: false, leaders: false });
        setChecksFor(["dispatcher_verified"]);
        break;
      }
      case "all_dispatchers": {
        setRoleGroups({ dispatchers: true, admins: false, leaders: false });
        setChecksFor([
          "dispatcher_basic",
          "dispatcher_verified",
          "dispatcher_admin",
        ]);
        break;
      }
      case "admins_only": {
        setRoleGroups({ dispatchers: false, admins: true, leaders: false });
        setChecksFor(["admin", "regional_admin", "national_admin"]);
        break;
      }
      case "leaders_trainers": {
        setRoleGroups({ dispatchers: false, admins: false, leaders: true });
        setChecksFor(["pod_leader", "trainer"]);
        break;
      }
      case "trainers_only": {
        setRoleGroups({ dispatchers: false, admins: false, leaders: false });
        setChecksFor(["trainer"]);
        break;
      }
      case "clear": {
        setRoleGroups({ dispatchers: false, admins: false, leaders: false });
        setRoleChecks({});
        setSelectedUsers([]);
        break;
      }
    }
  };
  // Load profiles for user selection (authorized admins only)
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    (async () => {
      setProfilesLoading(true);
      setProfilesError(null);
      try {
        const res = await fetch("/api/admin/profiles", {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as {
          profiles?: Profile[];
        };
        const list = Array.isArray(json.profiles) ? json.profiles : [];
        if (!cancelled) {
          setSelectedProfiles(
            list
              .filter((p) => !!p.user_id)
              .map((p) => ({
                id: p.id,
                user_id: p.user_id,
                display_name: p.display_name,
                access_role: p.access_role,
              })),
          );
        }
      } catch (e: any) {
        if (cancelled || e?.name === "AbortError") return;
        setProfilesError(e?.message ?? "Failed to load users");
      } finally {
        if (!cancelled) setProfilesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);
  const toggleUser = (u: Pick<Profile, "user_id" | "display_name">) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((x) => x.user_id === u.user_id);
      if (exists) return prev.filter((x) => x.user_id !== u.user_id);
      return [...prev, u];
    });
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ids = selectedUsers.map((u) => u.user_id).filter(Boolean);
    const roles = AccessRoles.filter((r) => roleChecks[r]).map((r) => r);
    const groups = Object.entries(roleGroups)
      .filter(([, v]) => v)
      .map(([k]) => k) as any;
    onSend({
      title: title || undefined,
      body: body || undefined,
      level,
      channel: channel || undefined,
      link: link || undefined,
      sticky,
      ttlMinutes: ttlMinutes === "" ? null : Number(ttlMinutes),
      recipientUserIds: ids.length ? ids : undefined,
      roles: roles.length ? roles : undefined,
      groups: groups.length ? groups : undefined,
    });
  };
  if (!effectiveCanManage) {
    // UI-level gate: only show this form to users allowed to manage instructor/admin tasks.
    return (
      <p className="text-sm text-muted-foreground">
        You dont have permission to send notifications.
      </p>
    );
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-4">
        <span id="ttl-label" className="text-sm font-medium">
          TTL (minutes)
        </span>
        <Input
          className="w-36"
          value={ttlMinutes}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") setTtlMinutes("");
            else setTtlMinutes(Number(v) || "");
          }}
          aria-labelledby="ttl-label"
          inputMode="numeric"
          placeholder="e.g. 120"
        />
        <div className="flex items-center gap-2 mt-1.5">
          <Switch checked={sticky} onCheckedChange={setSticky} id="sticky" />
          <label htmlFor="sticky" className="text-sm">
            Sticky
          </label>
        </div>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between align-baseline">
        <div className="flex gap-3 flex-col md:flex-row md:items-end">
          <div>
            <span id="level-label" className="text-sm font-medium">
              Level
            </span>
            <Select value={level} onValueChange={(v) => setLevel(v as any)}>
              <SelectTrigger className="w-32" aria-labelledby="level-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <span id="channel-label" className="text-sm font-medium">
              Channel
            </span>
            <Select
              value={channel}
              onValueChange={(value) =>
                setChannel(value as NotificationChannel)
              }
            >
              <SelectTrigger className="w-44" aria-labelledby="channel-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NOTIFICATION_CHANNELS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {humanize(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <span id="link-label" className="text-sm font-medium">
              Link
            </span>
            <Input
              className="w-72"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              aria-labelledby="link-label"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <span className="text-sm font-medium">Title</span>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Subject/title of the notification"
        />
      </div>
      <div className="grid gap-2">
        <span className="text-sm font-medium">Body</span>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Message body"
        />
      </div>

      <div className="grid gap-2">
        <div className="text-sm font-medium">Recipients</div>
        <div className="text-xs text-muted-foreground">
          Select specific users (optional)
        </div>
        <div className="flex flex-col gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="min-w-64 justify-between"
              >
                {selectedUsers.length === 0
                  ? "Select users"
                  : `${selectedUsers.length} user${selectedUsers.length === 1 ? "" : "s"} selected`}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[420px]">
              <Command>
                <CommandInput
                  placeholder={
                    profilesLoading ? "Loading users..." : "Search users"
                  }
                  disabled={profilesLoading}
                />
                <CommandList>
                  {profilesError ? (
                    <CommandEmpty>{profilesError}</CommandEmpty>
                  ) : (
                    <>
                      <CommandEmpty>
                        {profilesLoading ? "Loading…" : "No users found"}
                      </CommandEmpty>
                      <CommandGroup>
                        {selectedProfiles.map((p) => {
                          const checked = !!selectedUsers.find(
                            (u) => u.user_id === p.user_id,
                          );
                          const value =
                            `${p.display_name ?? ""} ${p.user_id ?? ""} ${p.access_role ?? ""}`.trim();
                          return (
                            <CommandItem
                              key={p.user_id}
                              value={value}
                              onSelect={() =>
                                toggleUser({
                                  user_id: p.user_id,
                                  display_name: p.display_name,
                                })
                              }
                            >
                              <div className="flex items-center gap-2 w-full justify-between">
                                <div className="flex flex-col">
                                  <span className="font-normal">
                                    {p.display_name || p.user_id}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {p.access_role
                                      ? `${humanize(p.access_role)} • `
                                      : ""}
                                    {p.user_id}
                                  </span>
                                </div>
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={() =>
                                    toggleUser({
                                      user_id: p.user_id,
                                      display_name: p.display_name,
                                    })
                                  }
                                />
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedUsers.map((u) => (
              <Badge
                key={u.user_id}
                variant="outline"
                className="flex items-center gap-1"
              >
                {u.display_name || u.user_id}
                <button type="button" onClick={() => toggleUser(u)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="text-sm font-medium">Roles</div>
        <div className="text-xs text-muted-foreground">
          Select specific roles or use a preset below
        </div>
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="min-w-48 justify-between"
              >
                {selectedRoles.length === 0
                  ? "Select roles"
                  : `${selectedRoles.length} roles selected`}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-80">
              <Command>
                <CommandInput placeholder="Search roles" />
                <CommandList>
                  <CommandEmpty>No roles found</CommandEmpty>
                  <CommandGroup>
                    {AccessRoles.map((r) => {
                      const checked = !!roleChecks[r];
                      return (
                        <CommandItem
                          key={r}
                          onSelect={() =>
                            setRoleChecks((prev) => ({
                              ...prev,
                              [r]: !checked,
                            }))
                          }
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) =>
                                setRoleChecks((prev) => ({ ...prev, [r]: !!v }))
                              }
                            />
                            <span>{roleLabel(r as any)}</span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedRoles.map((r) => (
              <Badge
                key={r}
                variant="outline"
                className="flex items-center gap-1"
              >
                {roleLabel(r as any)}
                <button
                  type="button"
                  onClick={() =>
                    setRoleChecks((prev) => ({ ...prev, [r]: false }))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => applyPreset("verified_dispatchers")}
          >
            Verified Dispatchers
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => applyPreset("all_dispatchers")}
          >
            All Dispatchers
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => applyPreset("admins_only")}
          >
            Admins Only
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => applyPreset("leaders_trainers")}
          >
            Leaders + Trainers
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => applyPreset("trainers_only")}
          >
            Trainers Only
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyPreset("clear")}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Send Notification</Button>
      </div>
    </form>
  );
}
export default AdminNotificationForm;
