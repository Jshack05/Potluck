import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {flattenReactions,coverage,sourceHash} from './audit-data.mjs';
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
const reviewDate=fs.existsSync(path.join(here,'2026-10-09-visual-review.json'))?'2026-10-09':date;
const visual=read(`${reviewDate}-visual-review.json`),expected=coverage(inventory,raw,visual.ids);
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
for(const [file,hash] of Object.entries(source.supportingSourceHashes))assert.equal(hash,sourceHash(fs.readFileSync(path.join(root,file),'utf8')),`Source changed: ${file}`);
for(const r of source.routes){
  assert(routes.routes.some(x=>x.file===r.sourceFile));
  const content=fs.readFileSync(path.join(root,r.sourceFile),'utf8');
  assert.equal(r.sha256,sourceHash(content),`Source changed: ${r.sourceFile}`);
  for(const s of [...(r.implementedStates??[]),...(r.missingStates??[])]){
    assert((s.designIds??[]).every(id=>inventory.some(i=>i.id===id)));
    if(s.evidence){const lines=fs.readFileSync(path.join(root,s.evidence.file),'utf8').split(/\r?\n/).length;assert(s.evidence.startLine>0&&s.evidence.endLine>=s.evidence.startLine&&s.evidence.endLine<=lines);}
  }
}
assert.equal(draft.status,'DRAFT_NOT_CREATED_IN_FIGMA');assert.equal(draft.sectionId,null);assert.equal(draft.createdNodeIds.length,0);
assert.equal(new Set(draft.panels.flatMap(p=>p.screens.map(s=>s.id))).size,inventory.length);
if(reviewDate==='2026-10-09'){
  const manifest=read('2026-10-09-annotation-manifest.json'),evidence=read('2026-10-09-directory-evidence.json');
  const checkpoint=read('2026-10-09-checkpoint.json'),prototype=read('2026-10-09-prototype-review.json');
  assert.equal(manifest.status,'CREATED_STRUCTURE_VERIFIED');
  assert.equal(manifest.sectionId,'2244:45190');
  assert.deepEqual(manifest.createdNodeIds,evidence.createdNodeIds);
  assert.equal(new Set(manifest.createdNodeIds).size,118);
  assert(manifest.createdNodeIds.every(id=>!inventory.some(s=>s.id===id)));
  assert.equal(manifest.panels.length,family.families.length);
  assert.deepEqual(manifest.panels,evidence.panels);
  const linked=manifest.panels.flatMap(p=>p.screenIds);
  assert.equal(linked.length,inventory.length);
  assert.deepEqual([...linked].sort(),inventory.map(s=>s.id).sort());
  for(const panel of manifest.panels){
    assert(manifest.createdNodeIds.includes(panel.id));
    assert(panel.childIds.every(id=>manifest.createdNodeIds.includes(id)));
    assert.deepEqual([...panel.screenIds].sort(),[...family.families.find(f=>f.id===panel.familyId).screenIds].sort());
    assert.equal(panel.overflow,false);
  }
  assert.deepEqual(evidence.escaped,[]);
  const before=[0,1,2].flatMap(i=>read(`2026-10-09-originals-before-${i}.json`));
  const after=[0,1,2].flatMap(i=>read(`2026-10-09-originals-after-${i}.json`));
  assert.deepEqual(before.map(s=>s.id),inventory.map(s=>s.id));
  assert.deepEqual(after,before,'Original subtree preservation failed');
  assert.equal(checkpoint.visualReviewCount,visual.ids.length);
  assert.deepEqual(checkpoint.remainingVisualIds,inventory.filter(s=>!visual.ids.includes(s.id)).map(s=>s.id));
  assert.equal(checkpoint.livePrototypeChecks,prototype.journeys.length);
  assert(prototype.journeys.every(j=>j.nodes.every(id=>inventory.some(s=>s.id===id))));
  const board=read('2026-10-09-reference-board-review.json');
  assert.equal(board.id,'2034:44493');
  assert.equal(board.links.length,22);
  assert(board.links.every(link=>link.to.every(id=>inventory.some(s=>s.id===id))));
}
const html=fs.readFileSync(path.join(here,'index.html'),'utf8');
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
const embedded=JSON.parse(html.match(/<script type="application\/json" id="data">([\s\S]*?)<\/script>/)[1]);
assert.equal(embedded.records.length,inventory.length);assert.equal(embedded.edges.length,edges.length);
assert(html.includes('Incomplete audit:'));assert(!html.includes('__AUDIT_'));
assert(html.includes('Verification and app mapping'));
for(const file of ['README.md','2026-10-08-findings.md','2026-10-08-graph-findings.md','2026-10-08-source-findings.md',...(reviewDate==='2026-10-09'?['2026-10-09-findings.md']:[])]) {
  const text=fs.readFileSync(path.join(here,file),'utf8');
  for(const [,link] of text.matchAll(/\]\(([^)]+)\)/g))if(!/^(https?:|#)/.test(link))assert(fs.existsSync(path.resolve(here,link.split('#')[0])),`Broken link ${file}: ${link}`);
}
console.log(JSON.stringify({status:'PASS',auditStatus:'INCOMPLETE',records:inventory.length,reactions:raw.length,visualReviews:visual.ids.length,appComparisons:app.visualComparisons.length,transitions:edges.length,routeFiles:routes.routes.length,scope:'Artifact consistency and explorer syntax only; not full Figma/app sign-off'},null,2));
