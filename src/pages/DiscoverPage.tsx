import { Bell, SlidersHorizontal } from "lucide-react";
import { SessionCard } from "../components/sessions/SessionCard";
import { mockSessions } from "../data/mockSessions";

const filters = ["Alle", "Laufen", "Radfahren", "Fußball", "Basketball"];

export function DiscoverPage() {
  return (
    <div className="px-4 py-5">
      <header className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-600">
            In deinem Radius
          </p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight text-slate-950">
            Entdecke Sessions
            <br />
            in deiner Nähe
          </h1>
        </div>

        <button className="rounded-2xl border border-slate-200 p-2.5 text-slate-600">
          <Bell size={20} />
        </button>
      </header>

      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
        <input
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          placeholder="Suche nach Sport, Ort oder Titel ..."
        />
        <SlidersHorizontal size={18} className="text-slate-500" />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter, index) => (
          <button
            key={filter}
            className={[
              "whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-bold",
              index === 0
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700",
            ].join(" ")}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 text-sm font-bold">
        <button className="rounded-xl bg-blue-600 py-2 text-white">
          Kurzfristig
        </button>
        <button className="rounded-xl py-2 text-slate-500">Langfristig</button>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-slate-950">Empfohlene Sessions</h2>
          <button className="text-sm font-bold text-blue-600">Mehr sehen</button>
        </div>

        <div className="space-y-3">
          {mockSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </section>
    </div>
  );
}