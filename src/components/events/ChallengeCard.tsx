import { CalendarDays, Flame, Trophy, Users } from "lucide-react";
import type { Challenge } from "../../data/mockChallenges";

interface ChallengeCardProps {
  challenge: Challenge;
}

const typeLabels: Record<Challenge["type"], string> = {
  weekly: "Wochenchallenge",
  event: "Offizielles Event",
  community: "Community",
};

const statusLabels: Record<Challenge["status"], string> = {
  ACTIVE: "Aktiv",
  UPCOMING: "Demnächst",
  COMPLETED: "Abgeschlossen",
};

const statusStyles: Record<Challenge["status"], string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  UPCOMING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-slate-100 text-slate-700",
};

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const progressPercent = Math.min(
    100,
    Math.round((challenge.progress / challenge.goal) * 100),
  );

  const Icon =
    challenge.type === "weekly"
      ? Flame
      : challenge.type === "event"
        ? CalendarDays
        : Users;

  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Icon size={22} />
          </div>

          <div>
            <p className="text-xs font-bold text-blue-600">
              {typeLabels[challenge.type]}
            </p>
            <h3 className="mt-1 text-lg font-extrabold text-slate-950">
              {challenge.title}
            </h3>
          </div>
        </div>

        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[challenge.status]}`}
        >
          {statusLabels[challenge.status]}
        </span>
      </div>

      <p className="text-sm leading-6 text-slate-600">{challenge.description}</p>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-600">Fortschritt</span>
          <span className="font-extrabold text-slate-950">
            {challenge.progress} / {challenge.goal}
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3">
        <div className="flex items-center gap-2 text-slate-700">
          <Trophy size={17} className="text-emerald-600" />
          <span className="text-sm font-bold">Belohnung</span>
        </div>

        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
          +{challenge.xpReward} XP
        </span>
      </div>
    </article>
  );
}