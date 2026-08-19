#!/usr/bin/env node
// Runs before every build (see "prebuild" in package.json) so a malformed
// or schema-invalid content file fails the build loudly instead of Astro
// silently shipping an empty page — see the "activities.yaml" incident
// this guarded against: a tab-indented entry broke YAML parsing, and
// Astro's file loader logged an error but still exited 0, deploying a
// blank /activities/ page.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as loadYaml } from 'js-yaml';
import { publicationSchema, activitiesSchema, noteSchema, talkSchema } from '../src/content/schemas.mjs';

const CONTENT_ROOT = fileURLToPath(new URL('../src/content/', import.meta.url));

function yamlFilesIn(dir) {
  return readdirSync(join(CONTENT_ROOT, dir))
    .filter((name) => name.endsWith('.yaml'))
    .map((name) => join(dir, name));
}

let errorCount = 0;

function reportYamlError(relPath, error) {
  errorCount++;
  console.error(`\n✗ ${relPath}`);
  console.error(`  ${error.message.split('\n').join('\n  ')}`);
}

function reportSchemaError(relPath, entryLabel, error) {
  errorCount++;
  console.error(`\n✗ ${relPath}${entryLabel ? ` (${entryLabel})` : ''}`);
  for (const issue of error.issues) {
    const path = issue.path.length ? issue.path.join('.') : '(root)';
    console.error(`  ${path}: ${issue.message}`);
  }
}

// Collections whose entries are one-YAML-file-per-item.
for (const [dir, schema] of [
  ['publications', publicationSchema],
  ['notes', noteSchema],
  ['talks', talkSchema],
]) {
  for (const relPath of yamlFilesIn(dir)) {
    let data;
    try {
      data = loadYaml(readFileSync(join(CONTENT_ROOT, relPath), 'utf8'));
    } catch (error) {
      reportYamlError(relPath, error);
      continue;
    }
    const result = schema.safeParse(data);
    if (!result.success) reportSchemaError(relPath, null, result.error);
  }
}

// Activities: one YAML file holding an array of term entries, each with
// its own `id`.
{
  const relPath = 'activities/activities.yaml';
  let terms;
  try {
    terms = loadYaml(readFileSync(join(CONTENT_ROOT, relPath), 'utf8'));
  } catch (error) {
    reportYamlError(relPath, error);
    terms = [];
  }
  const seenIds = new Set();
  for (const term of terms ?? []) {
    if (typeof term.id !== 'string' || term.id === '') {
      errorCount++;
      console.error(`\n✗ ${relPath}`);
      console.error(`  every term needs a string "id" field, got: ${JSON.stringify(term.id)}`);
      continue;
    }
    if (seenIds.has(term.id)) {
      errorCount++;
      console.error(`\n✗ ${relPath} (id: ${term.id})`);
      console.error(`  duplicate term id`);
    }
    seenIds.add(term.id);
    const result = activitiesSchema.safeParse(term);
    if (!result.success) reportSchemaError(relPath, `id: ${term.id}`, result.error);
  }
}

if (errorCount > 0) {
  console.error(`\n${errorCount} content error${errorCount === 1 ? '' : 's'} found — fix before building.\n`);
  process.exit(1);
}

console.log('Content validation passed.');
