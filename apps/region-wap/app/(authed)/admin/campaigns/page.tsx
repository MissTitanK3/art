"use client";

import { CampaignForm } from "@workspace/ui/components/CampaignForm";
import { useCampaigns } from "@workspace/ui/hooks/useCampaigns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export default function CampaignsAdminPage() {
  const { items, loading, error, createCampaign } = useCampaigns();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Seasonal Campaigns</h1>

      <CampaignForm onSubmit={createCampaign} loading={loading} error={error} />

      <Card>
        <CardHeader>
          <CardTitle>Upcoming & Active</CardTitle>
          <CardDescription>Campaigns in or ahead of window</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No campaigns yet
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((c) => (
                <li key={c.id} className="text-sm">
                  <span className="font-medium">{c.title || "Untitled"}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — {c.start_at?.slice(0, 10)} → {c.end_at?.slice(0, 10)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
