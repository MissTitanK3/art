import createMDX from '@next/mdx'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

/**
 * MDX support via @next/mdx per Next.js docs.
 * - Enables importing .md/.mdx files anywhere in the app
 * - Uses the same remark/rehype plugins as our manual loader
 */
// Normalize ESM/CJS interop for plugins to avoid null/undefined in unified.use()
const _rehypeSlug = /** @type {any} */ (rehypeSlug)?.default ?? rehypeSlug
const _remarkGfm = /** @type {any} */ (remarkGfm)?.default ?? remarkGfm

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [_remarkGfm],
    rehypePlugins: [_rehypeSlug],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/store"],
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  experimental: {
    // Use mdx-rs to avoid unified preset/null interop issues and enable GFM parsing
    mdxRs: { mdxType: 'gfm' },
  },
}

export default withMDX(nextConfig)
