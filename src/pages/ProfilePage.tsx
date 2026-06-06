import type { ReactNode } from "react";
import { Award, Flame, Medal, Settings, Shirt, Trophy } from "lucide-react";
import { mockActivities } from "../data/mockActivities";
import { mockUser } from "../data/mockUser";

export function ProfilePage() {
  const progress = Math.round(
    (mockUser.currentXp / mockUser.nextLevelXp) * 100,
  );

  const remainingXp = mockUser.nextLevelXp - mockUser.currentXp;

  return (
    <div className="min-h-[780px] bg-slate-50">
      <section className="rounded-b-[2rem] bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-400 px-4 pb-6 pt-5 text-white">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white/80">Profil</p>
            <h1 className="text-2xl font-extrabold">{mockUser.name}</h1>
          </div>

          <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Settings size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <img
            src={mockUser.avatarUrl}
            alt={mockUser.name}
            className="h-20 w-20 rounded-3xl border-4 border-white/30 object-cover shadow-lg"
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white/80">
              {mockUser.city}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-blue-700">
                Level {mockUser.level}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
                {mockUser.rank}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white p-4 text-slate-950 shadow-xl shadow-blue-900/10">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                XP Fortschritt
              </p>
              <p className="font-extrabold text-slate-950">
                {mockUser.currentXp} / {mockUser.nextLevelXp} XP
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Trophy size={22} />
            </div>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-500">
            Noch {remainingXp} XP bis zum nächsten Level
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 px-4 pt-5">
        <StatCard
          icon={<Flame size={20} />}
          label="Streak"
          value={`${mockUser.streakDays} Tage`}
          colorClass="bg-orange-50 text-orange-600"
        />

        <StatCard
          icon={<Medal size={20} />}
          label="Abzeichen"
          value="12"
          colorClass="bg-blue-50 text-blue-600"
        />
      </section>

      <section className="px-4 pt-5">
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="font-extrabold text-slate-950">
              Bevorzugte Sportarten
            </h2>
            <p className="text-sm text-slate-500">
              Darauf basieren deine Empfehlungen
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {mockUser.preferredSports.map((sport) => (
              <span
                key={sport}
                className="whitespace-nowrap rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700"
              >
                {sport}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-950">Dein Avatar</h2>
              <p className="text-sm text-slate-500">
                MVP-Ansicht für spätere Avatar-Items
              </p>
            </div>

            <Shirt className="text-blue-600" size={22} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <AvatarItem label="Shirt" active />
            <AvatarItem label="Shorts" />
            <AvatarItem label="Shoes" />
          </div>
        </div>
      </section>

      <section className="px-4 pb-6 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-950">Letzte Aktivitäten</h2>
          <button className="text-sm font-bold text-blue-600">
            Mehr anzeigen
          </button>
        </div>

        <div className="space-y-3">
          {mockActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm"
            >
              <img
                src={activity.imageUrl}
                alt={activity.title}
                className="h-14 w-14 rounded-2xl object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-950">
                  {activity.title}
                </p>
                <p className="text-sm text-slate-500">
                  {activity.sportType} · {activity.dateLabel}
                </p>
              </div>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
                +{activity.xp} XP
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  colorClass: string;
}

function StatCard({ icon, label, value, colorClass }: StatCardProps) {
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

interface AvatarItemProps {
  label: string;
  active?: boolean;
}

function AvatarItem({ label, active = false }: AvatarItemProps) {
  return (
    <div
      className={[
        "flex h-24 flex-col items-center justify-center rounded-3xl border text-center",
        active
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-100 bg-slate-50 text-slate-500",
      ].join(" ")}
    >
      <Award size={22} />
      <p className="mt-2 text-xs font-bold">{label}</p>
    </div>
  );
}