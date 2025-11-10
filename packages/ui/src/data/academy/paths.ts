import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findCoursesDir(): string {
  const fromModule = path.resolve(__dirname, "./courses");
  const candidates = [
    fromModule,
    // When executed from the app (e.g., apps/academy), resolve to packages/ui/src/... directly
    path.resolve(process.cwd(), "packages/ui/src/data/academy/courses"),
    // When executed from apps/academy, going up one or two levels depending on tooling
    path.resolve(process.cwd(), "../../packages/ui/src/data/academy/courses"),
    path.resolve(
      process.cwd(),
      "../../../packages/ui/src/data/academy/courses",
    ),
  ];

  for (const dir of candidates) {
    try {
      if (fs.existsSync(dir)) return dir;
    } catch {
      // ignore and try next
    }
  }
  // Fallback to module-relative path even if it may not exist; callers can handle errors
  return fromModule;
}

export const ACADEMY_COURSES_DIR = findCoursesDir();

export function resolveAcademyCoursePath(slug: string) {
  return path.join(ACADEMY_COURSES_DIR, `${slug}.mdx`);
}
