import test from "node:test";
import assert from "node:assert/strict";
import {
  withSessionRecovery,
  revokeSession,
} from "../src/services/session-recovery.ts";

test("expired authenticated requests clear identity before returning the error; outages do not", async () => {
  for (const status of [401, 403, 503, 0]) {
    let identity = "signed-in";
    const failure = Object.assign(new Error("request failed"), { status });
    await assert.rejects(
      withSessionRecovery(
        async () => {
          throw failure;
        },
        async () => {
          identity = "signed-out";
        },
      ),
      (error) => error === failure,
    );
    assert.equal(identity, status === 401 ? "signed-out" : "signed-in");
  }
});

test("sign-out accepts an already expired session but never hides a revocation failure", async () => {
  for (const status of [200, 401, 501, 0]) {
    let cleared = false;
    const operation = revokeSession(
      async () => {
        if (status !== 200)
          throw Object.assign(new Error("revoke failed"), { status });
      },
      async () => {
        cleared = true;
      },
    );
    if (status === 200 || status === 401) await operation;
    else await assert.rejects(operation, /revoke failed/);
    assert.equal(cleared, status === 200 || status === 401);
  }
});
