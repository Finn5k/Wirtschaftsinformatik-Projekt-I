export function EventsPage() {
  return (
    <div className="px-4 py-5">
      <h1 className="text-2xl font-extrabold text-slate-950">
        Events & Challenges
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Offizielle Events und Challenges für deine Community.
      </p>

      <div className="mt-6 rounded-3xl bg-gradient-to-br from-blue-600 to-emerald-400 p-5 text-white">
        <p className="text-sm font-bold text-white/80">Challenge</p>
        <h2 className="mt-2 text-2xl font-extrabold">
          3 Sessions diese Woche
        </h2>
        <p className="mt-2 text-sm text-white/80">
          Checke bei drei Sessions ein und sammle einen Bonus von 150 XP.
        </p>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/30">
          <div className="h-full w-1/3 rounded-full bg-white" />
        </div>

        <p className="mt-2 text-sm font-bold">1 / 3 abgeschlossen</p>
      </div>
    </div>
  );
}