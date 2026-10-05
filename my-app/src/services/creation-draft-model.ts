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
  const result = await send(prepared.pending, prepared.workflowId);
  await save({ ...prepared, result, pending: null });
  return result;
}
