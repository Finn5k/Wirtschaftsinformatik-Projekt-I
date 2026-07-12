import { CheckCircle2, Clock, KeyRound, QrCode, XCircle } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { getSessionById } from "../services/sessionService";

// Check-in gemäß B1 DLG-06 (UC-08 QR / UC-09 PIN, Regeln in F3 AF-02).
// Zustände: Scan → PIN-Eingabe → Erfolg / Abgelehnt; Zeitfenster nur bei "active".
type CheckInView = "scan" | "pin" | "success";

export function CheckInPage() {
  const { sessionId } = useParams();
  const session = getSessionById(sessionId);

  const [view, setView] = useState<CheckInView>("scan");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  if (!session) {
    return (
      <BlockedScreen
        title="Session nicht gefunden"
        message="Diese Session existiert nicht oder ist nicht mehr verfügbar."
        linkTo="/discover"
        linkLabel="Zurück zum Entdecken"
      />
    );
  }

  // Zeitfenster gemäß AF-02 Regel 4: Check-in nur, solange die Session "active" ist.
  if (session.status !== "active") {
    return (
      <BlockedScreen
        title="Check-in nicht möglich"
        message={
          session.status === "scheduled"
            ? `Der Check-in für „${session.title}" öffnet erst zum Session-Start.`
            : `„${session.title}" ist bereits beendet — der Check-in ist geschlossen.`
        }
        linkTo={`/sessions/${session.id}`}
        linkLabel="Zurück zur Session"
      />
    );
  }

  function submitPin() {
    if (!/^\d{4}$/.test(pinInput)) {
      setPinError("Bitte gib genau 4 Ziffern ein.");
      return;
    }

    // Merkmalsprüfung gemäß AF-02 Regel 3 (Ergebniscode INVALID_CREDENTIAL).
    if (pinInput !== session!.pin) {
      setPinError("Ungültiger Code für diese Session.");
      return;
    }

    setPinError(null);
    setView("success");
  }

  if (view === "success") {
    return (
      <div className="flex min-h-[780px] flex-col items-center justify-center bg-slate-950 px-4 text-white">
        <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-emerald-500 text-white shadow-lg shadow-emerald-900/30">
          <CheckCircle2 size={52} />
        </div>

        <h1 className="mt-6 text-center text-3xl font-extrabold">
          Check-in erfolgreich
        </h1>

        <p className="mt-3 max-w-xs text-center text-sm leading-6 text-slate-300">
          Deine Anwesenheit bei „{session.title}“ wurde bestätigt. Viel Spaß
          bei der Session!
        </p>

        <Link
          to={`/sessions/${session.id}`}
          className="mt-8 w-full rounded-2xl bg-emerald-500 py-3 text-center font-extrabold text-white"
        >
          Zurück zur Session
        </Link>

        <Link
          to="/my-sessions"
          className="mt-3 w-full rounded-2xl border border-white/20 py-3 text-center font-bold text-white"
        >
          Meine Sessions
        </Link>
      </div>
    );
  }

  if (view === "pin") {
    return (
      <div className="flex min-h-[780px] flex-col items-center justify-center bg-slate-950 px-4 text-white">
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
          Check-in aktiv
        </span>

        <h1 className="mt-4 text-center text-3xl font-extrabold">
          PIN eingeben
        </h1>

        <p className="mt-2 max-w-xs text-center text-sm leading-6 text-slate-300">
          Gib die 4-stellige PIN ein, die dir der Organisator von „
          {session.title}“ nennt.
        </p>

        <div className="mt-8 w-full rounded-[2rem] bg-white p-5 text-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <KeyRound size={24} />
            </div>

            <input
              value={pinInput}
              onChange={(event) => {
                setPinInput(event.target.value.replace(/\D/g, "").slice(0, 4));
                setPinError(null);
              }}
              inputMode="numeric"
              placeholder="0000"
              className="min-w-0 flex-1 bg-transparent text-3xl font-extrabold tracking-[0.4em] outline-none placeholder:text-slate-300"
            />
          </div>

          {pinError && (
            <p className="mt-4 flex items-center gap-2 text-sm font-bold text-red-600">
              <XCircle size={16} />
              {pinError}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={submitPin}
          className="mt-6 w-full rounded-2xl bg-emerald-500 py-3 font-bold text-white"
        >
          Teilnahme bestätigen
        </button>

        <button
          type="button"
          onClick={() => {
            setView("scan");
            setPinInput("");
            setPinError(null);
          }}
          className="mt-3 w-full rounded-2xl border border-white/20 py-3 font-bold text-white"
        >
          Zurück zum QR-Code
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

  return (
    <div className="flex min-h-[780px] flex-col items-center justify-center bg-slate-950 px-4 text-white">
      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
        Check-in aktiv
      </span>

      <h1 className="mt-4 text-center text-3xl font-extrabold">
        QR-Code scannen
      </h1>

      <p className="mt-2 max-w-xs text-center text-sm leading-6 text-slate-300">
        Scanne den QR-Code des Organisators, um deine Anwesenheit bei „
        {session.title}“ zu bestätigen.
      </p>

      <div className="mt-8 flex h-60 w-60 items-center justify-center rounded-[2rem] bg-white text-slate-950">
        <QrCode size={120} />
      </div>

      <button
        type="button"
        onClick={() => setView("success")}
        className="mt-8 w-full rounded-2xl bg-emerald-500 py-3 font-bold text-white"
      >
        Teilnahme bestätigen
      </button>

      <button
        type="button"
        onClick={() => setView("pin")}
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

interface BlockedScreenProps {
  title: string;
  message: string;
  linkTo: string;
  linkLabel: string;
}

function BlockedScreen({ title, message, linkTo, linkLabel }: BlockedScreenProps) {
  return (
    <div className="flex min-h-[780px] flex-col items-center justify-center bg-slate-950 px-4 text-white">
      <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/10 text-slate-300">
        <Clock size={40} />
      </div>

      <h1 className="mt-6 text-center text-3xl font-extrabold">{title}</h1>

      <p className="mt-3 max-w-xs text-center text-sm leading-6 text-slate-300">
        {message}
      </p>

      <Link
        to={linkTo}
        className="mt-8 w-full rounded-2xl bg-white py-3 text-center font-extrabold text-slate-950"
      >
        {linkLabel}
      </Link>
    </div>
  );
}
