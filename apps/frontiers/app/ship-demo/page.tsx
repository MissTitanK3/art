import { ShipRenderer } from "@/components/ship/ShipRenderer";
import { SHIP_CATALOG } from "@/schemas/ships";
export default function ShipDemoPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-cyan-400">
        Ship Renderer Demo
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SHIP_CATALOG.map((ship) => (
          <div
            key={ship.id}
            className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col items-center"
          >
            <h2 className="text-xl font-semibold mb-2">{ship.name}</h2>
            <p className="text-sm text-slate-400 mb-4">
              {ship.role} - {ship.mass_class}
            </p>

            <div className="bg-slate-950 rounded-md p-4 mb-4 border border-slate-800">
              <ShipRenderer shipData={ship} />
            </div>

            <div className="w-full text-xs text-slate-500 space-y-1">
              <p>
                Faction:{" "}
                <span className="text-slate-300">
                  {ship.faction_tags.join(", ")}
                </span>
              </p>
              <p>
                Rarity: <span className="text-slate-300">{ship.rarity}</span>
              </p>
              <p>
                Depreciation:{" "}
                <span className="text-slate-300">{ship.depreciation_rate}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
