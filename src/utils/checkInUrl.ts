export function buildCheckInUrl(sessionId: string, pin: string): string {
  const url = new URL("/check-in", window.location.origin);
  url.searchParams.set("session", sessionId);
  url.searchParams.set("pin", pin);
  return url.toString();
}
