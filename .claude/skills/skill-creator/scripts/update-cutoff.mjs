#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

function parseArgs(argv) {
  const args = {
    skillRoot: process.cwd(),
    date: new Date().toISOString().slice(0, 10),
    source: []
  };

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) continue;

    if (key === '--skill-root') args.skillRoot = next;
    if (key === '--date') args.date = next;
    if (key === '--source') args.source.push(next);
  }

  return args;
}

const args = parseArgs(process.argv);
const skillRoot = resolve(args.skillRoot);
const dataDir = join(skillRoot, 'data');
mkdirSync(dataDir, { recursive: true });

const payload = {
  baselineYear: 2026,
  cutoffDate: args.date,
  updatedAt: new Date().toISOString(),
  sources: args.source
};

writeFileSync(join(dataDir, 'research-cutoff.json'), JSON.stringify(payload, null, 2) + '\n', 'utf8');
console.log(`Updated research cutoff to ${args.date}`);

