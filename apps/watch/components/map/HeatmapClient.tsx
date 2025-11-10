"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AGENCY_OPTIONS } from "@/constants/agencies";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Report } from "@/types/wizard";
import { useTranslations } from "@/lib/il8n/useTranslations";
import { TranslationKey } from "@/lib/il8n/translations";
import TimeRangeSlider from "@/components/TimeRangeSlider";
import { LatLngExpression } from "leaflet";
import { useFindMe } from "@/lib/useFindMe";
import TileLayerDropdown from "./TileLayerDropdown";
import LinkButton from "../ui/FrostedLink";
import { FrostedButton } from "../ui/FrostedButton";
import { CheckCircle } from "lucide-react";

const Map = dynamic(() => import("@/components/map/HeatLayer"), { ssr: false });

function filterReports(
  reports: Report[],
  timeRange: [number, number],
  agencyFilter: string[],
) {
  const isAllActive = agencyFilter.length === 0;
  const now = Date.now();

  return reports.filter((r) => {
    const ageHr = (now - new Date(r.timestamp).getTime()) / (1000 * 60 * 60);
    const matchesTime = ageHr >= timeRange[0] && ageHr <= timeRange[1];
    const matchesAgency =
      isAllActive || r.agency_type.some((a) => agencyFilter.includes(a));
    const hasLocation =
      r.location &&
      typeof r.location.lat === "number" &&
      typeof r.location.lng === "number";
    return matchesTime && matchesAgency && hasLocation;
  });
}

export default function HeatmapClient() {
  const { t } = useTranslations();
  const [agencyFilter, setAgencyFilter] = useState<string[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [visibleReports, setVisibleReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 168]);
  const [center, setCenter] = useState<LatLngExpression | null>([
    37.7749, -122.4194,
  ]); // default: SF or whatever fallback you prefer

  const { handleFindMe } = useFindMe((coords) => {
    setCenter(coords);
  });

  const [filtersOpen, setFiltersOpen] = useState(false);

  const isAllActive = agencyFilter.length === 0;

  useEffect(() => {
    // Attempt to load stored agency filter from localStorage
    const storedAgency = localStorage.getItem("agencyFilter");
    if (storedAgency) setAgencyFilter(JSON.parse(storedAgency));

    // Fire location lookup
    handleFindMe();

    // Load reports from API
    async function fetchReports() {
      try {
        const res = await fetch("/api/wizard");
        const json = await res.json();
        if (json.wizard) {
          setReports(json.wizard);
          const initialFiltered = filterReports(
            json.wizard,
            timeRange,
            agencyFilter,
          );
          setVisibleReports(initialFiltered);
        } else {
          console.error(json.error);
        }
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("agencyFilter", JSON.stringify(agencyFilter));
  }, [agencyFilter]);

  useEffect(() => {
    const filtered = filterReports(reports, timeRange, agencyFilter);
    setVisibleReports(filtered);
  }, [agencyFilter, timeRange, reports]);

  return (
    <div className="space-y-4 w-full text-center">
      <div className="flex justify-evenly">
        <LinkButton
          size="2xl"
          variant="red"
          label={t("quickExit")}
          href="https://wikipedia.org"
        />
      </div>

      <h2 className="text-2xl font-bold">{t("reportTitle")}</h2>

      <div className="flex gap-4 flex-wrap items-center w-full">
        <TimeRangeSlider
          reports={reports}
          onChange={(range) => {
            setTimeRange(range);
          }}
        />
      </div>

      {/* Backdrop */}
      {filtersOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          role="button"
          tabIndex={0}
          aria-label="Close filters"
          onClick={() => setFiltersOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFiltersOpen(false);
            }
          }}
        />
      )}

      {/* Sidepanel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-80 bg-white/10 backdrop-blur-md border-l border-white/20 shadow-xl transition-transform duration-300 ${
          filtersOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">
              {t("filterAgencies")}
            </h2>
            <button
              onClick={() => setFiltersOpen(false)}
              className="text-white/70 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Your filter buttons go here */}
          <div className="grid grid-cols-1 gap-2">
            {AGENCY_OPTIONS.map((agency) => {
              const isActive = isAllActive || agencyFilter.includes(agency);

              return (
                <FrostedButton
                  key={agency}
                  onClick={() => {
                    if (isAllActive) {
                      setAgencyFilter([agency]);
                    } else if (agencyFilter.includes(agency)) {
                      setAgencyFilter(agencyFilter.filter((a) => a !== agency));
                    } else {
                      setAgencyFilter([...agencyFilter, agency]);
                    }
                  }}
                  variant={isActive ? "primary" : "secondary"}
                  size="md"
                  className="w-full flex items-center justify-between"
                >
                  <span>{t(`agency.${agency}` as TranslationKey)}</span>
                  {isActive && (
                    <CheckCircle className="w-5 h-5 text-blue-300" />
                  )}
                </FrostedButton>
              );
            })}
            <FrostedButton
              onClick={() => setAgencyFilter([])}
              variant="red"
              size="md"
              className="w-full mt-2"
            >
              {t("resetFilters") ?? "Reset Filters"}
            </FrostedButton>
          </div>
        </div>
      </div>

      <div className="flex gap-1 w-full justify-evenly">
        <FrostedButton onClick={() => setFiltersOpen(true)}>
          {t("filterAgencies")}
        </FrostedButton>
      </div>
      {loading || !center ? (
        <LoadingSpinner text="Loading reports…" />
      ) : (
        <Map reports={visibleReports} center={center} />
      )}

      <p className="text-xs text-gray-500 max-w-md pt-2">{t("warning")}</p>
    </div>
  );
}
