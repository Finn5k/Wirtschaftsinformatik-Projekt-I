import type { SessionStatus } from "../../types/session";

interface StatusBadgeProps {
  status: SessionStatus;
}

const statusStyles: Record<SessionStatus, string> = {
  OPEN: "bg-emerald-100 text-emerald-700",
  FULL: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-slate-100 text-slate-700",
};

const statusLabels: Record<SessionStatus, string> = {
  OPEN: "Offen",
  FULL: "Voll",
  CANCELLED: "Abgesagt",
  COMPLETED: "Beendet",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}