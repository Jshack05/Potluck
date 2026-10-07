export type CreationDraft<F, R extends { id: string }> = {
  workflowId: string;
  fields: F;
  pending: Record<string, unknown> | null;
  result: R | null;
};
export async function submitCreation<F, R extends { id: string }>(
  state: CreationDraft<F, R>,
  body: Record<string, unknown>,
  send: (body: Record<string, unknown>, identity: string) => Promise<R>,
  save: (state: CreationDraft<F, R>) => Promise<void>,
): Promise<R> {
  if (state.result) return state.result;
  const prepared = { ...state, pending: state.pending ?? body };
  await save(prepared);
  let result: R;
  try {
    result = await send(prepared.pending, prepared.workflowId);
  } catch (error) {
    // These API responses definitively reject the command before commit. A
    // timeout, transport error, server failure or idempotency conflict can hide
    // a committed result and must keep the exact request available for retry.
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      [400, 401, 403, 404, 422].includes(Number(error.status))
    )
      await save({ ...prepared, pending: null });
    throw error;
  }
  await save({ ...prepared, result, pending: null });
  return result;
}
