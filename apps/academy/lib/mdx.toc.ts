import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import type { Heading } from "mdast";
import { toString } from "mdast-util-to-string";

export type TOCHeading = {
  value: string;
  id: string;
  depth: number;
};

const FRONTMATTER_KEYS = [
  "title:",
  "slug:",
  "description:",
  "type:",
  "readingtime:",
  "version:",
] as const;
function looksLikeFrontmatter(text: string, minMatches = 2): boolean {
  const lc = text.toLowerCase();
  const matches = FRONTMATTER_KEYS.filter((k) => lc.includes(k)).length;
  return matches >= minMatches;
}

export type NestedTOCHeading = {
  value: string;
  id: string;
  children: TOCHeading[];
};

export function extractToc(markdown: string): NestedTOCHeading[] {
  const tree = unified().use(remarkParse).parse(markdown);
  const nestedToc: NestedTOCHeading[] = [];
  const idCounts: Record<string, number> = {};
  let currentParent: NestedTOCHeading | null = null;

  visit(tree, "heading", (node: Heading) => {
    const value = toString(node);
    // Skip headings that look like leaked frontmatter
    if (looksLikeFrontmatter(value, 2)) {
      return;
    }
    let id = value
      .toLowerCase()
      .replace(/[^\w]+/g, "-")
      .replace(/^[-]+|[-]+$/g, "");

    const count = (idCounts[id] ?? 0) + 1;
    idCounts[id] = count;
    if (count > 1) {
      id = `${id}-${count}`;
    }

    if (node.depth === 2) {
      currentParent = { value, id, children: [] };
      nestedToc.push(currentParent);
    } else if (node.depth === 3 && currentParent) {
      currentParent.children.push({ value, id, depth: 3 });
    }
  });

  return nestedToc;
}
