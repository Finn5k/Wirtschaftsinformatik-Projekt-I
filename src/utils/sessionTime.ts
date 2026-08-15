import type { SportSession, SessionStatus } from "../types/session";

type SessionTiming = Pick<SportSession, "startAt" | "durationMin">;

const dayFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
});

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
});

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function getSessionStatus(
  session: SessionTiming,
  now = new Date(),
): SessionStatus {
  const start = Date.parse(session.startAt);
  const end = start + session.durationMin * 60 * 1000;
  const current = now.getTime();

  if (current < start) {
    return "scheduled";
  }

  if (current < end) {
    return "active";
  }

  return "completed";
}

export function formatSessionDate(
  startAt: string,
  now = new Date(),
): string {
  const start = new Date(startAt);
  const dayDifference = Math.round(
    (startOfLocalDay(start) - startOfLocalDay(now)) / (24 * 60 * 60 * 1000),
  );

  if (dayDifference === 0) {
    return "Heute";
  }

  if (dayDifference === 1) {
    return "Morgen";
  }

  if (dayDifference === -1) {
    return "Gestern";
  }

  if (Math.abs(dayDifference) <= 6) {
    return dayFormatter.format(start);
  }

  return dateFormatter.format(start);
}

export function formatSessionTime(startAt: string): string {
  return timeFormatter.format(new Date(startAt));
}
