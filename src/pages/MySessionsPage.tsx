import { CalendarDays, CheckCircle2, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { StatusBadge } from "../components/sessions/StatusBadge";
import {
  getMyPastSessions,
  getMyUpcomingSessions,
} from "../services/sessionService";
import { getCurrentUser } from "../services/userService";
import type { SportSession } from "../types/session";

// "Meine Sessions" gemäß B1 DLG-07 mit zwei Zuständen (Tabs):
// Bevorstehend (UC-05) und Vergangen (UC-11, read-only Historie).
type Tab = "upcoming" | "past";

export function MySessionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const sessions =
    activeTab === "upcoming" ? getMyUpcomingSessions() : getMyPastSessions();

  return (
    <div className="min-h-[780px] bg-slate-50 px-4 py-5">
      <header className="mb-5">
        <p className="text-xs font-semibold text-blue-600">Übersicht</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-950">
          Meine Sessions
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sessions, an denen du teilnimmst oder die du organisierst.
        </p>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-white p-1.5 shadow-sm">
        <TabButton
          label="Bevorstehend"
          isActive={activeTab === "upcoming"}
          onClick={() => setActiveTab("upcoming")}
        />
        <TabButton
          label="Vergangen"
          isActive={activeTab === "past"}
          onClick={() => setActiveTab("past")}
        />
      </div>

      {sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((session) => (
            <MySessionRow
              key={session.id}
              session={session}
              showCheckInInfo={activeTab === "past"}
            />
          ))}
        </div>
      ) : (
        <section className="rounded-[2rem] border border-slate-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <CalendarDays size={24} />
          </div>

          <h2 className="mt-4 text-xl font-extrabold text-slate-950">
            {activeTab === "upcoming"
              ? "Keine bevorstehenden Sessions"
              : "Noch keine vergangenen Sessions"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {activeTab === "upcoming"
              ? "Tritt einer Session bei oder erstelle deine eigene."
              : "Abgeschlossene Sessions erscheinen hier als read-only Historie."}
          </p>

          {activeTab === "upcoming" && (
            <Link
              to="/discover"
              className="mt-5 block rounded-2xl bg-blue-600 py-3 font-extrabold text-white"
            >
              Sessions entdecken
            </Link>
          )}
        </section>
      )}
    </div>
  );
}

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl py-2.5 text-sm font-bold transition",
        isActive ? "bg-blue-600 text-white" : "text-slate-600",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

interface MySessionRowProps {
  session: SportSession;
  showCheckInInfo: boolean;
}

function MySessionRow({ session, showCheckInInfo }: MySessionRowProps) {
  const currentUser = getCurrentUser();

  const isOrganizer = session.organizerId === currentUser.id;
  const myParticipation = session.participants.find(
    (participant) => participant.id === currentUser.id,
  );
  const wasCheckedIn = myParticipation?.status === "checked_in";

  return (
    <Link
      to={`/sessions/${session.id}`}
      className="block rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <StatusBadge status={session.status} />
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
          {session.sportType}
        </span>
        <span
          className={[
            "rounded-full px-2.5 py-1 text-xs font-bold",
            isOrganizer
              ? "bg-violet-100 text-violet-700"
              : "bg-slate-100 text-slate-600",
          ].join(" ")}
        >
          {isOrganizer ? "Organisator:in" : "Teilnehmer:in"}
        </span>
      </div>

      <h3 className="text-base font-extrabold text-slate-950">
        {session.title}
      </h3>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock size={13} />
          {session.dateLabel} · {session.timeLabel}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={13} />
          {session.locationName}
        </span>
      </div>

      {showCheckInInfo && !isOrganizer && (
        <p
          className={[
            "mt-3 flex items-center gap-1.5 text-xs font-bold",
            wasCheckedIn ? "text-emerald-700" : "text-slate-500",
          ].join(" ")}
        >
          <CheckCircle2 size={14} />
          {wasCheckedIn ? "Du warst eingecheckt" : "Kein Check-in erfolgt"}
        </p>
      )}
    </Link>
  );
}
