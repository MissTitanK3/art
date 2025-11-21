import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { MarkdownPreview } from "@workspace/ui/components/markdown-preview";

interface MarkdownEditorProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  description?: string;
  className?: string;
}

export function MarkdownEditor({
  label,
  value = "",
  onChange,
  placeholder,
  description,
  className,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = React.useState("edit");
  return (
    <div className={cn("space-y-2", className)}>
      <div>
        <p className="font-medium text-sm">{label}</p>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-2"
      >
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <Textarea
            rows={8}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
          />
          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => onChange?.("")}
            >
              Clear
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="preview">
          <MarkdownPreview source={value} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MarkdownEditor;
