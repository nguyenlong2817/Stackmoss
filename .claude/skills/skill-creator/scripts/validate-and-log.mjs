#!/usr/bin/env node

import { mkdirSync, appendFileSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

function parseArgs(argv) {
  const optionKeys = new Set(['--skill-root', '--command', '--id', '--owner', '--layer', '--notes']);
  const args = {
    skillRoot: process.cwd(),
    command: '',
    id: `run-${Date.now()}`,
    owner: 'unknown-owner',
    layer: 'layer-7',
    notes: ''
  };

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const next = argv[i + 1];
    if (!next) continue;

    if (key === '--command') {
      const cmdParts = [];
      let j = i + 1;
      while (j < argv.length && !optionKeys.has(argv[j])) {
        cmdParts.push(argv[j]);
        j += 1;
      }
      args.command = cmdParts.join(' ').trim();
      i = j - 1;
      continue;
    }

    if (next.startsWith('--')) continue;
    if (key === '--skill-root') args.skillRoot = next;
    if (key === '--id') args.id = next;
    if (key === '--owner') args.owner = next;
    if (key === '--layer') args.layer = next;
    if (key === '--notes') args.notes = next;
  }

  return args;
}

function tail(text, maxChars = 4000) {
  if (!text) return '';
  if (text.length <= maxChars) return text;
  return text.slice(text.length - maxChars);
}

function splitCommand(command) {
  const parts = [];
  let current = '';
  let quote = null;

  for (let i = 0; i < command.length; i += 1) {
    const ch = command[i];
    if ((ch === '"' || ch === "'") && !quote) {
      quote = ch;
      continue;
    }
    if (quote && ch === quote) {
      quote = null;
      continue;
    }
    if (!quote && /\s/.test(ch)) {
      if (current) {
        parts.push(current);
        current = '';
      }
      continue;
    }
    current += ch;
  }

  if (current) parts.push(current);
  return parts;
}

function ensureDataFiles(dataDir) {
  mkdirSync(dataDir, { recursive: true });
  const summaryPath = join(dataDir, 'validation-summary.json');
  const logPath = join(dataDir, 'validation-log.ndjson');

  if (!existsSync(summaryPath)) {
    writeFileSync(
      summaryPath,
      JSON.stringify(defaultSummary(), null, 2) + '\n',
      'utf8'
    );
  }

  if (!existsSync(logPath)) {
    writeFileSync(logPath, '', 'utf8');
  }

  return { summaryPath, logPath };
}

function defaultSummary() {
  return {
    totalRuns: 0,
    failedRuns: 0,
    lastRunAt: null,
    lastStatus: null
  };
}

function updateSummary(summaryPath, isSuccess, endedAt) {
  const raw = readFileSync(summaryPath, 'utf8');
  let summary;
  try {
    summary = JSON.parse(raw);
  } catch {
    summary = defaultSummary();
  }

  summary.totalRuns += 1;
  if (!isSuccess) summary.failedRuns += 1;
  summary.lastRunAt = endedAt;
  summary.lastStatus = isSuccess ? 'success' : 'failure';
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n', 'utf8');
}

const args = parseArgs(process.argv);

if (!args.command) {
  console.error('Missing required argument: --command "<cmd>"');
  process.exit(2);
}

const skillRoot = resolve(args.skillRoot);
const dataDir = join(skillRoot, 'data');
const { summaryPath, logPath } = ensureDataFiles(dataDir);

const startedAt = new Date().toISOString();
const commandParts = splitCommand(args.command);
if (commandParts.length === 0) {
  console.error('Command is empty after parsing.');
  process.exit(2);
}

const run = spawnSync(commandParts[0], commandParts.slice(1), {
  cwd: skillRoot,
  encoding: 'utf8',
  shell: false
});
const endedAt = new Date().toISOString();

const statusCode = typeof run.status === 'number' ? run.status : (run.error ? 127 : 1);
const success = statusCode === 0;

const entry = {
  id: args.id,
  owner: args.owner,
  layer: args.layer,
  command: args.command,
  startedAt,
  endedAt,
  statusCode,
  success,
  notes: args.notes,
  spawnError: run.error ? String(run.error.message ?? run.error) : '',
  stdoutTail: tail(run.stdout ?? ''),
  stderrTail: tail(run.stderr ?? '')
};

appendFileSync(logPath, `${JSON.stringify(entry)}\n`, 'utf8');
updateSummary(summaryPath, success, endedAt);

if (success) {
  console.log(`Validation passed and logged: ${args.id}`);
} else {
  console.error(`Validation failed and logged: ${args.id}`);
}

process.exit(statusCode);
