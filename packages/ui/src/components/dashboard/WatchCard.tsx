"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Eye, AlertTriangle, MapPin } from "lucide-react";
import type { WizardReport } from "@workspace/store/types/watch";
import { formatDistanceToNow } from "date-fns";

export function WatchCard() {
  const [reports, setReports] = useState<WizardReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        // Fetch latest 5 reports, including test reports to ensure we see recent activity
        const res = await fetch("/api/watch/reports?limit=5&includeTests=true");
        const data = await res.json();
        if (data.reports) {
          const reportsWithLocation = await Promise.all(
            data.reports.map(async (report: WizardReport) => {
              if (
                !report.location?.address &&
                report.location?.lat &&
                report.location?.lng
              ) {
                try {
                  const geoRes = await fetch(
                    `/api/reverse-geocode?lat=${report.location.lat}&lng=${report.location.lng}`
                  );
                  const geoData = await geoRes.json();
                  if (geoData.address) {
                    // Format address object to string
                    const addr = geoData.address;
                    const formattedAddress = [addr.city, addr.state]
                      .filter(Boolean)
                      .join(", ");

                    return {
                      ...report,
                      location: {
                        ...report.location,
                        address:
                          formattedAddress ||
                          addr.country ||
                          "Unknown Location",
                      },
                    };
                  }
                } catch (err) {
                  console.warn("Failed to reverse geocode", err);
                }
              }
              return report;
            })
          );
          setReports(reportsWithLocation);
        }
      } catch (e) {
        console.error("Failed to fetch watch reports", e);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Active Watch</CardTitle>
        <Eye className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-md dark:bg-red-900/20">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {report.agency_type?.join(", ") ||
                      report.agency_other ||
                      "Unknown Incident"}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <MapPin className="h-3 w-3" />{" "}
                    {report.location?.address || "Unknown Location"}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="destructive"
                      className="text-[10px] px-1 py-0 h-5"
                    >
                      Active
                    </Badge>
                    {report.test && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 h-5 border-amber-500 text-amber-500"
                      >
                        TEST
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {report.timestamp
                        ? formatDistanceToNow(new Date(report.timestamp), {
                            addSuffix: true,
                          })
                        : "Unknown time"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center text-muted-foreground">
            <Eye className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">No active incidents</p>
          </div>
        )}
        <Button variant="outline" size="sm" className="w-full mt-4">
          View Live Map
        </Button>
      </CardContent>
    </Card>
  );
}
