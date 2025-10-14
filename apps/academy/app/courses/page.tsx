import Link from 'next/link';
import { getAllCourses } from '@/lib/mdx-loader';
import { COURSE_GROUPS } from '@/lib/course-index';
import ThemeToggle from '@workspace/ui/components/client/ThemeToggle';
import { Callout } from '@workspace/ui/components/academy/Callout';

export default async function AcademyHome() {
  const allCourses = await getAllCourses();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between w-full items-center">
        <h1 className="text-3xl font-bold mb-6">🎓 ICE Tea Academy</h1>
        <div className="flex gap-3">
          <ThemeToggle />
          <Link
            href="/protected"
            className="bg-green-600 text-white px-4 py-2 rounded hover:scale-105 transition text-sm">
            My Dashboard
          </Link>
        </div>
      </div>
      <p className="text-muted-foreground mb-10">
        Learn how to stay safe, take action, and support your community through qualified and certified courses.
      </p>
      <div className="my-3">
        <Callout type="info">
          🚧 <strong>Dispatch Tools Deployment Notice</strong>
          <br />
          The materials in the ICE Tea Academy are currently undergoing final vetting to ensure accuracy, integrity, and
          alignment with our values. While the <strong>Qualification process is live and valid</strong>, the deployment
          of Certifications will occur <strong>only after this review is complete</strong>. We are committed to building
          on <strong>truth, not misinformation or speculation</strong>. Thanks for learning and growing with us.
        </Callout>
      </div>
      <div className="my-3">
        <Callout type="important">
          <p>
            If you find any errors, misinformation, disinformation, or want additions to the Academy, please email us
            at:
          </p>
          <p className="my-2">
            <strong>academy@peoplesrebellion.org</strong>
          </p>
          <p>We are not perfect — so we will address anything we publish with integrity and care.</p>
        </Callout>
      </div>

      <div className="space-y-12">
        {COURSE_GROUPS.map((group) => (
          <section key={group.label}>
            <h2 className="text-xl font-semibold mb-4">{group.label}</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {group.courses.map((course) => {
                const courseMeta = allCourses.find((c) => c.slug === course.slug);
                if (!courseMeta) return null;
                return (
                  <li key={course.slug}>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="block p-4 border rounded-lg hover:bg-muted transition hover:scale-[1.01] h-full">
                      <div className="grid grid-cols-[2.5rem_2.5rem_1fr] items-start gap-2">
                        <div className="text-xs text-muted-foreground pt-1">
                          {courseMeta.frontmatter.version && `v${courseMeta.frontmatter.version.toFixed(1)}`}
                        </div>
                        <div className="text-xl">{course.icon}</div>
                        <div className="flex flex-col h-full">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base leading-tight">{courseMeta.frontmatter.title}</h3>

                          </div>
                          <div className="h-full flex flex-col justify-between">
                            <p className="text-sm text-muted-foreground">{courseMeta.frontmatter.description}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
