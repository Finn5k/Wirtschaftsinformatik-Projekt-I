import { Bell } from "lucide-react";

export function TopBar() {
  return (
    <header className="hidden md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white">
            M
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-500">MoveUp</p>
            <h1 className="text-xl font-bold text-slate-950">
              LocalCourt Prototype
            </h1>
          </div>
        </div>

        <button className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}