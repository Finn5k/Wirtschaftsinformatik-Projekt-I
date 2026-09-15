import L from "leaflet";
import { AlertTriangle, LocateFixed, Navigation, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { StatusBadge } from "../components/sessions/StatusBadge";
import { sportDisplayName, sportKeys } from "../data/sports";
import { getDiscoverableSessions } from "../services/sessionService";
import { ErrorState, LoadingState } from "../components/DataStates";
import { useLoadedData } from "../hooks/useLoadedData";
import type { SportKey, SportSession } from "../types/session";
import { formatSessionTime } from "../utils/sessionTime";

type SessionFilter = "Alle" | SportKey;

const filters: SessionFilter[] = [
  "Alle",
  ...sportKeys,
];

// „Standardregion" aus B1 DLG-03: Gießen als Rückfall, wenn keine Session
// angezeigt wird. B1 legt die Region nicht namentlich fest; gewählt ist der
// Hochschulstandort des Teams. Sobald Sessions vorliegen, richtet sich der
// Ausschnitt nach ihnen (siehe MapViewport) — ein fester Ausschnitt würde sonst
// eine leere Karte zeigen, obwohl es Sessions gibt, nur eben anderswo.
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
  // Zentrier-Schaltfläche: Auswahl aufheben und die Übersicht wiederherstellen
  // (B1.4.3 „Ansicht zurücksetzen"). Das bloße Aufheben der Auswahl lässt den
  // Ausschnitt stehen; deshalb ein eigener Zähler statt nur `selectedSession`.
  const [uebersichtAnforderung, setUebersichtAnforderung] = useState(0);

  // Nur zukünftige/laufende Sessions, gefiltert nach Sportart (B1 DLG-03, UC-02).
  const { state, reload } = useLoadedData(
    () => getDiscoverableSessions(activeFilter),
    [activeFilter],
  );
  const sessions = useMemo(
    () => (state.status === "ok" ? state.data : []),
    [state],
  );

  // Eine ausgewählte Session bestimmt den Ausschnitt allein; sonst umfasst er
  // alle angezeigten Marker (B1 DLG-03, Kartenansicht).
  const selectedCenter = useMemo<[number, number] | null>(
    () =>
      selectedSession
        ? [selectedSession.court.latitude, selectedSession.court.longitude]
        : null,
    [selectedSession],
  );

  const markerPositions = useMemo<[number, number][]>(
    () =>
      sessions.map((session) => [
        session.court.latitude,
        session.court.longitude,
      ]),
    [sessions],
  );

  function selectFilter(filter: SessionFilter) {
    setActiveFilter(filter);
    setSelectedSession(null);
  }

  function retryMapLoading() {
    setMapUnavailable(false);
    setTileLayerKey((currentKey) => currentKey + 1);
  }

  if (state.status === "loading") {
    return <LoadingState label="Sessions werden geladen …" />;
  }

  if (state.status === "failed") {
    return (
      <ErrorState
        onRetry={reload}
        label="Die Sessions konnten gerade nicht geladen werden."
      />
    );
  }

  return (
    <div className="relative -mb-24 overflow-hidden bg-slate-100 md:rounded-[2rem]">
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

      {/*
        Mobil: Viewport minus Navigationsleiste, damit die Karte bündig bis zur
        Leiste reicht. Desktop: die feste Höhe des Seitenrahmens (AppLayout,
        md:min-h-[850px]) — sonst bliebe unter der Karte ein weißer Rest des
        Rahmens sichtbar, sobald die Seite scrollt.
      */}
      <div className="h-[calc(100dvh-5.5rem)] w-full md:h-[850px]">
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

          <MapViewport
            selectedCenter={selectedCenter}
            positions={markerPositions}
            uebersichtAnforderung={uebersichtAnforderung}
          />
          <DeselectOnMapClick onDeselect={() => setSelectedSession(null)} />

          {sessions.map((session) => {
            const isSelected = selectedSession?.id === session.id;

            return (
              <Marker
                key={session.id}
                title={`${session.title} – ${session.court.name}`}
                position={[session.court.latitude, session.court.longitude]}
                icon={createSessionMarkerIcon(isSelected)}
                eventHandlers={{
                  click: (event) => {
                    // Der Klick soll die Session auswählen, nicht zugleich als
                    // Kartenklick die Auswahl wieder aufheben (Leaflet reicht
                    // Ereignisse vom Marker an die Karte weiter).
                    L.DomEvent.stopPropagation(event.originalEvent);
                    setSelectedSession(session);
                  },
                }}
              />
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
          aria-label="Ansicht zurücksetzen"
          onClick={() => {
            setSelectedSession(null);
            setUebersichtAnforderung((current) => current + 1);
          }}
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
                <StatusBadge status={selectedSession.status} />
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

interface MapViewportProps {
  /** Ausgewählte Session; ein Wechsel darauf fliegt die Karte dorthin. */
  selectedCenter: [number, number] | null;
  /** Positionen aller angezeigten Marker. */
  positions: [number, number][];
  /** Zähler der Zentrier-Schaltfläche; jede Erhöhung stellt die Übersicht her. */
  uebersichtAnforderung: number;
}

// Bestimmt den Kartenausschnitt (B1 DLG-03, Vorbelegung „Standardregion").
//
// Zwei getrennte Auslöser: Die Übersicht (alle Marker) wird beim Öffnen, bei
// geänderter Markermenge (Filter) und auf die Zentrier-Schaltfläche hin
// eingepasst; die Auswahl eines Markers fliegt zur Session. Das Aufheben der
// Auswahl ändert den Ausschnitt dagegen nicht (B1.4.3 „Auswahl aufheben") —
// der Nutzer soll dort bleiben, wo er gerade hingesehen hat.
function MapViewport({
  selectedCenter,
  positions,
  uebersichtAnforderung,
}: MapViewportProps) {
  const map = useMap();

  // Die Eigenschaften sind bei jedem Rendern neue Arrays; als Abhängigkeit
  // würden sie den Effekt endlos auslösen. Maßgeblich ist ihr Inhalt.
  const markerSchluessel = positions
    .map((position) => position.join(","))
    .join("|");
  const auswahlSchluessel = selectedCenter?.join(",") ?? null;

  useEffect(() => {
    // Leaflet kennt seine Größe erst, wenn der Container gemessen wurde. Beim
    // ersten Lauf direkt nach dem Einhängen ist das noch nicht geschehen, und
    // ein Einpassen würde in einen Container der Größe null rechnen.
    map.invalidateSize();

    // Der Übersichtsausschnitt wird ohne Animation gesetzt: Beim Öffnen der
    // Karte soll sofort der richtige Bereich zu sehen sein, kein Zoomflug.
    // Animiert wird nur der Sprung zu einer ausgewählten Session (unten).
    if (positions.length === 0) {
      map.setView(defaultCenter, 12, { animate: false });
      return;
    }

    if (positions.length === 1) {
      map.setView(positions[0], 13, { animate: false });
      return;
    }

    // Mehrere Sessions: Ausschnitt so wählen, dass alle Marker sichtbar sind.
    // maxZoom verhindert, dass eng beieinanderliegende Courts bis auf
    // Straßenniveau herangezoomt werden.
    //
    // Der Rand ist oben und unten größer als seitlich: Kopfbereich mit Filter
    // und die Navigationsleiste liegen über der Karte, ein gleichmäßiger Rand
    // schöbe die äußersten Marker darunter.
    map.fitBounds(L.latLngBounds(positions), {
      paddingTopLeft: [48, 160],
      paddingBottomRight: [48, 130],
      maxZoom: 14,
      animate: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerSchluessel, uebersichtAnforderung, map]);

  useEffect(() => {
    if (selectedCenter) {
      map.flyTo(selectedCenter, 13, { duration: 0.8 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auswahlSchluessel, map]);

  return null;
}

// Ein Tipp auf die Karte außerhalb eines Markers hebt die Auswahl auf und
// blendet die Vorschaukarte aus (B1.4.3 „Auswahl aufheben"). Marker-Klicks
// erreichen diesen Handler nicht, weil der Marker die Weitergabe stoppt.
function DeselectOnMapClick({ onDeselect }: { onDeselect: () => void }) {
  useMapEvents({ click: onDeselect });

  return null;
}
