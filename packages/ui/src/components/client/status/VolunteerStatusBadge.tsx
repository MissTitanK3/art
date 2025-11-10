import { Badge } from "@workspace/ui/components/badge";
import {
  DispatchPersonnelStatus,
  STATUS_COLOR_CLASSES,
  STATUS_INFO,
} from "@workspace/ui/lib/constants/dispatch";

export default function VolunteerStatusBadge({
  status,
}: {
  status: DispatchPersonnelStatus;
}) {
  const info = STATUS_INFO[status];
  const classes = STATUS_COLOR_CLASSES[status];

  if (!info) {
    return <Badge className="bg-gray-500 text-white">Unknown</Badge>;
  }

  return <Badge className={classes}>{info.label}</Badge>;
}
