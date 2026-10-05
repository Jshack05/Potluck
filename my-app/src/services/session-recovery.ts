function invalidSession(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 401
  );
}

/** Only a confirmed authentication failure invalidates an authenticated session. */
export async function withSessionRecovery<T>(
  operation: () => Promise<T>,
  clear: () => Promise<void>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (invalidSession(error)) await clear();
    throw error;
  }
}

/** A rejected/expired token is already unusable. Other revocation failures stay visible. */
export async function revokeSession(
  revoke: () => Promise<unknown>,
  clear: () => Promise<void>,
): Promise<void> {
  try {
    await revoke();
  } catch (error) {
    if (!invalidSession(error)) throw error;
  }
  await clear();
}
