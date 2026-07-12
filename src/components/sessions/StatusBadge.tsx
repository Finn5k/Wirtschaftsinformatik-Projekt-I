import type { SessionStatus } from "../../types/session";

// Statusdarstellung gemäß Spezifikation D2.3 / F3 AF-03.
const statusStyles: Record<SessionStatus, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-slate-100 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<SessionStatus, string> = {
  scheduled: "Geplant",
  active: "Läuft",
  completed: "Beendet",
  cancelled: "Abgesagt",
};

interface StatusBadgeProps {
  status: SessionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
