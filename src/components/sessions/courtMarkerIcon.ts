import L from "leaflet";

// Gemeinsamer Pin für einen Sportort — auch der Kartenausschnitt in DLG-04
// (`CourtMapPreview`) verwendet ihn, damit ein Court überall gleich aussieht.
export const courtMarkerIcon = L.divIcon({
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
