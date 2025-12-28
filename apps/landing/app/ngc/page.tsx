"use client";

import Link from "next/link";
import React, { Fragment, useMemo, useState } from "react";
import type { JSX as ReactJSX } from "react";
import { NGC_V15, type NGCBlock, type NGCNode, type NGCNodeKind, walkNodes } from "../../lib/ngc_v_15";

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  try {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "ig"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={i}
              className="rounded px-1 bg-yellow-200 dark:bg-yellow-700"
            >
              {part}
            </mark>
          ) : (
            <Fragment key={i}>{part}</Fragment>
          )
        )}
      </>
    );
  } catch {
    return <>{text}</>;
  }
}

function blockContains(block: NGCBlock, contains: (t?: string) => boolean): boolean {
  switch (block.type) {
    case "p":
    case "quote":
      return contains(block.text);
    case "kv":
      return contains(block.key) || contains(block.value);
    case "hr":
      return false;
    case "list":
      return block.items.some((item) => {
        const nested = item.blocks ?? [];
        return (
          contains(item.text) ||
          nested.some((nestedBlock) => blockContains(nestedBlock, contains))
        );
      });
    default:
      return false;
  }
}

function nodeMatches(node: NGCNode, normalizedQuery: string): boolean {
  const contains = (text?: string) =>
    (text ?? "").toLowerCase().includes(normalizedQuery);

  return (
    contains(node.title) ||
    contains(node.label ?? undefined) ||
    node.blocks.some((b) => blockContains(b, contains))
  );
}

function filterNode(node: NGCNode, normalizedQuery: string): NGCNode | null {
  if (!normalizedQuery) return node;

  const filteredChildren = node.children
    .map((child) => filterNode(child, normalizedQuery))
    .filter(Boolean) as NGCNode[];

  const matchesSelf = nodeMatches(node, normalizedQuery);

  if (matchesSelf || filteredChildren.length > 0) {
    return { ...node, children: filteredChildren };
  }

  return null;
}

function renderTextWithBoldPrefix(text: string, query: string) {
  const colonIndex = text.indexOf(":");
  if (colonIndex === -1) {
    return <Highlight text={text} query={query} />;
  }

  const prefix = text.slice(0, colonIndex + 1);
  const suffix = text.slice(colonIndex + 1);

  return (
    <>
      <strong className="font-semibold text-muted-foreground">
        <Highlight text={prefix} query={query} />
      </strong>
      {suffix ? <Highlight text={suffix} query={query} /> : null}
    </>
  );
}

function renderBlock(block: NGCBlock, query: string, key: React.Key) {
  switch (block.type) {
    case "p":
      return (
        <p key={key} className="text-[15px] leading-relaxed sm:text-base my-6">
          {renderTextWithBoldPrefix(block.text, query)}
        </p>
      );
    case "kv":
      // Only allow highlighting for Plain Meaning; other kv pairs stay un-highlighted for readability.
      const isPlainMeaning = block.key.trim().toLowerCase() === "plain meaning.";
      const kvContainerClasses = [
        "grid grid-cols-1 gap-2 rounded-xl px-3 py-3 text-sm sm:grid-cols-[160px,1fr] sm:items-start",
        isPlainMeaning
          ? "border border-muted/50 bg-muted/30"
          : "border border-muted/40 bg-background",
      ].join(" ");
      return (
        <div
          key={key}
          className={kvContainerClasses}
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-[13px]">
            {block.key}
          </span>
          <span className="text-[15px] leading-relaxed sm:text-base">
            {isPlainMeaning ? (
              <Highlight text={block.value} query={query} />
            ) : (
              block.value
            )}
          </span>
        </div>
      );
    case "quote":
      return (
        <blockquote
          key={key}
          className="border-l-4 border-muted-foreground/40 pl-4 italic text-muted-foreground"
        >
          <Highlight text={block.text} query={query} />
        </blockquote>
      );
    case "hr":
      return <hr key={key} className="border-muted/50" />;
    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag
          key={key}
          className="space-y-2 pl-4 text-[15px] sm:pl-5 sm:text-base [&>li]:leading-relaxed"
        >
          {block.items.map((item, idx) => (
            <li key={idx} className="list-disc">
              <Highlight text={item.text} query={query} />
              {item.blocks && item.blocks.length > 0 && (
                <div className="mt-2 space-y-3">
                  {item.blocks.map((nested, nestedIdx) =>
                    renderBlock(nested, query, `${key}-nested-${nestedIdx}`)
                  )}
                </div>
              )}
            </li>
          ))}
        </ListTag>
      );
    }
    default:
      return null;
  }
}

