"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/primitives/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/primitives/tabs";
import { Button } from "@workspace/ui/primitives/button";
import { toast } from "sonner";
import { Copy, Download, Share2 } from "lucide-react";
import { MultiTierMessages } from "@workspace/ui/patterns/features/engagement/multi-tier-messages";
import { generateMessages } from "@workspace/ui/lib/message-formatter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import QRCode from "react-qr-code";
import * as htmlToImage from "html-to-image";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";

async function downloadCardAsPng(node: HTMLElement, filename: string) {
  try {
    const dataUrl = await htmlToImage.toPng(node, {
      cacheBust: true,
      filter: (el) => !el.classList?.contains("no-export"), // 🚫 skip no-export
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
  } catch (err) {
    console.error("Failed to download image:", err);
  }
}

async function shareCard(node: HTMLElement, filename: string) {
  try {
    const dataUrl = await htmlToImage.toPng(node, {
      cacheBust: true,
      filter: (el) => !el.classList?.contains("no-export"),
    });

    // Convert data URL → Blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: "image/png" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: "Community Call",
        text: "Join our community support effort!",
        files: [file],
      });
    } else {
      toast.error("Sharing not supported on this device");
    }
  } catch (err) {
    console.error("Failed to share:", err);
    toast.error("Failed to share card");
  }
}

export async function downloadOrShareCard(node: HTMLElement, filename: string) {
  try {
    const dataUrl = await htmlToImage.toPng(node, {
      cacheBust: true,
      filter: (el) => !el.classList?.contains("no-export"), // skip download buttons
    });

    // Convert data URL → Blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: "image/png" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      // Mobile share flow
      await navigator.share({
        title: "Community Call",
        text: "Join our community support effort!",
        files: [file],
      });
    } else {
      // Fallback: trigger download
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      link.click();
    }
  } catch (err) {
    console.error("Failed to download/share:", err);
  }
}

function printFlyer() {
  const flyer = document.querySelector(".flyer") as HTMLElement;
  if (!flyer) return;

  const win = window.open("", "_blank");
  if (!win) return;

  // Copy <link> and <style> tags from parent into print window
  const styles = Array.from(
    document.querySelectorAll("link[rel=stylesheet], style")
  )
    .map((el) => el.outerHTML)
    .join("\n");

  win.document.write(`
    <html>
      <head>
        <title>Flyer</title>
        ${styles}
        <style>
          @page { size: 8.5in 11in; margin: 0; }
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>${flyer.outerHTML}</body>
    </html>
  `);

  win.document.close();
  win.focus();

  // Give it a moment to apply styles before printing
  setTimeout(() => {
    win.print();
    win.close();
  }, 500);
}

export const REGION_PUBLIC_CHAT_URL =
  "https://signal.group/#public_example_region_chat";

function CopyButton({ text }: { text: string }) {
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };
  return (
    <Button variant="outline" size="sm" onClick={copy}>
      <Copy className="w-4 h-4 mr-1" /> Copy
    </Button>
  );
}

type PublicEngagementPanelProps = {
  submission: DispatchSubmission;
};

