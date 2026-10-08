import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {flattenReactions,coverage} from './audit-data.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..'),date='2026-10-08';
const read=n=>JSON.parse(fs.readFileSync(path.join(here,n),'utf8'));
const map=read(`${date}-connection-map.json`),inventory=read(`${date}-screen-inventory.json`);
const raw=fs.readdirSync(path.join(here,date)).filter(n=>/^raw-\d+\.json$/.test(n)).sort().flatMap(n=>read(`${date}/${n}`));
assert.equal(new Set(inventory.map(s=>s.id)).size,inventory.length);
assert.equal(new Set(raw.map(s=>s.id)).size,raw.length);
assert(raw.every(s=>inventory.some(i=>i.id===s.id)));
assert.equal(map.records.length,inventory.length);
assert.equal(map.records.filter(s=>s.controls!==null).length,raw.length);
assert.equal(map.summary.reactionAuditedRecords,raw.length);
const actions=flattenReactions(raw),edges=actions.filter(a=>a.to||['BACK','CLOSE','URL','OPEN_URL'].includes(a.type));
assert.equal(edges.length,map.edges.length);
assert.deepEqual(map.edges.map(e=>[e.source,e.control,e.to,e.actionPath,e.conditions]),edges.map(e=>[e.source,e.control,e.to,e.actionPath,e.conditions]));
const visual=read(`${date}-visual-review.json`),expected=coverage(inventory,raw,visual.ids);
assert(visual.ids.every(id=>inventory.some(s=>s.id===id)));
for(const key of ['records','reactions','visual','remainingReactions','remainingVisual'])assert.deepEqual(map.summary[key],expected[key]);
assert.equal(map.summary.status,'INCOMPLETE');
const app=read(`${date}-app-review.json`),routes=read(`${date}-app-routes.json`);
assert.equal(map.summary.appVisualComparisons,app.visualComparisons.length);
assert(routes.routes.every(r=>fs.existsSync(path.join(root,r.file))));
assert(app.sourceInspections.every(r=>fs.existsSync(path.join(root,r.file))));
assert(app.visualComparisons.every(r=>r.figmaIds.every(id=>inventory.some(s=>s.id===id))));
assert(map.records.every(s=>s.candidateRoutes.every(r=>routes.routes.some(a=>a.route===r))));
const family=read(`${date}-flow-families.json`),source=read(`${date}-source-mapping.json`),draft=read(`${date}-annotation-draft.json`);
assert.equal(family.source.edgesSha256,crypto.createHash('sha256').update(JSON.stringify(map.edges)).digest('hex'));
assert.equal(new Set(family.screens.map(s=>s.id)).size,inventory.length);
assert.equal(family.families.flatMap(f=>f.screenIds).length,inventory.length);
assert.equal(new Set(family.families.flatMap(f=>f.screenIds)).size,inventory.length);
for(const s of family.screens){
  assert(inventory.some(i=>i.id===s.id));
  assert(family.families.some(f=>f.id===s.familyId&&f.screenIds.includes(s.id)));
  assert(s.incomingEdgeIndices.every(i=>map.edges[i]?.to===s.id));
  assert(s.outgoingEdgeIndices.every(i=>map.edges[i]?.source===s.id));
}
assert.equal(source.routes.length,routes.routes.length);
assert.equal(new Set(source.routes.map(r=>r.sourceFile)).size,routes.routes.length);
assert.deepEqual(Object.keys(source.supportingSourceHashes).sort(),[...source.supportingSourceInspection].sort());
for(const [file,hash] of Object.entries(source.supportingSourceHashes))assert.equal(hash,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'));
for(const r of source.routes){
  assert(routes.routes.some(x=>x.file===r.sourceFile));
  const content=fs.readFileSync(path.join(root,r.sourceFile),'utf8');
  assert.equal(r.sha256,crypto.createHash('sha256').update(content).digest('hex'));
  for(const s of [...(r.implementedStates??[]),...(r.missingStates??[])]){
    assert((s.designIds??[]).every(id=>inventory.some(i=>i.id===id)));
    if(s.evidence){const lines=fs.readFileSync(path.join(root,s.evidence.file),'utf8').split(/\r?\n/).length;assert(s.evidence.startLine>0&&s.evidence.endLine>=s.evidence.startLine&&s.evidence.endLine<=lines);}
  }
}
assert.equal(draft.status,'DRAFT_NOT_CREATED_IN_FIGMA');assert.equal(draft.sectionId,null);assert.equal(draft.createdNodeIds.length,0);
assert.equal(new Set(draft.panels.flatMap(p=>p.screens.map(s=>s.id))).size,inventory.length);
const html=fs.readFileSync(path.join(here,'index.html'),'utf8');
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
const embedded=JSON.parse(html.match(/<script type="application\/json" id="data">([\s\S]*?)<\/script>/)[1]);
assert.equal(embedded.records.length,inventory.length);assert.equal(embedded.edges.length,edges.length);
assert(html.includes('Incomplete audit:'));assert(!html.includes('__AUDIT_'));
assert(html.includes('Verification and app mapping'));
for(const file of ['README.md','2026-10-08-findings.md','2026-10-08-graph-findings.md','2026-10-08-source-findings.md']) {
  const text=fs.readFileSync(path.join(here,file),'utf8');
  for(const [,link] of text.matchAll(/\]\(([^)]+)\)/g))if(!/^(https?:|#)/.test(link))assert(fs.existsSync(path.resolve(here,link.split('#')[0])),`Broken link ${file}: ${link}`);
}
console.log(JSON.stringify({status:'PASS',auditStatus:'INCOMPLETE',records:inventory.length,reactions:raw.length,visualReviews:visual.ids.length,appComparisons:app.visualComparisons.length,transitions:edges.length,routeFiles:routes.routes.length,scope:'Artifact consistency and explorer syntax only; not full Figma/app sign-off'},null,2));
