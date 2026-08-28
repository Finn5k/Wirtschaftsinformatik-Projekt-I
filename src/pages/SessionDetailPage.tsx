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
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { StatusBadge } from "../components/sessions/StatusBadge";
import { CheckInQrCode } from "../components/sessions/CheckInQrCode";
import { sportDisplayName } from "../data/sports";
import { getSessionById, joinSession } from "../services/sessionService";
import { useAuth } from "../auth/authContext";
import { isSessionFull } from "../types/session";
import { formatSessionDate, formatSessionTime } from "../utils/sessionTime";
import { ErrorState, LoadingState } from "../components/DataStates";
import { useLoadedData } from "../hooks/useLoadedData";
import { getSessionPin } from "../services/sessionService";

// Session-Detail gemäß B1 DLG-04 mit rollen- und statusabhängigen Zuständen:
// Offen / Beigetreten / Organisator / Read-only (UC-03, UC-04, UC-07).
// Anzeigetexte zu den Ergebniscodes aus F3 AF-01 (A08 8.5.6).
function joinRejectionText(code: string): string {
  switch (code) {
    case "SESSION_FULL":
      return "Diese Session ist bereits voll. Es gibt keine Warteliste.";
    case "ALREADY_JOINED":
      return "Du nimmst an dieser Session bereits teil.";
    case "SESSION_NOT_JOINABLE":
      return "Diese Session ist beendet; ein Beitritt ist nicht mehr möglich.";
    case "NOT_AUTHENTICATED":
      return "Bitte melde dich an, um beizutreten.";
    case "SESSION_NOT_FOUND":
      return "Diese Session existiert nicht mehr.";
    default:
      return "Der Beitritt war nicht erfolgreich.";
  }
}

