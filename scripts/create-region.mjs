import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGION_PREFIX = "region-";
const TEMPLATE_DIR = path.resolve(__dirname, "../apps/region-template");
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

async function copyTemplate(destDir) {
  await fs.cp(TEMPLATE_DIR, destDir, {
    recursive: true,
    filter: (src) => {
      const name = path.basename(src);
      return !SKIP_COPY_NAMES.has(name);
    }
  });
}

async function updatePackageJson(destDir, regionName) {
  const pkgPath = path.join(destDir, "package.json");
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

async function replaceTemplateName(destDir, regionName) {
  const files = await gatherFiles(destDir);
  for (const file of files) {
    if (!shouldScanFile(file)) continue;
    let contents;
    try {
      contents = await fs.readFile(file, "utf8");
    } catch {
      continue;
    }
    if (!contents.includes("region-template")) continue;
    const updated = contents.replaceAll("region-template", regionName);
    if (updated !== contents) {
      await fs.writeFile(file, updated, "utf8");
    }
  }
}

async function main() {
  const regionName = process.argv[2];
  if (!regionName) {
    fail("Usage: pnpm create:region region-your-name");
  }
  if (!regionName.startsWith(REGION_PREFIX)) {
    fail(`Region name must start with "${REGION_PREFIX}". Received: ${regionName}`);
  }
  if (regionName === "region-template") {
    fail("Refusing to overwrite the template. Choose a new region name.");
  }
  if (!/^region-[a-z0-9-]+$/.test(regionName)) {
    fail(`Region name may only contain lowercase letters, numbers, and hyphens. Received: ${regionName}`);
  }

  await ensureTemplateExists();

  const destDir = path.resolve(__dirname, "../apps", regionName);
  await ensureDestinationAvailable(destDir);

  await copyTemplate(destDir);
  await updatePackageJson(destDir, regionName);
  await replaceTemplateName(destDir, regionName);

  const relPath = path.relative(process.cwd(), destDir);
  console.log(`Created ${regionName} at ${relPath}`);
  console.log("Next steps:");
  console.log(`- Wire up region-specific data adapters in ${path.join(relPath, "lib")}`);
  console.log(`- Update any environment variables in ${path.join(relPath, ".env")}`);
  console.log(`- Configure data layers to use the new database connections inside ${path.join(relPath, "components/dataLayer")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
