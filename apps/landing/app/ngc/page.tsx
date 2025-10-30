"use client";

import React, { useMemo, useState } from "react";
import {
  ngcData,
  type NGC as NGCTypes,
  type Article,
  type Section,
  type Content,
  type SubSection,
} from "../../lib/ngc";
import Link from "next/link";

// Simple highlighter for matched query substrings
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  try {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "ig"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            // Use <mark> for built-in highlight semantics
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">
              {part}
            </mark>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          )
        )}
      </>
    );
  } catch {
    return <>{text}</>;
  }
}

function includes(text: string | undefined, q: string) {
  if (!text) return false;
  return text.toLowerCase().includes(q.toLowerCase());
}

type Filtered<T> = T & { __matched?: boolean };

function filterSubSections(subs: SubSection[], q: string): Filtered<SubSection>[] {
  if (!q) return subs;
  return subs
    .map((s) => ({ ...s, __matched: includes(s.title, q) || includes(s.content, q) }))
    .filter((s) => s.__matched);
}

function filterContent(contents: Content[], q: string): Filtered<Content>[] {
  if (!q) return contents;
  return contents
    .map((c) => {
      const subSections = c.subSections ? filterSubSections(c.subSections, q) : undefined;
      const matched = includes(c.preface, q) || includes(c.statement, q) || (subSections?.length ?? 0) > 0;
      return { ...c, subSections, __matched: matched } as Filtered<Content>;
    })
    .filter((c) => c.__matched);
}

function filterSections(sections: Section[], q: string): Filtered<Section>[] {
  if (!q) return sections;
  return sections
    .map((s) => {
      const content = filterContent(s.content, q);
      const matched = includes(s.title, q) || (content.length > 0);
      return { ...s, content, __matched: matched } as Filtered<Section>;
    })
    .filter((s) => s.__matched);
}

function filterArticles(articles: Article[], q: string): Filtered<Article>[] {
  if (!q) return articles;
  return articles
    .map((a) => {
      const sections = filterSections(a.sections, q);
      const matched = includes(a.title, q) || includes(a.id, q) || sections.length > 0;
      return { ...a, sections, __matched: matched } as Filtered<Article>;
    })
    .filter((a) => a.__matched);
}

function countMatches(ngc: NGCTypes, q: string) {
  if (!q) return 0;
  let total = 0;
  // Preamble
  if (includes(ngc.preamble.forward, q)) total++;
  if (includes(ngc.preamble.subTitle, q)) total++;
  total += ngc.preamble.points.filter((p) => includes(p.content, q)).length;
  // Articles tree
  for (const a of ngc.articles) {
    if (includes(a.title, q) || includes(a.id, q)) total++;
    for (const s of a.sections) {
      if (includes(s.title, q) || includes(s.id, q)) total++;
      for (const c of s.content) {
        if (includes(c.preface, q) || includes(c.statement, q)) total++;
        if (c.subSections) {
          total += c.subSections.filter((ss) => includes(ss.title, q) || includes(ss.content, q)).length;
        }
      }
    }
  }
  // Epilogue
  if (includes(ngc.epilogue, q)) total++;
  return total;
}

export default function NGCPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    return {
      ...ngcData,
      preamble: {
        ...ngcData.preamble,
        points: q
          ? ngcData.preamble.points.filter((p) => includes(p.content, q))
          : ngcData.preamble.points,
      },
      articles: filterArticles(ngcData.articles, q),
    } as NGCTypes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const resultsCount = useMemo(() => countMatches(ngcData, query.trim()), [query]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <div className="space-y-2 md:flex md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Next-Generation Constitution</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore and search the full text of the NGC.
            </p>
          </div>
          <div>
            <Link className="text-sm font-medium text-blue-600 hover:underline" href="/">
              Back Home
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="ngc-search" className="sr-only">
            Search NGC
          </label>
          <input
            id="ngc-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, sections, and clauses…"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          {query.trim() && (
            <p className="mt-2 text-xs text-muted-foreground">
              {resultsCount} result{resultsCount === 1 ? "" : "s"} for "{query.trim()}"
            </p>
          )}
        </div>
      </header>

      {/* Preamble */}
      <section aria-labelledby="preamble-heading" className="mb-10">
        <h2 id="preamble-heading" className="text-2xl font-semibold">
          Preamble
        </h2>
        <p className="mt-3 leading-relaxed">
          <Highlight text={ngcData.preamble.forward} query={query} />
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          <Highlight text={ngcData.preamble.subTitle} query={query} />
        </p>

        {filtered.preamble.points.length > 0 && (
          <ol className="mt-4 list-decimal space-y-2 pl-6">
            {filtered.preamble.points.map((p) => (
              <li key={p.id} className="leading-relaxed">
                <Highlight text={p.content} query={query} />
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Articles */}
      <div className="space-y-10">
        {filtered.articles.map((article) => (
          <ArticleBlock key={article.id} article={article} query={query} />)
        )}
      </div>

      {/* Epilogue */}
      <footer className="mt-12 border-t pt-6 text-sm text-muted-foreground">
        <h3 className="mb-2 text-base font-semibold text-foreground">Epilogue</h3>
        <p className="leading-relaxed">
          <Highlight text={ngcData.epilogue} query={query} />
        </p>
      </footer>
    </main>
  );
}

function ArticleBlock({ article, query }: { article: Article; query: string }) {
  return (
    <article id={`article-${article.id}`} className="scroll-mt-24">
      <h2 className="text-xl font-bold">
        Article {article.id}: <span className="font-semibold"><Highlight text={article.title} query={query} /></span>
      </h2>
      <div className="mt-4 space-y-8">
        {article.sections.map((section) => (
          <SectionBlock key={section.id} section={section} articleId={article.id} query={query} />
        ))}
      </div>
    </article>
  );
}

function SectionBlock({ section, articleId, query }: { section: Section; articleId: string; query: string }) {
  return (
    <section id={`article-${articleId}-section-${section.id}`} className="scroll-mt-24">
      <h3 className="text-lg font-semibold">
        Section {section.id}. <Highlight text={section.title} query={query} />
      </h3>
      <div className="mt-3 space-y-4">
        {section.content.map((c, idx) => (
          <ContentBlock key={idx} content={c} query={query} />
        ))}
      </div>
    </section>
  );
}

function ContentBlock({ content, query }: { content: Content; query: string }) {
  return (
    <div className="rounded-md border border-gray-200 p-4 dark:border-zinc-800">
      <p className="text-sm font-medium text-foreground">
        <Highlight text={content.preface} query={query} />
      </p>
      <p className="mt-1 leading-relaxed">
        <Highlight text={content.statement} query={query} />
      </p>
      {content.subSections && content.subSections.length > 0 && (
        <ol className="mt-3 list-decimal space-y-1 pl-6 text-sm">
          {content.subSections.map((s) => (
            <li key={s.id} className="leading-relaxed">
              {s.title ? (
                <span className="font-medium"><Highlight text={s.title} query={query} />: </span>
              ) : null}
              <Highlight text={s.content} query={query} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
