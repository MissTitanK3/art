import Image from "next/image";
import { ShipCatalog } from "@/schemas/ships";
import { getHullAsset, getSlotAsset, getFactionColor } from "@/lib/ship-utils";
import { getHullVisuals } from "@/lib/ship-visuals";
import { cn } from "@workspace/ui/lib/utils";
interface ShipRendererProps {
  shipData: ShipCatalog;
  className?: string;
}
export const ShipRenderer: React.FC<ShipRendererProps> = ({
  shipData,
  className,
}) => {
  const hullSrc = getHullAsset(shipData);
  const visuals = getHullVisuals(hullSrc);
  const factionColor = getFactionColor(shipData.faction_tags);
  // Calculate grime opacity based on depreciation rate (higher depreciation = more grime)
  // depreciation_rate is 0-1. Let's say max grime is at 0.8 opacity.
  const grimeOpacity = Math.min(shipData.depreciation_rate * 0.8, 0.8);
  return (
    <div
      className={cn("relative w-64 h-64", className)}
      style={
        {
          "--faction-glow": factionColor,
        } as React.CSSProperties
      }
    >
      {/* Layer 0: Glow/Shadow Container */}
      {/* We use a pseudo-element or a separate div for the glow to avoid affecting the image itself too much if we want a back-glow */}
      <div
        className="absolute inset-0 rounded-full opacity-50 blur-xl"
        style={{
          background: `radial-gradient(circle, var(--faction-glow) 0%, transparent 70%)`,
          transform: "scale(0.8)",
        }}
      />

      {/* Layer 1: Engine Plumes (Bottom) */}
      {visuals.engine_positions
        .filter((p) => !p.layer || p.layer === "bottom")
        .map((pos, index) => (
          <div
            key={`engine-bottom-${index}`}
            className="absolute h-16 opacity-90 blur-[1px] animate-pulse origin-top"
            style={{
              top: `${pos.top}%`,
              left: `${pos.left}%`,
              width: `${pos.width || 16}px`, // Default 16px
              transform: `translate(-50%, 0) rotate(${pos.rotation || 0}deg)`,
              // More intense core, fading out to edges and bottom
              background: `conic-gradient(at 50% 0%, transparent 160deg, #60a5fa 180deg, transparent 200deg)`,
              maskImage:
                "linear-gradient(to bottom, black 0%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, transparent 100%)",
            }}
          />
        ))}

      {/* Layer 2: Base Hull */}
      <div className="absolute inset-0 flex items-center justify-center drop-shadow-[0_0_10px_var(--faction-glow)]">
        <Image
          src={hullSrc}
          alt={shipData.name}
          width={200}
          height={200}
          className="object-contain"
          priority
        />
      </div>

      {/* Layer 2.5: Engine Plumes (Top) */}
      {visuals.engine_positions
        .filter((p) => p.layer === "top")
        .map((pos, index) => (
          <div
            key={`engine-top-${index}`}
            className="absolute h-16 opacity-90 blur-[1px] animate-pulse origin-top z-10"
            style={{
              top: `${pos.top}%`,
              left: `${pos.left}%`,
              width: `${pos.width || 16}px`,
              transform: `translate(-50%, 0) rotate(${pos.rotation || 0}deg)`,
              background: `conic-gradient(at 50% 0%, transparent 160deg, #60a5fa 180deg, transparent 200deg)`,
              maskImage:
                "linear-gradient(to bottom, black 0%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, transparent 100%)",
            }}
          />
        ))}

      {/* Layer 3: Modular Slots */}
      {shipData.base_slots?.weapon_primary && visuals.weapon_mounts.primary && (
        <div
          className="absolute z-10 pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            top: `${visuals.weapon_mounts.primary.top}%`,
            left: `${visuals.weapon_mounts.primary.left}%`,
          }}
        >
          {/* Offset slightly to look like it's mounted */}
          <div className="relative">
            {(() => {
              const weaponSrc = getSlotAsset(
                "weapon_primary",
                shipData.base_slots.weapon_primary,
              );
              if (weaponSrc) {
                return (
                  <Image
                    src={weaponSrc}
                    alt="Primary Weapon"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                );
              }
              return null;
            })()}
          </div>
        </div>
      )}

      {/* Layer 4: Grime/Decals */}
      {/* We can use a texture overlay with mix-blend-mode */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-multiply"
        style={{
          opacity: grimeOpacity,
          backgroundImage: "url(/assets/utility/grime_texture.png)", // Assuming this exists or we use a CSS noise
          backgroundSize: "cover",
        }}
      />

      {/* Fallback grime using CSS if texture missing */}
      <div
        className="absolute inset-0 pointer-events-none bg-amber-900 mix-blend-overlay"
        style={{ opacity: grimeOpacity * 0.5 }}
      />
    </div>
  );
};
