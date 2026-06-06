import { CheckCircle2, QrCode, Trophy } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { getSessionById, getSessions } from "../services/sessionService";

export function CheckInPage() {
  const { sessionId } = useParams();
  const session = getSessionById(sessionId) ?? getSessions()[0];

  const [isCheckedIn, setIsCheckedIn] = useState(false);

  if (isCheckedIn) {
    return (
      <div className="flex min-h-[780px] flex-col items-center justify-center bg-slate-950 px-4 text-white">
        <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-emerald-500 text-white shadow-lg shadow-emerald-900/30">
          <CheckCircle2 size={52} />
        </div>

        <h1 className="mt-6 text-center text-3xl font-extrabold">
          Check-in erfolgreich
        </h1>

        <p className="mt-3 max-w-xs text-center text-sm leading-6 text-slate-300">
          Deine Anwesenheit bei „{session.title}“ wurde bestätigt.
        </p>

        <div className="mt-8 w-full rounded-[2rem] bg-white p-5 text-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Trophy size={24} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                XP erhalten
              </p>
              <p className="text-2xl font-extrabold text-slate-950">
                +{session.xpReward} XP
              </p>
            </div>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 rounded-full bg-emerald-500" />
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-500">
            Dein Fortschritt wurde aktualisiert.
          </p>
        </div>

        <Link
          to="/profile"
          className="mt-6 w-full rounded-2xl bg-emerald-500 py-3 text-center font-extrabold text-white"
        >
          Profil ansehen
        </Link>

        <Link
          to={`/sessions/${session.id}`}
          className="mt-3 w-full rounded-2xl border border-white/20 py-3 text-center font-bold text-white"
        >
          Zurück zur Session
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[780px] flex-col items-center justify-center bg-slate-950 px-4 text-white">
      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
        Check-in aktiv
      </span>

      <h1 className="mt-4 text-center text-3xl font-extrabold">
        QR-Code scannen
      </h1>

      <p className="mt-2 max-w-xs text-center text-sm leading-6 text-slate-300">
        Scanne den QR-Code des Leaders, um deine Anwesenheit bei „
        {session.title}“ zu bestätigen und XP zu sammeln.
      </p>

      <div className="mt-8 flex h-60 w-60 items-center justify-center rounded-[2rem] bg-white text-slate-950">
        <QrCode size={120} />
      </div>

      <button
        type="button"
        onClick={() => setIsCheckedIn(true)}
        className="mt-8 w-full rounded-2xl bg-emerald-500 py-3 font-bold text-white"
      >
        Teilnahme bestätigen
      </button>

      <button
        type="button"
        className="mt-3 w-full rounded-2xl border border-white/20 py-3 font-bold text-white"
      >
        Code manuell eingeben
      </button>

      <Link
        to={`/sessions/${session.id}`}
        className="mt-6 text-sm font-bold text-slate-300"
      >
        Abbrechen
      </Link>
    </div>
  );
}