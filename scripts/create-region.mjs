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

// Styling helpers (no external deps)
const supportsColor = process.stdout.isTTY && process.env.NO_COLOR !== "1";
const code = (open, close) => (str) => (supportsColor ? `\x1b[${open}m${str}\x1b[${close}m` : String(str));
const bold = code(1, 22);
const dim = code(2, 22);
const red = code(31, 39);
const green = code(32, 39);
const yellow = code(33, 39);
const blue = code(34, 39);
const magenta = code(35, 39);
const cyan = code(36, 39);
const gray = code(90, 39);

const symbols = {
  info: "ℹ",
  success: "✔",
  warn: "⚠",
  error: "✖",
  step: "➜",
  skip: "⏭",
  dry: "🧪",
};

const log = {
  header(title) {
    console.log(bold(cyan(title)));
  },
  hr(len = 13) {
    console.log(dim("-".repeat(len)));
  },
  info(msg) {
    console.log(`${cyan(symbols.info)} ${msg}`);
  },
  step(msg) {
    console.log(`${cyan(symbols.step)} ${msg}`);
  },
  success(msg) {
    console.log(`${green(symbols.success)} ${msg}`);
  },
  warn(msg) {
    console.log(`${yellow(symbols.warn)} ${msg}`);
  },
  error(msg) {
    console.log(`${red(symbols.error)} ${msg}`);
  },
  skip(msg) {
    console.log(`${yellow(symbols.skip)} ${dim(msg)}`);
  },
  dry(msg) {
    console.log(`${yellow(symbols.dry)} ${dim(msg)}`);
  },
};

