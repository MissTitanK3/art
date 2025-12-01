"use client";

import {
  LayoutDashboard,
  GraduationCap,
  Eye,
  Package,
  HeartHandshake,
  Users,
  Settings,
  Truck,
  Calendar,
} from "lucide-react";
import NavTile from "@workspace/ui/components/nav-tile";

export function AppGrid() {
  const apps = [
    {
      label: "Academy",
      description: "Training & Certs",
      href: "/academy",
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      label: "Watch",
      description: "Live Map & Incidents",
      href: "/watch",
      icon: <Eye className="h-5 w-5" />,
    },
    {
      label: "Dispatches",
      description: "Mission Management",
      href: "/dispatches",
      icon: <Truck className="h-5 w-5" />,
    },
    {
      label: "Warehouse",
      description: "Inventory & Logistics",
      href: "/warehouse",
      icon: <Package className="h-5 w-5" />,
    },
    {
      label: "Meet a Need",
      description: "Volunteer Opportunities",
      href: "/meet-a-need",
      icon: <HeartHandshake className="h-5 w-5" />,
    },
    {
      label: "Roster",
      description: "Team Directory",
      href: "/roster",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Schedules",
      description: "Shift Management",
      href: "/schedules",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      label: "Admin",
      description: "System Settings",
      href: "/admin",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {apps.map((app) => (
        <NavTile
          key={app.href}
          href={app.href}
          icon={app.icon}
          label={app.label}
          description={app.description}
        />
      ))}
    </div>
  );
}
