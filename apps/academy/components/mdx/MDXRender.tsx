'use client';

import * as React from 'react';
import { MDX_COURSE_MODULES, type MDXModule } from '@/lib/mdx-manifest.generated';

export function MDXRender({ slug }: { slug: string }) {
  const [Comp, setComp] = React.useState<null | ((props: any) => React.ReactElement)>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const map = MDX_COURSE_MODULES as Record<string, () => Promise<MDXModule>>;
        const importFn = map[slug];
        if (!importFn) {
          throw new Error(`No MDX module for slug: ${slug}`);
        }
        const mod = await importFn();
        if (mounted) setComp(() => mod.default as any);
      } catch (e) {
        console.error('[academy] MDXRender:import-error', { slug, error: (e as Error)?.message });
        if (mounted) setError((e as Error)?.message ?? 'Failed to load content');
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (error) return <div className="text-sm text-red-500">Error loading content: {error}</div>;
  if (!Comp) return <div className="text-sm text-muted-foreground">Loading…</div>;
  return <Comp />;
}
