import { NestedTOCHeading } from '@/lib/mdx.toc';
import { DocsSidebar } from './DocsSidebar';
import { DocsTocNav } from './DocsTocNav';
import { FadeOnScroll } from '@workspace/ui/components/client/FadeOnScroll';
import { ScrollProgress } from '@workspace/ui/components/client/ScrollProgress';
import ScrollAreaPersist from '@/components/client/ScrollAreaPersist';
import MobileCourseSheet from '@/components/client/MobileCourseSheet';
import DocsSidebarServer from './DocsSidebarServer';
import SearchCoursesModal from '@/components/client/SearchCoursesModal';
import Link from 'next/link';
import PrintButton from '@/components/client/PrintButton';

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
    <div className="flex w-full h-screen overflow-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:p-2 focus:rounded-md focus:bg-background focus:border"
      >
        Skip to content
      </a>
      {/* Left Sidebar (independent scroll from xl+) */}
      <aside className="hidden lg:block w-80 border-r border-muted py-4 sticky top-0 h-screen">
        <ScrollAreaPersist
          storageKey="academy.sidebar.scroll"
          className="h-full overflow-y-auto pr-2"
          style={{ scrollbarGutter: 'stable both-edges' as any }}
        >
          <DocsSidebar />
        </ScrollAreaPersist>
      </aside>

      {/* Main Content (independent scroll) */}
      <main id="main-content" className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col w-full md:flex-row items-center justify-between mb-6 sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3">
          <nav className="text-sm ml-2">
            <Link href="/courses" className="text-muted-foreground hover:underline">
              Courses
            </Link>{' '}
            / <span className="font-medium">{title}</span>
          </nav>
          {/* Actions: Search, Print and mobile course list */}
          <div className="flex items-center gap-2">
            <SearchCoursesModal />
            <PrintButton />
            <div className="lg:hidden">
              <MobileCourseSheet>
                <DocsSidebarServer />
              </MobileCourseSheet>
            </div>
          </div>
        </div>
        <div className="prose dark:prose-invert max-w-4xl mx-auto px-2">
          {children}
        </div>
      </main>

      {/* Right TOC (independent scroll from 2xl+) */}
      <aside aria-label="Table of contents" className="hidden 2xl:block w-72 border-l border-muted px-4 py-8 sticky top-0 h-screen overflow-y-auto">
        <FadeOnScroll>
          <DocsTocNav toc={toc} />
        </FadeOnScroll>
        <ScrollProgress />
      </aside>
    </div>
  );
}
