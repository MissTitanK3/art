"use client";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "@workspace/ui/primitives/button";
import { Input } from "@workspace/ui/primitives/input";
import { Textarea } from "@workspace/ui/primitives/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/primitives/dialog";
import { Copy, Send } from "lucide-react";
import type { DetaineeIntake } from "@workspace/ui/types/missing-person-intake";
import type { AdvocacyGroup } from "@workspace/store/types/advocacy";

interface AdvocacyEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  records: DetaineeIntake[];
  loadingRecords: boolean;
  selectedCaseId: string;
  onCaseSelect: (caseId: string) => void;
  emailSubject: string;
  setEmailSubject: Dispatch<SetStateAction<string>>;
  emailBody: string;
  setEmailBody: Dispatch<SetStateAction<string>>;
  copyText: (text: string, msg: string) => void | Promise<void>;
  openMailClient: () => void;
  emailTarget: AdvocacyGroup | null;
}

export function AdvocacyEmailDialog({
  open,
  onOpenChange,
  records,
  loadingRecords,
  selectedCaseId,
  onCaseSelect,
  emailSubject,
  setEmailSubject,
  emailBody,
  setEmailBody,
  copyText,
  openMailClient,
  emailTarget,
}: AdvocacyEmailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground max-h-2/3 overflow-y-auto max-w-2xl m-auto">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
          <DialogDescription>
            Select a missing person record to include in the message. You can
            review and edit before sending.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Select value={selectedCaseId || undefined} onValueChange={onCaseSelect}>
              <SelectTrigger>
                <SelectValue
                  placeholder={loadingRecords ? "Loading records…" : "Select record"}
                />
              </SelectTrigger>
              <SelectContent>
                {records.map((r) => (
                  <SelectItem key={r.caseId} value={r.caseId}>
                    {(r.fullName || r.caseId) as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
          </div>
          <Textarea
            className="min-h-[200px]"
            placeholder="Message body"
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyText(emailSubject, "Subject copied")}
              disabled={!emailSubject}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy Subject
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyText(emailBody, "Body copied")}
              disabled={!emailBody}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy body
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={openMailClient}
              disabled={!emailTarget || !emailBody}
            >
              <Send className="mr-2 h-4 w-4" /> Open email client
            </Button>
          </div>
        </div>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}
