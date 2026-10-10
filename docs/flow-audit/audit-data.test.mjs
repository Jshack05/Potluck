import test from 'node:test';
import assert from 'node:assert/strict';
import { flattenReactions, classifyTarget, coverage, mapSourceStates, sourceHash } from './audit-data.mjs';

test('source fingerprints ignore checkout line endings but detect real code changes', () => {
  assert.equal(sourceHash('const value = 1;\n'), sourceHash('const value = 1;\r\n'));
  assert.notEqual(sourceHash('const value = 1;\n'), sourceHash('const value = 2;\n'));
  assert.notEqual(sourceHash('const value = 1;\n'), sourceHash('const value = 1;'));
});

test('preserves action order, nested conditions and hidden controls', () => {
  const screens = [{id:'1:1', name:'Source', controls:[{id:'1:2', name:'Hidden', visible:false, reactions:[{trigger:{type:'ON_CLICK'}, actions:[
    {type:'SET_VARIABLE', variableId:'v', variableValue:{value:true}},
    {type:'CONDITIONAL', conditionalBlocks:[{condition:{type:'VARIABLE_ALIAS', value:{id:'v'}}, actions:[{type:'NODE',destinationId:'2:1',navigation:'OVERLAY'}]}, {actions:[{type:'CONDITIONAL',conditionalBlocks:[{actions:[{type:'BACK'}]}]}]}]},
    {type:'CLOSE'}
  ]}]}]}];
  const rows=flattenReactions(screens);
  assert.deepEqual(rows.map(r=>r.type),['SET_VARIABLE','OVERLAY','BACK','CLOSE']);
  assert.deepEqual(rows.map(r=>r.actionPath),[[0],[1,'branch',0,0],[1,'branch',1,0,'branch',0,0],[2]]);
  assert(rows.every(r=>r.visibleAtCapture===false));
  assert.equal(rows[1].to,'2:1');
  assert.equal(rows[2].conditions.length,2);
  assert.equal(rows[2].conditions[0].otherwise,true);
});

test('keeps legacy ordered IF actions and null triggers readable', () => {
  const rows=flattenReactions([{id:'a',controls:[{id:'b',reactions:[{trigger:null,actions:[{type:'IF',branches:[{when:'x',actions:[{type:'NAVIGATE',to:'c'}]}]}]}]}]}]);
  assert.equal(rows[0].to,'c');
  assert.equal(rows[0].trigger,null);
  assert.equal(rows[0].conditions[0].when,'x');
});

test('an outside-inventory component is resolved; an unknown target is not called deleted', () => {
  assert.equal(classifyTarget('1',new Set(['1']),new Set(['2'])),'SCREEN');
  assert.equal(classifyTarget('2',new Set(['1']),new Set(['2'])),'COMPONENT');
  assert.equal(classifyTarget('3',new Set(['1']),new Set(['2'])),'UNRESOLVED');
  assert.equal(classifyTarget(null,new Set(),new Set()),'DYNAMIC_OR_NONE');
});

test('coverage never upgrades extraction to visual or runtime verification', () => {
  const result=coverage([{id:'a'},{id:'b'}],[{id:'a'}],['a']);
  assert.equal(result.status,'INCOMPLETE');
  assert.equal(result.reactions,1);assert.equal(result.visual,1);
  assert.deepEqual(result.remainingReactions,['b']);
  assert.equal(result.prototypeInteractions,0);
  assert.equal(result.appVisualComparisons,0);
});

test('source mapping keeps missing and implemented states distinct without inferring sibling coverage', () => {
  const routes=[{route:'/agreement/[id]',sourceFile:'agreement.tsx',implementedStates:[{state:'Manual',designIds:['manual'],implementation:'manual terms'}],missingStates:[{state:'Automatic',designIds:['auto'],reason:'provider absent'}]}];
  assert.equal(mapSourceStates('manual',routes)[0].status,'SOURCE_CORRESPONDENCE');
  assert.equal(mapSourceStates('auto',routes)[0].status,'MISSING_IN_INSPECTED_UI');
  assert.equal(mapSourceStates('auto',routes)[0].runtimeVerified,false);
  assert.deepEqual(mapSourceStates('other',routes),[]);
});
