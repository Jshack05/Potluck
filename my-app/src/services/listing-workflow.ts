type ListingRecord = { id: string; version: number };
type Pending = {
  path: string;
  body: Record<string, unknown>;
  savedBody: string;
  phase: "saved" | "published";
};
export type ListingWorkflow<T extends ListingRecord> = {
  workflowId: string;
  listing: T | null;
  savedBody: string | null;
  phase: "editing" | "saved" | "published";
  pending: Pending | null;
};
/** Persist intent before dispatch, then checkpoint each acknowledgment. Resolve
 * uncertain commands before a changed draft can create another resource. */
export async function runListingWorkflow<T extends ListingRecord>(
  initial: ListingWorkflow<T>,
  body: Record<string, unknown>,
  publish: boolean,
  command: (
    path: string,
    body: Record<string, unknown>,
    workflowId: string,
  ) => Promise<T>,
  save: (state: ListingWorkflow<T>) => Promise<void>,
): Promise<T> {
  let state = initial;
  async function checkpoint(next: ListingWorkflow<T>) {
    await save(next);
    state = next;
  }
  async function resolvePending() {
    const pending = state.pending!;
    const listing = await command(pending.path, pending.body, state.workflowId);
    await checkpoint({
      ...state,
      listing,
      savedBody: pending.savedBody,
      phase: pending.phase,
      pending: null,
    });
  }
  if (state.pending) await resolvePending();
  const fingerprint = JSON.stringify(body);
  if (!state.listing || state.savedBody !== fingerprint) {
    await checkpoint({
      ...state,
      pending: {
        path: state.listing
          ? "/listings/" + state.listing.id + "/edit"
          : "/listings",
        body: state.listing
          ? { ...body, expectedVersion: state.listing.version }
          : body,
        savedBody: fingerprint,
        phase: "saved",
      },
    });
    await resolvePending();
  }
  if (publish && state.phase !== "published") {
    await checkpoint({
      ...state,
      pending: {
        path: "/listings/" + state.listing!.id + "/publish",
        body: { expectedVersion: state.listing!.version },
        savedBody: fingerprint,
        phase: "published",
      },
    });
    await resolvePending();
  }
  return state.listing!;
}
