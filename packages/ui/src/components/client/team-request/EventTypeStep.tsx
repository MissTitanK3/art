import { TEAM_CONFIG_PRESETS } from "@workspace/store/types/roles.ts";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { humanize } from "@workspace/ui/lib/utils";

interface EventTypeStepProps {
  onBack: () => void;
  onNext: (data: { eventType: keyof typeof TEAM_CONFIG_PRESETS }) => void;
}

export function EventTypeStep({ onBack, onNext }: EventTypeStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Select Event Type</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 grid-cols-1 md:grid-cols-3">
        {Object.keys(TEAM_CONFIG_PRESETS).map((type) => (
          <Button
            key={type}
            variant="outline"
            onClick={() => onNext({ eventType: type as keyof typeof TEAM_CONFIG_PRESETS })}
          >
            {humanize(type)}
          </Button>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </CardFooter>
    </Card>
  );
}
