import { useState, useEffect } from "react";

type CampaignRow = {
  id: string;
  title: string | null;
  region_id: string | null;
  start_at: string | null;
  end_at: string | null;
  summary: string | null;
  art_link: string | null;
};

export const useCampaigns = () => {
  const [items, setItems] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/campaigns", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { campaigns } = await res.json();
        setItems(Array.isArray(campaigns) ? campaigns : []);
      } catch {
        setItems([]);
      }
    };
    load();
  }, []);

  const createCampaign = async (data: {
    title: string;
    summary: string;
    artLink: string;
    startAt: string;
    endAt: string;
  }) => {
    setError(null);
    setLoading(true);
    try {
      const payload: any = { title: data.title.trim() };
      if (data.summary.trim()) payload.summary = data.summary.trim();
      if (data.artLink.trim()) payload.art_link = data.artLink.trim();
      if (data.startAt) payload.start_at = new Date(data.startAt).toISOString();
      if (data.endAt) payload.end_at = new Date(data.endAt).toISOString();
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const { campaign } = await res.json();
      setItems((prev) => [campaign, ...prev]);
    } catch (e: any) {
      setError(
        typeof e?.message === "string"
          ? e.message
          : "Failed to create campaign",
      );
    } finally {
      setLoading(false);
    }
  };

  return { items, loading, error, createCampaign };
};
