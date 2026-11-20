/** Extracts a displayable message from an unknown thrown value. */
export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return fallback;
}

/** `fetchAPI` throws this exact message for 401/403/404 responses. */
export function isUnauthorized(err: unknown): boolean {
  return err instanceof Error && err.message === "Unauthorized";
}
