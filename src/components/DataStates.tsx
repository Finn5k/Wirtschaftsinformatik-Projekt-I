import { RefreshCw } from "lucide-react";

// Lade- und Fehleranzeige nach B1.5.4.
//
// Der Fehlertext bleibt allgemein verständlich und technikfrei: A08 8.5.6
// verbietet Rohantworten, Stacktraces sowie interne URL-, HTTP- oder
// DB-Details in Nutzermeldungen. Die Wiederholung erfolgt ausschließlich durch
// eine bewusste Nutzeraktion, nicht automatisch (S1.1).

export function LoadingState({ label = "Wird geladen …" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[40vh] items-center justify-center px-4"
    >
      <p className="text-sm font-bold text-slate-500">{label}</p>
    </div>
  );
}

export function ErrorState({
  onRetry,
  label = "Die Daten konnten gerade nicht geladen werden.",
}: {
  onRetry: () => void;
  label?: string;
}) {
  return (
    <section
      role="alert"
      className="m-4 rounded-2xl border border-red-100 bg-red-50 p-4"
    >
      <p className="text-xs font-bold leading-5 text-red-700">{label}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-3 flex items-center gap-2 text-xs font-extrabold text-red-700"
      >
        <RefreshCw size={14} />
        Erneut versuchen
      </button>
    </section>
  );
}
