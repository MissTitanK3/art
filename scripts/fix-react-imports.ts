/**
 * Modernized React Namespace Cleanup Codemod
 *
 * Goals:
 * 1. Remove `import * as React from "react"` and `import React from "react"`
 * 2. Rewrite `React.useX` → `useX` using named imports
 * 3. Convert:
 *    - React.FC
 *    - React.VFC
 *    - React.Fragment / <React.Fragment>
 *    - React.memo / React.forwardRef / React.lazy / React.createContext / React.Suspense
 * 4. Add missing imports only as needed
 * 5. Respect `"use client"` directive
 * 6. Produce categorized log file so manual review is simple
 *
 * This script ONLY touches files that use React namespace patterns.
 * All operations are idempotent and AST-driven for correctness.
 */

import * as fs from "fs";
import * as path from "path";
import { spawnSync } from "child_process";
import * as ts from "typescript";
import { globby } from "globby";

/**
 * React hooks we transform from namespace access (e.g. `React.useState`)
 * into named imports so that tree shaking and lint rules keep working.
 *
 * @remarks Extend this list any time you introduce a new stable hook that
 * appears in namespace form.
 */
const HOOKS = new Set<string>([
  "useState",
  "useEffect",
  "useContext",
  "useReducer",
  "useCallback",
  "useMemo",
  "useRef",
  "useLayoutEffect",
  "useImperativeHandle",
  "useTransition",
  "useId",
  "useDeferredValue"
]);

/**
 * Additional runtime React APIs that appear as namespace properties but
 * should be pulled in via named imports for parity with the hooks above.
 */
const RUNTIME_APIS = new Set<string>([
  "memo",
  "forwardRef",
  "lazy",
  "createContext",
  "Fragment",
  "Suspense"
]);

/**
 * Type-only React usages that must stay usable after namespace removal.
 * These are rewritten to named imports so TypeScript still resolves them.
 */
const TYPE_APIS = new Set<string>([
  "FC",
  "VFC",
  "ReactNode",
  "ReactElement",
  "ComponentType"
]);

/** Categorized logging buckets for human follow-up */
const logHooksOnly: string[] = [];
const logFC: string[] = [];
const logFragment: string[] = [];
const logRuntimeAPI: string[] = [];

/**
 * Infers the `ts.ScriptKind` for a file using the extension so parsing logic
 * stays consistent across helpers.
 */
function getScriptKind(filePath: string): ts.ScriptKind {
  return filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
}

/**
 * Returns true if the import declaration targets the React package.
 */
function isReactImportDeclaration(node: ts.ImportDeclaration): boolean {
  return ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === "react";
}

/**
 * Extracts local value-level identifiers from a React import declaration,
 * skipping type-only specifiers since they do not emit runtime bindings.
 */
function getReactValueLocalNames(node: ts.ImportDeclaration): string[] {
  const clause = node.importClause;
  if (!clause || clause.isTypeOnly) return [];

  const names: string[] = [];
  const push = (identifier: ts.Identifier | undefined, isTypeOnly?: boolean) => {
    if (!identifier || isTypeOnly) return;
    names.push(identifier.text);
  };

  if (clause.name) push(clause.name);

  if (clause.namedBindings) {
    if (ts.isNamespaceImport(clause.namedBindings)) {
      push(clause.namedBindings.name);
    } else {
      for (const element of clause.namedBindings.elements) {
        push(element.name, element.isTypeOnly);
      }
    }
  }

  return names;
}

/**
 * Determines the statement index immediately after any leading
 * `"use client"` directive so we can insert imports without moving it.
 *
 * @param statements - The statement list from a `ts.SourceFile`.
 * @returns The array index where new imports should be inserted.
 */
