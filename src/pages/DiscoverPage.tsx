import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { SessionCard } from "../components/sessions/SessionCard";
import { getSessionsBySportType } from "../services/sessionService";
import { getCurrentUser } from "../services/userService";
import type { SportType } from "../types/session";

type SessionFilter = "Alle" | SportType;

const filters: SessionFilter[] = [
  "Alle",
  "Laufen",
  "Radfahren",
  "Fußball",
  "Basketball",
  "Badminton",
  "Schwimmen",
];

export function DiscoverPage() {
  const [activeFilter, setActiveFilter] = useState<SessionFilter>("Alle");
  const [searchTerm, setSearchTerm] = useState("");

  const currentUser = getCurrentUser();

  // Suche nach Ort/Region und optional Sportart (B1 DLG-02, UC-02).
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredSessions = getSessionsBySportType(activeFilter).filter(
    (session) => {
      if (!normalizedSearch) {
        return true;
      }

      return [session.title, session.locationName, session.city, session.sportType]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    },
  );

  const featuredSession = filteredSessions[0];
  const otherSessions = filteredSessions.slice(1);

  return (
    <div className="min-h-[780px] bg-slate-50 px-4 py-5">
      <header className="mb-5">
        <p className="text-xs font-semibold text-blue-600">
          Hi, {currentUser.name.split(" ")[0]} 👋
        </p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight text-slate-950">
          Finde deine nächste
          <br />
          Sport-Session
        </h1>
      </header>

      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-white px-3 py-3 shadow-sm">
        <Search size={18} className="text-slate-400" />
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          placeholder="Suche nach Ort, Titel oder Sportart ..."
        />
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => {
          const isActive = filter === activeFilter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={[
                "whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-bold shadow-sm transition",
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100",
              ].join(" ")}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {featuredSession ? (
        <>
          <section className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-slate-950">
                  Nächste Session
                </h2>
                <p className="text-sm text-slate-500">
                  {activeFilter === "Alle"
                    ? "Bald in deiner Nähe"
                    : `Passend für ${activeFilter}`}
                </p>
              </div>

              <Sparkles size={22} className="text-blue-600" />
            </div>

            <Link
              to={`/sessions/${featuredSession.id}`}
              className="block overflow-hidden rounded-[2rem] bg-white shadow-sm"
            >
              <div className="relative h-44">
                <img
                  src={featuredSession.imageUrl}
                  alt={featuredSession.title}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="mb-2 flex gap-2">
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
                      {featuredSession.sportType}
                    </span>
                    <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-slate-950">
                      {featuredSession.participantsCount}/
                      {featuredSession.maxParticipants} Plätze
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold">
                    {featuredSession.title}
                  </h3>

                  <p className="mt-1 text-sm text-white/80">
                    {featuredSession.locationName} · {featuredSession.dateLabel}{" "}
                    {featuredSession.timeLabel}
                  </p>
                </div>
              </div>
            </Link>
          </section>

          <section className="pb-4">
            <div className="mb-3">
              <h2 className="font-extrabold text-slate-950">
                Weitere Sessions
              </h2>
              <p className="text-sm text-slate-500">
                {otherSessions.length > 0
                  ? "Offen für deine Sportarten"
                  : "Keine weiteren Sessions für diesen Filter"}
              </p>
            </div>

            <div className="space-y-3">
              {otherSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-[2rem] border border-slate-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Search size={24} />
          </div>

          <h2 className="mt-4 text-xl font-extrabold text-slate-950">
            Keine Sessions gefunden
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Für deine Suche gibt es aktuell keine passende Session. Erstelle
            eine neue Session oder ändere Suche und Filter.
          </p>

          <Link
            to="/sessions/new"
            className="mt-5 block rounded-2xl bg-blue-600 py-3 font-extrabold text-white"
          >
            Session erstellen
          </Link>
        </section>
      )}
    </div>
  );
}
