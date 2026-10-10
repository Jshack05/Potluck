// This is a view over captured evidence, never an application router or state machine.
export function makeGraph(capture, batches, sha256) {
  const nodes = {},
    reactions = {},
    families = {},
    reactionLookup = new Map(),
    interned = new Map();
  for (const r of capture.records) {
    if (nodes[r.id]) throw new Error(`Duplicate screen ${r.id}`);
    const { controls, instances, text, x, y, w, h, ...metadata } = r;
    nodes[r.id] = {
      ...metadata,
      kind: "SCREEN",
      outgoing: [],
      incoming: [],
      journeys: [],
      actionReactions: [],
      appRuntimeVerified: false,
    };
    families[r.familyId] ??= { id: r.familyId, name: r.family, screens: [] };
    families[r.familyId].screens.push(r.id);
    for (const control of controls ?? [])
      for (const [index, reaction] of (control.reactions ?? []).entries()) {
        const program = JSON.stringify(reaction);
        if (!interned.has(program)) {
          const key = `r${String(interned.size + 1).padStart(5, "0")}`;
          interned.set(program, key);
          reactions[key] = reaction;
        }
        const reactionRef = interned.get(program);
        reactionLookup.set(`${r.id}/${control.id}/${index}`, reactionRef);
        nodes[r.id].actionReactions.push({
          control: control.id,
          name: control.name,
          visible: control.visible,
          reactionIndex: index,
          reactionRef,
        });
      }
  }
  for (const r of capture.referencedOutsideInventory ?? []) {
    nodes[r.id] ??= {
      id: r.id,
      name: r.name,
      kind: r.status,
      outgoing: [],
      incoming: [],
      journeys: [],
      appRuntimeVerified: false,
    };
  }
  const transitions = capture.edges.map((edge, index) => {
    if (!nodes[edge.source]) throw new Error(`Unknown source ${edge.source}`);
    if (edge.to && !nodes[edge.to])
      nodes[edge.to] = {
        id: edge.to,
        name: edge.destinationName ?? edge.to,
        kind: "UNRESOLVED",
        outgoing: [],
        incoming: [],
        journeys: [],
        appRuntimeVerified: false,
      };
    const id = `t${String(index + 1).padStart(6, "0")}`;
    const ref = `${edge.source}/${edge.control}/${edge.reactionIndex}`;
    const row = {
      ...edge,
      id,
      reactionRef: reactionLookup.get(ref) ?? null,
      sourceEdgeIndex: index,
      evidence: "CAPTURED_WIRING",
      appRuntimeVerified: false,
    };
    nodes[edge.source].outgoing.push(id);
    if (edge.to) nodes[edge.to].incoming.push(id);
    return row;
  });
  const journeys = [];
  for (const batch of batches)
    for (const sample of batch.journeys) {
      const id = `J${String(journeys.length + 1).padStart(2, "0")}`;
      const steps = sample.nodes.map((screen, index) => {
        if (!nodes[screen]) throw new Error(`Unknown journey screen ${screen}`);
        if (!nodes[screen].journeys.includes(id))
          nodes[screen].journeys.push(id);
        return { id: `${id}s${index + 1}`, screen };
      });
      const links = steps.slice(1).map((step, index) => {
        const from = steps[index].screen,
          to = step.screen;
        const candidates = transitions.filter(
          (e) => e.source === from && e.to === to,
        );
        return {
          fromStep: index,
          toStep: index + 1,
          from,
          to,
          capturedTransitionIds: candidates.map((e) => e.id),
          evidence: candidates.length
            ? "RECORDED_SEQUENCE_WITH_CAPTURED_CANDIDATES"
            : "RECORDED_SEQUENCE_ONLY",
        };
      });
      journeys.push({
        ...sample,
        id,
        date: batch.date,
        sourceFile: batch.sourceFile,
        steps,
        links,
        appRuntimeVerified: false,
        approval: "NOT_RECORDED",
      });
    }
  return {
    schemaVersion: 1,
    source: {
      file: "2026-10-08-connection-map.json",
      sha256,
      capturedOn: capture.summary.capturedOn,
      figmaFileKey: capture.summary.fileKey,
    },
    scope:
      "Captured design graph. Not an approved runtime navigation specification.",
    families,
    nodes,
    transitions,
    reactions,
    journeys,
  };
}

export function inspectScreen(graph, id, { includeHidden = false } = {}) {
  const node = graph.nodes[id];
  if (!node) throw new Error(`Unknown screen ${id}`);
  const pick = (ids) =>
    ids
      .map((ref) => graph.transitions[Number(ref.slice(1)) - 1])
      .filter((e) => includeHidden || e.visibleAtCapture);
  return {
    node,
    outgoing: pick(node.outgoing),
    incoming: pick(node.incoming),
    journeys: graph.journeys.filter((j) => node.journeys.includes(j.id)),
  };
}

export function findCapturedPath(
  graph,
  from,
  to,
  { includeHidden = false } = {},
) {
  if (!graph.nodes[from] || !graph.nodes[to])
    throw new Error("Unknown path endpoint");
  const queue = [{ id: from, path: [] }],
    seen = new Set([from]);
  for (let index = 0; index < queue.length; index++) {
    const item = queue[index];
    if (item.id === to)
      return {
        status: "CAPTURED_CANDIDATE_NOT_EXECUTED",
        warning:
          "Conditions and earlier variable writes are not evaluated. A captured path is not proof of a feasible journey.",
        transitions: item.path,
      };
    for (const edge of inspectScreen(graph, item.id, { includeHidden })
      .outgoing) {
      if (
        !edge.to ||
        seen.has(edge.to) ||
        graph.nodes[edge.to].kind !== "SCREEN" ||
        !["NAVIGATE", "OVERLAY", "SWAP"].includes(edge.type)
      )
        continue;
      seen.add(edge.to);
      queue.push({ id: edge.to, path: [...item.path, edge] });
    }
  }
  return null;
}

const quoted = (text) =>
  String(text)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replace(/[\r\n]/g, " ");
export function renderJourneyMermaid(graph, journey, prefix = "") {
  const lines = ["flowchart LR"];
  for (const [index, step] of journey.steps.entries()) {
    const n = graph.nodes[step.screen];
    lines.push(`  ${prefix}step${index + 1}["${quoted(n.name)} | ${n.id}"]`);
    if (n.figmaUrl)
      lines.push(
        `  click ${prefix}step${index + 1} "${n.figmaUrl}" "Open original screen"`,
      );
  }
  for (const link of journey.links) {
    // Observations record a screen sequence, not the exact clicked hotspot/action log.
    lines.push(
      `  ${prefix}step${link.fromStep + 1} -->|"Recorded next state"| ${prefix}step${link.toStep + 1}`,
    );
  }
  return lines.join("\n") + "\n";
}