function findUseClientPosition(statements: readonly ts.Statement[]): number {
  for (let i = 0; i < statements.length; i++) {
    const stmt: ts.Statement = statements[i]!;
    if (
      ts.isExpressionStatement(stmt) &&
      ts.isStringLiteral(stmt.expression) &&
      stmt.expression.text === "use client"
    ) {
      return i + 1;
    }
  }
  return 0;
}

/**
 * Formats a file using the repo's Prettier setup so codemod output matches
 * existing style.
 *
 * @param filePath - Absolute path to the file that was just rewritten.
 */
function formatFile(filePath: string): void {
  const relative = path.relative(process.cwd(), filePath);
  spawnSync("pnpm", ["exec", "prettier", "--write", relative], {
    stdio: "ignore"
  });
}

/**
 * Detects duplicate value-level React imports within a single file.
 *
 * @param filePath - Absolute or relative path to scan.
 * @returns The list of duplicate local identifiers, or an empty array when
 * none are found.
 */
function detectDuplicateReactImports(filePath: string): string[] {
  const source = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath)
  );

  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const stmt of sourceFile.statements) {
    if (!ts.isImportDeclaration(stmt)) continue;
    if (!isReactImportDeclaration(stmt)) continue;

    for (const localName of getReactValueLocalNames(stmt)) {
      if (seen.has(localName)) {
        duplicates.add(localName);
      } else {
        seen.add(localName);
      }
    }
  }

  return Array.from(duplicates).sort();
}

/**
 * Scans a set of files for duplicate React imports and records the offending
 * identifiers for each file.
 */
function scanForDuplicateReactImports(filePaths: readonly string[]): Map<string, string[]> {
  const results = new Map<string, string[]>();
  for (const filePath of filePaths) {
    try {
      const duplicates = detectDuplicateReactImports(filePath);
      if (duplicates.length > 0) {
        results.set(filePath, duplicates);
      }
    } catch (err) {
      console.error(`Failed to scan ${filePath} for duplicate imports:`, err);
    }
  }
  return results;
}

/**
 * Rewrites a single TS/TSX file, removing namespace-based React usage in
 * favor of tree-shakeable named imports while tracking what changed for the
 * summary log.
 *
 * @param filePath - Absolute path to the source file being transformed.
 */
