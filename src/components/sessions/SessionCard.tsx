import { MapPin } from "lucide-react";
import { Link } from "react-router";
import type { SportSession } from "../../types/session";
import { StatusBadge } from "./StatusBadge";

interface SessionCardProps {
  session: SportSession;
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <article className="flex gap-3 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
      <img
        src={session.imageUrl}
        alt={session.title}
        className="h-24 w-24 rounded-2xl object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <StatusBadge status={session.status} />
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
            {session.sportType}
          </span>
        </div>

        <h3 className="truncate text-base font-bold text-slate-950">
          {session.title}
        </h3>

        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={13} />
          {session.locationName}, {session.city}
        </p>

        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {session.dateLabel} · {session.timeLabel}
          </span>
          <span className="font-semibold text-slate-700">
            {session.participantsCount}/{session.maxParticipants}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-600">
            {session.recommendedRank}+
          </span>
          <Link
            to={`/sessions/${session.id}`}
            className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}