// ASCII art banner provided by user
const BANNER = `
                                                                                                    
                                                                                                    
                                                @@@@                                                
                                             @@@@@@@@@@                                             
                                           @@@@@@  @@@@@@                                           
                                       @@@@@@@@  @@  @@@@@@@@                                       
                                    @@@@@@@@   @@@@@@   @@@@@@@@                                    
                                @@@@@@@@@   @@@@%=+@@@@@   @@@@@@@@@                                
                          @@@@@@@@@@@    @@@@@#-::::-%@@@@@    @@@@@@@@@@@                          
            @@@@@@@@@@@@@@@@@@@@@    @@@@@@%=::::::::::+%@@@@@@    @@@@@@@@@@@@@@@@@@@@@            
           @@@@@@@@@@@@@@@@      @@@@@@%*=-::::::::::::::-=*%@@@@@@      @@@@@@@@@@@@@@@            
           @@@@          @@@@@@@@@@%+--::::::::::::::::::::::--*%@@@@@@@@@@          @@@@           
           @@@@  @@@@@@@@@@@@%*=::::::::::::::::::::::::::::::::::::=*%@@@@@@@@@@@@  @@@@           
           @@@@  @@#===-:::::::::::::::::::::::::::::::::::-=**+-:::::::::::-===%@@  @@@@           
           @@@@ @@@*::::::::::::::::::::::::::::::::::::-*%@@@@@@#=:::::::::::::*@@  @@@@           
           @@@@ @@@+::::::-@@=:::::::::::::::::::::==-:%@@@@@@@@@@+:::::::::::::*@@  @@@@           
           @@@@ @@@+::::::+@%--:::::::::::::::::=*@@@@%=+@@@@@@@@%=:::::::::::::*@@  @@@@           
            @@@  @@*::::::*@@@@@@%%#**-::::::-*%@@@@@@@@%=#@@@@#=*%@%=::::::::::*@@  @@@            
            @@@  @@*:::::-%@=--==+*#%%=:::-*@@@@@@@@@@@@@@*=%+*@@@@@@@*-::::::::#@@  @@@            
            @@@@ @@%:::::=%@:::::::::::-%@@@@@@@@@@@@@@@@@@@=*@@@@@@@@%-::::::::%@@ @@@@            
            @@@@ @@@::::::::--::::-===-@@@@@@@@@@@@%+@@@@@@@@*+@@@@@@@=::::::::-@@@ @@@@            
            @@@@ @@@=:::::*@@@%=+%@@@+:%@@@@@@@@**#%-#@@@@@@@@%*@@@@*=++-::::::+@@@ @@@@            
            @@@@ @@@*::::=%@=-*@@#=-:::*@@@@@@@@@#***=*@@@@@@#*@@*=%@@@@@*:::::#@@@ @@@@            
             @@@@ @@@-:::=%%::=@%::::::-@@@@@@@@######**##%###*=%@@@@@@@@%=:::-@@@ @@@@             
             @@@@ @@@+:::=%@%@@@@@@@@#::%@@@@@@%############%%@@@@@@@@@@@%=:::+@@@ @@@@             
              @@@@ @@#-::-+*++++=====+::+@@@@@@%###########@@@@@@@@@@@@@*=:::-%@@ @@@@              
              @@@@ @@@=:::::::::::=@@%=:-@@@@@@%###########@@@@@@@@@%+*@@@@=:=@@@ @@@@              
               @@@@ @@#-::::::-=%@@@+:::-%@@@@@@%%##########%@@%%**%@@@@@@@#-#@@ @@@@               
               @@@@ @@@=::::=#@@%*%@=::::*@@@@@@@%%#######%%*=*@@@@@@@@@@@@++@@@ @@@@               
                @@@@ @@@-::*@@*=::*@#::::=@@@@@@@@@@%####%@@%+#@@@@@@@@@@%=-@@@ @@@@                
                @@@@ @@@%::=@@@@@@@@@@@%:=%@@@@%@@@@@@%%@@@@%#+@@@@%*===::-%@@@@@@@                 
                 @@@@ @@@*::::::::::-==+:-%@@@@@@@@@@@@%@%@@@@@++*%@@@*::-*@@@@@@@@                 
                  @@@@ @@@+::::::::::::::=@@@@@@@@@@@@@@@@@@%@@@@@@@@=:::*@@@ @@@@                  
                   @@@@ @@@=::::::::::::=@@@@@@@@@@@@@@@@@@@@@@@@@@#-:::+@@@ @@@@                   
                    @@@@ @@@+::::::::::*@@@@@@@@@@@@@@%%@@@@@@@@@@+::::*@@@ @@@@                    
                     @@@@ @@@*-::::::-#@@@@@@@@@@@@@@@%%@@@@@@@@*-:::-*@@@ @@@@                     
                      @@@@ @@@*-::::=%@@@@@@@@@@@@@@@@%%@@@@%*=:::::-#@@@ @@@@                      
                       @@@@ @@@@-::=@@@@@@@@@@@@@@@@@@@@@@+::::::::-@@@@ @@@@                       
                        @@@@@@@@@**@@@@@@@@@@@@@@@@@@@@@@*:::::::-*@@@ @@@@@                        
                         @@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@*:::::::=%@@@ @@@@@                         
                           @@@@  @@@@@@@@@@@@@@@@@@@@@@#::::::-#@@@ @@@@@                           
                            @@@@@ @@@@@@@@@@@@@@@@@@@@#-::::-*@@@@ @@@@@                            
                             @@@@@@ @@@@@@@@@@@@@@@@@%=:::-*@@@@ @@@@@@                             
                               @@@@@@ @@@@@@@@@@@@@@@=::-#@@@@ @@@@@@                               
                                 @@@@@@ @@@@@@@@@@@@=:+%@@@@ @@@@@@                                 
                                   @@@@@@  @@@@@@@@=#@@@@  @@@@@@                                   
                                     @@@@@@  @@@@@@@@@@  @@@@@@                                     
                                       @@@@@@@  @@@@  @@@@@@@                                       
                                          @@@@@@    @@@@@@                                          
                                            @@@@@@@@@@@@                                            
                                               @@@@@@                                               
                                                                                                    
                                                                                                    
                                                                                                    
`;

function printBanner(options) {
  if (!options.banner) return;
  if (!process.stdout.isTTY && process.env.FORCE_BANNER !== "1") return;
  console.log(cyan(BANNER));
}

