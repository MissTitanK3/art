"use client";
import { Switch } from "@workspace/ui/primitives/switch";
import { Badge } from "@workspace/ui/primitives/badge";
import { Button } from "@workspace/ui/primitives/button";
import { AtSign, Copy, Mail, Phone, Printer, Trash2 } from "lucide-react";
import type { AdvocacyGroup } from "@workspace/store/types/advocacy";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives";

interface AdvocacyGroupCardProps {
  group: AdvocacyGroup;
  canManage: boolean;
  copyText: (text: string, msg: string) => void | Promise<void>;
  openEmailForGroup: (group: AdvocacyGroup) => void | Promise<void>;
  toggleActive: (group: AdvocacyGroup, next: boolean) => void | Promise<void>;
  openRemoveModal: (group: AdvocacyGroup) => void;
  onEdit?: (group: AdvocacyGroup) => void;
}

export function AdvocacyGroupCard({
  group,
  canManage,
  copyText,
  openEmailForGroup,
  toggleActive,
  openRemoveModal,
  onEdit,
}: AdvocacyGroupCardProps) {
  return (
    <Card className="max-w-[420px] w-full flex-1">
      <CardHeader className="w-full">
        <CardTitle>{group.name}</CardTitle>
        <CardDescription className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col space-y-2">
              <div className="space-y-1 text-sm text-muted-foreground break-words">
                {group.jurisdiction ? (
                  <div>Coverage: {group.jurisdiction}</div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {group.type ? (
              <Badge variant="outline">{group.type.replace("_", " ")}</Badge>
            ) : null}
            {group.preferred_format ? (
              <Badge variant="secondary">
                {group.preferred_format.toUpperCase()}
              </Badge>
            ) : null}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex flex-col w-full justify-between h-full">
          <h3 className="text-lg font-semibold">Contact Emails</h3>
          <hr className="my-2" />
          <div className="flex flex-col gap-2 w-full mb-3 h-full">
            {group.contact_emails?.length ? (
              <div className="flex flex-col gap-3 mb-3 h-full">
                {group.contact_emails.length > 1 ? (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() =>
                      copyText(
                        group.contact_emails?.join(", ") ?? "",
                        "Emails copied"
                      )
                    }
                    disabled={!group.contact_emails?.length}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy all emails
                  </Button>
                ) : null}
                {group.contact_emails.map((email, idx) => (
                  <Button
                    key={`email-copy-${idx}`}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyText(email, "Email copied")}
                  >
                    <Copy className="mr-1 h-3 w-3" /> {email}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
          <h3 className="text-lg font-semibold">Contact Phones</h3>
          <hr className="my-2" />
          <div className="flex flex-col gap-2 w-full mb-3 h-full">
            {group.contact_phones?.length ? (
              <div className="flex flex-col gap-3 mb-3 h-full">
                {group.contact_phones.length > 1 ? (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() =>
                      copyText(
                        group.contact_phones?.join(", ") ?? "",
                        "Phone numbers copied"
                      )
                    }
                    disabled={!group.contact_phones?.length}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy all phones
                  </Button>
                ) : null}
                {group.contact_phones.map((phone, idx) => (
                  <Button
                    key={`phone-copy-${idx}`}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyText(phone, "Phone copied")}
                  >
                    <Copy className="mr-1 h-3 w-3" /> {phone}
                  </Button>
                ))}
              </div>
            ) : null}
            <h3 className="text-lg font-semibold">Contact Faxes</h3>
            <hr className="my-2" />
            <div className="flex flex-col gap-2 w-full mb-3 h-full">
              {group.contact_faxes?.length ? (
                <div className="flex flex-col gap-3 mb-3 h-full">
                  {group.contact_faxes.length > 1 ? (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() =>
                        copyText(
                          group.contact_faxes?.join(", ") ?? "",
                          "Fax numbers copied"
                        )
                      }
                      disabled={!group.contact_faxes?.length}
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy all faxes
                    </Button>
                  ) : null}
                  {group.contact_faxes.map((fax, idx) => (
                    <Button
                      key={`fax-copy-${idx}`}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyText(fax, "Fax copied")}
                    >
                      <Copy className="mr-1 h-3 w-3" /> {fax}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
            <h3 className="text-lg font-semibold">Contact Signal</h3>
            <hr className="my-2" />
            <div className="flex flex-col gap-2 w-full mb-3 h-full">
              {group.contact_signal?.length ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyText(group.contact_signal || "", "Signal copied")
                  }
                  disabled={!group.contact_signal}
                >
                  <Copy className="mr-2 h-4 w-4" /> {group.contact_signal}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
        {canManage ? (
          <div className="flex flex-col gap-2 w-full">
            <h3 className="text-lg font-semibold">Actions</h3>
            {onEdit ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEdit(group)}
              >
                Edit
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openRemoveModal(group)}
              aria-label={`Remove ${group.name}`}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Remove
            </Button>
            <div className="flex w-full items-center justify-center gap-2 md:w-auto">
              <Switch
                checked={group.active_status}
                onCheckedChange={(v) => toggleActive(group, v)}
              />
              <span className="text-sm">
                {group.active_status
                  ? "Available for Advocacy"
                  : "Not Available for Advocacy"}
              </span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
