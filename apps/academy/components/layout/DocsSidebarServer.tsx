// components/layout/DocsSidebarServer.tsx
import Link from 'next/link';
import { COURSE_GROUPS } from '@/lib/course-index';
import { getAllCourses } from '@/lib/mdx-loader';
import ThemeToggle from '@workspace/ui/components/client/ThemeToggle';

export default async function DocsSidebarServer() {
  const allCourses = getAllCourses();
  const courseMap = Object.fromEntries(allCourses.map((c) => [c.slug, c.frontmatter, c.frontmatter.version]));

  return (
    <aside className="w-full h-dvh">
      <div className="flex w-full justify-between mb-10">
        <h2 className="font-bold text-lg mb-4">📚 Courses</h2>
        <ThemeToggle />
      </div>

      <div className="space-y-6 space-r-4">
        {COURSE_GROUPS.map((group) => (
          <SidebarGroup
            key={group.label}
            track={group?.track || ''}
            label={group.label}
            courses={group.courses}
            courseMap={courseMap}
          />
        ))}
      </div>
    </aside>
  );
}

function SidebarGroup({
  label,
  courses,
  courseMap,
  track,
}: {
  label: string;
  courses: { slug: string; icon?: string }[];
  courseMap: Record<string, { title: string; version: string }>;
  track: string;
}) {
  return (
    <div>
      <h3 className="font-semibold text-muted-foreground mb-2 mr-3 w-full">{label}</h3>
      <span className="text-xs text-muted-foreground">{track}</span>
      <ul className="space-y-1">
        {courses.map(({ slug, icon }) => {
          const course = courseMap[slug];
          if (!course) return null;
          return (
            <li key={slug}>
              <Link
                href={`/courses/${slug}`}
                className="block transition rounded px-2 py-1 hover:bg-muted hover:scale-[1.01]">
                <div className="grid grid-cols-[2rem_1fr] items-center gap-2 w-full">
                  <div className="pr-3">
                    <div className="text-base leading-none">{icon}</div>
                    <div className="text-xs text-muted-foreground">v{Number(course.version).toFixed(1)}</div>
                  </div>
                  <div className="text-sm">{course.title}</div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
