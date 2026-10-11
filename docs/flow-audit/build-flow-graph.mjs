import fs from "node:fs";
import { sourceHash } from "./audit-data.mjs";
import { makeGraph, renderJourneyMermaid } from "./flow-graph.mjs";
const here = new URL("./", import.meta.url);
const read = (name) => fs.readFileSync(new URL(name, here), "utf8");
const write = (name, value) => fs.writeFileSync(new URL(name, here), value);
const source = read("2026-10-08-connection-map.json");
const graph = makeGraph(
  JSON.parse(source),
  ["2026-10-09", "2026-10-10"].map((date) => ({
    ...JSON.parse(read(`${date}-prototype-review.json`)),
    sourceFile: `${date}-prototype-review.json`,
  })),
  sourceHash(source),
);
// Generated artifact: compact whitespace while retaining every captured action and condition.
write("flow-graph.json", JSON.stringify(graph) + "\n");
fs.mkdirSync(new URL("graph-journeys/", here), { recursive: true });
const packets = [
  {
    id: "cards",
    title: "Cards — navigation, appearance and funding",
    ids: ["J01", "J02", "J03", "J04", "J22", "J23"],
  },
  {
    id: "card-permissions",
    title: "Cards — Trusted Spender controls",
    ids: ["J05"],
  },
  {
    id: "account-circles",
    title: "Account access and Circle Host handover",
    ids: ["J09", "J10", "J11", "J12", "J13", "J14"],
  },
  {
    id: "bill-agreements",
    title: "Bills — agreement acceptance, payment and ending",
    ids: ["J15", "J16", "J17", "J18"],
  },
  {
    id: "bill-recovery-goals",
    title: "Bills — recovery, changed shares and Goal schedule",
    ids: ["J19", "J20", "J21", "J26"],
  },
  {
    id: "splitfinder",
    title: "Splitfinder — requests, conversations and category choice",
    ids: ["J06", "J07", "J08", "J24", "J25"],
  },
];
const escape = (text) =>
  String(text)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replace(/[\r\n]/g, " ");
let markdown =
  '# Potluck screen graph\n\nOpen [the interactive graph](flow-map.html) to follow any captured screen. Select a family or tested journey, then click a screen to inspect incoming/outgoing connections and open its exact Figma counterpart. [Machine-readable graph](flow-graph.json).\n\nThe graph contains all 809 captured screen/state records and 8,553 transition references. It also includes two referenced component states. Source capture: October 8; sampled live journeys: October 9–10. Figma wiring, sampled sequence evidence, product approval and app parity are distinct. No journey is marked user-approved automatically.\n\n## Native traversal for builders\n\n```powershell\nnode docs/flow-audit/graph-query.mjs search "Attach Circle"\nnode docs/flow-audit/graph-query.mjs screen 854:3495\nnode docs/flow-audit/graph-query.mjs screen 854:3495 --all\nnode docs/flow-audit/graph-query.mjs path 854:3466 861:3572\nnode docs/flow-audit/graph-query.mjs journey J22\n```\n\nPaths are candidates from the captured graph, not simulations. Evaluate conditions and the complete ordered reaction before implementation. Dynamic Back/Close do not have invented destinations. Hidden controls are excluded from default traversal and retained with `--all`. Exact source IDs, authority notes and app source mappings live on each node; unresolved canonical choices remain unresolved. Inspect the live counterpart before building because this map is dated evidence.\n\n## Tested journeys\n\nArrows show the recorded screen sequence. They do not claim the exact clicked hotspot when the original audit did not record it. Detailed candidate controls and complete raw reactions are available in the interactive graph. A journey result does not grade every screen or edge in it. Findings below are Figma prototype observations, not app bugs.\n\n';
