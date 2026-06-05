import { QrCode } from "lucide-react";

export function CheckInPage() {
  return (
    <div className="flex min-h-[780px] flex-col items-center justify-center bg-slate-950 px-4 text-white">
      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
        Check-in aktiv
      </span>

      <h1 className="mt-4 text-3xl font-extrabold">QR-Code scannen</h1>
      <p className="mt-2 max-w-xs text-center text-sm leading-6 text-slate-300">
        Scanne den QR-Code des Leaders, um deine Anwesenheit zu bestätigen und
        XP zu sammeln.
      </p>

      <div className="mt-8 flex h-60 w-60 items-center justify-center rounded-[2rem] bg-white text-slate-950">
        <QrCode size={120} />
      </div>

      <button className="mt-8 w-full rounded-2xl bg-emerald-500 py-3 font-bold text-white">
        Teilnahme bestätigen
      </button>

      <button className="mt-3 w-full rounded-2xl border border-white/20 py-3 font-bold text-white">
        Code manuell eingeben
      </button>
    </div>
  );
}