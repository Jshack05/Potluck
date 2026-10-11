import crypto from 'node:crypto';

// Git may check out text with CRLF on Windows. Preserve all other content.
export function sourceHash(content) {
  return crypto.createHash('sha256').update(String(content).replace(/\r\n/g, '\n')).digest('hex');
}

/** Preserve raw action trees separately; this projection is for searching, not execution. */
export function flattenReactions(screens) {
  const rows=[];
  function walk(actions, context, conditions=[], prefix=[]) {
    for(const [index, action] of actions.entries()) {
      const actionPath=[...prefix,index];
      if(action.type==='CONDITIONAL' || action.type==='IF') {
        const blocks=action.conditionalBlocks ?? action.branches ?? [];
        for(const [branchIndex,branch] of blocks.entries()) {
          const when=branch.condition ?? branch.when ?? null;
          walk(branch.actions ?? [],context,[...conditions,{branchIndex,when,otherwise:when===null,previousBranchesMustNotMatch:branchIndex>0}], [...actionPath,'branch',branchIndex]);
        }
      } else rows.push({...context, type:action.type==='NODE' ? action.navigation ?? 'NODE' : action.type, to:action.destinationId ?? action.to ?? null, conditions,actionPath,rawAction:action});
    }
  }
  for(const screen of screens) for(const control of screen.controls ?? []) for(const [reactionIndex,reaction] of control.reactions.entries()) {
    walk(reaction.actions ?? [],{source:screen.id,sourceName:screen.name,control:control.id,controlName:control.name,visibleAtCapture:control.visible ?? null,trigger:reaction.trigger ?? null,reactionIndex});
  }
  return rows;
}

export function classifyTarget(id,screenIds,componentIds) {
  return !id ? 'DYNAMIC_OR_NONE' : screenIds.has(id) ? 'SCREEN' : componentIds.has(id) ? 'COMPONENT' : 'UNRESOLVED';
}

export function coverage(inventory,raw,visualIds) {
  const captured=new Set(raw.map(s=>s.id)),visual=new Set(visualIds);
  return {status:'INCOMPLETE',records:inventory.length,reactions:captured.size,visual:visual.size,
    remainingReactions:inventory.filter(s=>!captured.has(s.id)).map(s=>s.id),
    remainingVisual:inventory.filter(s=>!visual.has(s.id)).map(s=>s.id),
    prototypeInteractions:0,appVisualComparisons:0};
}
export function mapSourceStates(id, routes) {
  return routes.flatMap(route => [
    ...(route.implementedStates ?? []).filter(s => s.designIds?.includes(id)).map(s => ({...s,status:'SOURCE_CORRESPONDENCE'})),
    ...(route.missingStates ?? []).filter(s => s.designIds?.includes(id)).map(s => ({...s,status:'MISSING_IN_INSPECTED_UI'})),
  ].map(s => ({...s,route:route.route,sourceFile:route.sourceFile,runtimeVerified:false,visualParityVerified:false})));
}
