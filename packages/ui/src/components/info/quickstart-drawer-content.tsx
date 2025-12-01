import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Eye,
  GraduationCap,
  Shield,
} from "lucide-react";
import { DrawerDescription, DrawerHeader, DrawerTitle } from "../drawer";

export default function QuickStartDrawerContent() {
  const Item = ({
    icon,
    title,
    children,
  }: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="flex gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <h3 className="font-semibold leading-6">{title}</h3>
        <div className="text-sm text-muted-foreground mt-1">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <DrawerHeader>
        <DrawerTitle>Quick Start Understanding</DrawerTitle>
        <DrawerDescription>
          Short explainers for the main sections of your region.
        </DrawerDescription>
      </DrawerHeader>
      <div className="max-h-[50dvh] overflow-y-auto px-4 pb-4 space-y-5">
        <Item icon={<GraduationCap className="h-5 w-5" />} title="Academy">
          The Academy is your training hub for learning how this platform and
          your region operate. Courses are self‑paced and cover both
          fundamentals and role‑specific practices so you can onboard quickly.
          As you complete modules, you earn credentials that unlock permissions
          and responsibilities in other areas of the app. Returning users can
          use the Academy for refreshers or to track progress toward advanced
          qualifications.
        </Item>

        <Item icon={<Shield className="h-5 w-5" />} title="Admin">
          The Admin area provides region‑level oversight and configuration tools
          for authorized administrators. Use it to review activity, access audit
          trails, manage reports, and keep operations compliant with local
          policies. From here you can tune integrations, branding, and feature
          availability so the platform matches your needs. Access is restricted
          to protect sensitive settings while preserving transparency for
          coordinators.
        </Item>

        <Item icon={<Eye className="h-5 w-5" />} title="Watch">
          Watch is a live map for situational awareness across your region.
          Layers and filters help you focus on relevant reports, signals, and
          activity as conditions change. It’s useful for real‑time monitoring,
          early triage, and spotting patterns before they turn into dispatches.
          Teams can use Watch during operations briefings to align on what’s
          happening right now.
        </Item>

        <Item
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="Confirmed Watch"
        >
          Confirmed Watch highlights reports that coordinators have reviewed and
          verified for accuracy. This view reduces noise and uncertainty so
          on‑the‑ground teams can act with confidence. It lives inside Watch as
          a filter or dedicated layer rather than a separate tool. Use it when
          you need a trusted baseline for decisions or public communication.
        </Item>

        <Item icon={<ClipboardList className="h-5 w-5" />} title="Dispatches">
          Dispatches is the intake‑to‑action pipeline that moves a report from
          first contact to resolution. Coordinators triage submissions, set
          status, and record intended actions so everyone sees the current plan.
          Roles and staffing needs are tracked here, and updates form the
          running incident log for handoffs. Use Dispatches to keep decisions
          visible, responsibilities clear, and progress easy to audit.
        </Item>

        <Item icon={<BookOpen className="h-5 w-5" />} title="How to Use">
          The How‑to guide is a built‑in reference for new and experienced
          volunteers. It contains standard operating procedures, role
          definitions, and best practices for using the platform safely. Unlike
          the Academy, which is for training, the How‑to guide is designed for
          quick lookups during active operations. Keep it handy when you need to
          verify a protocol or find a resource.
        </Item>
      </div>
    </div>
  );
}
