import test from "node:test";
import assert from "node:assert/strict";
import { submitCreation } from "../src/services/creation-draft-model.ts";

test("a definitive validation rejection unlocks the draft while preserving its fields", async () => {
  let state = {
    workflowId: "rejected-workflow",
    fields: { name: "Fix me" },
    pending: null,
    result: null,
  };
  await assert.rejects(
    submitCreation(
      state,
      { name: "Fix me" },
      async () => {
        throw Object.assign(new Error("Invalid recipient"), {
          status: 404,
          code: "NOT_FOUND",
        });
      },
      async (value) => {
        state = value;
      },
    ),
  );
  assert.equal(state.pending, null);
  assert.equal(state.fields.name, "Fix me");
  const saved = await submitCreation(
    state,
    { name: "Corrected" },
    async (body) => ({ id: "created", ...body }),
    async (value) => {
      state = value;
    },
  );
  assert.equal(saved.name, "Corrected");
});

test("timeouts, server failures and idempotency conflicts keep the original pending request", async () => {
  for (const failure of [
    { status: 0, code: "CONNECTION_FAILED" },
    { status: 408, code: "REQUEST_TIMEOUT" },
    { status: 500, code: "INTERNAL_ERROR" },
    { status: 409, code: "IDEMPOTENCY_CONFLICT" },
  ]) {
    let state = {
      workflowId: "uncertain",
      fields: { name: "Original" },
      pending: null,
      result: null,
    };
    await assert.rejects(
      submitCreation(
        state,
        { name: "Original" },
        async () => {
          throw Object.assign(new Error("Unknown outcome"), failure);
        },
        async (value) => {
          state = value;
        },
      ),
    );
    assert.deepEqual(state.pending, { name: "Original" });
  }
});
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