function transformFile(filePath: string): void {
  const source: string = fs.readFileSync(filePath, "utf8");

  const sourceFile: ts.SourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath)
  );

  let namespace: string | null = null;
  let changed = false;

  const detectedHooks = new Set<string>();
  const detectedTypes = new Set<string>();
  const detectedRuntimeAPIs = new Set<string>();

  /**
   * AST traversal visitor
   */
  const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
    const visit = (node: ts.Node): ts.VisitResult<ts.Node> => {
      // Detect namespace import clause or default import
      if (
        ts.isImportDeclaration(node) &&
        isReactImportDeclaration(node)
      ) {
        const clause = node.importClause;
        // Check for namespace import: import * as React from "react"
        if (
          clause &&
          clause.namedBindings &&
          ts.isNamespaceImport(clause.namedBindings)
        ) {
          namespace = clause.namedBindings.name.text;
          changed = true;
          return node;
        }
        // Check for default import: import React from "react"
        if (clause && clause.name && !clause.namedBindings) {
          namespace = clause.name.text;
          changed = true;
          return node;
        }
      }

      // Convert namespace-based usages
      if (
        namespace &&
        ts.isPropertyAccessExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === namespace &&
        ts.isIdentifier(node.name)
      ) {
        const name: string = node.name.text;

        if (HOOKS.has(name)) {
          detectedHooks.add(name);
          changed = true;
          return ts.factory.createIdentifier(name);
        }

        if (RUNTIME_APIS.has(name)) {
          detectedRuntimeAPIs.add(name);
          changed = true;
          return ts.factory.createIdentifier(name);
        }

        if (TYPE_APIS.has(name)) {
          detectedTypes.add(name);
          changed = true;
          return ts.factory.createIdentifier(name);
        }
      }

      return ts.visitEachChild(node, visit, context);
    };
    return (node: ts.SourceFile): ts.SourceFile =>
      ts.visitEachChild(node, visit, context) as ts.SourceFile;
  };

  const { transformed } = ts.transform(sourceFile, [transformer]);
  let updated: ts.SourceFile = transformed[0] as ts.SourceFile;

  if (!changed) return;

  // Remove namespace or default import
  if (namespace) {
    updated = ts.factory.updateSourceFile(
      updated,
      updated.statements.filter(stmt => {
        if (!ts.isImportDeclaration(stmt)) return true;
        if (!isReactImportDeclaration(stmt)) return true;

        const clause = stmt.importClause;
        // Remove namespace import: import * as React from "react"
        if (
          clause &&
          clause.namedBindings &&
          ts.isNamespaceImport(clause.namedBindings) &&
          clause.namedBindings.name.text === namespace
        ) {
          return false;
        }
        // Remove default import: import React from "react"
        if (clause && clause.name && clause.name.text === namespace && !clause.namedBindings) {
          return false;
        }
        return true;
      })
    );
  }

  /**
   * Track any existing named React imports so we avoid re-importing hooks or
   * types that are already present (which would trigger duplicate identifier
   * errors in the compiler/bundler).
   */
  const existingReactLocalNames = new Set<string>();
  for (const stmt of updated.statements) {
    if (!ts.isImportDeclaration(stmt)) continue;
    if (!isReactImportDeclaration(stmt)) continue;
    for (const localName of getReactValueLocalNames(stmt)) {
      existingReactLocalNames.add(localName);
    }
  }

  /** Build new named import list, excluding identifiers already imported */
  const namedImports: string[] = [
    ...detectedHooks,
    ...detectedRuntimeAPIs,
    ...detectedTypes
  ].filter(name => !existingReactLocalNames.has(name));

  if (namedImports.length > 0) {
    const importDecl: ts.ImportDeclaration = ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamedImports(
          namedImports.sort().map(name =>
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier(name)
            )
          )
        )
      ),
      ts.factory.createStringLiteral("react")
    );

    const stmts = [...updated.statements];
    const insertAt = findUseClientPosition(stmts);

    updated = ts.factory.updateSourceFile(
      updated,
      [
        ...stmts.slice(0, insertAt),
        importDecl,
        ...stmts.slice(insertAt)
      ]
    );
  }

  /** Categorized logging */
  if (detectedTypes.has("FC") || detectedTypes.has("VFC")) {
    logFC.push(filePath);
  } else if (detectedRuntimeAPIs.has("Fragment")) {
    logFragment.push(filePath);
  } else if (detectedRuntimeAPIs.size > 0) {
    logRuntimeAPI.push(filePath);
  } else {
    logHooksOnly.push(filePath);
  }

  /** Emit code */
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const result: string = printer.printFile(updated);

  fs.writeFileSync(filePath, result);
  formatFile(filePath);

  console.log("Updated:", filePath);
}

/**
 * Shape of CLI arguments derived from `process.argv`.
 */
interface CLIOptions {
  /** Optional target file to rewrite; undefined means run repo-wide. */
  readonly targetFile?: string;
  /** Whether the caller asked for usage instructions instead of execution. */
  readonly showHelp: boolean;
}

/**
 * Parses CLI arguments for the script, supporting both positional file paths
 * and explicit flags such as `--file`, `--all`, and `--help`.
 *
 * @param args - Raw CLI arguments excluding `node` and script paths.
 * @returns A normalized options object consumed by the `main` entrypoint.
 */
