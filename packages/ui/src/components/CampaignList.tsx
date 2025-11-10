import React from "react";

type CampaignRow = {
  id: string;
  title: string | null;
  start_at: string | null;
  end_at: string | null;
};

interface CampaignListProps {
  campaigns: CampaignRow[];
}

export const CampaignList: React.FC<CampaignListProps> = ({ campaigns }) => {
  if (campaigns.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No campaigns yet</div>
    );
  }

  return (
    <ul className="space-y-2">
      {campaigns.map((c) => (
        <li key={c.id} className="text-sm">
          <span className="font-medium">{c.title || "Untitled"}</span>
          <span className="text-muted-foreground">
            {" "}
            — {c.start_at?.slice(0, 10)} → {c.end_at?.slice(0, 10)}
          </span>
        </li>
      ))}
    </ul>
  );
};
