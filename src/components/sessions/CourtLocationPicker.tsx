import { courtMarkerIcon } from "./courtMarkerIcon";
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

      <div
        role="region"
        className="h-64 w-full"
        aria-label="Karte zur Auswahl des Sportorts"
      >
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
              title="Ausgewählter Sportort"
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