function parseCLIArgs(args: readonly string[]): CLIOptions {
  let targetFile: string | undefined;
  let showHelp = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;

    if (arg === "--help" || arg === "-h") {
      showHelp = true;
      continue;
    }

    if (arg === "--file" || arg === "-f") {
      const explicitPath = args[i + 1];
      if (!explicitPath) {
        console.warn("Missing path after --file flag; falling back to repo-wide run.");
      } else {
        targetFile = explicitPath;
        i++;
      }
      continue;
    }

    if (arg === "--all") {
      targetFile = undefined;
      continue;
    }

    if (!targetFile) {
      targetFile = arg;
    } else {
      console.warn(`Ignoring unknown argument: ${arg}`);
    }
  }

  return { targetFile, showHelp };
}

/**
 * Prints supported CLI commands and examples so contributors can run the
 * codemod without hunting for documentation.
 */
function printUsage(): void {
  const cmd = "pnpm ts-node scripts/fix-react-imports.ts";
  console.log("Usage:\n" +
    `  ${cmd} --help\n` +
    `  ${cmd} --file path/to/file.tsx\n` +
    `  ${cmd} --all`);

  console.log("\nCommands:");
  console.log("  --file, -f   Run against a single file (relative or absolute path)");
  console.log("  --all        Scan all workspace packages (default behavior)");
  console.log("  --help, -h   Show this usage summary");

  console.log("\nExamples:");
  console.log(`  ${cmd}`);
  console.log(`  ${cmd} --file apps/frontiers/components/fleet/CrewCard.tsx`);
  console.log(`  ${cmd} apps/frontiers/components/fleet/CrewCard.tsx`);
}

/**
 * Executes the codemod either on a specific file (when provided) or across
 * the entire monorepo workspace using the standard glob patterns.
 *
 * @param targetFile - Optional absolute or relative file path to process.
 */
async function run(targetFile?: string): Promise<void> {
  const files = targetFile
    ? [path.resolve(targetFile)]
    : await globby([
        "packages/**/*.{ts,tsx}",
        "apps/**/*.{ts,tsx}",
        "!**/node_modules/**",
        "!**/.turbo/**"
      ]);

  if (targetFile && !fs.existsSync(files[0]!)) {
    console.error(`File not found: ${files[0]}`);
    process.exitCode = 1;
    return;
  }

  for (const f of files) {
    try {
      transformFile(f);
    } catch (err) {
      console.error(`Failed to transform ${f}:`, err);
    }
  }

  const duplicateReactImports = scanForDuplicateReactImports(files);
  if (duplicateReactImports.size > 0) {
    console.warn("\n⚠️ Duplicate React imports detected:");
    for (const [filePath, names] of duplicateReactImports) {
      console.warn(`  ${filePath}: ${names.join(", ")}`);
    }
    console.warn("Review these files manually to consolidate imports.\n");
  } else {
    console.log("\n✅ No duplicate React imports detected across scanned files.\n");
  }

  const logOutput: string = [
    "=== React Namespace Cleanup Log ===",
    "",
    "[FC/VFC Conversions]",
    ...logFC,
    "",
    "[Fragment Conversions]",
    ...logFragment,
    "",
    "[Runtime API Conversions]",
    ...logRuntimeAPI,
    "",
    "[Hooks Only]",
    ...logHooksOnly,
    "",
    "[Duplicate React Imports]",
    ...(duplicateReactImports.size > 0
      ? Array.from(duplicateReactImports.entries()).map(
          ([filePath, names]) => `${filePath}: ${names.join(", ")}`
        )
      : ["<none>"])
  ].join("\n");

  fs.writeFileSync("react-namespace-cleanup.log", logOutput, "utf8");
  console.log("Log generated: react-namespace-cleanup.log");
  console.log("🎉 Modernization complete!");
}

/**
 * CLI entrypoint. Parses arguments, optionally prints help, then kicks off
 * the codemod run.
 *
 * @command `pnpm ts-node scripts/fix-react-imports.ts`
 */
async function main(): Promise<void> {
  const options = parseCLIArgs(process.argv.slice(2));

  if (options.showHelp) {
    printUsage();
    return;
  }

  await run(options.targetFile);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
