"use client";

import type { ReactNode } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/primitives/tabs";

import type { OrgTabKey } from "./types";

type OrgTabsProps = {
  value: OrgTabKey;
  onValueChange: (value: OrgTabKey) => void;
  podsCount?: number;
  membersCount?: number;
  pollsCount?: number;
  overviewPanel: ReactNode;
  teamPanel: ReactNode;
  pollsPanel: ReactNode;
  settingsPanel: ReactNode;
};

const normalizeTabKey = (tab: OrgTabKey) =>
  tab === "pods" || tab === "members" ? "team" : tab;

export function OrgTabs({
  value,
  onValueChange,
  podsCount = 0,
  membersCount = 0,
  pollsCount = 0,
  overviewPanel,
  teamPanel,
  pollsPanel,
  settingsPanel,
}: OrgTabsProps) {
  const normalizedValue = normalizeTabKey(value);

  return (
    <Tabs
      value={normalizedValue}
      onValueChange={(next) => onValueChange(next as OrgTabKey)}
      className="space-y-4"
    >
      <TabsList className="grid md:grid-cols-4 h-full w-full gap-2">
        <TabsTrigger value="overview" className="h-full w-full">
          Overview
        </TabsTrigger>
        <TabsTrigger value="team" className="h-full w-full">
          Pods {podsCount} & Members {membersCount}
        </TabsTrigger>
        <TabsTrigger value="polls" className="h-full w-full">
          Polls {pollsCount}
        </TabsTrigger>
        <TabsTrigger value="settings" className="h-full w-full">
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">{overviewPanel}</TabsContent>
      <TabsContent value="team">{teamPanel}</TabsContent>
      <TabsContent value="polls">{pollsPanel}</TabsContent>
      <TabsContent value="settings">{settingsPanel}</TabsContent>
    </Tabs>
  );
}
