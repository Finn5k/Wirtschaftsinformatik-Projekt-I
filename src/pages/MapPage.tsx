import {
  LocateFixed,
  MapPin,
  Navigation,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { StatusBadge } from "../components/sessions/StatusBadge";
import { getSessions } from "../services/sessionService";
import type { SportSession } from "../types/session";

const filters = [
  "Alle",
  "Laufen",
  "Radfahren",
  "Fußball",
  "Basketball",
  "Badminton",
  "Schwimmen",
];

const positions = [
  { top: "22%", left: "54%" },
  { top: "42%", left: "24%" },
  { top: "56%", left: "68%" },
  { top: "30%", left: "72%" },
  { top: "64%", left: "32%" },
  { top: "70%", left: "58%" },
];

export function MapPage() {
  const [selectedSession, setSelectedSession] = useState<SportSession | null>(
    null,
  );

  const sessions = getSessions();

  return (
    <div className="relative min-h-[780px] overflow-hidden bg-slate-100">
      <div
        role="button"
        tabIndex={0}
        aria-label="Kartenauswahl schließen"
        onClick={() => setSelectedSession(null)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setSelectedSession(null);
          }
        }}
        className="absolute inset-0 z-0 cursor-default"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#bfdbfe_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white/90" />
      </div>

      <header
        className="relative z-20 px-4 pt-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-600">Karte</p>
            <h1 className="text-2xl font-extrabold text-slate-950">
              Sessions in deiner Nähe
            </h1>
          </div>

          <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
            <SlidersHorizontal size={20} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={[
                "whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-bold shadow-sm",
                index === 0
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700",
              ].join(" ")}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      <div
        className="relative z-10 h-[500px]"
        onClick={() => setSelectedSession(null)}
      >
        {sessions.map((session, index) => {
          const position = positions[index] ?? positions[0];
          const isSelected = selectedSession?.id === session.id;

          return (
            <button
              key={session.id}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedSession(session);
              }}
              className="absolute"
              style={position}
            >
              <div className="relative">
                <div
                  className={[
                    "flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition",
                    isSelected
                      ? "scale-110 bg-emerald-500 shadow-emerald-300"
                      : "bg-blue-600 shadow-blue-300",
                  ].join(" ")}
                >
                  <MapPin size={24} />
                </div>

                <div
                  className={[
                    "absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 transition",
                    isSelected ? "bg-emerald-500" : "bg-blue-600",
                  ].join(" ")}
                />

                <div className="absolute left-1/2 top-16 w-max max-w-[160px] -translate-x-1/2 rounded-2xl bg-white px-3 py-2 text-center shadow-lg">
                  <p className="text-xs font-extrabold text-slate-950">
                    {session.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {session.timeLabel}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={(event) => event.stopPropagation()}
        className="absolute right-4 top-40 z-20 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-lg"
      >
        <LocateFixed size={22} />
      </button>

      {selectedSession && (
        <section
          onClick={(event) => event.stopPropagation()}
          className="absolute bottom-24 left-4 right-4 z-20 rounded-[2rem] bg-white p-4 shadow-2xl"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <StatusBadge status={selectedSession.status} />
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                  {selectedSession.sportType}
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-slate-950">
                {selectedSession.title}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedSession.locationName}, {selectedSession.city}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Navigation size={20} />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Zeit</p>
              <p className="font-extrabold text-slate-950">
                {selectedSession.timeLabel}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Plätze</p>
              <p className="font-extrabold text-slate-950">
                {selectedSession.participantsCount}/
                {selectedSession.maxParticipants}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">XP</p>
              <p className="font-extrabold text-slate-950">
                +{selectedSession.xpReward}
              </p>
            </div>
          </div>

          <Link
            to={`/sessions/${selectedSession.id}`}
            className="block w-full rounded-2xl bg-blue-600 py-3 text-center font-extrabold text-white"
          >
            Session ansehen
          </Link>
        </section>
      )}
    </div>
  );
}