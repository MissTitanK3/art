import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Input } from "@workspace/ui/primitives/input";
import { Textarea } from "@workspace/ui/primitives/textarea";
import { Label } from "@workspace/ui/primitives/label";
import { LoadingButton } from "@workspace/ui/patterns/common/loading-button";
import { ErrorMessage } from "@workspace/ui/patterns/common/error-message";
import { DateTimePicker } from "@workspace/ui/patterns/common/date-time-picker";

type CampaignFormProps = {
  onSubmit: (data: {
    title: string;
    summary: string;
    artLink: string;
    startAt: string;
    endAt: string;
  }) => Promise<void>;
  loading: boolean;
  error: string | null;
};

export const CampaignForm: React.FC<CampaignFormProps> = ({
  onSubmit,
  loading,
  error,
}) => {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [artLink, setArtLink] = useState("");
  const [startAt, setStartAt] = useState<string>("");
  const [endAt, setEndAt] = useState<string>("");

  const handleSubmit = async () => {
    await onSubmit({ title, summary, artLink, startAt, endAt });
    setTitle("");
    setSummary("");
    setArtLink("");
    setStartAt("");
    setEndAt("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Campaign</CardTitle>
        <CardDescription>
          Launch a time-boxed Season visible in Frontiers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Winter Repair Drive"
            />
          </div>
          <div>
            <Label htmlFor="art">ART Link (optional)</Label>
            <Input
              id="art"
              value={artLink}
              onChange={(e) => setArtLink(e.target.value)}
              placeholder="https://alwaysreadytools.org/fundraisers/winter-drive"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Short description"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <DateTimePicker
              label="Start"
              value={startAt}
              onChange={setStartAt}
            />
          </div>
          <div>
            <DateTimePicker label="End" value={endAt} onChange={setEndAt} />
          </div>
        </div>
        <ErrorMessage message={error} />
        <div className="flex justify-end">
          <LoadingButton
            onClick={handleSubmit}
            isLoading={loading}
            disabled={!title.trim()}
          >
            Create Campaign
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  );
};