for (const j of graph.journeys) {
  const mermaid = renderJourneyMermaid(graph, j);
  write(`graph-journeys/${j.id}.mmd`, mermaid);
  markdown += `### ${j.id} — ${j.name}\n\n**${j.result} · ${j.date} · approval not recorded · current app unverified**\n\n\`\`\`mermaid\n${mermaid}\`\`\`\n\n${j.observations.map((o) => `- ${o}`).join("\n")}\n\n`;
}
for (const packet of packets) {
  const lines = ["flowchart LR"];
  for (const id of packet.ids) {
    const j = graph.journeys.find((j) => j.id === id);
    lines.push(
      `subgraph ${id.toLowerCase()} ["${escape(`${j.id} | ${j.name} | ${j.result}`)}"]`,
    );
    lines.push(
      ...renderJourneyMermaid(graph, j, `${id.toLowerCase()}`)
        .split("\n")
        .slice(1)
        .filter(Boolean),
    );
    lines.push("end");
  }
  packet.mermaid = lines.join("\n");
  write(`graph-journeys/${packet.id}.mmd`, packet.mermaid + "\n");
}
write("graph-journeys/packets.json", JSON.stringify(packets, null, 2) + "\n");
const board = JSON.parse(read("figjam-map.json"));
const boardGuide = `## Shared visual map\n\n[Open the FigJam map](${board.url}). Its six chapters contain the 26 sampled journeys, with 122 linked screen occurrences and 96 sequence arrows. Every screen label opens its exact original Figma frame. The complete 809-record captured graph is available in the local interactive view and through the CLI above; the FigJam board is a readable projection of the sampled journeys, not an exhaustive execution map.\n\n${board.chapters.map((c) => `- [${c.title}](${board.url}?node-id=${c.id.replace(":", "-")}) — ${c.journeys.map((j) => j.journey).join(", ")}`).join("\n")}\n\n### Review and approval\n\nChoose a chapter, follow its arrows, and open the original screen when visual detail matters. Refer to a journey ID and source screen ID when commenting, for example: “J22, 854:3495: preserve No Circle when returning from review.” Explicitly say whether you approve the intended flow or want a change. An observed pass is not your approval. Red sections mark corrections, cream sections mark review findings, and white sections mark observed passes; the result grades the sampled journey, not every element in it.\n\nFuture builders must read the graph directly, then verify the current Figma counterpart. Read all ordered actions and conditions for the chosen control, preserve actor and draft context, and inspect returns and failure states. Stop and record missing or ambiguous screens/elements instead of inventing them. A sampled sequence arrow does not identify the exact clicked control when the source notes did not record it.\n\nWhen Joseph confirms or changes a flow, save the dated decision and exact journey/screen IDs separately from the captured evidence, and link it from the audit entry point. Keep the original findings intact. Board edits and comments are not automatically synchronized to JSON; reconcile them before implementation or regeneration.\n\n### Maintain and validate\n\nEdit the dated capture/review evidence when new verification warrants it, then run:\n\n\`\`\`powershell\nnode docs/flow-audit/build-flow-graph.mjs\nnode --test docs/flow-audit/flow-graph.test.mjs docs/flow-audit/flow-map.test.mjs\nnode docs/flow-audit/validate-flow-graph.mjs\n\`\`\`\n\nThe builder regenerates JSON, HTML and Mermaid locally. It does not write to Figma. Native node IDs and chapter links are recorded in [figjam-map.json](figjam-map.json); reconcile changed sequences against that manifest and recheck the visual map before claiming it current.\n\n`;
markdown = markdown.replace(
  "## Tested journeys\n",
  boardGuide + "## Tested journeys\n",
);
write("FLOW_GRAPH.md", markdown.trimEnd() + "\n");
const json = JSON.stringify(graph)
  .replaceAll("<", "\\u003c")
  .replaceAll(">", "\\u003e")
  .replaceAll("&", "\\u0026");
write(
  "flow-map.html",
  read("flow-map.template.html").replace("/*GRAPH_DATA*/", json),
);
console.log(
  JSON.stringify({
    screens: Object.values(graph.nodes).filter((n) => n.kind === "SCREEN")
      .length,
    external: Object.values(graph.nodes).filter((n) => n.kind !== "SCREEN")
      .length,
    transitions: graph.transitions.length,
    families: Object.keys(graph.families).length,
    journeys: graph.journeys.length,
    packets: packets.length,
  }),
);
