// components/layout/DocsSidebarServer.tsx
import { COURSE_GROUPS } from "@/lib/course-index";
import { getAllCourses } from "@/lib/mdx-loader";
import CourseSidebarList, {
  CourseSidebarGroup,
} from "@/components/client/CourseSidebarList";

export default async function DocsSidebarServer() {
  const allCourses = getAllCourses();
  const courseMap: Record<string, { title: string; version: number | string }> =
    Object.fromEntries(
      allCourses.map((c) => [
        c.slug,
        {
          title: c.frontmatter.title ?? c.slug,
          version: c.frontmatter.version ?? "",
        },
      ]),
    );

  const groups: CourseSidebarGroup[] = COURSE_GROUPS.map((group) => ({
    label: group.label,
    track: group?.track || "",
    courses: group.courses
      .map(({ slug, icon }) => {
        const course = courseMap[slug];
        if (!course) return null;
        return { slug, icon, title: course.title, version: course.version };
      })
      .filter(Boolean) as any,
  }));

  return <CourseSidebarList groups={groups} />;
}
