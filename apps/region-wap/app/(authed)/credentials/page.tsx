export default function CredentialCardPage() {
  const card = { name: "Raven Q.", role: "Verified Volunteer", region: "South Sound", id: "ART-SS-0042" };
  return (
    <section className="max-w-md">
      <h1 className="text-2xl font-bold">Credential Card</h1>
      <div className="mt-4 aspect-[1.586/1] rounded-2xl border p-4 grid">
        <div>
          <div className="text-xs text-muted-foreground">Always Ready Tools</div>
          <div className="text-xl font-semibold">{card.name}</div>
          <div className="text-sm">{card.role}</div>
        </div>
        <div className="self-end text-xs text-muted-foreground">
          Region: {card.region} • ID: {card.id}
        </div>
      </div>
    </section>
  );
}