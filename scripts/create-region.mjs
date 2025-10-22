import fs from "fs/promises";
import path from "path";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGION_PREFIX = "region-";
const WORKSPACE_ROOT = path.resolve(__dirname, "..");
const TEMPLATE_DIR = path.resolve(__dirname, "../apps/region-template");
const PNPM_COMMAND = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".mdx",
  ".txt",
  ".tsconfig",
  ".config",
  ".yml",
  ".yaml",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".svg",
  ".html"
]);
const TEXT_BASENAMES = new Set([".env", ".env.local", ".env.example", "CONTRIBUTING.md"]);
const SKIP_COPY_NAMES = new Set(["node_modules", ".next", ".turbo"]);

function parseArgs(argv) {
  const options = { dryRun: false, skipInstall: false };
  let nameArg;
  const extras = [];

  for (const arg of argv) {
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--skip-install" || arg === "--no-install") {
      options.skipInstall = true;
    } else if (arg.startsWith("--")) {
      fail(`Unknown flag "${arg}".`);
    } else if (!nameArg) {
      nameArg = arg;
    } else {
      extras.push(arg);
    }
  }

  if (extras.length > 0) {
    fail(`Unexpected extra arguments: ${extras.join(", ")}`);
  }

  return { nameArg, options };
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

async function ensureTemplateExists() {
  try {
    const stat = await fs.stat(TEMPLATE_DIR);
    if (!stat.isDirectory()) {
      fail(`Template directory is not a folder: ${TEMPLATE_DIR}`);
    }
  } catch (err) {
    if (err && err.code === "ENOENT") {
      fail(`Template directory not found: ${TEMPLATE_DIR}`);
    }
    throw err;
  }
}

async function ensureDestinationAvailable(destDir) {
  try {
    await fs.access(destDir);
    fail(`Destination already exists: ${destDir}`);
  } catch (err) {
    if (err && err.code === "ENOENT") {
      return;
    }
    throw err;
  }
}

async function copyTemplate(destDir, options) {
  if (options.dryRun) {
    console.log(`[dry-run] Would copy ${TEMPLATE_DIR} -> ${destDir}`);
    return;
  }
  try {
    await fs.cp(TEMPLATE_DIR, destDir, {
      recursive: true,
      filter: (src) => {
        const name = path.basename(src);
        return !SKIP_COPY_NAMES.has(name);
      }
    });
  } catch (err) {
    if (err && err.code === "EACCES") {
      fail(`Permission denied while copying template into ${destDir}. Try running with elevated privileges or choose a writable location.`);
    }
    throw err;
  }
}

async function removeTemplateDataDir(destDir, options) {
  const dataDir = path.join(destDir, "data");
  if (options.dryRun) {
    console.log(`[dry-run] Would remove demo data directory at ${dataDir}`);
    return;
  }
  try {
    await fs.rm(dataDir, { recursive: true, force: true });
  } catch (err) {
    if (err && err.code !== "ENOENT") {
      throw err;
    }
  }
}

async function updatePackageJson(destDir, regionName, options) {
  const pkgPath = path.join(destDir, "package.json");
  if (options.dryRun) {
    console.log(`[dry-run] Would update package name to "${regionName}" in ${pkgPath}`);
    return;
  }
  const raw = await fs.readFile(pkgPath, "utf8");
  const pkg = JSON.parse(raw);
  pkg.name = regionName;
  await fs.writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
}

function shouldScanFile(filePath) {
  const name = path.basename(filePath);
  if (TEXT_BASENAMES.has(name)) return true;
  const ext = path.extname(filePath).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
}

async function gatherFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_COPY_NAMES.has(entry.name)) continue;
      files.push(...(await gatherFiles(absPath)));
    } else if (entry.isFile()) {
      files.push(absPath);
    }
  }
  return files;
}

async function replaceTemplateName(destDir, regionName, options) {
  if (options.dryRun) {
    console.log(`[dry-run] Would replace "region-template" references within ${destDir}`);
    return;
  }
  const files = await gatherFiles(destDir);
  const BATCH_SIZE = 25;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE).map(async (file) => {
      if (!shouldScanFile(file)) return;
      let contents;
      try {
        contents = await fs.readFile(file, "utf8");
      } catch {
        return;
      }
      if (!contents.includes("region-template")) return;
      const updated = contents.replace(/region-template/g, regionName);
      if (updated !== contents) {
        await fs.writeFile(file, updated, "utf8");
      }
    });
    await Promise.allSettled(batch);
  }
}

async function promptForRegionInput(argvValue, options) {
  if (argvValue) return argvValue;
  if (options.dryRun) {
    fail('Provide a region identifier when using "--dry-run"; interactive prompts are disabled in dry-run mode.');
  }
  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question(`? Region identifier (no "${REGION_PREFIX}" prefix needed, e.g. "pccd"): `);
    return answer;
  } finally {
    rl.close();
  }
}

