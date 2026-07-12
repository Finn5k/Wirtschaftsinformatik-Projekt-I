import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  KeyRound,
  MapPin,
  QrCode,
  SearchX,
  Timer,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { StatusBadge } from "../components/sessions/StatusBadge";
import { getSessionById } from "../services/sessionService";
import { getCurrentUser } from "../services/userService";
import { isSessionFull } from "../types/session";

// Session-Detail gemäß B1 DLG-04 mit rollen- und statusabhängigen Zuständen:
// Offen / Beigetreten / Organisator / Read-only (UC-03, UC-04, UC-07).
export function SessionDetailPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const session = getSessionById(sessionId);
  const currentUser = getCurrentUser();

  const initiallyJoined = session
    ? session.participants.some((p) => p.id === currentUser.id)
    : false;

  // Lokaler Demo-Zustand: simuliert den Beitritt (im finalen System AF-01 über die API).
  const [hasJoined, setHasJoined] = useState(initiallyJoined);

  if (!session) {
    return (
      <div className="flex min-h-[780px] flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
          <SearchX size={30} />
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-slate-950">
          Session nicht gefunden
        </h1>

        <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
          Diese Session existiert nicht oder ist nicht mehr verfügbar.
        </p>

        <Link
          to="/discover"
          className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white"
        >
          Zurück zum Entdecken
        </Link>
      </div>
    );
  }

  const isOrganizer = session.organizerId === currentUser.id;
  const isReadOnly =
    session.status === "completed" || session.status === "cancelled";
  const isFull = isSessionFull(session);
  const canJoin = !isOrganizer && !hasJoined && !isReadOnly && !isFull;
  const canCheckIn = !isOrganizer && hasJoined && session.status === "active";

  return (
    <div className="min-h-[780px] bg-white">
      <div className="relative">
        <img
          src={session.imageUrl}
          alt={session.title}
          className="h-64 w-full object-cover"
        />

        <div className="absolute inset-x-0 top-0 p-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-slate-800 shadow-sm backdrop-blur"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute bottom-5 left-4 right-4">
          <div className="mb-3 flex items-center gap-2">
            <StatusBadge status={session.status} />
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              {session.sportType}
            </span>
            {isFull && !isReadOnly && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Voll
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold text-white">
            {session.title}
          </h1>
          <p className="mt-1 text-sm font-medium text-white/80">
            organisiert von {isOrganizer ? "dir" : session.organizerName}
          </p>
        </div>
      </div>

      <div className="space-y-5 px-4 py-5">
        {isReadOnly && (
          <section className="rounded-3xl bg-slate-100 p-4">
            <p className="text-sm font-bold text-slate-700">
              Diese Session ist abgeschlossen.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Beitritt und Check-in sind nicht mehr möglich (nur Ansicht).
            </p>
          </section>
        )}

        <section className="rounded-3xl bg-slate-50 p-4">
          <p className="text-sm leading-6 text-slate-700">
            {session.description}
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <InfoCard
            icon={<Calendar size={18} />}
            label="Datum"
            value={session.dateLabel}
          />
          <InfoCard
            icon={<Clock size={18} />}
            label="Uhrzeit"
            value={session.timeLabel}
          />
          <InfoCard
            icon={<Timer size={18} />}
            label="Dauer"
            value={`${session.durationMin} Min.`}
          />
          <InfoCard
            icon={<MapPin size={18} />}
            label="Treffpunkt"
            value={session.meetingPoint}
          />
        </section>

        {isOrganizer && !isReadOnly && (
          <section className="rounded-3xl bg-slate-950 p-4 text-white">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950">
                <QrCode size={48} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-extrabold">Check-in-Code</h2>
                <p className="mt-1 text-xs leading-5 text-slate-300">
                  Zeige den QR-Code am Treffpunkt oder nenne die PIN, damit
                  Teilnehmer einchecken können.
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <KeyRound size={16} className="text-emerald-300" />
                  <span className="text-2xl font-extrabold tracking-[0.3em]">
                    {session.pin}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-950">Teilnehmer</h2>
              <p className="text-sm text-slate-500">
                {session.participantsCount} von {session.maxParticipants}{" "}
                Plätzen belegt
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Users size={20} />
            </div>
          </div>

          <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{
                width: `${Math.round(
                  (session.participantsCount / session.maxParticipants) * 100,
                )}%`,
              }}
            />
          </div>

          <div className="space-y-3">
            {session.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {participant.name.slice(0, 1)}
                  </div>

                  <p className="font-semibold text-slate-800">
                    {participant.name}
                  </p>
                </div>

                {/* Check-in-Status nur für Organisator:innen sichtbar (B1 DLG-04, UC-07) */}
                {isOrganizer ? (
                  participant.status === "checked_in" ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 size={13} />
                      Eingecheckt
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                      Beigetreten
                    </span>
                  )
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {canCheckIn && (
          <section className="rounded-3xl bg-slate-950 p-4 text-white">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
                <QrCode size={24} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-extrabold">Check-in vor Ort</h2>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Scanne den QR-Code beim Organisator oder gib die PIN ein, um
                  deine Anwesenheit zu bestätigen.
                </p>

                <Link
                  to={`/check-in/${session.id}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 py-3 font-bold text-white"
                >
                  Zum Check-in
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-950">Sportort</h2>
              <p className="text-sm text-slate-500">
                {session.locationName}, {session.city}
              </p>
            </div>

            <MapPin className="text-blue-600" size={22} />
          </div>

          <div className="relative h-44 overflow-hidden rounded-3xl bg-slate-100">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#bfdbfe_1px,transparent_1px)] [background-size:22px_22px]" />
            <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200">
              <MapPin size={22} />
            </div>
          </div>
        </section>

        {!isReadOnly && !isOrganizer && (
          <div className="sticky bottom-24 z-10 rounded-3xl bg-white/90 p-2 shadow-xl backdrop-blur">
            {canJoin ? (
              <button
                type="button"
                onClick={() => setHasJoined(true)}
                className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white"
              >
                Beitreten
              </button>
            ) : hasJoined ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-3 font-bold text-emerald-700">
                <CheckCircle2 size={18} />
                Du bist dabei
              </div>
            ) : (
              // Volle Session: harte Kapazitätsgrenze, keine Warteliste (P1 NG-10, F3 AF-01)
              <div className="rounded-2xl bg-amber-50 py-3 text-center font-bold text-amber-700">
                Session ist voll
              </div>
            )}
          </div>
        )}
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
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        {icon}
      </div>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-slate-950">{value}</p>
    </div>
  );
}
