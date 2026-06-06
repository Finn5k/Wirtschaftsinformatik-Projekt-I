import {
  Bell,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { SessionCard } from "../components/sessions/SessionCard";
import { mockSessions } from "../data/mockSessions";
import { mockUser } from "../data/mockUser";
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

  const filteredSessions =
    activeFilter === "Alle"
      ? mockSessions
      : mockSessions.filter((session) => session.sportType === activeFilter);

  const featuredSession = filteredSessions[0];
  const otherSessions = filteredSessions.slice(1);

  return (
    <div className="min-h-[780px] bg-slate-50 px-4 py-5">
      <header className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-600">
            Hi, {mockUser.name.split(" ")[0]} 👋
          </p>
          <h1 className="mt-1 text-3xl font-extrabold leading-tight text-slate-950">
            Finde deine nächste
            <br />
            Sport-Session
          </h1>
        </div>

        <button className="relative rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm">
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </button>
      </header>

      <section className="mb-5 rounded-[2rem] bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-400 p-5 text-white shadow-lg shadow-blue-100">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-white/80">Dein Fortschritt</p>
            <h2 className="mt-1 text-2xl font-extrabold">
              Level {mockUser.level}
            </h2>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Trophy size={24} />
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-white/80">{mockUser.rank}</span>
          <span className="font-bold">
            {mockUser.currentXp} / {mockUser.nextLevelXp} XP
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white"
            style={{
              width: `${Math.round(
                (mockUser.currentXp / mockUser.nextLevelXp) * 100,
              )}%`,
            }}
          />
        </div>
      </section>

      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-white px-3 py-3 shadow-sm">
        <Search size={18} className="text-slate-400" />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          placeholder="Suche nach Sport, Ort oder Titel ..."
        />
        <SlidersHorizontal size={18} className="text-slate-500" />
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
                  Featured Session
                </h2>
                <p className="text-sm text-slate-500">
                  {activeFilter === "Alle"
                    ? "Besonders passend für dich"
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
                      +{featuredSession.xpReward} XP
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold">
                    {featuredSession.title}
                  </h3>

                  <p className="mt-1 flex items-center gap-1 text-sm text-white/80">
                    <MapPin size={14} />
                    {featuredSession.locationName} · {featuredSession.timeLabel}
                  </p>
                </div>
              </div>
            </Link>
          </section>

          <section className="pb-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-slate-950">
                  Weitere Sessions
                </h2>
                <p className="text-sm text-slate-500">
                  {otherSessions.length > 0
                    ? "Offen für deine Sportarten"
                    : "Keine weiteren Sessions für diesen Filter"}
                </p>
              </div>

              <button className="text-sm font-bold text-blue-600">
                Mehr sehen
              </button>
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
            Für den Filter „{activeFilter}“ gibt es aktuell keine passende
            Session. Erstelle eine neue Session oder wähle einen anderen Filter.
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