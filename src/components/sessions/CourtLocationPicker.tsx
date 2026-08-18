import L from "leaflet";
import { MapPin } from "lucide-react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

export interface CourtCoordinates {
  latitude: number;
  longitude: number;
}

interface CourtLocationPickerProps {
  coordinates: CourtCoordinates | null;
  onSelect: (coordinates: CourtCoordinates) => void;
  onTileError: () => void;
}

const defaultCenter: [number, number] = [50.5841, 8.6784];

const courtMarkerIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      border-radius: 9999px;
      background: #2563eb;
      box-shadow: 0 8px 18px rgba(37, 99, 235, 0.35);
    ">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
});

export function CourtLocationPicker({
  coordinates,
  onSelect,
  onTileError,
}: CourtLocationPickerProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <MapPin size={18} />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-950">
            Standort auf der Karte setzen
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Tippe auf den Standort des Sportorts. Ort und Adresse werden danach
            automatisch ermittelt.
          </p>
        </div>
      </div>

      <div className="h-64 w-full" aria-label="Karte zur Auswahl des Sportorts">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{ tileerror: onTileError }}
          />
          <MapClickHandler onSelect={onSelect} />
          {coordinates && (
            <Marker
              position={[coordinates.latitude, coordinates.longitude]}
              icon={courtMarkerIcon}
            />
          )}
        </MapContainer>
      </div>
    </section>
  );
}

function MapClickHandler({
  onSelect,
}: Pick<CourtLocationPickerProps, "onSelect">) {
  useMapEvents({
    click: (event) =>
      onSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      }),
  });

  return null;
}
