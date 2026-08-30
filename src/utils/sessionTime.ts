// Darstellung von Zeitpunkten in den Dialogen (B1).
//
// Den Sessionstatus leitet dieses Modul bewusst nicht mehr ab: AF-03 wird von
// `session_status()` in der Datenbank berechnet und über `v_session`
// geliefert. Eine zweite Berechnung im Client könnte anzeigen, was `check_in`
// ablehnt, weil beide gegen unterschiedliche Uhren prüfen würden.

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
