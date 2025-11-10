import { loadSeason, listSeasonSlugs } from "@/lib/seasonsContent";
import { MarkdownView } from "@/components/MarkdownView";
import { notFound } from "next/navigation";

function slugifyTitle(s?: string | null): string | null {
  if (!s) return null;
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function generateStaticParams() {
  return listSeasonSlugs().map((slug) => ({ slug }));
}

export default async function SeasonOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const season = loadSeason(slug);
  if (!season) return notFound();
  const { frontmatter, content } = season;
  const color = frontmatter.themeColor || "#a78bfa";
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold" style={{ color }}>
          {frontmatter.title || slugifyTitle(slug) || "Season"}
        </h1>
        <div className="text-sm text-muted-foreground">
          {frontmatter.sector ? `Sector: ${frontmatter.sector}` : null}{" "}
          {frontmatter.tone ? `· Tone: ${frontmatter.tone}` : null}
        </div>
      </header>
      <MarkdownView source={content} />
    </section>
  );
}
