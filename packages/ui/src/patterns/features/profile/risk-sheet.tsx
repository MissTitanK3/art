"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/primitives/sheet";
import { Button } from "@workspace/ui/primitives/button";

const RISK_QUESTIONS = {
  practical: [
    "Am I aware that my actions may result in arrest, injury, or surveillance?",
    "Do I have someone I trust who knows where I’ll be and can check in on me?",
    "Do I have a plan if I lose access to my phone or ID?",
    "Do I have medical needs or medication I need to prepare for?",
    "Am I aware of who to contact if something goes wrong?",
    "Do I know what kind of legal support is available, if needed?",
    "Have I signed a medical, financial, and property power of attorney?",
    "Do I have a plan or designated person to take care of friends, family, and pets if I cannot fulfill those duties?",
    "Do I have a life insurance policy to cover any potential costs related to this work?",
    "Do I have secure ways to communicate with my team and loved ones if things go sideways?",
    "Have I stored my emergency contacts and critical info somewhere accessible (but secure)?",
    "Do I know what to do if someone around me is injured, detained, or traumatized?",
    "Am I carrying only what I need, with no unnecessary or identifying items that could put me or others at risk?",
  ],
  commitment: [
    "Where do I draw the line and retreat?",
    "If I have no retreat in me, am I prepared for what that means? (To be clear, that means death.)",
    "As I activate, the team members to my left and right are counting on me to stay by their side until everyone is prepared to retreat. Do I understand what that signal looks like and how to retreat while maintaining cover?",
    "Can I recognize the difference between courage and recklessness, and act accordingly?",
    "Do I trust my team enough to follow or give orders under pressure?",
    "If a teammate falters, do I have the resolve and clarity to support or carry them?",
    "Am I capable of walking away when that is the safest and strongest choice, even if others do not?",
  ],
};

export function RiskSheet({ onViewed }: { onViewed: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) onViewed();
      }}
    >
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Review Risk Expectations
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="p-4 max-w-3xl m-auto bg-secondary text-foreground overflow-auto h-3/4"
      >
        <SheetHeader>
          <SheetTitle>Field Risk Awareness</SheetTitle>
          <SheetDescription>
            Review each section carefully before acknowledging fieldwork risks.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-4 text-sm mb-10">
          <div>
            <h3 className="font-bold ">✅ Practical Preparedness</h3>
            <ul className="list-disc pl-8 space-y-2">
              {RISK_QUESTIONS.practical.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold ">🔥 Commitment & Consequence</h3>
            <ul className="list-disc pl-8 space-y-2">
              {RISK_QUESTIONS.commitment.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
