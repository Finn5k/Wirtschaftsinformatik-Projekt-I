export function TopBar() {
  return (
    <header className="hidden md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white">
            LC
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-500">LocalCourt</p>
            <h1 className="text-xl font-bold text-slate-950">
              UI-Prototyp (MVP)
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
