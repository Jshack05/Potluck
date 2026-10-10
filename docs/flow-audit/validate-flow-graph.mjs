import fs from "node:fs";
import assert from "node:assert/strict";
import { sourceHash } from "./audit-data.mjs";
import vm from "node:vm";
import { makeGraph, renderJourneyMermaid } from "./flow-graph.mjs";
const read = (name) =>
  fs
    .readFileSync(new URL(name, import.meta.url), "utf8")
    .replace(/\r\n/g, "\n");
const raw = read("./2026-10-08-connection-map.json"),
  source = JSON.parse(raw),
  graph = JSON.parse(read("./flow-graph.json"));
const expected = makeGraph(
  source,
  ["09", "10"].map((day) => ({
    ...JSON.parse(read(`./2026-10-${day}-prototype-review.json`)),
    sourceFile: `2026-10-${day}-prototype-review.json`,
  })),
  sourceHash(raw),
);
assert.deepEqual(
  graph,
  expected,
  "Graph is stale or differs from source evidence",
);
assert.equal(
  Object.values(graph.nodes).filter((n) => n.kind === "SCREEN").length,
  809,
);
assert.equal(graph.transitions.length, 8553);
assert.equal(graph.journeys.length, 26);
assert.equal(Object.keys(graph.families).length, 25);
for (const e of graph.transitions) {
  const rawEdge = source.edges[e.sourceEdgeIndex];
  for (const [key, value] of Object.entries(rawEdge))
    assert.deepEqual(e[key], value, `${e.id} altered ${key}`);
  if (e.reactionRef) {
    const screen = source.records.find((n) => n.id === e.source),
      control = screen.controls.find((c) => c.id === e.control);
    assert.deepEqual(
      graph.reactions[e.reactionRef],
      control.reactions[e.reactionIndex],
      `${e.id} lost ordered actions`,
    );
  }
  assert(graph.nodes[e.source].outgoing.includes(e.id));
  if (e.to) assert(graph.nodes[e.to].incoming.includes(e.id));
}
for (const j of graph.journeys)
  assert.equal(
    read(`./graph-journeys/${j.id}.mmd`),
    renderJourneyMermaid(graph, j),
  );
const packets = JSON.parse(read("./graph-journeys/packets.json"));
assert.deepEqual(
  packets.flatMap((p) => p.ids).sort(),
  graph.journeys.map((j) => j.id).sort(),
);
const html = read("./flow-map.html");
assert.deepEqual(
  JSON.parse(
    html.match(
      /<script type="application\/json" id="graph">([\s\S]*?)<\/script>/,
    )[1],
  ),
  graph,
);
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1);
new vm.Script(scripts[0][1]);
assert(!html.includes("/*GRAPH_DATA*/"));
const board = JSON.parse(read("./figjam-map.json"));
assert.equal(board.originalScreenLinks.length, 122);
assert.deepEqual(board.verifiedNativeNodes.badLinks, []);
assert.deepEqual(board.verifiedNativeNodes.textOverflow, []);
assert.deepEqual(
  board.chapters.flatMap((c) => c.journeys.map((j) => j.journey)).sort(),
  graph.journeys.map((j) => j.id).sort(),
);
const byBoardNode = new Map(
  board.originalScreenLinks.map((n) => [n.id, n.sourceId]),
);
for (const link of board.originalScreenLinks) {
  assert(graph.nodes[link.sourceId], `Unknown FigJam source ${link.sourceId}`);
  const actual = new URL(link.url),
    expectedUrl = new URL(graph.nodes[link.sourceId].figmaUrl);
  // Figma accepts both 7-423 and the URL-encoded 7:423 form; compare target identity.
  assert.equal(
    actual.origin + actual.pathname,
    expectedUrl.origin + expectedUrl.pathname,
  );
  assert.equal(
    actual.searchParams.get("node-id").replace("-", ":"),
    link.sourceId,
  );
  assert.equal(
    expectedUrl.searchParams.get("node-id").replace("-", ":"),
    link.sourceId,
  );
}
for (const chapter of board.chapters)
  for (const mapped of chapter.journeys) {
    const journey = graph.journeys.find((j) => j.id === mapped.journey);
    const nodeIds = new Set(
      board.verifiedNativeNodes.connectors
        .filter((c) => c[1] === mapped.id)
        .flatMap((c) => [c[2], c[3]]),
    );
    const links = board.verifiedNativeNodes.connectors.filter(
      (c) => c[1] === mapped.id,
    );
    assert.equal(
      links.length,
      journey.links.length,
      `${mapped.journey} connector count`,
    );
    for (const [index, link] of links.entries()) {
      assert.equal(
        byBoardNode.get(link[2]),
        journey.links[index].from,
        `${mapped.journey} arrow source`,
      );
      assert.equal(
        byBoardNode.get(link[3]),
        journey.links[index].to,
        `${mapped.journey} arrow destination`,
      );
    }
    if (journey.links.length) assert.equal(nodeIds.size, journey.steps.length);
  }
console.log(
  "PASS: 809 screens, 2 component targets, 8553 exact transitions, complete ordered reactions, 26 journeys, 25 families, Mermaid sources, embedded graph/script and recorded FigJam links/endpoints verified.",
);
