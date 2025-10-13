'use client';

import { MDXProvider } from '@mdx-js/react';
import type { MDXComponents } from 'mdx/types.js'
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Callout } from './callout';
import { Photo } from './photo';
import { QRCodeImage } from './QRCodeImage';
import { PodCard } from './PodCard';
import { DownloadFile } from './DownloadPDF';
import { TrackBadge } from './TrackBadge';
import Mermaid from './Mermaid';

const baseComponents: MDXComponents = {
  Callout,
  Photo,
  QRCodeImage,
  PodCard,
  DownloadFile,
  TrackBadge,
  Mermaid,
  h1: (props: ComponentPropsWithoutRef<'h1'>) => {
    const { id, children, ...rest } = props;
    return (
      <h1 id={id} className="text-3xl font-bold mt-6 mb-4" {...rest}>
        {children}
      </h1>
    );
  },
  h2: (props: ComponentPropsWithoutRef<'h2'>) => {
    const { id, children, ...rest } = props;
    return (
      <h2 id={id} className="text-2xl font-semibold mt-6 mb-3" {...rest}>
        {children}
      </h2>
    );
  },
  h3: (props: ComponentPropsWithoutRef<'h3'>) => {
    const { id, children, ...rest } = props;
    return (
      <h3 id={id} className="text-xl font-medium mt-5 mb-2" {...rest}>
        {children}
      </h3>
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

  return (
    <MDXProvider components={mergedComponents}>
      <div className={cn('prose dark:prose-invert', className)}>{children}</div>
    </MDXProvider>
  );
}