export default function PublicEngagementPanel({
  submission,
}: PublicEngagementPanelProps) {
  const [urgency, setUrgency] = useState("Within the Week");
  const [selectedTier, setSelectedTier] =
    useState<keyof ReturnType<typeof generateMessages>>("callout");

  const msgs = useMemo(
    () => generateMessages(submission, urgency),
    [submission, urgency]
  );
  const publicChatUrl = useMemo(() => {
    if (submission.public_signal_link) return submission.public_signal_link;
    try {
      const payload = JSON.parse(submission.encrypted_payload || "{}");
      return payload?.public_signal_link || REGION_PUBLIC_CHAT_URL;
    } catch {
      return REGION_PUBLIC_CHAT_URL;
    }
  }, [submission.public_signal_link, submission.encrypted_payload]);

  return (
    <Tabs defaultValue="messaging" className="flex-1">
      <TabsList>
        <TabsTrigger value="messaging">Messaging</TabsTrigger>
        <TabsTrigger value="images">Images</TabsTrigger>
        <TabsTrigger value="flyers">Flyers</TabsTrigger>
      </TabsList>

      <TabsContent value="messaging">
        <Card>
          <CardHeader>
            <CardTitle>Messaging Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiTierMessages
              msgs={msgs}
              urgency={urgency}
              setUrgency={setUrgency}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="images">
        <Card>
          <CardHeader>
            <CardTitle>Social Media Image Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex flex-col items-center">
            <Select
              onValueChange={(value) =>
                setSelectedTier(
                  value as keyof ReturnType<typeof generateMessages>
                )
              }
              value={selectedTier}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Choose message level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="callout">Community Callout 🧡</SelectItem>
                <SelectItem value="volunteerCallout">
                  Volunteer Callout 🧡
                </SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="tldr">TL;DR</SelectItem>
              </SelectContent>
            </Select>

            {/* Download All Button */}
            {(selectedTier === "callout" ||
              selectedTier === "volunteerCallout" ||
              selectedTier === "detailed" ||
              selectedTier === "medium") && (
              <Button
                onClick={async () => {
                  const nodes = document.querySelectorAll(".share-card");
                  nodes.forEach((node, idx) => {
                    downloadCardAsPng(
                      node as HTMLElement,
                      `${selectedTier}-card-${idx + 1}.png`
                    );
                  });
                }}
              >
                📥 Download All Cards
              </Button>
            )}

            {/* Multi-card for callout, volunteerCallout & detailed */}
            {(selectedTier === "callout" ||
              selectedTier === "volunteerCallout" ||
              selectedTier === "detailed") &&
              (selectedTier === "callout"
                ? msgs.calloutSections
                : selectedTier === "volunteerCallout"
                  ? msgs.volunteerCalloutSections
                  : msgs.detailedSections
              ).map((section, idx, arr) => (
                <div
                  key={idx}
                  className="
                      share-card
                      w-full max-w-[500px]
                      aspect-square
                      flex flex-col justify-between
                      bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
                      rounded-2xl shadow-2xl
                      p-8 text-center text-white
                    "
                >
                  <div className="flex-1 flex flex-col justify-center items-center">
                    <h2 className="text-lg font-extrabold mb-4 drop-shadow-md">
                      {section.title}
                    </h2>
                    <p className="text-sm leading-snug font-semibold whitespace-pre-wrap max-w-[90%]">
                      {section.body}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <QRCode
                      value={publicChatUrl}
                      size={60}
                      bgColor="transparent"
                      fgColor="#ffffff"
                    />
                    <span className="text-xs opacity-80">
                      Scan to join public chat
                    </span>
                    <span className="text-xs opacity-70">
                      Card {idx + 1} of {arr.length}
                    </span>
                    <div className="flex gap-2 mt-6 no-export">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          downloadCardAsPng(
                            document.querySelectorAll(".share-card")[
                              idx
                            ] as HTMLElement,
                            `${selectedTier}-card-${idx + 1}.png`
                          )
                        }
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          shareCard(
                            document.querySelectorAll(".share-card")[
                              idx
                            ] as HTMLElement,
                            `${selectedTier}-card-${idx + 1}.png`
                          )
                        }
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

            {/* Multi-card for medium */}
            {selectedTier === "medium" &&
              msgs.mediumSections.map((section, idx, arr) => (
                <div
                  key={idx}
                  className="
                      share-card
                      w-full max-w-[500px]
                      aspect-square
                      flex flex-col justify-between
                      bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
                      rounded-2xl shadow-2xl
                      p-8 text-center text-white
                    "
                >
                  <div className="flex-1 flex flex-col justify-center items-center gap-4">
                    <h2 className="text-2xl font-extrabold drop-shadow-md uppercase tracking-wide">
                      {section.title}
                    </h2>
                    <p className="text-base leading-relaxed font-semibold whitespace-pre-wrap max-w-[90%]">
                      {section.body}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <QRCode
                      value={publicChatUrl}
                      size={70}
                      bgColor="transparent"
                      fgColor="#ffffff"
                    />
                    <span className="text-xs opacity-80">
                      Scan to join public chat
                    </span>
                    <span className="text-xs opacity-70">
                      Card {idx + 1} of {arr.length}
                    </span>
                    <div className="flex gap-2 mt-6 no-export">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          downloadCardAsPng(
                            document.querySelectorAll(".share-card")[
                              idx
                            ] as HTMLElement,
                            `medium-card-${idx + 1}.png`
                          )
                        }
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          shareCard(
                            document.querySelectorAll(".share-card")[
                              idx
                            ] as HTMLElement,
                            `medium-card-${idx + 1}.png`
                          )
                        }
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

            {/* Single large-text card for tldr */}
            {selectedTier === "tldr" && (
              <div
                className="
                  share-card
                  w-full max-w-[500px]
                  aspect-square
                  flex flex-col justify-between
                  bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
                  rounded-2xl shadow-2xl
                  p-8 text-center text-white
                "
              >
                <div className="flex-1 flex flex-col justify-center items-center gap-6">
                  <h2 className="text-3xl font-extrabold drop-shadow-md uppercase tracking-wide leading-tight">
                    {msgs.tldrSection.title}
                  </h2>
                  <p className="text-xl leading-relaxed font-bold whitespace-pre-wrap">
                    {msgs.tldrSection.body}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <QRCode
                    value={publicChatUrl}
                    size={100}
                    bgColor="transparent"
                    fgColor="#ffffff"
                  />
                  <span className="text-sm opacity-90 font-semibold">
                    Scan to join
                  </span>
                  <span className="text-xs opacity-70">1 of 1</span>
                  <div className="flex gap-2 mt-6 no-export">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        downloadCardAsPng(
                          document.querySelector(".share-card") as HTMLElement,
                          `tldr-card.png`
                        )
                      }
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        shareCard(
                          document.querySelector(".share-card") as HTMLElement,
                          `tldr-card.png`
                        )
                      }
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="flyers">
        <Card>
          <CardHeader>
            <CardTitle>Flyers & Press Kits</CardTitle>
            {/* Print button */}
            <Button onClick={printFlyer} className="mt-4 no-print">
              🖨️ Print / Save as PDF
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Printable one-pagers with QR codes and outreach material.
            </p>

            {/* Flyer sheet */}
            <div
              className="
                flyer
                w-full max-w-[8.5in] h-auto
                bg-white text-black
                shadow-xl border
                mx-auto flex flex-col justify-between
                p-6 sm:p-12
                print:shadow-none print:border-none print:w-[8.5in] print:h-[11in]
              "
            >
              {/* Header */}
              <header className="text-center">
                <h1 className="text-4xl font-extrabold uppercase tracking-wide mb-2">
                  Community Call
                </h1>
                <p className="text-lg font-semibold">
                  {msgs.calloutSections?.[0]?.body || msgs.medium}
                </p>
              </header>

              {/* Body */}
              <main className="flex-1 mt-8 space-y-6 text-lg leading-relaxed">
                {/* Dispatch Message / Event Details */}
                <section>
                  <h2 className="text-2xl font-bold mb-2">Event Details</h2>
                  <p className="whitespace-pre-wrap">
                    {msgs.calloutSections?.[1]?.body || msgs.medium}
                  </p>
                </section>

                {/* Actions */}
                <section>
                  <h2 className="text-2xl font-bold mb-2">Intended Actions</h2>
                  <p className="whitespace-pre-wrap">
                    {msgs.calloutSections?.[2]?.body || "• Community presence"}
                  </p>
                </section>

                {/* Roles */}
                <section>
                  <h2 className="text-2xl font-bold mb-2">Roles Needed</h2>
                  <p className="whitespace-pre-wrap">
                    {msgs.calloutSections?.[3]?.body ||
                      msgs.detailedSections?.[3]?.body}
                  </p>
                </section>

                {/* Volunteers / How to Join */}
                <section>
                  <h2 className="text-2xl font-bold mb-2">How to Join</h2>
                  <p className="whitespace-pre-wrap">
                    {msgs.calloutSections?.[4]?.body ||
                      msgs.detailedSections?.[4]?.body}
                  </p>
                </section>
              </main>

              {/* Footer with QR */}
              <footer className="flex flex-col items-center mt-8">
                <QRCode
                  value={publicChatUrl}
                  size={160}
                  bgColor="transparent"
                  fgColor="#000000"
                />
                <p className="mt-2 text-base font-semibold">
                  Scan to join the public chat
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Powered by Always Ready Tools
                </p>
              </footer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
