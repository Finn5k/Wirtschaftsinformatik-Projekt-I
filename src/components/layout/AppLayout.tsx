import { Outlet } from "react-router";
import { BottomNavigation } from "./BottomNavigation";
import { TopBar } from "./TopBar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <TopBar />

      <main className="mx-auto min-h-screen w-full max-w-md bg-white pb-24 shadow-sm md:my-6 md:min-h-[850px] md:rounded-[2rem] md:border md:border-slate-200">
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  );
}