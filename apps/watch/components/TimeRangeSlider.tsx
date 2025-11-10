"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Range } from "react-range";
import { FrostedButton } from "./ui/FrostedButton";
import { useTranslations } from "@/lib/il8n/useTranslations";

const MAX = 168;
const STEP = 4;

type Props = {
  reports?: { timestamp: string }[];
  onChange: (range: [number, number]) => void;
  value?: [number, number];
};

export default function TimeRangeSlider({ onChange, value }: Props) {
  const searchParams = useSearchParams();
  const { t } = useTranslations();
  const router = useRouter();

  const parseIntOrDefault = (value: string | null, fallback: number) =>
    Math.max(0, Math.min(MAX, parseInt(value || "", 10) || fallback));

  const initialFrom = parseIntOrDefault(searchParams.get("from"), 0);
  const initialTo = parseIntOrDefault(searchParams.get("to"), MAX);
  const derivedInitial: [number, number] = [
    Math.min(initialFrom, initialTo),
    Math.max(initialFrom, initialTo),
  ];
  const isControlled = Array.isArray(value);
  const [range, setRange] = useState<[number, number]>(() =>
    isControlled && value ? value : derivedInitial,
  );

  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced URL update
  const updateUrl = (from: number, to: number) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("from", String(from));
      params.set("to", String(to));
      router.replace(`?${params.toString()}`, { scroll: false });
    }, 300);
  };

  const handleSliderChange = (values: [number, number]) => {
    setRange(values);
    onChange(values);
    updateUrl(values[0], values[1]);
  };

  const setPreset = (hoursAgo: number) => {
    const newRange: [number, number] = [0, hoursAgo];
    setRange(newRange);
    onChange(newRange);
    updateUrl(0, hoursAgo);
  };

  useEffect(() => {
    if (!isControlled || !value) return;
    if (value[0] !== range[0] || value[1] !== range[1]) {
      setRange(value);
    }
  }, [isControlled, value, range]);

  useEffect(() => {
    if (isControlled) return;
    const urlFrom = parseIntOrDefault(searchParams.get("from"), 0);
    const urlTo = parseIntOrDefault(searchParams.get("to"), MAX);
    const normalized: [number, number] = [
      Math.min(urlFrom, urlTo),
      Math.max(urlFrom, urlTo),
    ];

    // Only update state if values actually changed
    if (normalized[0] !== range[0] || normalized[1] !== range[1]) {
      setRange(normalized);
      onChange(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isControlled]);

  return (
    <div className="my-4 flex flex-col justify-center m-auto">
      {/* Presets */}
      <div className="flex gap-2 mb-4 justify-evenly">
        <FrostedButton onClick={() => setPreset(24)}>Last 24h</FrostedButton>
        <FrostedButton onClick={() => setPreset(72)}>Last 3d</FrostedButton>
        <FrostedButton onClick={() => setPreset(168)}>Last 7d</FrostedButton>
      </div>

      {/* Label */}
      <label className="block font-semibold mb-15">
        {t("showingReportsFrom")} {Math.floor(range[0] / 24)}d {range[0] % 24}h
        → {Math.floor(range[1] / 24)}d {range[1] % 24}h ago
      </label>

      {/* Range Slider */}
      <Range
        values={range}
        step={STEP}
        min={0}
        max={MAX}
        onChange={(values) => handleSliderChange(values as [number, number])}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: "0.5rem", // h-2 equivalent
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "9999px", // fully rounded
              backdropFilter: "blur(4px)",
            }}
            className="relative"
          >
            <div
              className="absolute top-0 bottom-0 bg-blue-500 rounded"
              style={{
                left: `${(range[0] / MAX) * 100}%`,
                width: `${((range[1] - range[0]) / MAX) * 100}%`,
              }}
            />
            {children}
          </div>
        )}
        renderThumb={({ props, value, isDragged }) => {
          const { key, ...safeProps } = props;
          return (
            <div
              key={key}
              {...safeProps}
              className={`relative z-10 flex items-center justify-center w-5 h-5 rounded-full border-2 transition
      ${isDragged ? "border-blue-600 bg-blue-500 scale-110" : "border-blue-400 bg-white"}
      focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {/* Label above the thumb */}
              <div
                className="absolute -top-7 text-xs font-medium text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded shadow"
                style={{ whiteSpace: "nowrap" }}
              >
                {Math.floor(value / 24)}d {value % 24}h
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
