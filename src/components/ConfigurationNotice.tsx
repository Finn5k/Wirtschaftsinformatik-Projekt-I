// Angezeigt, wenn die Zugangsdaten für NB-02/NB-03 fehlen (A07).
//
// Ohne NB-03 ist LocalCourt fachlich nicht nutzbar (S1.4, Abgrenzung) — die
// Anwendung startet deshalb nicht. Sie tut das aber sichtbar und mit einer
// Handlungsanweisung, statt als leere Seite: A08 8.5.6 verlangt für technische
// Fehler eine verständliche Meldung ohne Rohantworten oder Stacktraces.
//
// Diese Meldung richtet sich ausdrücklich an das Entwicklungsteam, nicht an
// Endnutzer: Sie erscheint nur bei einem Deployment- oder Einrichtungsfehler,
// nie im regulären Betrieb.
export function ConfigurationNotice({
  missing,
}: {
  missing: readonly string[];
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
          ⚙️
        </div>

        <h1 className="mt-4 text-xl font-extrabold text-slate-950">
          LocalCourt ist nicht vollständig konfiguriert
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Die Verbindung zu Supabase fehlt, deshalb startet die Anwendung nicht.
          Es fehlen diese Umgebungsvariablen:
        </p>

        <ul className="mt-3 space-y-1">
          {missing.map((name) => (
            <li
              key={name}
              className="rounded-xl bg-slate-50 px-3 py-2 font-mono text-xs font-bold text-slate-800"
            >
              {name}
            </li>
          ))}
        </ul>

        <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
          <p>
            <span className="font-bold text-slate-900">Lokal:</span> eine
            Datei <code className="font-mono text-xs">.env.local</code> nach dem
            Muster von <code className="font-mono text-xs">.env.example</code>{" "}
            anlegen.
          </p>
          <p>
            <span className="font-bold text-slate-900">Auf Vercel:</span> die
            Werte unter Project Settings → Environment Variables eintragen und
            danach neu deployen. Vite ersetzt sie beim Bauen, ein bestehendes
            Deployment übernimmt sie also nicht nachträglich.
          </p>
        </div>

        <p className="mt-5 text-xs leading-5 text-slate-400">
          Beide Werte sind öffentlich. Der geheime Service-Role-Key gehört
          weder hierhin noch in die Vercel-Clientvariablen.
        </p>
      </div>
    </div>
  );
}
