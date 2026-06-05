import { Calendar, Clock, MapPin, Trophy } from "lucide-react";
import { Link, useParams } from "react-router";
import { mockSessions } from "../data/mockSessions";

export function SessionDetailPage() {
  const { sessionId } = useParams();
  const session =
    mockSessions.find((item) => item.id === sessionId) ?? mockSessions[0];

  return (
    <div>
      <div className="relative">
        <img
          src={session.imageUrl}
          alt={session.title}
          className="h-56 w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="-mt-8 relative rounded-t-[2rem] bg-white px-4 py-6">
        <div className="mb-3 flex gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
            {session.sportType}
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-950">
          {session.title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {session.description}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <InfoCard icon={<Calendar size={18} />} label="Datum" value={session.dateLabel} />
          <InfoCard icon={<Clock size={18} />} label="Uhrzeit" value={session.timeLabel} />
          <InfoCard icon={<MapPin size={18} />} label="Ort" value={session.locationName} />
          <InfoCard icon={<Trophy size={18} />} label="XP" value={`+${session.xpReward}`} />
        </div>

        <div className="mt-5 rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-950">Teilnehmer</p>
          <p className="mt-1 text-sm text-slate-500">
            {session.participantsCount} von {session.maxParticipants} Plätzen belegt
          </p>

          <div className="mt-3 flex -space-x-2">
            {session.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-xs font-bold text-blue-700"
              >
                {participant.name.slice(0, 1)}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button className="flex-1 rounded-2xl bg-blue-600 py-3 font-bold text-white">
            Beitreten
          </button>

          <Link
            to={`/check-in/${session.id}`}
            className="flex-1 rounded-2xl border border-slate-200 py-3 text-center font-bold text-blue-600"
          >
            Check-in
          </Link>
        </div>
      </div>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="mb-2 text-blue-600">{icon}</div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-bold text-slate-950">{value}</p>
    </div>
  );
}