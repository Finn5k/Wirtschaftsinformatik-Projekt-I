import { Flame, Trophy } from "lucide-react";
import { mockUser } from "../data/mockUser";

export function ProfilePage() {
  const progress = Math.round(
    (mockUser.currentXp / mockUser.nextLevelXp) * 100,
  );

  return (
    <div className="px-4 py-5">
      <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 to-emerald-400 p-5 text-white">
        <div className="flex items-center gap-4">
          <img
            src={mockUser.avatarUrl}
            alt={mockUser.name}
            className="h-20 w-20 rounded-3xl object-cover"
          />

          <div>
            <h1 className="text-2xl font-extrabold">{mockUser.name}</h1>
            <p className="text-sm text-white/80">{mockUser.city}</p>
            <p className="mt-1 text-sm font-bold">{mockUser.rank}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white p-4 text-slate-950">
          <div className="flex justify-between text-sm">
            <span className="font-bold">Level {mockUser.level}</span>
            <span className="text-slate-500">
              {mockUser.currentXp} / {mockUser.nextLevelXp} XP
            </span>
          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-500">
            Noch {mockUser.nextLevelXp - mockUser.currentXp} XP bis zum nächsten Level
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <StatCard icon={<Flame size={20} />} label="Streak" value={`${mockUser.streakDays} Tage`} />
        <StatCard icon={<Trophy size={20} />} label="Rang" value={mockUser.rank} />
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 text-blue-600">{icon}</div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-bold text-slate-950">{value}</p>
    </div>
  );
}