type NodeContext = {
  article?: { label: string | null; title: string };
  section?: { label: string | null; title: string };
};

function NodeView({
  node,
  query,
  context = {},
  collapsedIds,
  onToggleCollapsed,
  collapsibleKinds,
}: {
  node: NGCNode;
  query: string;
  context?: NodeContext;
  collapsedIds: Set<string>;
  onToggleCollapsed: (id: string) => void;
  collapsibleKinds: Set<NGCNodeKind>;
}) {
  if (node.kind === "root") {
    return (
      <div className="space-y-6 sm:space-y-8">
        {node.children.map((child) => (
          <NodeView
            key={child.id}
            node={child}
            query={query}
            context={context}
            collapsedIds={collapsedIds}
            onToggleCollapsed={onToggleCollapsed}
            collapsibleKinds={collapsibleKinds}
          />
        ))}
      </div>
    );
  }

  const normalizedLocalQuery = query.trim().toLowerCase();
  const hidePreamble =
    node.kind === "preamble" &&
    normalizedLocalQuery &&
    !nodeMatches(node, normalizedLocalQuery);

  if (hidePreamble) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {node.children.map((child) => (
          <NodeView
            key={child.id}
            node={child}
            query={query}
            context={context}
            collapsedIds={collapsedIds}
            onToggleCollapsed={onToggleCollapsed}
            collapsibleKinds={collapsibleKinds}
          />
        ))}
      </div>
    );
  }

  const HeadingTag = (`h${Math.min(6, node.level + 1)}` as keyof ReactJSX.IntrinsicElements);
  const nextContext: NodeContext = { ...context };

  if (node.kind === "article") {
    nextContext.article = { label: node.label, title: node.title };
    nextContext.section = undefined;
  } else if (node.kind === "section") {
    nextContext.section = { label: node.label, title: node.title };
  }

  const articleLabel = nextContext.article?.label ?? nextContext.article?.title;
  const sectionLabel = nextContext.section?.label ?? nextContext.section?.title;
  const locationBadge = [articleLabel, sectionLabel].filter(Boolean).join(" • ");
  const hasContent = node.blocks.length > 0 || node.children.length > 0;
  const isCollapsible = collapsibleKinds.has(node.kind) && hasContent;
  const isCollapsed = isCollapsible && collapsedIds.has(node.id);

  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="rounded-2xl border border-muted/50 bg-background/60 p-2 shadow-sm sm:p-5">
        <header
          className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${isCollapsible ? "cursor-pointer" : ""
            }`}
          role={isCollapsible ? "button" : undefined}
          tabIndex={isCollapsible ? 0 : undefined}
          aria-expanded={isCollapsible ? !isCollapsed : undefined}
          onClick={isCollapsible ? () => onToggleCollapsed(node.id) : undefined}
          onKeyDown={
            isCollapsible
              ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleCollapsed(node.id);
                }
              }
              : undefined
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            {node.label && (
              <span className="rounded-full bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {node.label}
              </span>
            )}
            <HeadingTag className="text-lg font-semibold leading-snug sm:text-xl">
              {node.title}
            </HeadingTag>
          </div>
          <div className="flex items-center gap-3">
            {locationBadge && (
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {locationBadge}
              </span>
            )}
            {isCollapsible && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapsed(node.id);
                }}
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:text-foreground"
              >
                {isCollapsed ? "Expand" : "Collapse"}
              </button>
            )}
          </div>
        </header>

        {!isCollapsed && node.blocks.length > 0 && (
          <div className="mt-4 space-y-3">
            {node.blocks.map((block, idx) =>
              renderBlock(block, query, `${node.id}-block-${idx}`)
            )}
          </div>
        )}
      </div>

      {!isCollapsed && node.children.length > 0 && (
        <div className="space-y-3 border-l border-dashed border-muted/50 pl-2 sm:space-y-4 sm:pl-3">
          {node.children.map((child) => (
            <NodeView
              key={child.id}
              node={child}
              query={query}
              context={nextContext}
              collapsedIds={collapsedIds}
              onToggleCollapsed={onToggleCollapsed}
              collapsibleKinds={collapsibleKinds}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function NGCPage() {
  const [query, setQuery] = useState("");
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const normalizedQuery = query.trim().toLowerCase();
  const collapsibleKinds = useMemo(
    () => new Set<NGCNodeKind>(["article", "section", "topic"]),
    []
  );

  const filteredRoot = useMemo(() => {
    if (!normalizedQuery) return NGC_V15.root;
    return filterNode(NGC_V15.root, normalizedQuery) ?? {
      ...NGC_V15.root,
      children: [],
    };
  }, [normalizedQuery]);

  const hasResults =
    filteredRoot.blocks.length > 0 || filteredRoot.children.length > 0;

  const idsByKind = useMemo(() => {
    const kinds: Record<NGCNodeKind, string[]> = {
      root: [],
      preamble: [],
      article: [],
      section: [],
      subsection: [],
      topic: [],
    };
    walkNodes(filteredRoot, (node) => {
      kinds[node.kind]?.push(node.id);
    });
    return kinds;
  }, [filteredRoot]);

  const setKindCollapsed = (kind: NGCNodeKind, collapse: boolean) => {
    if (!collapsibleKinds.has(kind)) return;
    const ids = idsByKind[kind];
    if (!ids || ids.length === 0) return;
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (collapse) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  };

  const onToggleCollapsed = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-8 sm:space-y-10 sm:py-12">
      <header className="space-y-5">
        <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-slate-50 shadow-lg sm:p-7">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-300">
            Next-Generation Constitution
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
            Read and search the NGC
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
            Mobile-first reading with fast search, plain-meaning highlights, and a clean hierarchy for long-form text.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-200">
            <span className="rounded-full bg-white/10 px-3 py-1">
              Version {NGC_V15.meta.version}
            </span>
            <Link
              href="/Next-Generation-Constitution-Version-15.pdf"
              download
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white transition hover:bg-white/20"
            >
              Download PDF
            </Link>
          </div>
          <Link
            href="/"
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white"
          >
            ← Back Home
          </Link>
        </div>

        <div className="sticky top-3 z-10 rounded-xl border border-muted/60 bg-background/95 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="ngc-search">
            Search the NGC
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2 ring-1 ring-inset ring-muted/50 focus-within:ring-2 focus-within:ring-primary/50">
            <span className="text-sm text-muted-foreground">⌕</span>
            <input
              id="ngc-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find any article, section, or phrase…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
          {normalizedQuery && (
            <p className="mt-1 text-xs text-muted-foreground">
              Showing matches for “{query.trim()}”
            </p>
          )}
        </div>
      </header>

      <div className="flex flex-wrap gap-2 rounded-xl border border-muted/60 bg-muted/20 p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <button
          type="button"
          onClick={() => setCollapsedIds(new Set())}
          className="rounded-lg bg-background px-3 py-2 shadow-sm transition hover:text-foreground"
        >
          Expand All
        </button>
        {(["article", "section", "topic"] as const).map((kind) => {
          const ids = idsByKind[kind];
          const allCollapsed = ids.length > 0 && ids.every((id) => collapsedIds.has(id));
          const label =
            kind === "article" ? "Articles" : kind === "section" ? "Sections" : "Notes";
          return (
            <button
              key={kind}
              type="button"
              onClick={() => setKindCollapsed(kind, !allCollapsed)}
              className="rounded-lg bg-background px-3 py-2 shadow-sm transition hover:text-foreground"
            >
              {allCollapsed ? `Expand ${label}` : `Collapse ${label}`}
            </button>
          );
        })}
      </div>

      {!hasResults && normalizedQuery ? (
        <p className="text-sm text-muted-foreground">
          No results found. Try a different search term.
        </p>
      ) : (
        <NodeView
          node={filteredRoot}
          query={query.trim()}
          collapsedIds={collapsedIds}
          onToggleCollapsed={onToggleCollapsed}
          collapsibleKinds={collapsibleKinds}
        />
      )}
    </main>
  );
}
