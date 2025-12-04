"use client";

import React from "react";
import Link from "next/link";
import { Input } from "@workspace/ui/primitives/input";
import ThemeToggle from "@workspace/ui/patterns/common/theme-toggle";

export type CourseSidebarGroup = {
  label: string;
  track?: string;
  courses: Array<{
    slug: string;
    title: string;
    version: number | string;
    icon?: string;
  }>;
};

export default function CourseSidebarList({
  groups,
}: {
  groups: CourseSidebarGroup[];
}) {
  const [query, setQuery] = React.useState("");

  const norm = (s: string) => s.toLowerCase();

  const filtered = React.useMemo(() => {
    const q = norm(query);
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        courses: g.courses.filter(
          (c) => norm(c.title).includes(q) || norm(c.slug).includes(q)
        ),
      }))
      .filter((g) => g.courses.length > 0);
  }, [groups, query]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="font-bold text-lg">📚 Courses</h2>
        <ThemeToggle />
      </div>
      <div className="mb-4">
        <label htmlFor="course-search" className="sr-only">
          Search courses
        </label>
        <Input
          id="course-search"
          placeholder="Search Course Titles…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        {filtered.map((group) => (
          <div key={group.label}>
            <div className="flex flex-col">
              <h3 className="font-semibold text-muted-foreground mb-1 mr-3">
                {group.label}
              </h3>
              {group.track ? (
                <span className="text-xs text-muted-foreground mb-2">
                  {group.track}
                </span>
              ) : null}
            </div>
            <ul className="space-y-1">
              {group.courses.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/courses/${c.slug}`}
                    className="block transition rounded px-2 py-1 hover:bg-muted hover:scale-[1.01]"
                  >
                    <div className="grid grid-cols-[2rem_1fr] items-center gap-2 w-full">
                      <div className="pr-3">
                        <div className="text-base leading-none">{c.icon}</div>
                        <div className="text-xs text-muted-foreground">
                          v{Number(c.version).toFixed(1)}
                        </div>
                      </div>
                      <div className="text-sm">{c.title}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No courses match “{query}”.
          </div>
        ) : null}
      </div>
    </div>
  );
}
