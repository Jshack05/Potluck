// Aggregate observed evidence without changing the October 8 capture baseline.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (name) => JSON.parse(fs.readFileSync(path.join(here, name), 'utf8'));
const write = (name, data) => fs.writeFileSync(path.join(here, name), `${JSON.stringify(data, null, 2)}\n`);
const inventory = read('2026-10-08-screen-inventory.json');
const baseline = read('2026-10-08-visual-review.json');
const resume = read('2026-10-09-resume.json');
const batches = fs.readFileSync(path.join(here, '2026-10-09-visual-batches.jsonl'), 'utf8')
  .split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const newBatches = [...resume.visualBatches, ...batches];
const newIds = newBatches.flatMap((batch) => batch.ids);
assert.equal(new Set(newIds).size, newIds.length, 'Duplicate resumed visual credit');
assert(newIds.every((id) => inventory.some((screen) => screen.id === id)), 'Unknown visual record');
assert(newIds.every((id) => !baseline.ids.includes(id)), 'Repeated baseline visual credit');
const ids = [...baseline.ids, ...newIds];
const remaining = inventory.filter((screen) => !ids.includes(screen.id)).map((screen) => screen.id);
write('2026-10-09-visual-review.json', {
  date: '2026-10-09', inventoryCaptureDate: '2026-10-08',
  baselineEvidence: '2026-10-08-visual-review.json', ids, newBatches,
  scope: 'Readable source-frame layout review; not prototype or app parity verification.',
});

const directory = read('2026-10-09-directory-evidence.json');
const prototype = read('2026-10-09-prototype-review.json');
const before = [0, 1, 2].flatMap((i) => read(`2026-10-09-originals-before-${i}.json`));
const after = [0, 1, 2].flatMap((i) => read(`2026-10-09-originals-after-${i}.json`));
assert.equal(before.length, inventory.length);
assert.deepEqual(after, before, 'Original screen subtree changed during note creation');
assert.equal(new Set(directory.createdNodeIds).size, directory.createdNodeIds.length);
assert.equal(new Set(directory.panels.flatMap((p) => p.screenIds)).size, inventory.length);
assert(directory.panels.every((p) => !p.overflow));
assert.equal(directory.escaped.length, 0);
write('2026-10-09-annotation-manifest.json', {
  date: '2026-10-09', status: 'CREATED_STRUCTURE_VERIFIED',
  sectionId: directory.sectionId,
  sectionUrl: 'https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=2244-45190',
  createdNodeIds: directory.createdNodeIds, panels: directory.panels,
  bounds: directory.bounds,
  originalPreservation: { recordsCompared: before.length, differences: 0, method: 'FNV-1a of ordered subtree geometry, fills, strokes, text, parent IDs, instance component IDs and reactions before/after notes; not a full document byte hash.' },
  rollback: 'Delete only section 2244:45190; every created note is its descendant. No original product screen is part of the section.',
  limits: 'Directory and readable layout review cover all 809 records. Canonical decisions, exhaustive prototype execution and current app comparisons remain incomplete. Structural checks are not runtime sign-off.',
});
const oldCheckpoint = read('2026-10-08-checkpoint.json');
write('2026-10-09-checkpoint.json', {
  ...oldCheckpoint, date: '2026-10-09', inventoryCaptureDate: '2026-10-08',
  status: 'INCOMPLETE — all source layouts reviewed; directory created; sampled prototype checks complete; current app parity outstanding',
  annotationSection: directory.sectionId, visualReviewCount: ids.length,
  remainingVisualIds: remaining, nextVisualNodeId: remaining[0] ?? null,
  nextVisualInventoryIndex: remaining.length ? inventory.findIndex((s) => s.id === remaining[0]) : null,
  livePrototypeChecks: prototype.journeys.length,
  appComparisonRevision: resume.appComparisonRevision,
  limitations: [
    `${remaining.length} screen/state records remain without readable visual review.`,
    `${prototype.journeys.length} live prototype checks recorded, including failures; full journey coverage is not claimed.`,
    'Five historical app visual comparisons; no new live app comparison this resume. Local servers unavailable and prior start/browser review blocked.',
    'All 55 route source files were inspected at the captured baseline; later Cards recovery is a separate revision and must not be reported as current runtime parity.',
    'All 809 original screen subtree fingerprints match before/after note creation. Directory is removable through one section.',
  ],
  resume: 'No source-layout batches remain. Follow 2026-10-09-findings.md for untested actor/return/error paths and current app visual comparison. Do not repeat the 809 reaction captures or visual passes. Rebuild with build-flow-audit.mjs.',
});
console.log(JSON.stringify({ visualReviews: ids.length, remaining: remaining.length, prototypeChecks: prototype.journeys.length, noteNodes: directory.createdNodeIds.length, originalsUnchanged: after.length }));
