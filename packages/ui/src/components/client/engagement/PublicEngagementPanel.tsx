"use client";

import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { toast } from "sonner";
import { Copy, Download } from "lucide-react";
import { MultiTierMessages } from "./MultiTierMessages.tsx";
import { useDispatchStore } from "@workspace/store/dispatchStore";
import { generateMessages } from "@workspace/ui/lib/messageFormatter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import QRCode from "react-qr-code";
import { chunkMessage } from "@workspace/ui/lib/utils";
import * as htmlToImage from "html-to-image";

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
  const styles = Array.from(document.querySelectorAll("link[rel=stylesheet], style"))
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

export default function PublicEngagementPanel({ dispatchId }: { dispatchId: string }) {
  const { submissions } = useDispatchStore();
  const dispatch = submissions.find((s) => s.id === dispatchId);

  const [urgency, setUrgency] = useState("Within the Week");
  const [selectedTier, setSelectedTier] = useState<keyof ReturnType<typeof generateMessages>>("callout");

  if (!dispatch) {
    return <p className="text-muted-foreground">No dispatch found.</p>;
  }

  const msgs = generateMessages(dispatch, urgency);

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
              onValueChange={value =>
                setSelectedTier(value as keyof ReturnType<typeof generateMessages>)
              }
              value={selectedTier}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Choose message level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="callout">Community Callout 🧡</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="tldr">TL;DR</SelectItem>
              </SelectContent>
            </Select>

            {/* Download All Button */}
            {(selectedTier === "callout" || selectedTier === "detailed") && (
              <Button
                onClick={async () => {
                  const nodes = document.querySelectorAll(".share-card");
                  nodes.forEach((node, idx) =>
                    downloadCardAsPng(node as HTMLElement, `${selectedTier}-card-${idx + 1}.png`)
                  );
                }}
              >
                📥 Download All Cards
              </Button>
            )}

            {/* Multi-card for callout & detailed */}
            {(selectedTier === "callout" || selectedTier === "detailed") &&
              (selectedTier === "callout" ? msgs.calloutSections : msgs.detailedSections).map(
                (section, idx, arr) => (
                  <div
                    key={idx}
                    className="
                      share-card
                      w-full max-w-[500px]   /* responsive: shrink to screen, cap at 500px */
                      aspect-square          /* keep square ratio */
                      flex flex-col justify-between
                      bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
                      rounded-2xl shadow-2xl
                      p-6 text-center text-white
                    "
                  >
                    <div className="flex-1 flex flex-col justify-center items-center">
                      <h2 className="text-lg font-extrabold mb-4 drop-shadow-md">{section.title}</h2>
                      <p className="text-sm leading-snug font-semibold whitespace-pre-wrap max-w-[90%]">
                        {section.body}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <QRCode
                        value={REGION_PUBLIC_CHAT_URL}
                        size={60}
                        bgColor="transparent"
                        fgColor="#ffffff"
                      />
                      <span className="text-xs opacity-80">Scan to join public chat</span>
                      <span className="text-xs mt-2 opacity-70">
                        Card {idx + 1} of {arr.length}
                      </span>
                      {/* 🚫 excluded from export */}
                      <Button
                        size="sm"
                        className="mt-2 no-export"
                        onClick={() =>
                          downloadOrShareCard(
                            document.querySelectorAll(".share-card")[idx] as HTMLElement,
                            `${selectedTier}-card-${idx + 1}.png`
                          )
                        }
                      >
                        📲 Download / Share
                      </Button>

                    </div>
                  </div>
                )
              )}


            {/* Single-card for medium & tldr */}
            {(selectedTier === "medium" || selectedTier === "tldr") && (
              <div className="
                  share-card
                  w-full max-w-[500px]   /* responsive: shrink to screen, cap at 500px */
                  aspect-square          /* keep square ratio */
                  flex flex-col justify-between
                  bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
                  rounded-2xl shadow-2xl
                  p-6 text-center text-white
                ">
                <div className="flex-1 flex flex-col justify-center items-center">
                  <p className="text-lg leading-snug font-semibold whitespace-pre-wrap max-w-[90%]">
                    {selectedTier === "medium" ? msgs.medium : msgs.tldr}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <QRCode
                    value={REGION_PUBLIC_CHAT_URL}
                    size={80}
                    bgColor="transparent"
                    fgColor="#ffffff"
                  />
                  <span className="text-xs opacity-80">Scan to join public chat</span>
                  <span className="text-xs mt-2 opacity-70">1 of 1</span>
                  {/* 🚫 excluded from export */}
                  <Button
                    size="sm"
                    className="mt-2 no-export"
                    onClick={() =>
                      downloadOrShareCard(
                        document.querySelector(".share-card") as HTMLElement,
                        `${selectedTier}-card.png`
                      )
                    }
                  >
                    📲 Download / Share
                  </Button>

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
                    {msgs.calloutSections?.[3]?.body || msgs.detailedSections?.[3]?.body}
                  </p>
                </section>

                {/* Volunteers / How to Join */}
                <section>
                  <h2 className="text-2xl font-bold mb-2">How to Join</h2>
                  <p className="whitespace-pre-wrap">
                    {msgs.calloutSections?.[4]?.body || msgs.detailedSections?.[4]?.body}
                  </p>
                </section>
              </main>

              {/* Footer with QR */}
              <footer className="flex flex-col items-center mt-8">
                <QRCode
                  value={REGION_PUBLIC_CHAT_URL}
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