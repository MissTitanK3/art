"use client";
import { useTrustStore } from "@/lib/trustStore";

export default function TrustManagementPage() {
  const entries = useTrustStore((s) => s.trustList);
  const addTrust = useTrustStore((s) => s.addTrust);
  const toggleTrustByIndex = useTrustStore((s) => s.toggleTrustByIndex);

  return (
    <div>
      <h1 className="text-lg font-semibold">Trust Management</h1>
      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget as HTMLFormElement);
          const subjectId = (fd.get("subjectId") ?? "").toString().trim();
          if (!subjectId) return;

          addTrust({
            subjectId,
            signerId: "demo-admin",
            signer_role: "regional_admin",
            signer_rot: "rot-1",
            status: "active",
          });

          (e.currentTarget as HTMLFormElement).reset();
        }}
      >
        <input
          name="subjectId"
          placeholder="Subject ID"
          className="border rounded px-2 py-1 text-sm"
          required
        />
        <button className="border rounded px-3 py-1 text-sm">Add</button>
      </form>

      <div className="mt-4 grid gap-2">
        {entries.map((t, i) => (
          <div key={t.signed_entry_hash} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">Subject: {t.subjectId}</div>
              <span className="text-xs px-2 py-0.5 rounded bg-muted">
                {t.status}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              signer: {t.signer_role} • signed:{" "}
              {new Date(t.signed_at).toLocaleString()}
            </div>
            <button
              className="mt-2 text-xs underline"
              onClick={() => toggleTrustByIndex(i)}
            >
              Toggle inactive
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
