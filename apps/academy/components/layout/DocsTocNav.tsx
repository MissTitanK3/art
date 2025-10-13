'use client';

import { NestedTOCHeading } from '@/lib/mdx.toc';
import { useEffect, useState } from 'react';

export function DocsTocNav({ toc }: { toc: NestedTOCHeading[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target?.id) {
          setActiveId(visible.target.id);
          document.querySelectorAll('[data-active-heading]').forEach((el) => el.removeAttribute('data-active-heading'));
          visible.target.setAttribute('data-active-heading', 'true');
        }
      },
      {
        rootMargin: '0px 0px -70% 0px',
        threshold: 1.0,
      },
    );

    const allIds = [...toc.map((h) => h.id), ...toc.flatMap((h) => h.children.map((c) => c.id))];
    const elements = allIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    elements.forEach((el) => observer.observe(el));
    return () => elements.forEach((el) => observer.unobserve(el));
  }, [toc]);

  useEffect(() => {
    const headings = [...toc.map((h) => h.id), ...toc.flatMap((h) => h.children.map((c) => c.id))];

    const handleKey = (e: KeyboardEvent) => {
      const index = headings.findIndex((id) => id === activeId);
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextId = headings[index + 1];
        if (nextId) document.getElementById(nextId)?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevId = headings[index - 1];
        if (prevId) document.getElementById(prevId)?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeId, toc]);

  return (
    <nav className="text-sm text-muted-foreground space-y-2">
      <h2 className="font-bold mb-4">On this page</h2>
      <ul className="space-y-2">
        {toc.map((h, i) => (
          <li key={`${h.id}-${i}`}>
            <a
              href={`#${h.id}`}
              onClick={() => setExpanded((prev) => (prev === h.id ? null : h.id))}
              className={`block transition-colors ${activeId === h.id ? ' font-semibold' : 'hover:text-foreground'}`}>
              {h.value}
            </a>

            {expanded === h.id && h.children.length > 0 && (
              <ul className="mt-1 ml-4 space-y-1 border-l border-muted pl-2">
                {h.children.map((child, j) => (
                  <li key={`${child.id}-${j}`}>
                    <a
                      href={`#${child.id}`}
                      className={`block text-xs transition-colors ${
                        activeId === child.id ? 'font-semibold' : 'hover:text-foreground'
                      }`}>
                      {child.value}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
