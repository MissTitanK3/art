import { NestedTOCHeading } from '@/lib/mdx.toc';
import { DocsSidebar } from './DocsSidebar';
import { DocsTocNav } from './DocsTocNav';
import { FadeOnScroll } from './FadeOnScroll';
import { ScrollProgress } from '../ScrollProgress';
import Link from 'next/link';

export default async function DocsLayout({
  children,
  toc,
  title,
}: {
  children: React.ReactNode;
  toc: NestedTOCHeading[];
  title: string;
}) {
  return (
    <div className="flex w-full min-h-screen bg-background">
      {/* Left Sidebar */}
      <aside className="hidden lg:block w-80 border-r border-muted px-4 py-4 ">
        <DocsSidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 prose dark:prose-invert">
        <nav className="text-sm mb-6">
          <Link href="/courses" className="text-muted-foreground hover:underline">
            Courses
          </Link>{' '}
          / <span className="font-medium">{title}</span>
        </nav>

        {children}
      </main>

      {/* Right TOC */}
      <aside className="hidden xl:block w-72 border-l border-muted px-4 py-8 sticky top-0 max-h-screen overflow-y-auto">
        <FadeOnScroll>
          <DocsTocNav toc={toc} />
        </FadeOnScroll>
        <ScrollProgress />
      </aside>
    </div>
  );
}
