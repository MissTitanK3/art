import {
  DISPATCH_TYPE_LABELS,
  DISPATCH_TYPE_VARIANTS,
  DispatchType,
} from "@workspace/store/types/dispatch.ts";
import { Badge } from "@workspace/ui/components/badge";

export function DispatchTypeBadge({ type }: { type: DispatchType }) {
  return (
    <Badge variant={DISPATCH_TYPE_VARIANTS[type]}>
      {DISPATCH_TYPE_LABELS[type]}
    </Badge>
  );
}
