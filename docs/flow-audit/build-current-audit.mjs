import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {flattenReactions,classifyTarget,coverage,mapSourceStates,sourceHash} from './audit-data.mjs';

const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const date='2026-10-08',read=n=>JSON.parse(fs.readFileSync(path.join(here,n),'utf8'));
const resumed=fs.existsSync(path.join(here,'2026-10-09-resume.json'));
if(resumed)await import('./build-resume-checkpoint.mjs');
const reviewDate=resumed?'2026-10-09':date;
const write=(name,value)=>fs.writeFileSync(path.join(here,name),JSON.stringify(value)+'\n');
const inventory=read(`${date}-screen-inventory.json`);
const raw=fs.readdirSync(path.join(here,date)).filter(n=>/^raw-\d+\.json$/.test(n)).sort().flatMap(n=>read(`${date}/${n}`));
const components=read(`${date}-components.json`).components;
const variables=read(`${date}-variables.json`);
const visual=read(`${reviewDate}-visual-review.json`),appReview=read(`${date}-app-review.json`),checkpoint=read(`${reviewDate}-checkpoint.json`);
const families=read(`${date}-flow-families.json`),source=read(`${date}-source-mapping.json`);
const figma=id=>`https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=${encodeURIComponent(id)}`;
const ids=new Set(inventory.map(s=>s.id)),componentIds=new Set(components.map(s=>s.id)),rawById=new Map(raw.map(s=>[s.id,s]));
if(ids.size!==inventory.length||rawById.size!==raw.length||raw.some(s=>!ids.has(s.id)))throw Error('Duplicate or unmatched capture');
const allActions=flattenReactions(raw);
const edges=allActions.filter(a=>a.to||['BACK','CLOSE','URL','OPEN_URL'].includes(a.type)).map(a=>({...a,destinationCaptured:ids.has(a.to),targetStatus:classifyTarget(a.to,ids,componentIds),destinationName:inventory.find(s=>s.id===a.to)?.name??components.find(s=>s.id===a.to)?.name??null,url:a.rawAction.url??null}));
const outside=[...new Set(edges.filter(e=>e.to&&!ids.has(e.to)).map(e=>e.to))].map(id=>({id,status:classifyTarget(id,ids,componentIds),name:components.find(c=>c.id===id)?.name??null,incoming:edges.filter(e=>e.to===id).length}));
const counts=coverage(inventory,raw,visual.ids);
const summary={...counts,capturedOn:date,fileKey:checkpoint.fileKey,pageId:checkpoint.pageId,sourceCommit:checkpoint.baseCommit,reactionAuditedRecords:raw.length,controls:raw.reduce((n,s)=>n+s.controls.length,0),actionLeaves:allActions.length,transitionReferences:edges.length,components:components.length,variables:variables.variables.length,collections:variables.collections.length,appVisualComparisons:appReview.visualComparisons.length,limitations:checkpoint.limitations,inventoryScope:'809 screen-sized frames/instances, including overlay states, references and alternatives. Recursively expanded every section; not 809 production routes.'};
summary.visualReviewDate=reviewDate;
summary.livePrototypeChecks=checkpoint.livePrototypeChecks??0;
// Journeys are counted separately; this audit does not count every individual click.
summary.prototypeInteractions=null;
summary.annotationSection=checkpoint.annotationSection;
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const routeFiles=walk(path.join(root,'my-app/src/app')).filter(f=>f.endsWith('.tsx'));
const routeRows=routeFiles.map(f=>({file:path.relative(root,f).replaceAll('\\','/'),route:'/'+path.relative(path.join(root,'my-app/src/app'),f).replaceAll('\\','/').replace(/\.tsx$/,''),sha256:sourceHash(fs.readFileSync(f,'utf8')),sourceInspection:appReview.sourceInspections.find(r=>r.file===path.relative(root,f).replaceAll('\\','/'))??null}));
function domain(name){const n=name.toLowerCase();if(/reference|review guide|start here/.test(n))return 'Reference';if(/^(auth|onboarding|potluck)|sign.?in|sign.?up|password|verifyemail|resend|email.*verif|^you|^settings|\/ account|deleteaccount|privacydocument|termsdocument/.test(n))return 'Account / entry';if(/role/.test(n))return 'Roles / access';if(/goal/.test(n))return 'Goals';if(/bill|agreement|contribution/.test(n))return 'Bills';if(/circle|handover|hostleave|memberleave/.test(n))return 'Circles';if(/card/.test(n)&&!n.startsWith('splitfinder'))return 'Cards';if(/inbox|conversation|convo|message|report|block|support/.test(n))return 'Messaging / safety';return 'Splitfinder';}
const familyRoutes={Circles:['/circles','/circle/[id]','/create/circle'],Cards:['/cards','/card/[id]','/create/card'],Bills:['/bills','/bill/[id]','/create/bill','/import-bills'],Goals:['/goals','/goal/[id]','/create/goal'],'Roles / access':['/card/[id]/people','/card/[id]/controls','/invitation/[id]','/agreement/[id]'],'Account / entry':['/sign-in','/you','/settings/[section]'],'Messaging / safety':['/inbox','/conversation/[id]'],Splitfinder:['/discover','/explore','/listing/[id]','/create/listing'],Reference:[]};
const records=inventory.map(s=>{const a=rawById.get(s.id),area=domain(s.name),compared=appReview.visualComparisons.filter(v=>v.figmaIds.includes(s.id));return {...s,domain:area,figmaUrl:figma(s.id),evidence:a?'REACTIONS_CAPTURED':'INVENTORY_ONLY',text:a?.text.filter(t=>t.visible).map(t=>t.text)??null,controls:a?.controls??null,instances:a?.instances??null,fingerprint:a?.fingerprint??null,mentionedIn:[],purpose:s.name,actor:null,state:s.name.split(' / ').slice(1).join(' / '),canonicalStatus:'UNRESOLVED — preserve alternatives until reconciled with product decisions',visualStatus:visual.ids.includes(s.id)?'LAYOUT_REVIEWED':'NOT_REVIEWED',appStatus:compared.length?'SAMPLED_COMPARISON':'NOT_VERIFIED',appComparisons:compared,candidateRoutes:familyRoutes[area],mappingEvidence:compared.length?'Explicit sampled comparison; see app-review.json':'Family search aid only; not a verified screen-to-route mapping',captureDate:date,sourceCommit:checkpoint.baseCommit};});
const historical=read('2026-10-02-screen-inventory.json');
for(const record of records){
  const assignment=families.screens.find(s=>s.id===record.id);
  const family=families.families.find(f=>f.id===assignment.familyId);
  record.familyId=family.id;record.family=family.name;record.actor=assignment.actor;
  record.actorEvidence=assignment.actorEvidence;record.purpose=family.intendedSemantics;
  record.canonicalStatus=assignment.canonicalStatus;record.canonicalDecision=family.canonicalDecision;
  record.authority=family.authority;record.graphStatus=assignment.graphStatus;record.uncertainty=assignment.uncertainty;
  record.sourceMappings=mapSourceStates(record.id,source.routes);
  record.mappingEvidence=record.sourceMappings.length?'Explicit source-state correspondence; missing versus implemented labels retained. Not runtime or visual parity verification.':record.mappingEvidence;
  record.appStatus=record.appComparisons.length?'SAMPLED_COMPARISON':record.sourceMappings.length?'SOURCE_STATE_REVIEWED':'UNMAPPED_STATE';
}
for(const row of routeRows)row.sourceInspection=source.routes.find(r=>r.sourceFile===row.file)??row.sourceInspection;
summary.flowFamilies=families.families.length;summary.sourceRouteFilesRead=source.coverage.routeFilesRead;
summary.sourceMappedDesignRecords=records.filter(r=>r.sourceMappings.length).length;
const references=read(`${date}-reference-boards.json`);
if(resumed){const reviewed=read('2026-10-09-reference-board-review.json');const ref=references.find(r=>r.id===reviewed.id);if(ref)ref.contentReview=reviewed.review;}
const reconciliation={addedToInventory:inventory.filter(s=>!historical.some(h=>h.id===s.id)).map(s=>({id:s.id,name:s.name})),classifiedSeparately:references,previouslyInventoriedNotFound:historical.filter(s=>!ids.has(s.id)&&!references.some(r=>r.id===s.id)).map(s=>({id:s.id,name:s.name,status:'NOT_IN_CURRENT_ENUMERATION — direct live lookup pending; not proof of deletion'}))};
const variableIds=new Set(variables.variables.map(v=>v.id));
const refs=new Set();function aliases(v){if(!v||typeof v!=='object')return;if(v.type==='VARIABLE_ALIAS'&&typeof v.id==='string')refs.add(v.id);if(typeof v.variableId==='string')refs.add(v.variableId);for(const child of Object.values(v))if(child&&typeof child==='object')aliases(child);}
for(const s of raw)aliases(s.controls);
const unresolvedVariables=[...refs].filter(id=>!variableIds.has(id));
write(`${date}-coverage.json`,summary);
write(`${date}-connection-map.json`,{summary,records,edges,referencedOutsideInventory:outside,unresolvedVariables,reconciliation});
write(`${date}-app-routes.json`,{sourceCommit:checkpoint.baseCommit,routes:routeRows,classification:'All route files read; partial explicit state correspondences. Not exhaustive visual/runtime/provider verification.'});
const columns=['source','sourceName','control','controlName','visibleAtCapture','type','to','targetStatus','conditions','actionPath'];
const csv=value=>'"'+String(typeof value==='object'?JSON.stringify(value):value??'').replaceAll('"','""')+'"';
fs.writeFileSync(path.join(here,`${date}-connections.csv`),[columns.join(','),...edges.map(e=>columns.map(k=>csv(e[k])).join(','))].join('\n')+'\n');
const escapeCell=s=>String(s??'').replaceAll('|','\\|').replaceAll('\n',' ');
fs.writeFileSync(path.join(here,`${date}-screen-register.md`),['# October 8 screen inventory — reviewed through '+reviewDate,'','**Incomplete runtime audit.** Readable layouts: '+visual.ids.length+'/'+inventory.length+'. Prototype and app coverage are separate. Candidate routes are search aids; use the explorer and explicit comparisons.','','| Node | Screen/state | Area | Reactions | Visual | App |','|---|---|---|---|---|---|',...records.map(s=>`| [${s.id}](${s.figmaUrl}) | ${escapeCell(s.name)} | ${s.domain} | ${s.evidence} | ${s.visualStatus} | ${s.appStatus} |`)].join('\n')+'\n');
const template=fs.readFileSync(path.join(here,'explorer-template.html'),'utf8');
const payload=JSON.stringify({summary,records,edges,unresolved:outside}).replaceAll('<','\\u003c');
const notice=`Incomplete audit: ${raw.length}/${inventory.length} reaction trees, ${visual.ids.length}/${inventory.length} readable visual reviews, ${summary.livePrototypeChecks} sampled live prototype checks, ${appReview.visualComparisons.length} historical app comparisons. ${resumed?'Permanent Figma directory created; current app parity and full prototype coverage remain outstanding.':'Figma quota interrupted the remaining work; permanent notes not created.'} Source correspondences are not runtime parity.`;
fs.writeFileSync(path.join(here,'index.html'),template.replace('__AUDIT_DATE__',reviewDate).replace('__AUDIT_NOTICE__',notice).replace('__AUDIT_PAYLOAD__',payload));
console.log(JSON.stringify({status:summary.status,records:inventory.length,reactions:raw.length,visual:visual.ids.length,transitions:edges.length,unresolvedTargets:outside.filter(t=>t.status==='UNRESOLVED').length,unresolvedVariables:unresolvedVariables.length,routeFiles:routeRows.length},null,2));
