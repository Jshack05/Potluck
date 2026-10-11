import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

if (!process.argv.includes('--historical')) {
  await import('./build-current-audit.mjs');
  process.exit(0);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const read = name => JSON.parse(fs.readFileSync(path.join(here, name), 'utf8'));
const inventory = read('2026-10-02-screen-inventory.json');
const audit = read('2026-10-02-screen-reactions.json');
const vars = read('2026-10-02-prototype-variables.json');
const figma = id => `https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id=${encodeURIComponent(id)}`;
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (['node_modules', '.git', 'flow-audit'].includes(e.name) ? [] : walk(path.join(dir, e.name))) : [path.join(dir, e.name)]);
const docs = [...walk(path.join(root, 'docs')), path.join(root, 'AGENTS.md'), path.join(root, 'splitfinder.md'), path.join(root, 'my-app/MOBILE_PREVIEW.md')].filter(f => f.endsWith('.md'));
const sources = docs.map(f => ({ path: path.relative(root, f).replaceAll('\\', '/'), text: fs.readFileSync(f, 'utf8') }));
const audited = new Map(audit.map(s => [s.id, s]));
const known = new Map(inventory.map(s => [s.id, s]));
if (known.size !== inventory.length || audited.size !== audit.length || audit.some(s => !known.has(s.id))) throw new Error('Duplicate IDs or audit/inventory mismatch');
const edges = [];
const actions = [];
function flatten(list, ctx, conditions = []) {
  for (const [index, action] of list.entries()) {
    const row = { ...ctx, conditions, actionIndex: index, ...action };
    if (action.type === 'IF') {
      action.branches.forEach((branch, branchIndex) => flatten(branch.actions, ctx, [...conditions, { branchIndex, when: branch.when ?? 'ELSE (previous branches did not match)' }]));
    } else {
      actions.push(row);
      if (action.to || ['BACK', 'CLOSE', 'URL', 'OPEN_URL'].includes(action.type)) edges.push({ ...row, destinationName: known.get(action.to)?.name ?? null, destinationCaptured: known.has(action.to), figmaUrl: action.to ? figma(action.to) : null });
    }
  }
}
for (const s of audit) for (const c of s.controls) for (const [reactionIndex, r] of c.reactions.entries()) flatten(r.actions, { source: s.id, sourceName: s.name, control: c.id, controlName: c.name, label: c.label, visibleAtCapture: c.visible, trigger: r.trigger, reactionIndex });
const domain = s => {
  const n = s.name.toLowerCase();
  if (/reference|start here|review guide/.test(n)) return 'Reference / review';
  if (n.startsWith('continuation /')) {
    if (/circle|handover|hostleave|memberleave|memberremoved|recipient.*host/.test(n)) return 'Circles';
    if (/sign.?in|sign.?up|password|verifyemail|resend|email.*verif|auth|account|profile|legal|termsdocument|privacydocument|deleteaccount/.test(n)) return 'Account / identity';
    if (/inbox|convo|conversation|compose|message|reply|report|block|unblock|help|support/.test(n)) return 'Messaging / safety';
    if (/request|pending|withdraw|accepted|declined|unavailable/.test(n)) return 'Splitfinder requests';
    return 'Splitfinder discovery / publishing';
  }
  if (/splitfinder|onboarding/.test(n)) return 'Splitfinder discovery / publishing';
  if (/inbox|profile|settings|^you/.test(n)) return 'Account / messaging';
  if (/goal/.test(n)) return 'Goals / later scope';
  if (/bill|agreement|contribution/.test(n) || /^role \/ (b[a-z]|gagreement|ghistory|gpay|gpending|gstop|gstopped|thistory|msgbill)/.test(n)) return 'Bills / contributions';
  if (/circle|add people/.test(n)) return 'Circles';
  return 'Cards / roles';
};
const records = inventory.map(s => {
  const a = audited.get(s.id);
  const mentionedIn = sources.filter(d => new RegExp(`(?<![0-9])${s.id}(?![0-9])`).test(d.text)).map(d => d.path);
  return { ...s, domain: domain(s), figmaUrl: figma(s.id), evidence: a ? 'REACTIONS_CAPTURED' : mentionedIn.length ? 'INVENTORY_AND_DOCUMENT_REFERENCE' : 'INVENTORY_ONLY', mentionedIn, text: a?.text ?? null, controls: a?.controls ?? null };
});
const unresolved = [...new Set(edges.filter(e => e.to && !known.has(e.to)).map(e => e.to))].sort().map(id => ({ id, figmaUrl: figma(id), incoming: edges.filter(e => e.to === id).length, actionTypes: [...new Set(edges.filter(e => e.to === id).map(e => e.type))] }));
const summary = {
  capturedOn: '2026-10-02', fileKey: '1hAy3kcZAEvqq8ZNjKU7CD', pageId: '1:123',
  status: 'PARTIAL CONNECTION AUDIT; NOT IMPLEMENTATION SIGN-OFF',
  records: records.length, reactionAuditedRecords: audit.length, controls: audit.reduce((n,s) => n+s.controls.length,0), actionLeaves: actions.length, transitionReferences: edges.length,
  destinationsOutsideCapturedInventory: unresolved.length,
  inventoryScope: '495 direct frame/instance children of 03 Screens plus 291 frames in the October 2 continuation section. Includes variants and review/reference boards, not 786 distinct application routes.',
  missingSectionChildren: [{id:'955:4752',name:'Authentication'},{id:'985:4904',name:'Getting started'},{id:'1052:5011',name:'Bill import'}],
  limitations: ['Figma MCP quota stopped extraction at 240 records. Remaining 546 records have names/IDs but no complete reaction audit.', 'Three older sections have not been expanded. Additional nested screen/component states may exist.', 'Navigation references outside captured inventory are not necessarily broken. They may be nested screens, component variants, or scroll targets.', 'No live prototype click-through or rendered-screen review was completed in this audit.', 'Only 162 of 612 non-color variables were captured. Conditional expressions retain unresolved variable IDs.', 'Branch conditions are recorded per reaction, not evaluated. Raw ordered action trees remain in screen-reactions.json.', 'Captured visible flags describe the inspection state, not all possible variable-driven states.', 'Automatically assigned domains are search aids, not approved navigation assignments.'],
  sourceDocuments: sources.map(d => ({ path:d.path, sha256:crypto.createHash('sha256').update(d.text).digest('hex') }))
};
const writeJson = (name,value) => fs.writeFileSync(path.join(here,name), JSON.stringify(value,null,2)+'\n');
writeJson('2026-10-02-coverage.json',summary);
writeJson('2026-10-02-connection-map.json',{summary,records,edges,referencedOutsideInventory:unresolved,variables:vars});
const csvCell = x => '"'+String(x ?? '').replaceAll('"','""')+'"';
const cols = ['source','sourceName','control','controlName','label','visibleAtCapture','type','to','destinationName','destinationCaptured','conditions'];
fs.writeFileSync(path.join(here,'2026-10-02-connections.csv'),[cols.join(','),...edges.map(e=>cols.map(k=>csvCell(typeof e[k]==='object'?JSON.stringify(e[k]):e[k])).join(','))].join('\r\n'));
const md = ['# Captured Figma screen register', '', '> Partial coverage. See [audit and limitations](../APP_FLOW_MAP.md). Every row below is a captured Figma object, not necessarily a distinct app route.', '', '| Figma node | Name | Domain (search aid) | Evidence |', '|---|---|---|---|', ...records.map(s=>`| [${s.id}](${s.figmaUrl}) | ${s.name.replaceAll('|','\\|')} | ${s.domain} | ${s.evidence} |`)];
fs.writeFileSync(path.join(here,'2026-10-02-screen-register.md'),md.join('\n')+'\n');
const payload=JSON.stringify({summary,records,edges,unresolved}).replaceAll('<','\\u003c');
const html=String.raw`<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Potluck · App flow audit</title>
<style>*{box-sizing:border-box}body{margin:0;background:#f7f7f3;color:#233632;font:15px/1.55 system-ui,sans-serif}header{padding:30px 4vw 20px;background:#fff;border-bottom:1px solid #ddd}h1{font-size:30px;margin:0}h2{font-size:23px}h3{font-size:17px}.muted{color:#62706c}.notice{background:#fff0d4;padding:12px 16px;border-radius:10px;max-width:1050px}.stats{display:flex;gap:24px;margin:18px 0}.stats strong{font-size:25px;display:block}main{display:grid;grid-template-columns:minmax(280px,360px) 1fr;gap:22px;padding:24px 4vw}aside{min-width:0}input,select,button{font:inherit;border:1px solid #b9c9c4;border-radius:8px;background:white;padding:9px;color:inherit}input,select{width:100%;margin-bottom:9px}button{cursor:pointer}button:hover,a:hover{color:#006959;background:#e9f4ed}.list{max-height:70vh;overflow:auto}.item{display:block;width:100%;text-align:left;margin:7px 0;padding:12px}.item small{display:block;color:#687c74}.item[aria-current=true]{background:#e2efe7;border-color:#306e60}article{background:#fff;border-radius:16px;padding:24px;min-width:0}.pill{display:inline-block;border-radius:20px;padding:3px 10px;background:#e8f1ed;font-size:12px}.pending{background:#fff0d4}a{color:#226b5b}table{border-collapse:collapse;width:100%;font-size:13px}th,td{text-align:left;vertical-align:top;padding:10px;border-bottom:1px solid #eee;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f6f7f5;padding:15px;max-height:480px;overflow:auto;font-size:12px}details{margin:16px 0}summary{cursor:pointer;font-weight:600}.tablewrap{overflow:auto}footer{padding:20px 4vw}#results{font-size:13px}@media(max-width:760px){main{grid-template-columns:1fr}.list{max-height:32vh}.stats{gap:14px;flex-wrap:wrap}article{padding:15px}}</style>
<header><div class="muted">POTLUCK / DESIGN AUDIT / OCTOBER 2, 2026</div><h1>Where each screen goes.</h1><p>Search the captured Figma screens. Inspect actual prototype actions, conditions, and incoming links.</p><div class="notice"><b>Partial connection audit.</b> Figma quota interrupted verification. Inventory-only screens do not have verified outgoing connections. Three older sections remain unexpanded. This is not an implementation sign-off.</div><div id="stats" class="stats"></div><a href="../APP_FLOW_MAP.md">Read the app journey map and decisions</a></header>
<main><aside><label for="search">Find a screen or node ID</label><input id="search" placeholder="Try request, import, 714:2708…"><label for="domain">Area</label><select id="domain"><option value="">All areas</option></select><label for="evidence">Connection evidence</label><select id="evidence"><option value="">All evidence levels</option><option>REACTIONS_CAPTURED</option><option>INVENTORY_AND_DOCUMENT_REFERENCE</option><option>INVENTORY_ONLY</option></select><p id="results" aria-live="polite"></p><div id="list" class="list"></div></aside><article id="detail"></article></main><footer>Figma reactions are design evidence. They do not prove backend behavior, authorization, persistence, or payment settlement.</footer>
<script type="application/json" id="data">${payload}</script><script>
const data=JSON.parse(document.getElementById('data').textContent), byId=new Map(data.records.map(s=>[s.id,s]));
const $=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected=decodeURIComponent(location.hash.slice(1))||'7:423';
$('stats').innerHTML=[['Captured objects',data.summary.records],['Reaction-audited',data.summary.reactionAuditedRecords],['Transition references',data.summary.transitionReferences]].map(([l,n])=>'<div><strong>'+n+'</strong>'+l+'</div>').join('');
for(const d of [...new Set(data.records.map(s=>s.domain))].sort()) $('domain').add(new Option(d,d));
function link(id){const s=byId.get(id);return s?'<a href="#'+encodeURIComponent(id)+'">'+esc(s.name)+' <small>'+esc(id)+'</small></a>':'<a target="_blank" rel="noopener" href="https://www.figma.com/design/1hAy3kcZAEvqq8ZNjKU7CD?node-id='+encodeURIComponent(id)+'">'+esc(id)+' · outside captured inventory</a>'}
function list(){const q=$('search').value.toLowerCase(),d=$('domain').value,e=$('evidence').value;const rows=data.records.filter(s=>(!q||(s.name+' '+s.id).toLowerCase().includes(q))&&(!d||d===s.domain)&&(!e||e===s.evidence));$('results').textContent=rows.length+' captured objects';$('list').innerHTML=rows.map(s=>'<button class="item" data-id="'+esc(s.id)+'" aria-current="'+(s.id===selected)+'">'+esc(s.name)+'<small>'+esc(s.id)+' · '+(s.evidence==='REACTIONS_CAPTURED'?'reactions captured':'connections unverified')+'</small></button>').join('')}
function edgeTable(rows,incoming){if(!rows.length)return '<p class="muted">None in the captured reactions. This does not prove that the complete Figma graph has none.</p>';return '<div class="tablewrap"><table><thead><tr><th>Control / trigger</th><th>'+(incoming?'From':'Destination')+'</th><th>Conditions / visibility</th></tr></thead><tbody>'+rows.map(e=>'<tr><td>'+esc(e.label||e.controlName)+'<br><small>'+esc(e.type)+' · '+esc(e.trigger.type)+'</small></td><td>'+(incoming?link(e.source):e.to?link(e.to):esc(e.type==='BACK'?'Previous prototype frame':e.type==='CLOSE'?'Dismiss overlay':e.url||e.type))+'</td><td>'+esc(e.conditions.map(c=>c.when).join(' → ')||'No branch condition')+'<br><small>'+ (e.visibleAtCapture?'Visible at capture':'Hidden at capture; not an available click path in this state')+'</small></td></tr>').join('')+'</tbody></table></div>'}
function detail(){const s=byId.get(selected);if(!s){$('detail').innerHTML='<h2>Screen not in captured inventory</h2><p>Select a captured screen from the list.</p>';return}const outgoing=data.edges.filter(e=>e.source===s.id), incoming=data.edges.filter(e=>e.to===s.id);$('detail').innerHTML='<span class="pill '+(s.controls?'':'pending')+'">'+esc(s.evidence)+'</span><h2>'+esc(s.name)+'</h2><p class="muted">'+esc(s.id)+' · '+s.w+' × '+s.h+' · '+esc(s.type)+'</p><p><a target="_blank" rel="noopener" href="'+s.figmaUrl+'">Open this node in Figma ↗</a></p>'+(!s.controls?'<p class="notice">Name and ID captured; this screen’s controls and destinations have not been audited. Do not infer a working connection from its title.</p>':'<p>Prototype reactions captured. Branches are recorded, not executed. Multiple text/icon hotspots may represent the same user action.</p>')+'<h3>Outgoing transitions</h3>'+edgeTable(outgoing,false)+'<h3>Incoming transitions from audited screens</h3>'+edgeTable(incoming,true)+'<details><summary>Visible text at capture</summary><pre>'+esc(s.text?.join('\n')||'Not captured')+'</pre></details><details><summary>Raw controls, variable writes, and action order</summary><pre>'+esc(JSON.stringify(s.controls,null,2)||'Not captured')+'</pre></details><details><summary>Repository documents mentioning this exact ID</summary><ul>'+s.mentionedIn.map(p=>'<li><a href="../../'+encodeURI(p)+'">'+esc(p)+'</a></li>').join('')+'</ul><p class="muted">A document reference is supporting context, not current connection verification.</p></details>'}
$('list').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b)location.hash=encodeURIComponent(b.dataset.id)});for(const id of ['search','domain','evidence'])$(id).addEventListener('input',list);window.addEventListener('hashchange',()=>{selected=decodeURIComponent(location.hash.slice(1));list();detail()});list();detail();
</script></html>`;
fs.writeFileSync(path.join(here,'2026-10-02-index.html'),html);
console.log(JSON.stringify({records:records.length,audited:audit.length,controls:summary.controls,edges:edges.length,outside:unresolved.length,htmlBytes:Buffer.byteLength(html)},null,2));