function normalizeRegionName(rawValue) {
  const trimmed = (rawValue || "").trim().toLowerCase();
  if (!trimmed) {
    fail("No region name provided. Re-run the command and enter a name when prompted.");
  }
  const withoutPrefix = trimmed.startsWith(REGION_PREFIX)
    ? trimmed.slice(REGION_PREFIX.length)
    : trimmed;
  const slug = withoutPrefix.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slug) {
    fail("Region name must contain at least one alphanumeric character.");
  }
  const regionName = `${REGION_PREFIX}${slug}`;
  if (regionName === "region-template") {
    fail("Refusing to overwrite the template. Choose a different name.");
  }
  if (!/^region-[a-z0-9-]+$/.test(regionName)) {
    fail(
      `Region name may only contain lowercase letters, numbers, or hyphens after the "${REGION_PREFIX}" prefix. Received: ${regionName}`
    );
  }
  const regionLabel = slug.toUpperCase();
  return { regionName, regionLabel, regionSlug: slug };
}

function printIntro(options) {
  console.log("Create Region");
  console.log("-------------");
  console.log("This command copies apps/region-template into a new region directory,");
  console.log("updates package metadata, and replaces any references to \"region-template\".");
  console.log("You'll receive reminders about wiring up adapters and environment variables once it finishes.\n");
  if (options.dryRun) {
    console.log("Dry-run enabled — listing actions only. No files will be modified.\n");
  }
  if (options.skipInstall && !options.dryRun) {
    console.log("Skip install enabled — will not run pnpm install.\n");
  }
}

async function updateFileIfChanged(filePath, updater) {
  try {
    const original = await fs.readFile(filePath, "utf8");
    const updated = await updater(original);
    if (updated !== original) {
      await fs.writeFile(filePath, updated, "utf8");
    }
  } catch (err) {
    if (err && err.code === "ENOENT") {
      return;
    }
    throw err;
  }
}

async function updateBranding(destDir, regionLabel, options) {
  if (options.dryRun) {
    console.log(`[dry-run] Would update branding strings for "${regionLabel}" in ${destDir}`);
    return;
  }
  const brandName = `ART Region ${regionLabel}`;
  const brandNameWithDot = `ART. Region ${regionLabel}`;
  const dispatchName = `ART Dispatch — ${regionLabel}`;
  const navPath = path.join(destDir, "nav.config.ts");
  const layoutPath = path.join(destDir, "app", "layout.tsx");
  const manifestPath = path.join(destDir, "public", "site.webmanifest");

  await updateFileIfChanged(navPath, (content) =>
    content.replace(/(name:\s*)(["'])ART Region Template\2/, `$1$2${brandName}$2`)
  );

  await updateFileIfChanged(layoutPath, (content) => {
    let next = content.replaceAll("ART Region Template", brandName);
    next = next.replaceAll("ART. Region Template", brandNameWithDot);
    next = next.replaceAll("ART Dispatch — Region", dispatchName);
    return next;
  });

  await updateFileIfChanged(manifestPath, (content) => {
    try {
      const data = JSON.parse(content);
      data.name = brandName;
      data.short_name = `ART ${regionLabel} Dispatch`;
      return `${JSON.stringify(data, null, 2)}\n`;
    } catch {
      return content;
    }
  });
}

async function runPnpmInstall(regionName, options) {
  if (options.dryRun || options.skipInstall) {
    const reason = options.dryRun ? "dry-run" : "--skip-install";
    console.log(`[skip] pnpm install (${reason})`);
    return;
  }
  console.log(`\nRunning pnpm install to register ${regionName} with the workspace...`);
  await new Promise((resolve, reject) => {
    const child = spawn(PNPM_COMMAND, ["install"], {
      cwd: WORKSPACE_ROOT,
      stdio: "inherit",
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`pnpm install exited with code ${code}`));
      }
    });
    child.on("error", (err) => {
      if (err && err.code === "ENOENT") {
        fail("pnpm not found in PATH. Install pnpm or ensure it is available before re-running this command.");
      }
      reject(err);
    });
  });
}

async function main() {
  const { nameArg, options } = parseArgs(process.argv.slice(2));
  printIntro(options);
  const rawInput = await promptForRegionInput(nameArg, options);
  const { regionName, regionLabel } = normalizeRegionName(rawInput);

  await ensureTemplateExists();

  const destDir = path.resolve(__dirname, "../apps", regionName);
  await ensureDestinationAvailable(destDir);

  await copyTemplate(destDir, options);
  await removeTemplateDataDir(destDir, options);
  await updatePackageJson(destDir, regionName, options);
  await replaceTemplateName(destDir, regionName, options);
  await updateBranding(destDir, regionLabel, options);
  await runPnpmInstall(regionName, options);

  const relPath = path.relative(process.cwd(), destDir);
  if (options.dryRun) {
    console.log(`\nDry run complete. ${regionName} would be created at ${relPath}.`);
    return;
  }
  console.log(`\nCreated ${regionName} at ${relPath}`);
  console.log("Next steps:");
  console.log(`- Wire up region-specific data adapters in ${path.join(relPath, "lib")}`);
  console.log(`- Update any environment variables in ${path.join(relPath, ".env")}`);
  console.log(`- Configure data layers to use the new database connections inside ${path.join(relPath, "components/dataLayer")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
