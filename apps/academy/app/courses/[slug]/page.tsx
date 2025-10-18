import { getCourseBySlug } from '@/lib/mdx-loader';
import DocsLayout from '@/components/layout/DocsLayout';
import { notFound } from 'next/navigation';
import { estimateReadingTime } from '@/lib/reading-time';
import { getPrevNextWithMetadata } from '@/lib/course-index';
import { MDXWrapper, mdxComponents } from '@/components/mdx/MDXWrapper';
import { Callout } from '@workspace/ui/components/academy/Callout';
import { Photo } from '@workspace/ui/components/academy/Photo';
import { TrackBadge } from '@workspace/ui/components/academy/TrackBadge';
import { QRCodeImage } from '@workspace/ui/components/academy/QRCodeImage';
import { PodCard } from '@workspace/ui/components/academy/PodCard';
import { DownloadFile } from '@workspace/ui/components/academy/DownloadFile';
import { Mermaid } from '@workspace/ui/components/academy/Mermaid';
import { GENERATED_COURSE_DETAILS } from '@workspace/ui/data/academy/course-details.generated';

export async function generateStaticParams() {
  return Object.keys(GENERATED_COURSE_DETAILS).map((slug) => ({ slug }));
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    if (!slug) return notFound();

    const { frontmatter, Content, toc, raw } = await getCourseBySlug(slug);
    const readingTime = frontmatter.readingTime ?? estimateReadingTime(raw);
    const { prev, next } = getPrevNextWithMetadata(slug);

    return (
      <DocsLayout toc={toc} title={frontmatter.title}>
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

          <MDXWrapper className="max-w-none">
            <Content components={{
              ...mdxComponents,
              Callout,
              Photo,
              TrackBadge,
              QRCodeImage,
              PodCard,
              DownloadFile,
              Mermaid
            }} />
          </MDXWrapper>

          <hr className="my-12 border-muted" />

          <div className="flex flex-wrap justify-between text-sm mt-4 gap-4">
            <a href="#top" className="text-blue-400 hover:underline">
              ↑ Back to top
            </a>

            <div className="flex gap-4 ml-auto">
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
