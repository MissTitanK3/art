import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ACADEMY_COURSES_DIR = path.resolve(__dirname, './courses');

export function resolveAcademyCoursePath(slug: string) {
  return path.join(ACADEMY_COURSES_DIR, `${slug}.mdx`);
}
