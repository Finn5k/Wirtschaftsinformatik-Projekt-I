import { MapPin } from "lucide-react";
import { mockSessions } from "../data/mockSessions";

export function MapPage() {
  return (
    <div className="px-4 py-5">
      <h1 className="text-2xl font-extrabold text-slate-950">Karte</h1>
      <p className="mt-1 text-sm text-slate-500">
        Sessions und Treffpunkte in deiner Umgebung.
      </p>

      <div className="relative mt-5 h-[620px] overflow-hidden rounded-3xl bg-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#dbeafe_1px,transparent_1px)] [background-size:24px_24px]" />

        {mockSessions.map((session, index) => (
          <div
            key={session.id}
            className="absolute rounded-2xl bg-white p-3 shadow-lg"
            style={{
              top: `${120 + index * 120}px`,
              left: `${40 + index * 45}px`,
            }}
          >
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-950">
                  {session.title}
                </p>
                <p className="text-xs text-slate-500">{session.locationName}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}