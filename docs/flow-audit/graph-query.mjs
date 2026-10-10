import fs from "node:fs";
import { inspectScreen, findCapturedPath } from "./flow-graph.mjs";
const graph = JSON.parse(
  fs.readFileSync(new URL("./flow-graph.json", import.meta.url), "utf8"),
);
const [command, first, second] = process.argv.slice(2);
const options = { includeHidden: process.argv.includes("--all") };
let result;
if (command === "screen") {
  result = inspectScreen(graph, first, options);
  result.reactions = Object.fromEntries(
    (result.node.actionReactions ?? []).map((e) => [
      e.reactionRef,
      graph.reactions[e.reactionRef],
    ]),
  );
} else if (command === "path")
  result = findCapturedPath(graph, first, second, options);
else if (command === "journey")
  result = graph.journeys.find((j) => j.id === first);
else if (command === "family") result = graph.families[first];
else if (command === "search")
  result = Object.values(graph.nodes)
    .filter((n) =>
      `${n.id} ${n.name}`.toLowerCase().includes((first ?? "").toLowerCase()),
    )
    .map((n) => ({
      id: n.id,
      name: n.name,
      family: n.familyId,
      figmaUrl: n.figmaUrl,
    }));
else
  result = {
    usage:
      "node docs/flow-audit/graph-query.mjs screen <figma-id> [--all] | path <from> <to> [--all] | journey <J01> | family <id> | search <text>",
    source: graph.source,
    families: Object.values(graph.families).map((f) => ({
      id: f.id,
      name: f.name,
      screens: f.screens.length,
    })),
  };
if (result === undefined) throw new Error("No matching graph record");
console.log(JSON.stringify(result, null, 2));
