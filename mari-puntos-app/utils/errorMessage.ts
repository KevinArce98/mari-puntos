export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>;
    if (typeof e['error'] === 'string' && e['error'].length > 0) return e['error'];
    if (typeof e['message'] === 'string' && e['message'].length > 0) return e['message'];
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}
