import test from "node:test";
import assert from "node:assert/strict";
import { submitCreation } from "../src/services/creation-draft-model.ts";
test("resuming a create uses the saved request even if fields changed after the response was lost", async () => {
  let state = {
      workflowId: "workflow",
      fields: { name: "Circle" },
      pending: null,
      result: null,
    },
    count = 0;
  const replies = new Map(),
    save = async (value) => {
      state = structuredClone(value);
    };
  const send = async (body, key) => {
    const identity = JSON.stringify([key, body]);
    if (replies.has(identity)) return replies.get(identity);
    const result = { id: "circle-" + ++count, name: body.name };
    replies.set(identity, result);
    throw Error("response lost");
  };
  await assert.rejects(submitCreation(state, { name: "Original" }, send, save));
  const result = await submitCreation(
    state,
    { name: "New draft text" },
    send,
    save,
  );
  assert.equal(result.name, "Original");
  assert.equal(count, 1);
  assert.deepEqual(
    await submitCreation(state, { name: "Another" }, send, save),
    result,
  );
});
