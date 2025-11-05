import { MissingPersonDetailDataLayer } from "@/components/dataLayer/missing-persons/MissingPersonDetailDataLayer";

export default async function MissingPersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-16">
      <MissingPersonDetailDataLayer slug={id} />
    </div>
  );
}
