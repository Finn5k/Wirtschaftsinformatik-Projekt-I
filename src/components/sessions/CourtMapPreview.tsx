import { useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import type { Court } from "../../types/session";
import { courtMarkerIcon } from "./courtMarkerIcon";

// Kartenausschnitt zum Sportort in DLG-04 (B1.4.4 „Text (+ Kartenausschnitt)",
// S1.5 „Kartendarstellung bei Session-Suche/-Detail"). Nicht bedienbar: Er
// zeigt nur, wo der Court liegt; Entdecken auf der Karte ist DLG-03.
//
// Die Kacheln kommen direkt aus der UI-Komponentenschicht von NB-04, nicht aus
// der Service-Schicht (A08 8.4). Laden sie nicht, bleibt nur der Text stehen —
// die Detailansicht ist ohne Karte nutzbar (S1.5, N1-QA-01).

interface CourtMapPreviewProps {
  court: Court;
}

export function CourtMapPreview({ court }: CourtMapPreviewProps) {
  const [tilesUnavailable, setTilesUnavailable] = useState(false);

  if (tilesUnavailable) {
    return null;
  }

  return (
    <div
      role="img"
      aria-label={`Kartenausschnitt: ${court.name}, ${court.city}`}
      className="h-44 overflow-hidden rounded-3xl"
    >
      <MapContainer
        center={[court.latitude, court.longitude]}
        zoom={15}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{ tileerror: () => setTilesUnavailable(true) }}
        />
        <Marker
          title={court.name}
          position={[court.latitude, court.longitude]}
          icon={courtMarkerIcon}
          interactive={false}
        />
      </MapContainer>
    </div>
  );
}
