import L from "leaflet";
import { AlertTriangle, LocateFixed, Navigation, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { StatusBadge } from "../components/sessions/StatusBadge";
import { sportDisplayName, sportKeys } from "../data/sports";
import { getSessionsBySportKey } from "../services/sessionService";
import type { SportKey, SportSession } from "../types/session";
import {
  formatSessionDate,
  formatSessionTime,
  getSessionStatus,
} from "../utils/sessionTime";

type SessionFilter = "Alle" | SportKey;

const filters: SessionFilter[] = [
  "Alle",
  ...sportKeys,
];

const defaultCenter: [number, number] = [50.5841, 8.6784];

function createSessionMarkerIcon(isSelected: boolean) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 48px;
        height: 48px;
        background: ${isSelected ? "#10B981" : "#2563EB"};
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 12px 24px rgba(37, 99, 235, 0.35);
        transform: ${isSelected ? "scale(1.12)" : "scale(1)"};
        transition: transform 150ms ease;
      ">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -46],
  });
}

export function MapPage() {
  const [activeFilter, setActiveFilter] = useState<SessionFilter>("Alle");
  const [selectedSession, setSelectedSession] = useState<SportSession | null>(
    null,
  );
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const [tileLayerKey, setTileLayerKey] = useState(0);

  // Nur zukünftige/laufende Sessions, gefiltert nach Sportart (B1 DLG-03, UC-02).
  const sessions = getSessionsBySportKey(activeFilter);

  const mapCenter = useMemo<[number, number]>(() => {
    if (!selectedSession) {
      return defaultCenter;
    }

    return [selectedSession.court.latitude, selectedSession.court.longitude];
  }, [selectedSession]);

  function selectFilter(filter: SessionFilter) {
    setActiveFilter(filter);
    setSelectedSession(null);
  }

  function retryMapLoading() {
    setMapUnavailable(false);
    setTileLayerKey((currentKey) => currentKey + 1);
  }

  return (
    <div className="relative -mb-24 overflow-hidden bg-slate-100">
      <header className="absolute left-0 right-0 top-0 z-[1000] px-4 pt-5">
        <div className="mb-4">
          <div className="inline-block rounded-3xl bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold text-blue-600">Karte</p>
            <h1 className="text-xl font-extrabold text-slate-950">
              Sessions in deiner Nähe
            </h1>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => {
            const isActive = filter === activeFilter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => selectFilter(filter)}
                aria-pressed={isActive}
                className={[
                  "whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-bold shadow-sm backdrop-blur",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-white/90 text-slate-700",
                ].join(" ")}
              >
                {filter === "Alle" ? filter : sportDisplayName(filter)}
              </button>
            );
          })}
        </div>
      </header>

      {/* Höhe = Viewport minus Bottom-Navigation, damit die Karte bündig bis zur Navigation reicht */}
      <div className="h-[calc(100dvh-5.5rem)] w-full">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom
          zoomControl={false}
          className="h-full w-full"
        >
          <TileLayer
            key={tileLayerKey}
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{
              tileerror: () => {
                setMapUnavailable(true);
                setSelectedSession(null);
              },
            }}
          />

          <MapFlyTo center={mapCenter} />

          {sessions.map((session) => {
            const isSelected = selectedSession?.id === session.id;

            return (
              <Marker
                key={session.id}
                title={`${session.title} – ${session.court.name}`}
                position={[session.court.latitude, session.court.longitude]}
                icon={createSessionMarkerIcon(isSelected)}
                eventHandlers={{
                  click: () => setSelectedSession(session),
                }}
              >
                <Popup>
                  <strong>{session.title}</strong>
                  <br />
                  {session.court.name}
                  <br />
                  {formatSessionDate(session.startAt)} ·{" "}
                  {formatSessionTime(session.startAt)}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {mapUnavailable && (
        <section
          role="alert"
          className="absolute inset-x-4 top-40 z-[1100] rounded-[2rem] bg-white p-6 text-center shadow-2xl"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <AlertTriangle size={26} />
          </div>

          <h2 className="mt-4 text-xl font-extrabold text-slate-950">
            Karte derzeit nicht verfügbar
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Die Kartendaten konnten nicht geladen werden. Du kannst es erneut
            versuchen oder die Sessions in der Listenansicht entdecken.
          </p>

          <button
            type="button"
            onClick={retryMapLoading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 font-extrabold text-white"
          >
            <RefreshCw size={18} />
            Erneut versuchen
          </button>
          <Link
            to="/discover"
            className="mt-3 block w-full rounded-2xl border border-slate-200 py-3 font-bold text-slate-700"
          >
            Zur Listenansicht
          </Link>
        </section>
      )}

      {!mapUnavailable && (
        <button
          type="button"
          aria-label="Kartenauswahl zurücksetzen"
          onClick={() => setSelectedSession(null)}
          className="absolute right-4 top-44 z-[1000] flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-lg"
        >
          <LocateFixed size={22} />
        </button>
      )}

      {selectedSession && !mapUnavailable && (
        <section className="absolute bottom-24 left-4 right-4 z-[1000] rounded-[2rem] bg-white p-4 shadow-2xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <StatusBadge status={getSessionStatus(selectedSession)} />
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                  {sportDisplayName(selectedSession.sportKey)}
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-slate-950">
                {selectedSession.title}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedSession.court.name}, {selectedSession.court.city}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Navigation size={20} />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Zeit</p>
              <p className="font-extrabold text-slate-950">
                {formatSessionTime(selectedSession.startAt)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Plätze</p>
              <p className="font-extrabold text-slate-950">
                {selectedSession.participantsCount}/
                {selectedSession.maxParticipants}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Dauer</p>
              <p className="font-extrabold text-slate-950">
                {selectedSession.durationMin} Min.
              </p>
            </div>
          </div>

          <Link
            to={`/sessions/${selectedSession.id}`}
            className="block w-full rounded-2xl bg-blue-600 py-3 text-center font-extrabold text-white"
          >
            Session ansehen
          </Link>
        </section>
      )}
    </div>
  );
}

interface MapFlyToProps {
  center: [number, number];
}

function MapFlyTo({ center }: MapFlyToProps) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 13, {
      duration: 0.8,
    });
  }, [center, map]);

  return null;
}
