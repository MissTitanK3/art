import { getCourseBySlug } from '@/lib/mdx-loader';
import type { Metadata } from 'next';
import DocsLayout from '@/components/layout/DocsLayout';
import { notFound } from 'next/navigation';
import { estimateReadingTime } from '@/lib/reading-time';
import { getPrevNextWithMetadata } from '@/lib/course-index';
import { MDXWrapper } from '@/components/mdx/MDXWrapper';
import { GENERATED_COURSE_DETAILS } from '@workspace/ui/data/academy/course-details.generated';
import { MDXRender } from '@/components/mdx/MDXRender';

export async function generateStaticParams() {
  return Object.keys(GENERATED_COURSE_DETAILS).map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { frontmatter } = await getCourseBySlug(slug);
    const title = `${frontmatter.title ?? slug} · ART Academy`;
    const description = frontmatter.description ?? 'ART Academy course';
    return {
      title,
      description,
      openGraph: { title, description },
      twitter: { title, description },
    };
  } catch {
    return { title: 'ART Academy', description: 'Course' };
  }
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    if (!slug) return notFound();

    const { frontmatter, toc, raw } = await getCourseBySlug(slug);
    const readingTime =
      (frontmatter.readingTime as number | undefined) ??
      (frontmatter.estimatedReadingTime as number | undefined) ??
      estimateReadingTime(raw);
    const { prev, next } = getPrevNextWithMetadata(slug);

    const pageTitle = frontmatter.title ?? slug;
    return (
      <DocsLayout toc={toc} title={pageTitle}>
        <span id="top" className="block h-0" />

        <article className="prose dark:prose-invert max-w-none">
          <div className="flex flex-col items-center justify-between w-full">
            <span className="text-xs text-muted-foreground">Version {frontmatter.version ?? 1}</span>

            <h1 id="top" className="text-3xl font-bold">
              {frontmatter.title}
            </h1>
            <p className="text-muted-foreground">{frontmatter.description}</p>
            <div className="text-sm text-muted-foreground mb-4 space-x-2">
              <span>{readingTime} min read</span>
              <span>·</span>
              <span className={frontmatter.type === 'certified' ? 'text-red-400' : 'text-green-400'}>
                {frontmatter.type === 'certified' ? 'Certified Track' : 'Qualified Lesson'}
              </span>
            </div>
          </div>
          <hr />

          <MDXWrapper>
            <MDXRender slug={slug} />
          </MDXWrapper>

          <hr className="my-12 border-muted" />

          <div className="flex flex-wrap justify-between text-sm mt-4 gap-4 no-print">
            <a href="#top" className="text-blue-400 hover:underline">
              ↑ Back to top
            </a>

            <div className="flex ml-auto">
              {prev && (
                <a href={`/courses/${prev.slug}`} className="text-blue-400 hover:underline">
                  ← Previous: {prev.title}
                </a>
              )}
              {prev && next && <span className="text-muted-foreground">|</span>}
              {next && (
                <a href={`/courses/${next.slug}`} className="text-blue-400 hover:underline">
                  Next: {next.title} →
                </a>
              )}
            </div>
          </div>
        </article>
      </DocsLayout>
    );
  } catch {
    return notFound();
  }
}
