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
  const options = { dryRun: false, skipInstall: false, useSupa: false, banner: true };
  let nameArg;
  const extras = [];

  for (const arg of argv) {
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--skip-install" || arg === "--no-install") {
      options.skipInstall = true;
    } else if (arg === "-supa" || arg === "--supa") {
      options.useSupa = true;
    } else if (arg === "--no-banner") {
      options.banner = false;
    } else if (arg === "--banner" || arg === "-b") {
      options.banner = true;
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
      if (!contents.includes(fromName)) return;
      const updated = contents.replace(new RegExp(fromName, "g"), regionName);
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
  const { regionName, regionLabel } = normalizeRegionName(rawInput);
  const destDir = path.resolve(__dirname, "../apps", regionName);
  const baseName = options.useSupa ? "region-pnw" : "region-template";

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
  await runPnpmInstall(regionName, options);

  const relPath = path.relative(process.cwd(), destDir);
  if (options.dryRun) {
    console.log(`\n${green("Dry run complete.")} ${yellow(regionName)} would be created at ${dim(relPath)}.`);
    return;
  }
  console.log(`\n${green("✔ Created")} ${yellow(regionName)} at ${dim(relPath)}`);
  console.log(bold("Next steps:"));
  console.log(`- ${cyan("Wire up")} region-specific data adapters in ${dim(path.join(relPath, "lib"))}`);
  console.log(`- ${cyan("Update")} any environment variables in ${dim(path.join(relPath, ".env"))}`);
  console.log(`- ${cyan("Configure")} data layers to use the new database connections inside ${dim(path.join(relPath, "components/dataLayer"))}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
