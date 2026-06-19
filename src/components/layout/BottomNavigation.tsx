import { CalendarDays, Map, Plus, Search, User } from "lucide-react";
import { NavLink } from "react-router";

const navItems = [
  { to: "/discover", label: "Entdecken", icon: Search },
  { to: "/map", label: "Karte", icon: Map },
  { to: "/sessions/new", label: "Erstellen", icon: Plus },
  { to: "/events", label: "Events", icon: CalendarDays },
  { to: "/profile", label: "Profil", icon: User },
];

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white md:left-1/2 md:max-w-md md:-translate-x-1/2 md:rounded-t-3xl md:border md:shadow-lg">
      <div className="grid grid-cols-5 px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium transition",
                  isActive ? "text-blue-600" : "text-slate-500",
                  item.label === "Erstellen" ? "-mt-5" : "",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-2xl",
                      item.label === "Erstellen"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : isActive
                          ? "bg-blue-50"
                          : "bg-transparent",
                    ].join(" ")}
                  >
                    <Icon size={19} />
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}