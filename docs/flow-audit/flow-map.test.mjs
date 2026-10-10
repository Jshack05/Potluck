import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
// Offline interaction-logic test, not a browser or rendering test.
const script = fs
  .readFileSync(new URL("./flow-map.template.html", import.meta.url), "utf8")
  .match(/<script>([\s\S]*?)<\/script>/)[1];
function start() {
  const ids = ["854:3466", "928:4751", "573:2058"];
  const graph = {
    source: { figmaFileKey: "file" },
    families: { cards: { id: "cards", name: "Cards", screens: ids } },
    nodes: Object.fromEntries(
      ids.map((id) => [
        id,
        {
          id,
          name: id,
          kind: "SCREEN",
          familyId: "cards",
          outgoing: [],
          incoming: [],
          journeys: [],
          actionReactions: [],
        },
      ]),
    ),
    transitions: [],
    reactions: {
      r1: {
        actions: [
          { type: "SET_VARIABLE", variableId: "appearance", value: "Aurora" },
        ],
      },
    },
    journeys: [
      {
        id: "J02",
        name: "Show and hide",
        date: "2026-10-09",
        result: "PASS",
        observations: [],
        steps: [{ screen: "573:2058" }],
      },
    ],
  };
  graph.nodes["854:3466"].actionReactions = [
    { control: "tile", name: "Aurora tile", visible: true, reactionRef: "r1" },
  ];
  const elements = new Map(),
    listeners = {};
  const get = (id) => {
    if (!elements.has(id))
      elements.set(id, {
        value: "",
        checked: false,
        innerHTML: "",
        textContent: "",
        add() {},
      });
    return elements.get(id);
  };
  get("graph").textContent = JSON.stringify(graph);
  const context = vm.createContext({
    document: {
      getElementById: get,
      addEventListener: (name, callback) => {
        listeners[name] = callback;
      },
    },
    location: { hash: "" },
    Option: function () {},
    navigator: { clipboard: { writeText: async () => {} } },
  });
  vm.runInContext(script, context);
  return { context, get, listeners };
}
test("action-only appearance controls are accessible without eagerly printing the program", () => {
  const { get, listeners } = start();
  assert.match(get("details").innerHTML, /Aurora tile/);
  assert.match(get("details").innerHTML, /data-reaction="r1"/);
  assert.doesNotMatch(get("details").innerHTML, /SET_VARIABLE/);
  const pre = { textContent: "" };
  listeners.toggle({
    target: {
      open: true,
      dataset: { reaction: "r1" },
      querySelector: () => pre,
    },
  });
  assert.match(pre.textContent, /SET_VARIABLE/);
  assert.match(pre.textContent, /appearance/);
});
test("Previous screen returns to the screen visited before choosing a journey", () => {
  const { get, context } = start();
  vm.runInContext("select('928:4751')", context);
  get("journey").value = "J02";
  get("journey").onchange();
  get("back").onclick();
  assert.equal(vm.runInContext("selected", context), "928:4751");
});
