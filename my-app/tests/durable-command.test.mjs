import test from "node:test";
import assert from "node:assert/strict";
import { durableCommand } from "../src/services/durable-command.ts";
test("uncertain commands retain a stable key across remount; acknowledged commands release it", async () => {
  const data = new Map();
  let seq = 0;
  const keys = [];
  const store = {
    get: async (k) => data.get(k) ?? null,
    set: async (k, v) => {
      data.set(k, v);
    },
    remove: async (k) => {
      data.delete(k);
    },
  };
  const deps = { store, createKey: () => String(++seq) };
  await assert.rejects(
    durableCommand("actor/body-hash", deps, async (key) => {
      keys.push(key);
      throw new Error("response lost");
    }),
  );
  const result = await durableCommand("actor/body-hash", deps, async (key) => {
    keys.push(key);
    return "confirmed";
  });
  assert.equal(result, "confirmed");
  assert.equal(keys[0], keys[1]);
  await durableCommand("actor/body-hash", deps, async (key) => {
    keys.push(key);
  });
  assert.notEqual(keys[1], keys[2]);
});
test("failure to persist the operation key prevents dispatch", async () => {
  let dispatched = false;
  await assert.rejects(
    durableCommand(
      "hash",
      {
        store: {
          get: async () => null,
          set: async () => {
            throw new Error("storage unavailable");
          },
          remove: async () => {},
        },
        createKey: () => "id",
      },
      async () => {
        dispatched = true;
      },
    ),
  );
  assert.equal(dispatched, false);
});
