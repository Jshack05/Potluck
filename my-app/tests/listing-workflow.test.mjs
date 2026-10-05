import test from "node:test";
import assert from "node:assert/strict";
import { runListingWorkflow } from "../src/services/listing-workflow.ts";
function fixture() {
  let disk = {
    workflowId: "local-workflow",
    listing: null,
    savedBody: null,
    phase: "editing",
    pending: null,
  };
  const resources = new Map(),
    responses = new Map();
  let losePublish = false,
    failCheckpoint = false;
  const command = async (path, body, workflowId) => {
    const key = JSON.stringify([workflowId, path, body]);
    if (responses.has(key)) return structuredClone(responses.get(key));
    let result;
    if (path === "/listings") {
      result = { id: "listing-" + (resources.size + 1), version: 1, ...body };
      resources.set(result.id, result);
    } else {
      const id = path.split("/")[2],
        current = resources.get(id);
      assert.equal(current.version, body.expectedVersion);
      result = { ...current, ...body, version: current.version + 1 };
      resources.set(id, result);
    }
    responses.set(key, result);
    if (path.endsWith("/publish") && losePublish) {
      losePublish = false;
      throw Error("response lost");
    }
    return structuredClone(result);
  };
  const save = async (state) => {
    if (failCheckpoint && state.phase === "saved") {
      failCheckpoint = false;
      throw Error("storage interrupted");
    }
    disk = structuredClone(state);
  };
  return {
    resources,
    command,
    save,
    read: () => structuredClone(disk),
    losePublish: () => {
      losePublish = true;
    },
    failCheckpoint: () => {
      failCheckpoint = true;
    },
  };
}
test("listing publication resumes the acknowledged listing after a lost publish response", async () => {
  const f = fixture(),
    body = { title: "Our household" };
  f.losePublish();
  await assert.rejects(
    runListingWorkflow(f.read(), body, true, f.command, f.save),
  );
  assert.equal(f.read().listing.id, "listing-1");
  const done = await runListingWorkflow(
    f.read(),
    body,
    true,
    f.command,
    f.save,
  );
  assert.equal(done.id, "listing-1");
  assert.equal(f.resources.size, 1);
  assert.equal(done.version, 2);
});
test("after an acknowledged create cannot be checkpointed, recovery resolves it before applying new edits", async () => {
  const f = fixture();
  f.failCheckpoint();
  await assert.rejects(
    runListingWorkflow(
      f.read(),
      { title: "Original" },
      true,
      f.command,
      f.save,
    ),
  );
  assert.equal(f.read().pending.path, "/listings");
  const done = await runListingWorkflow(
    f.read(),
    { title: "Updated" },
    true,
    f.command,
    f.save,
  );
  assert.equal(f.resources.size, 1);
  assert.equal(done.title, "Updated");
  assert.equal(done.version, 3);
});
test("a listing workflow must be durably recorded before any dispatch", async () => {
  const f = fixture();
  await assert.rejects(
    runListingWorkflow(
      f.read(),
      { title: "Example" },
      true,
      f.command,
      async () => {
        throw Error("storage unavailable");
      },
    ),
  );
  assert.equal(f.resources.size, 0);
});
