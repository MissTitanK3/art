'use client';

import { MDXProvider } from '@mdx-js/react';
import type { MDXComponents } from 'mdx/types.js';
import { Children, isValidElement, useMemo, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { Callout } from '@workspace/ui/components/academy/Callout';
import { Photo } from '@workspace/ui/components/academy/Photo';
import { QRCodeImage } from '@workspace/ui/components/academy/QRCodeImage';
import { PodCard } from '@workspace/ui/components/academy/PodCard';
import { DownloadFile } from '@workspace/ui/components/academy/DownloadFile';
import { TrackBadge } from '@workspace/ui/components/academy/TrackBadge';
import { Mermaid } from '@workspace/ui/components/academy/Mermaid';

// Heuristic to detect leaked YAML frontmatter rendered into the MDX output
const FRONTMATTER_KEYS = ['title:', 'slug:', 'description:', 'type:', 'readingTime:', 'version:'] as const;
function looksLikeFrontmatter(text: string, minMatches = 2): boolean {
  const lc = text.toLowerCase();
  const matches = FRONTMATTER_KEYS.filter((k) => lc.includes(k)).length;
  return matches >= minMatches;
}

const baseComponents: MDXComponents = {
  Callout,
  Photo,
  QRCodeImage,
  PodCard,
  DownloadFile,
  TrackBadge,
  Mermaid,
  p: (props: ComponentPropsWithoutRef<'p'>) => {
    const { className, children, ...rest } = props;
    const text = toText(children).trim();
    if (text && looksLikeFrontmatter(text, 2)) return null;
    return (
      <p className={cn(className)} {...rest}>
        {children}
      </p>
    );
  },
  h1: (props: ComponentPropsWithoutRef<'h1'>) => Heading('h1', props),
  h2: (props: ComponentPropsWithoutRef<'h2'>) => Heading('h2', props),
  h3: (props: ComponentPropsWithoutRef<'h3'>) => Heading('h3', props),
  table: (props: ComponentPropsWithoutRef<'table'>) => {
    const { className, children, ...rest } = props;
    const clean = Children.toArray(children).filter(
      (c) => !(typeof c === 'string' && /^\s*$/.test(c as string))
    );
    return (
      <div className="not-prose overflow-x-auto w-full my-8">
        <table
          className={cn(
            // Force an overflow on small screens so scroll is visible
            'min-w-[640px] w-max max-w-none',
            // Table base styles
            'text-sm border-collapse caption-bottom',
            className,
          )}
          {...rest}
        >
          {clean}
        </table>
      </div>
    );
  },
  caption: (props: ComponentPropsWithoutRef<'caption'>) => {
    const { className, children, ...rest } = props;
    const clean = Children.toArray(children).filter(
      (c) => !(typeof c === 'string' && /^\s*$/.test(c as string))
    );
    return (
      <caption
        className={cn(
          // Subtle, compact caption styling
          'text-sm text-muted-foreground mt-2',
          className,
        )}
        {...rest}
      >
        {clean}
      </caption>
    );
  },
  thead: (props: ComponentPropsWithoutRef<'thead'>) => {
    const { children, ...rest } = props;
    const clean = Children.toArray(children).filter(
      (c) => !(typeof c === 'string' && /^\s*$/.test(c as string))
    );
    return (
      <thead
        className={cn(
          // Sticky header for long tables
          'sticky top-0 z-10 bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/40',
        )}
        {...rest}
      >
        {clean}
      </thead>
    );
  },
  tbody: (props: ComponentPropsWithoutRef<'tbody'>) => {
    const { children, ...rest } = props;
    const clean = Children.toArray(children).filter(
      (c) => !(typeof c === 'string' && /^\s*$/.test(c as string))
    );
    return (
      <tbody className="divide-y divide-border" {...rest}>
        {clean}
      </tbody>
    );
  },
  tfoot: (props: ComponentPropsWithoutRef<'tfoot'>) => {
    const { children, ...rest } = props;
    const clean = Children.toArray(children).filter(
      (c) => !(typeof c === 'string' && /^\s*$/.test(c as string))
    );
    return (
      <tfoot className="border-t border-border bg-muted/30" {...rest}>
        {clean}
      </tfoot>
    );
  },
  tr: (props: ComponentPropsWithoutRef<'tr'>) => {
    const { children, ...rest } = props;
    const clean = Children.toArray(children).filter(
      (c) => !(typeof c === 'string' && /^\s*$/.test(c as string))
    );
    return (
      <tr className="hover:bg-muted/40 transition-colors" {...rest}>
        {clean}
      </tr>
    );
  },
  th: (props: ComponentPropsWithoutRef<'th'>) => {
    const { className, children, ...rest } = props;
    const clean = Children.toArray(children).filter(
      (c) => !(typeof c === 'string' && /^\s*$/.test(c as string))
    );
    return (
      <th
        className={cn(
          // Sticky cells to keep headers visible
          'sticky top-0 z-10 bg-muted/60',
          // Cell layout
          'px-3 py-2 text-left font-semibold border-b border-border align-bottom',
          // Normalize inner spacing for block children
          '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:my-0 [&>ul]:my-0 [&>ol]:my-0 [&>pre]:my-0 [&>blockquote]:my-0',
          className,
        )}
        {...rest}
      >
        {clean}
      </th>
    );
  },
  td: (props: ComponentPropsWithoutRef<'td'>) => {
    const { className, children, ...rest } = props;
    const clean = Children.toArray(children).filter(
      (c) => !(typeof c === 'string' && /^\s*$/.test(c as string))
    );
    return (
      <td
        className={cn(
          'px-3 py-2 align-top border-b border-border',
          // Normalize block element margins inside cells
          '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:my-0 [&>ul]:my-0 [&>ol]:my-0 [&>pre]:my-0 [&>blockquote]:my-0',
          className,
        )}
        {...rest}
      >
        {clean}
      </td>
    );
  },
  pre: (props: ComponentPropsWithoutRef<'pre'>) => {
    const { className, children, ...rest } = props;
    return (
      <div className="not-prose overflow-x-auto w-full">
        <pre className={cn('w-max max-w-none rounded-md bg-muted p-3 text-xs', className)} {...rest}>
          {children}
        </pre>
      </div>
    );
  },
};

export const mdxComponents = baseComponents;

type MDXWrapperProps = {
  children: ReactNode;
  className?: string;
  components?: MDXComponents;
};

export function MDXWrapper({ children, className, components }: MDXWrapperProps) {
  const mergedComponents = { ...baseComponents, ...components };

  // Some MDX courses may accidentally render their YAML frontmatter as a paragraph
  // if the MDX compiler doesn't strip it. Detect and drop a leading paragraph that
  // looks like frontmatter (e.g., contains multiple keys like title:, slug:, etc.).
  const sanitizedChildren = useMemo(() => {
    const arr = Children.toArray(children);
    if (arr.length === 0) return children;
    // Find the first content block (p or heading) and drop it if it looks like frontmatter
    for (let i = 0; i < arr.length; i++) {
      const node = arr[i] as ReactNode;
      if (isValidElement<{ children?: ReactNode }>(node) && typeof node.type === 'string') {
        const tag = node.type as string;
        if (tag === 'p' || tag === 'h1' || tag === 'h2' || tag === 'h3') {
          const text = toText(node.props.children).trim();
          if (text && looksLikeFrontmatter(text, 2)) {
            return [...arr.slice(0, i), ...arr.slice(i + 1)];
          }
          break;
        }
      }
    }
    return children;
  }, [children]);

  return (
    <MDXProvider components={mergedComponents}>
      <div className={cn('prose dark:prose-invert max-w-[1920]', className)}>{sanitizedChildren}</div>
    </MDXProvider>
  );
}

function Heading<T extends 'h1' | 'h2' | 'h3'>(
  tag: T,
  props: ComponentPropsWithoutRef<T>
) {
  const { id, children, ...rest } = props as any;
  const computedId = useMemo(() => id ?? slugFromReact(children), [id, children]);
  const headingText = toText(children).trim();
  if (headingText && looksLikeFrontmatter(headingText, 3)) {
    return null;
  }

  const common =
    tag === 'h1'
      ? 'text-3xl font-bold mt-6 mb-4'
      : tag === 'h2'
        ? 'text-2xl font-semibold mt-6 mb-3'
        : 'text-xl font-medium mt-5 mb-2';

  const Tag: any = tag;
  return (
    <Tag id={computedId} className={common} {...rest}>
      {children}
    </Tag>
  );
}

function slugFromReact(node: ReactNode): string | undefined {
  const text = toText(node).trim();
  if (!text) return undefined;
  return text
    .toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/^[-]+|[-]+$/g, '');
}

function toText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(toText).join('');
  // Narrow React elements to a props shape that includes optional children so TS knows about it
  if (isValidElement<{ children?: ReactNode }>(node)) return toText(node.props.children);
  return '';
}