function parseArgs(argv) {
  const options = { dryRun: false, skipInstall: false, useSupa: false, banner: true, useSupaExplicit: false, verify: false, verifyExplicit: false };
  let nameArg;
  const extras = [];

  for (const arg of argv) {
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--skip-install" || arg === "--no-install") {
      options.skipInstall = true;
    } else if (arg === "-supa" || arg === "--supa") {
      options.useSupa = true;
      options.useSupaExplicit = true;
    } else if (arg === "--no-banner") {
      options.banner = false;
    } else if (arg === "--banner" || arg === "-b") {
      options.banner = true;
    } else if (arg === "--verify") {
      options.verify = true;
      options.verifyExplicit = true;
    } else if (arg === "--no-verify") {
      options.verify = false;
      options.verifyExplicit = true;
    } else if (/^--?/.test(arg)) {
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
    const stat = await fs.stat(getTemplateDir({ useSupa: false }));
    if (!stat.isDirectory()) {
      fail(`Template directory is not a folder: ${getTemplateDir({ useSupa: false })}`);
    }
  } catch (err) {
    if (err && err.code === "ENOENT") {
      fail(`Template directory not found: ${getTemplateDir({ useSupa: false })}`);
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

function getTemplateDir(options) {
  return path.resolve(__dirname, "../apps", options.useSupa ? "region-pnw" : "region-template");
}

async function copyTemplate(destDir, options) {
  if (options.dryRun) {
    log.dry(`Would copy ${getTemplateDir(options)} -> ${destDir}`);
    return;
  }
  try {
    await fs.cp(getTemplateDir(options), destDir, {
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
    log.dry(`Would remove demo data directory at ${dataDir}`);
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
    log.dry(`Would update package name to "${regionName}" in ${pkgPath}`);
    return;
  }
  const raw = await fs.readFile(pkgPath, "utf8");
  const pkg = JSON.parse(raw);
  pkg.name = regionName;
  // Set/adjust description to be region-aware if missing or looks like a template placeholder
  const desiredDescription = `ART Next.js app for ${regionName}`;
  if (!pkg.description || /template|region-template|replace/i.test(pkg.description)) {
    pkg.description = desiredDescription;
  }
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

async function replaceTemplateName(destDir, regionName, fromName, options) {
  if (options.dryRun) {
    log.dry(`Would replace "${fromName}" references within ${destDir}`);
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
      let updated = contents;
      if (contents.includes(fromName)) {
        updated = updated.replace(new RegExp(fromName, "g"), regionName);
      }
      // Also region-scope common persisted storage keys by appending :<region>
      const regionSuffix = `:${regionName}`;
      const storageKeyPatterns = [
        /(['"])dispatch-store\1/g,
        /(['"])profile-store\1/g,
        /(['"])pod-store\1/g,
        /(['"])pod-academy-dashboard-store\1/g,
        /(['"])meet-a-need-store\1/g,
      ];
      for (const re of storageKeyPatterns) {
        updated = updated.replace(re, (m, quote) => {
          const key = m.slice(1, -1);
          return key.includes(regionName) ? m : `${quote}${key}${regionSuffix}${quote}`;
        });
      }
      // Namespace common UI localStorage keys for filters where present
      updated = updated.replace(/persistKey=(\"|\')dispatchList\.filters(\"|\')/g, (_m, q1, q2) => `persistKey=${q1}dispatchList.filters${regionSuffix}${q2}`);
      // Region-scope pods filter key if present
      updated = updated.replace(/persistKey=(\"|\')podsList\.filters(\"|\')/g, (_m, q1, q2) => `persistKey=${q1}podsList.filters${regionSuffix}${q2}`);
      // Ensure notifications bootstrap default (if present) uses the target region
      updated = updated.replace(/notifications-store:region-[a-z0-9_-]+/gi, `notifications-store:${regionName}`);
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

async function promptForUseSupa(options) {
  if (options.dryRun || options.useSupaExplicit) return options.useSupa;
  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question("? Use Supabase template (apps/region-pnw)? (y/N): ");
    const normalized = (answer || "").trim().toLowerCase();
    if (!normalized) return false; // default N
    return normalized === "y" || normalized === "yes";
  } finally {
    rl.close();
  }
}

async function promptForVerify(options) {
  if (options.dryRun || options.verifyExplicit) return options.verify;
  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question("? Run verification (lint + typecheck) after creation? (y/N): ");
    const normalized = (answer || "").trim().toLowerCase();
    if (!normalized) return false; // default N
    return normalized === "y" || normalized === "yes";
  } finally {
    rl.close();
  }
}

async function promptForProceed({ regionName, baseName, destDir, options }) {
  if (options.dryRun) return true; // in dry-run, don't block
  const rl = readline.createInterface({ input, output });
  try {
    console.log("");
    log.info(`Summary:`);
    console.log(`- Region: ${yellow(regionName)}`);
    console.log(`- Template: ${cyan(baseName)}`);
    console.log(`- Destination: ${dim(destDir)}`);
    console.log(`- Run verification: ${options.verify ? green("Yes") : dim("No")}`);
    if (options.skipInstall) console.log(`- Skip install: ${yellow("Yes")}`);
    const answer = await rl.question(`\nProceed to create this region now? (Y/n): `);
    const normalized = (answer || "").trim().toLowerCase();
    if (!normalized) return true; // default Y
    return normalized === "y" || normalized === "yes";
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
  printBanner(options);
  log.header("Create Region");
  log.hr("Create Region".length);
  const templateRel = path.relative(process.cwd(), getTemplateDir(options));
  console.log(dim(`This command copies ${templateRel} into a new region directory,`));
  const baseName = options.useSupa ? "region-pnw" : "region-template";
  console.log(dim(`updates package metadata, and replaces any references to "${baseName}".`));
  console.log(dim("You'll receive reminders about wiring up adapters and environment variables once it finishes.\n"));
  if (options.dryRun) {
    log.warn("Dry-run enabled — listing actions only. No files will be modified.\n");
  }
  if (options.skipInstall && !options.dryRun) {
    log.skip("Skip install enabled — will not run pnpm install.\n");
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
    log.dry(`Would update branding strings for "${regionLabel}" in ${destDir}`);
    return;
  }
  const brandName = `ART Region ${regionLabel}`;
  const brandNameWithDot = `ART. Region ${regionLabel}`;
  const dispatchName = `ART Dispatch — ${regionLabel}`;
  const navPath = path.join(destDir, "nav.config.ts");
  const layoutPath = path.join(destDir, "app", "layout.tsx");
  const manifestPath = path.join(destDir, "public", "site.webmanifest");

  await updateFileIfChanged(navPath, (content) => {
    // Replace any nav name like: name: "ART Region <X>"
    const re = /(name:\s*)(["'])ART Region[^"']*\2/;
    return content.replace(re, `$1$2${brandName}$2`);
  });

  await updateFileIfChanged(layoutPath, (content) => {
    let next = content;
    // Replace various forms of branding from either template (Template/PNW/other slug)
    next = next.replace(/ART Region (Template|PNW|[A-Z0-9-]+)/g, brandName);
    next = next.replace(/ART\. Region (Template|PNW|[A-Z0-9-]+)/g, brandNameWithDot);
    next = next.replace(/ART Dispatch — (Region|PNW|[A-Z0-9-]+)/g, dispatchName);
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

function parseDotenv(content) {
  const keys = new Set();
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=/);
    if (m) keys.add(m[1]);
  }
  return keys;
}

async function ensureEnvExample(destDir, options, regionSlug) {
  const envPath = path.join(destDir, ".env.example");
  if (options.dryRun) {
    log.dry(`Would scaffold/update ${envPath} with region env keys`);
    return;
  }
  let content = "";
  try {
    content = await fs.readFile(envPath, "utf8");
  } catch (err) {
    if (!err || err.code !== "ENOENT") throw err;
    // Create a new file skeleton if it doesn't exist
    content = `# Auto-generated by scripts/create-region.mjs\n# Fill these values and copy to .env.local for local development.\n`;
  }
  const existing = parseDotenv(content);
  const requiredBase = [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_AUTH_PROVIDER",
    // Contact & support
    "REVERSE_GEOCODE_CONTACT",
    "NEXT_PUBLIC_CONTACT_EMAIL",
  ];
  const requiredSupa = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY", // optional; leave empty by default
  ];
  const keysToEnsure = options.useSupa ? [...requiredBase, ...requiredSupa] : requiredBase;
  const missing = keysToEnsure.filter((k) => !existing.has(k));
  if (missing.length === 0) return; // nothing to do
  const lines = ["", "# Required env keys for this region:"]; // keep a blank line before block
  const defaultValues = {
    // Provide sensible defaults where safe; these can be changed per region later
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    REVERSE_GEOCODE_CONTACT: regionSlug ? `${regionSlug}@alwaysreadytools.org` : "info@alwaysreadytools.org",
    NEXT_PUBLIC_CONTACT_EMAIL: regionSlug ? `${regionSlug}@alwaysreadytools.org` : "info@alwaysreadytools.org",
  };
  for (const k of missing) {
    const v = Object.prototype.hasOwnProperty.call(defaultValues, k) ? defaultValues[k] : "";
    lines.push(`${k}=${v}`);
  }
  if (options.useSupa) {
    lines.push(
      "",
      "# Optional admin Supabase envs (only if you use admin-targeted ops)",
      "# NEXT_PUBLIC_SUPABASE_URL_ADMIN=",
      "# NEXT_PUBLIC_SUPABASE_ANON_KEY_ADMIN=",
      "# SUPABASE_SERVICE_ROLE_KEY_ADMIN="
    );
  }
  await fs.writeFile(envPath, `${content}${lines.join("\n")}\n`, "utf8");
}

async function ensureWorkspaceRegistration(regionName, options) {
  const workspacePath = path.resolve(WORKSPACE_ROOT, "pnpm-workspace.yaml");
  if (options.dryRun) {
    log.dry(`Would verify workspace registration in ${workspacePath}`);
  } else {
    let ws;
    try {
      ws = await fs.readFile(workspacePath, "utf8");
    } catch (err) {
      log.warn(`Could not read pnpm-workspace.yaml at ${workspacePath}. Ensure the new app is included in workspace packages.`);
      ws = null;
    }
    if (ws) {
      const hasAppsGlob = /\n\s*-\s*apps\/\*\s*$/m.test(ws) || /packages:\s*\n[\s\S]*?-\s*apps\/\*/m.test(ws);
      if (!hasAppsGlob) {
        // Try to insert under packages:
        const packagesIdx = ws.indexOf("packages:");
        if (packagesIdx === -1) {
          // Append a minimal packages block
          ws = `${ws.trim()}\n\npackages:\n  - apps/*\n`;
        } else {
          // Find insertion point after the last existing list item under packages
          const lines = ws.split(/\r?\n/);
          const startLine = lines.findIndex((l) => /(^|\s)packages:\s*$/.test(l));
          let insertAt = startLine + 1;
          let i = insertAt;
          while (i < lines.length && /^\s*-\s*[^].*/.test(lines[i])) i++;
          const indent = (lines[startLine + 1] && (lines[startLine + 1].match(/^(\s*)-/)?.[1] || "  ")) || "  ";
          lines.splice(i, 0, `${indent}- apps/*`);
          ws = lines.join("\n");
        }
        try {
          await fs.writeFile(workspacePath, ws, "utf8");
          log.success(`Updated pnpm-workspace.yaml to include apps/*`);
        } catch (err) {
          log.warn(`Failed to update pnpm-workspace.yaml automatically. Please ensure apps/* is listed under packages.`);
        }
      } else {
        log.info("Workspace already includes apps/* pattern.");
      }
    }
  }

  // Validate turbo.json exists and is parseable (turborepo usually doesn't require per-app registration)
  const turboPath = path.resolve(WORKSPACE_ROOT, "turbo.json");
  try {
    const raw = await fs.readFile(turboPath, "utf8");
    JSON.parse(raw);
  } catch (err) {
    log.warn(`turbo.json missing or invalid at ${turboPath}. Turborepo may not run correctly.`);
  }
}

async function postCopyChecks(destDir) {
  const requiredFiles = [
    path.join(destDir, "app", "layout.tsx"),
    path.join(destDir, "nav.config.ts"),
    path.join(destDir, "public", "site.webmanifest"),
    path.join(destDir, "package.json"),
  ];
  const missing = [];
  for (const f of requiredFiles) {
    try {
      const s = await fs.stat(f);
      if (!s.isFile()) missing.push(f);
    } catch {
      missing.push(f);
    }
  }
  if (missing.length) {
    fail(`Template copy incomplete. Missing required files:\n- ${missing.map((p) => path.relative(process.cwd(), p)).join("\n- ")}`);
  }

  // Validate scripts
  try {
    const pkg = JSON.parse(await fs.readFile(path.join(destDir, "package.json"), "utf8"));
    const scripts = (pkg && pkg.scripts) || {};
    const requiredScripts = ["dev", "build", "start"];
    const missingScripts = requiredScripts.filter((k) => !scripts[k]);
    if (missingScripts.length) {
      log.warn(`package.json is missing scripts: ${missingScripts.join(", ")}`);
    }
  } catch (err) {
    log.warn(`Could not read/parse package.json for script validation.`);
  }
}

async function hasTypecheckScript(destDir) {
  try {
    const pkg = JSON.parse(await fs.readFile(path.join(destDir, "package.json"), "utf8"));
    return Boolean(pkg?.scripts?.typecheck);
  } catch {
    return false;
  }
}

async function runVerification(regionName, destDir, options) {
  if (options.dryRun || !options.verify) {
    if (options.verify) log.skip("Verification skipped in dry-run mode.");
    return;
  }
  log.info("Running verification (lint and typecheck)...");
  // Prefer app-scoped lint to avoid repo-wide warnings blocking creation
  let lintStatus = "SKIPPED";
  try {
    await new Promise((resolve, reject) => {
      const child = spawn(PNPM_COMMAND, ["--filter", regionName, "run", "lint"], { cwd: WORKSPACE_ROOT, stdio: "inherit" });
      child.on("close", (code) => {
        if (code === 0) {
          lintStatus = "PASS";
          resolve();
        } else {
          lintStatus = "WARN"; // non-fatal
          resolve();
        }
      });
      child.on("error", (err) => {
        lintStatus = "SKIPPED";
        resolve();
      });
    });
  } catch {
    // ignore
  }

  const filterArg = ["--filter", regionName];
  const useTypecheckScript = await hasTypecheckScript(destDir);
  const args = useTypecheckScript ? [...filterArg, "run", "typecheck"] : [...filterArg, "exec", "tsc", "--noEmit"];
  let typeStatus = "FAIL";
  await new Promise((resolve, reject) => {
    const child = spawn(PNPM_COMMAND, args, { cwd: WORKSPACE_ROOT, stdio: "inherit" });
    child.on("close", (code) => {
      if (code === 0) {
        typeStatus = "PASS";
        resolve();
      } else {
        typeStatus = "FAIL";
        reject(new Error(`Typecheck failed (exit ${code})`));
      }
    });
    child.on("error", (err) => {
      log.warn("TypeScript not found or typecheck command failed.");
      reject(err);
    });
  });
  const statusBadge = (s) => (s === "PASS" ? green("PASS") : s === "WARN" ? yellow("WARN") : dim("SKIPPED"));
  log.success(`Verification summary → Lint: ${statusBadge(lintStatus)}, Typecheck: ${statusBadge(typeStatus)}`);
}

async function ensureRegionReadme(destDir, regionName, regionLabel, options) {
  const readmePath = path.join(destDir, "README.md");
  if (options.dryRun) {
    log.dry(`Would create/update ${readmePath}`);
    return;
  }
  let existing = "";
  try {
    existing = await fs.readFile(readmePath, "utf8");
  } catch (err) {
    if (!err || err.code !== "ENOENT") throw err;
  }
  const header = `# ${regionName} (ART Region ${regionLabel})`;
  const lines = [
    header,
    "",
    "This is a region app in the ART monorepo.",
    "",
    "## Getting started",
    "- Copy .env.example to .env.local and fill in the values",
    `- Start dev server: pnpm --filter ${regionName} dev`,
    "",
    "## Environment",
    "- NEXT_PUBLIC_SITE_URL: Public site URL",
    "- NEXT_PUBLIC_AUTH_PROVIDER: Auth provider for this region",
    "- REVERSE_GEOCODE_CONTACT: Email used as contact when reverse geocoding services require it",
    "- NEXT_PUBLIC_CONTACT_EMAIL: Public contact email displayed in the UI",
    ...(options.useSupa
      ? [
        "- NEXT_PUBLIC_SUPABASE_URL: Supabase URL",
        "- NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anon key",
        "- SUPABASE_SERVICE_ROLE_KEY: Service role (server-only)",
      ]
      : []),
    "",
    "## Shared packages",
    "- @workspace/ui: packages/ui",
    "- @workspace/store: packages/store",
    "",
    "See root README for monorepo scripts and conventions.",
    "",
  ];
  const content = lines.join("\n");
  if (!existing) {
    await fs.writeFile(readmePath, `${content}\n`, "utf8");
  } else if (!existing.includes(header)) {
    await fs.writeFile(readmePath, `${existing.trim()}\n\n${content}\n`, "utf8");
  }
}

async function ensureLandingRegionsRegistration(regionSlug, options) {
  const regionsPath = path.resolve(WORKSPACE_ROOT, "apps/landing/app/regions/regions.ts");
  if (options.dryRun) {
    log.dry(`Would update ${regionsPath} to include/enable subdomain "${regionSlug}"`);
    return;
  }
  let content;
  try {
    content = await fs.readFile(regionsPath, "utf8");
  } catch (err) {
    log.warn(`Could not read landing regions file at ${regionsPath}. Skipping auto-registration.`);
    return;
  }

  const slug = String(regionSlug);
  const subdomainRe = new RegExp(`subdomain:\\s*['\"]${slug}['\"]`);
  if (subdomainRe.test(content)) {
    // Found existing region; remove any disabled: true within that object
    const match = content.match(subdomainRe);
    if (!match) return;
    let idx = match.index || 0;
    // Find the opening { of the object containing this subdomain
    let start = content.lastIndexOf("{", idx);
    if (start === -1) return;
    // Walk forward to find the end of this object by brace balancing
    let depth = 0;
    let end = -1;
    for (let i = start; i < content.length; i++) {
      const ch = content[i];
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          end = i + 1; // include closing brace
          break;
        }
      }
    }
    if (end === -1) return;
    const before = content.slice(0, start);
    const objectText = content.slice(start, end);
    const after = content.slice(end);
    // Remove a line like: disabled: true, (with varying whitespace)
    const cleanedObject = objectText
      .replace(/\n\s*disabled\s*:\s*true\s*,?\s*(?=\n)/g, '\n')
      // Also handle if it's the last prop without trailing comma
      .replace(/,\s*\n\s*disabled\s*:\s*true\s*(?=\n)/g, '\n')
      .replace(/\n\s*disabled\s*:\s*true\s*\n/g, '\n');
    if (cleanedObject !== objectText) {
      const updated = before + cleanedObject + after;
      await fs.writeFile(regionsPath, updated, "utf8");
      log.success(`Enabled landing listing for region "${slug}" (removed disabled: true).`);
    } else {
      log.info(`Landing listing for region "${slug}" already enabled.`);
    }
    return;
  }

  // Not found -> append a new placeholder region entry to the REGIONS array
  const addAt = content.lastIndexOf("\n];");
  if (addAt === -1) {
    log.warn(`Could not locate REGIONS array terminator in ${regionsPath}. Skipping auto-add.`);
    return;
  }
  const indent = "  ";
  const defaultSignalUrl = 'https://signal.group/#CjQKIADTv-8bQiCFQ9uNpqdZVe8ngPlj8O4XSd1hnMBhdg-lEhAKlOr9EvjsnlQh9RXActF-';
  const entry = `\n${indent}{\n${indent}  name: 'TODO: Region Name',\n${indent}  subdomain: '${slug}',\n${indent}  coverage: 'TODO',\n${indent}  notes: 'TODO',\n${indent}  signals: [\n${indent}    { name: 'TODO: Region Signal Group', url: '${defaultSignalUrl}' },\n${indent}  ],\n${indent}},\n`;
  const updated = content.slice(0, addAt) + entry + content.slice(addAt);
  await fs.writeFile(regionsPath, updated, "utf8");
  log.success(`Added new landing listing for region "${slug}" with placeholders.`);
}

async function runPnpmInstall(regionName, options) {
  if (options.dryRun || options.skipInstall) {
    const reason = options.dryRun ? "dry-run" : "--skip-install";
    log.skip(`pnpm install (${reason})`);
    return;
  }
  console.log(`\n${cyan("Running pnpm install")} to register ${yellow(regionName)} with the workspace...`);
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
  const { regionName, regionLabel, regionSlug } = normalizeRegionName(rawInput);
  // If not explicitly provided via flag and not dry-run, ask whether to use Supabase template
  if (!options.useSupaExplicit && !options.dryRun) {
    options.useSupa = await promptForUseSupa(options);
  }
  const destDir = path.resolve(__dirname, "../apps", regionName);
  const baseName = options.useSupa ? "region-pnw" : "region-template";
  log.info(`Using template: ${dim(path.relative(process.cwd(), path.resolve(__dirname, "../apps", baseName)))}`);

  // Make sure the selected template exists
  try {
    const templateDir = getTemplateDir(options);
    const stat = await fs.stat(templateDir);
    if (!stat.isDirectory()) {
      fail(`Template directory is not a folder: ${templateDir}`);
    }
  } catch (err) {
    if (err && err.code === "ENOENT") {
      fail(`Template directory not found: ${getTemplateDir(options)}`);
    }
    throw err;
  }

  await ensureDestinationAvailable(destDir);
  // Ask about verification if not explicitly set
  options.verify = await promptForVerify(options);
  // Final confirmation before making changes
  const proceed = await promptForProceed({ regionName, baseName, destDir, options });
  if (!proceed) {
    log.warn("Creation cancelled by user.");
    process.exit(0);
  }
  log.step(`Creating new region ${yellow(`"${regionName}"`)} at ${dim(destDir)}...\n`);

  await copyTemplate(destDir, options);
  if (!options.dryRun) console.log(`${green("✔")} Copied template to ${dim(destDir)}`);

  await removeTemplateDataDir(destDir, options);
  if (!options.dryRun) console.log(`${green("✔")} Removed demo data directory.`);
  await updatePackageJson(destDir, regionName, options);
  if (!options.dryRun) console.log(`${green("✔")} Updated package.json.`);
  await replaceTemplateName(destDir, regionName, baseName, options);
  if (!options.dryRun) console.log(`${green("✔")} Replaced references to ${yellow(`"${baseName}"`)}.`);
  await updateBranding(destDir, regionLabel, options);
  if (!options.dryRun) console.log(`${green("✔")} Updated branding strings.`);
  await ensureEnvExample(destDir, options, regionSlug);
  if (!options.dryRun) console.log(`${green("✔")} Ensured .env.example contains required keys.`);
  await ensureWorkspaceRegistration(regionName, options);
  await postCopyChecks(destDir);
  await runPnpmInstall(regionName, options);
  await ensureRegionReadme(destDir, regionName, regionLabel, options);
  await ensureLandingRegionsRegistration(regionSlug, options);
  await runVerification(regionName, destDir, options);

  const relPath = path.relative(process.cwd(), destDir);
  if (options.dryRun) {
    console.log(`\n${green("Dry run complete.")} ${yellow(regionName)} would be created at ${dim(relPath)}.`);
    return;
  }
  console.log(`\n${green("✔ Created")} ${yellow(regionName)} at ${dim(relPath)}`);
  console.log(bold("Next steps:"));
  console.log(`- ${cyan("Wire up")} region-specific data adapters in ${dim(path.join(relPath, "lib"))}`);
  console.log(`- ${cyan("Fill in")} ${dim(path.join(relPath, ".env.example"))} and copy to ${dim(".env.local")} for local runs`);
  if (options.useSupa) {
    console.log(`- ${cyan("Set Supabase envs")} (URL, anon key, service role) in your env files`);
  }
  console.log(`- ${cyan("Configure")} data layers to use the new database connections inside ${dim(path.join(relPath, "components/dataLayer"))}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
