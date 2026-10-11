import test from "node:test";
import assert from "node:assert/strict";
import {
  makeGraph,
  inspectScreen,
  findCapturedPath,
  renderJourneyMermaid,
} from "./flow-graph.mjs";

const capture = {
  summary: { capturedOn: "2026-10-08", fileKey: "file" },
  records: [
    {
      id: "1:1",
      name: 'Choose "A"',
      familyId: "cards",
      family: "Cards",
      controls: [
        {
          id: "button",
          reactions: [
            {
              actions: [
                { type: "SET_VARIABLE", variableId: "choice", value: "a" },
                { type: "CONDITIONAL", conditionalBlocks: [] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "2:2",
      name: "Review",
      familyId: "cards",
      family: "Cards",
      controls: [],
    },
    {
      id: "3:3",
      name: "Alternative",
      familyId: "cards",
      family: "Cards",
      controls: [],
    },
  ],
  edges: [
    {
      source: "1:1",
      to: "2:2",
      control: "button",
      controlName: "Continue",
      reactionIndex: 0,
      type: "NAVIGATE",
      visibleAtCapture: true,
      conditions: [{ when: "choice=a" }],
      actionPath: [1, "branch", 0],
    },
    {
      source: "1:1",
      to: "3:3",
      control: "button",
      controlName: "Continue",
      reactionIndex: 0,
      type: "NAVIGATE",
      visibleAtCapture: false,
      conditions: [{ otherwise: true }],
      actionPath: [1, "branch", 1],
    },
    {
      source: "2:2",
      to: null,
      type: "BACK",
      controlName: "Back",
      visibleAtCapture: true,
      conditions: [],
    },
    {
      source: "2:2",
      to: "9:9",
      type: "CHANGE_TO",
      controlName: "Toggle",
      visibleAtCapture: true,
      conditions: [],
    },
  ],
  referencedOutsideInventory: [{ id: "9:9", status: "COMPONENT", name: "On" }],
};

test("graph retains branch conditions, hidden edges, dynamic returns and ordered reaction context", () => {
  const g = makeGraph(capture, [], "capture-hash");
  assert.equal(g.transitions.length, 4);
  assert.deepEqual(g.transitions[0].conditions, capture.edges[0].conditions);
  assert.deepEqual(
    g.reactions[g.transitions[0].reactionRef].actions,
    capture.records[0].controls[0].reactions[0].actions,
  );
  assert.equal(g.transitions[1].visibleAtCapture, false);
  assert.equal(g.transitions[2].to, null);
  assert.equal(g.nodes["9:9"].kind, "COMPONENT");
  assert.deepEqual(g.nodes["2:2"].incoming, ["t000001"]);
  assert.equal(g.source.sha256, "capture-hash");
  assert.equal(g.nodes["1:1"].appRuntimeVerified, false);
  assert.equal(g.nodes["1:1"].actionReactions[0].control, "button");
});

test("screen traversal can expose hidden paths without misrepresenting them as available clicks", () => {
  const g = makeGraph(capture, [], "hash");
  assert.equal(inspectScreen(g, "1:1").outgoing.length, 1);
  assert.equal(
    inspectScreen(g, "1:1", { includeHidden: true }).outgoing.length,
    2,
  );
  assert.equal(findCapturedPath(g, "1:1", "3:3"), null);
  assert.equal(findCapturedPath(g, "2:2", "1:1"), null);
  const p = findCapturedPath(g, "1:1", "2:2");
  assert.equal(p.status, "CAPTURED_CANDIDATE_NOT_EXECUTED");
  assert.equal(p.transitions[0].conditions.length, 1);
});

test("observed screen sequence never fabricates a captured direct edge or promotes app parity", () => {
  const g = makeGraph(
    capture,
    [
      {
        date: "2026-10-10",
        sourceFile: "sample.json",
        journeys: [
          {
            name: "Sample",
            nodes: ["1:1", "3:3", "2:2"],
            result: "FAIL",
            elementId: "failing-control",
            observations: ["Selection is lost"],
          },
        ],
      },
    ],
    "hash",
  );
  assert.equal(g.journeys[0].steps[0].screen, "1:1");
  assert.deepEqual(g.journeys[0].links[1].capturedTransitionIds, []);
  assert.equal(g.journeys[0].links[1].evidence, "RECORDED_SEQUENCE_ONLY");
  assert.equal(g.journeys[0].appRuntimeVerified, false);
  assert.equal(g.nodes["1:1"].journeys.length, 1);
  assert.equal(g.journeys[0].elementId, "failing-control");
});

test("Mermaid repeats visited screens as distinct steps and escapes labels", () => {
  const g = makeGraph(
    capture,
    [
      {
        date: "2026-10-10",
        sourceFile: "sample.json",
        journeys: [
          {
            name: "Round trip",
            nodes: ["1:1", "2:2", "1:1"],
            result: "FAIL",
            observations: [],
          },
        ],
      },
    ],
    "hash",
  );
  const source = renderJourneyMermaid(g, g.journeys[0]);
  assert.match(source, /step1/);
  assert.match(source, /step3/);
  assert.doesNotMatch(source, /\["Choose "A"/);
  assert.match(source, /Recorded next state/);
});
