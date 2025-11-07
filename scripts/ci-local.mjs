#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const steps = [
  { name: 'generate:academy-course-details', cmd: 'pnpm', args: ['-w', 'run', 'generate:academy-course-details'] },
  { name: 'generate:academy-groups', cmd: 'pnpm', args: ['-w', 'run', 'generate:academy-groups'] },
  { name: 'validate:academy', cmd: 'pnpm', args: ['-w', 'run', 'validate:academy'] },
  { name: 'lint', cmd: 'pnpm', args: ['-w', '--filter', '@workspace/ui', 'run', 'lint'] },
  { name: 'build', cmd: 'pnpm', args: ['-w', 'turbo', 'build'] },
];

function ts() {
  return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

async function main() {
  const logsDir = path.resolve(process.cwd(), '.logs');
  fs.mkdirSync(logsDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = path.join(logsDir, `ci-local-${stamp}.log`);
  const logStream = fs.createWriteStream(logPath, { flags: 'a' });

  const write = (data) => logStream.write(data);
  const log = (line) => {
    const msg = `[${ts()}] ${line}\n`;
    process.stdout.write(msg);
    write(msg);
  };

  log('Starting ci:local');
  const started = Date.now();

  for (const step of steps) {
    log(`--- STEP: ${step.name} ---`);
    const code = await run(step.cmd, step.args, write);
    if (code !== 0) {
      log(`FAILED: ${step.name} (exit ${code})`);
      const duration = ((Date.now() - started) / 1000).toFixed(1);
      log(`ci:local finished with errors in ${duration}s. Log: ${path.relative(process.cwd(), logPath)}`);
      logStream.end();
      process.exit(code);
    }
    log(`OK: ${step.name}`);
  }

  const duration = ((Date.now() - started) / 1000).toFixed(1);
  log(`ci:local completed successfully in ${duration}s.`);
  log(`Log written to: ${path.relative(process.cwd(), logPath)}`);
  logStream.end();
}

function run(cmd, args, write) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], shell: false });
    child.stdout.on('data', (d) => {
      process.stdout.write(d);
      write(d);
    });
    child.stderr.on('data', (d) => {
      process.stderr.write(d);
      write(d);
    });
    child.on('close', (code) => resolve(code ?? 1));
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
