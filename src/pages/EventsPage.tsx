import { CalendarDays, Sparkles, Trophy } from "lucide-react";
import { ChallengeCard } from "../components/events/ChallengeCard";
import { mockChallenges } from "../data/mockChallenges";

export function EventsPage() {
  const activeChallenges = mockChallenges.filter(
    (challenge) => challenge.status === "ACTIVE",
  );

  const upcomingEvents = mockChallenges.filter(
    (challenge) => challenge.status === "UPCOMING",
  );

  return (
    <div className="min-h-[780px] bg-slate-50 px-4 py-5">
      <header className="mb-5">
        <p className="text-xs font-semibold text-blue-600">Community</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-950">
          Events & Challenges
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sammle XP durch offizielle Events, Wochenziele und Community-Challenges.
        </p>
      </header>

      <section className="mb-5 rounded-[2rem] bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-400 p-5 text-white shadow-lg shadow-blue-100">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-white/80">Featured Event</p>
            <h2 className="mt-1 text-2xl font-extrabold">
              Campus Sports Day
            </h2>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <CalendarDays size={24} />
          </div>
        </div>

        <p className="text-sm leading-6 text-white/85">
          Ein offizielles Sport-Event mit verschiedenen Sessions, Bonus-XP und
          Community-Ranking.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
            <p className="text-xs text-white/70">Belohnung</p>
            <p className="mt-1 font-extrabold">+250 XP</p>
          </div>

          <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
            <p className="text-xs text-white/70">Status</p>
            <p className="mt-1 font-extrabold">Demnächst</p>
          </div>
        </div>

        <button className="mt-5 w-full rounded-2xl bg-white py-3 font-extrabold text-blue-700">
          Event ansehen
        </button>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3">
        <SummaryCard
          icon={<Sparkles size={20} />}
          label="Aktive Challenges"
          value={`${activeChallenges.length}`}
          colorClass="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          icon={<Trophy size={20} />}
          label="Mögliche XP"
          value="+500"
          colorClass="bg-emerald-50 text-emerald-600"
        />
      </section>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-950">Aktive Challenges</h2>
          <button className="text-sm font-bold text-blue-600">
            Alle ansehen
          </button>
        </div>

        <div className="space-y-3">
          {activeChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </section>

      <section className="pb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-950">Demnächst</h2>
        </div>

        <div className="space-y-3">
          {upcomingEvents.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </section>
    </div>
  );
}

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  colorClass: string;
}

function SummaryCard({ icon, label, value, colorClass }: SummaryCardProps) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${colorClass}`}
      >
        {icon}
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-extrabold text-slate-950">{value}</p>
    </div>
  );
}