export function SessionDetailPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  // DLG-04 ist ohne Anmeldung einsehbar (B1.2); geschützte Aktionen wie der
  // Beitritt leiten dann über B1.5.2 zu DLG-01.
  const { user } = useAuth();
  const { state, reload } = useLoadedData(
    () => getSessionById(sessionId),
    [sessionId],
  );
  const session = state.status === "ok" ? state.data : null;

  // Fachliche Ablehnung des Beitritts (F3 AF-01) bzw. technischer Fehler.
  const [joinMessage, setJoinMessage] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  // Die PIN ist nicht Teil von v_session; sie ist nur für Organisator und
  // bestätigte Teilnehmer sichtbar (N2.2) und wird gesondert geholt. Das
  // Ergebnis wird zusammen mit der Session-Kennung abgelegt, damit beim
  // Wechsel der Session nicht kurzzeitig die alte PIN erscheint.
  const geladeneSessionId = session?.id;
  const [pinEintrag, setPinEintrag] = useState<{
    sessionId: string;
    pin: string | null;
  } | null>(null);

  useEffect(() => {
    if (!geladeneSessionId) {
      return;
    }

    let aktiv = true;
    void getSessionPin(geladeneSessionId).then((wert) => {
      if (aktiv) {
        setPinEintrag({ sessionId: geladeneSessionId, pin: wert });
      }
    });

    return () => {
      aktiv = false;
    };
  }, [geladeneSessionId]);

  const pin =
    pinEintrag && pinEintrag.sessionId === geladeneSessionId
      ? pinEintrag.pin
      : null;

  async function join() {
    if (!session) {
      return;
    }

    setJoinMessage(null);
    setIsJoining(true);
    const result = await joinSession(session.id);
    setIsJoining(false);

    if (result.kind === "ok") {
      // Belegung und Teilnehmerliste kommen aus der Datenbank; neu laden statt
      // den Zustand im Dialog fortzuschreiben (A08 8.5.4).
      reload();
      return;
    }

    setJoinMessage(
      result.kind === "rejected"
        ? joinRejectionText(result.code)
        : "Der Beitritt ist gerade nicht möglich. Bitte versuche es erneut.",
    );
  }

  if (state.status === "loading") {
    return <LoadingState label="Session wird geladen …" />;
  }

  if (state.status === "failed") {
    return (
      <ErrorState
        onRetry={reload}
        label="Die Session konnte gerade nicht geladen werden."
      />
    );
  }

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

  const isOrganizer = session.organizerId === user?.id;
  const status = session.status;
  const isReadOnly = status === "completed";
  const isFull = isSessionFull(session);
  const currentParticipation = session.participants.find(
    (participant) => participant.id === user?.id,
  );
  const hasJoined = Boolean(currentParticipation);
  const canJoin = !isOrganizer && !hasJoined && !isReadOnly && !isFull;
  const canCheckIn =
    !isOrganizer &&
    currentParticipation?.status === "confirmed" &&
    status === "active";
  const checkedInCount = session.participants.filter(
    (participant) => participant.status === "checked_in",
  ).length;

  return (
    <div className="min-h-[780px] bg-white">
      <div className="relative h-64 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="absolute inset-x-0 top-0 p-4">
          <button
            type="button"
            aria-label="Zurück"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-slate-800 shadow-sm backdrop-blur"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute bottom-5 left-4 right-4">
          <div className="mb-3 flex items-center gap-2">
            <StatusBadge status={status} />
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              {sportDisplayName(session.sportKey)}
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

        {isOrganizer && isReadOnly && (
          <section className="grid grid-cols-2 gap-3">
            <ResultCard
              label="Bestätigte Teilnehmer"
              value={`${session.participantsCount}`}
            />
            <ResultCard
              label="Eingecheckt"
              value={`${checkedInCount}`}
            />
          </section>
        )}

        <section className="rounded-3xl bg-slate-50 p-4">
          <p className="text-sm leading-6 text-slate-700">
            {session.description}
          </p>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <InfoCard
            icon={<Calendar size={18} />}
            label="Datum"
            value={formatSessionDate(session.startAt)}
          />
          <InfoCard
            icon={<Clock size={18} />}
            label="Uhrzeit"
            value={formatSessionTime(session.startAt)}
          />
          <InfoCard
            icon={<Timer size={18} />}
            label="Dauer"
            value={`${session.durationMin} Min.`}
          />
        </section>

        {isOrganizer && !isReadOnly && (
          <section className="rounded-3xl bg-slate-950 p-4 text-white">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950">
                <CheckInQrCode sessionId={session.id} pin={pin ?? ""} size={68} />
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
                    {pin ?? "····"}
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
                  {participant.avatarUrl ? (
                    <img
                      src={participant.avatarUrl}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {participant.name.slice(0, 1)}
                    </div>
                  )}

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
                  to={`/check-in?session=${session.id}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 py-3 font-bold text-white"
                >
                  Zum Check-in
                </Link>
              </div>
            </div>
          </section>
        )}

        {!isOrganizer &&
          currentParticipation?.status === "checked_in" &&
          status === "active" && (
            <section className="flex items-center gap-3 rounded-3xl bg-emerald-50 p-4 text-emerald-700">
              <CheckCircle2 size={22} />
              <p className="font-bold">Du bist eingecheckt.</p>
            </section>
          )}

        <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-950">Sportort</h2>
              <p className="text-sm text-slate-500">
                {session.court.name}, {session.court.city}
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
              <div>
                <button
                  type="button"
                  disabled={isJoining}
                  onClick={() => void join()}
                  className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white disabled:opacity-60"
                >
                  {isJoining ? "Einen Moment …" : "Beitreten"}
                </button>

                {joinMessage && (
                  <p
                    role="alert"
                    className="mt-2 px-1 text-xs font-bold text-red-600"
                  >
                    {joinMessage}
                  </p>
                )}
              </div>
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

interface ResultCardProps {
  label: string;
  value: string;
}

function ResultCard({ label, value }: ResultCardProps) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-950">{value}</p>
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
