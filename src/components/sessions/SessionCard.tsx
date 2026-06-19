import { Clock, MapPin, Trophy, Users } from "lucide-react";
import { Link } from "react-router";
import type { SportSession } from "../../types/session";
import { StatusBadge } from "./StatusBadge";

interface SessionCardProps {
  session: SportSession;
}

export function SessionCard({ session }: SessionCardProps) {
  const participantProgress = Math.round(
    (session.participantsCount / session.maxParticipants) * 100,
  );

  const isFull = session.status === "FULL";
  const actionLabel = isFull ? "Warteliste" : "Details";

  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
      <div className="flex gap-3 p-3">
        <img
          src={session.imageUrl}
          alt={session.title}
          className="h-28 w-28 rounded-3xl object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={session.status} />
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
              {session.sportType}
            </span>
          </div>

          <h3 className="truncate text-base font-extrabold text-slate-950">
            {session.title}
          </h3>

          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={13} />
            <span className="truncate">
              {session.locationName}, {session.city}
            </span>
          </p>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1 text-slate-500">
              <Clock size={13} />
              <span>
                {session.dateLabel} · {session.timeLabel}
              </span>
            </div>

            <div className="flex items-center justify-end gap-1 font-semibold text-slate-700">
              <Trophy size={13} className="text-emerald-600" />
              <span>+{session.xpReward} XP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-3 py-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <Users size={14} />
            <span>Teilnehmer</span>
          </div>

          <span className="font-extrabold text-slate-950">
            {session.participantsCount}/{session.maxParticipants}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={[
              "h-full rounded-full",
              isFull ? "bg-amber-500" : "bg-blue-600",
            ].join(" ")}
            style={{ width: `${participantProgress}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">Empfohlen</p>
            <p className="text-sm font-extrabold text-slate-950">
              {session.recommendedRank}+
            </p>
          </div>

          <Link
            to={`/sessions/${session.id}`}
            className={[
              "rounded-2xl px-4 py-2 text-sm font-extrabold text-white",
              isFull ? "bg-amber-500" : "bg-blue-600",
            ].join(" ")}
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}