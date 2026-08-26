import type { ReverseGeocodeResult, ReverseGeocodingData } from "../types/result";

// NB-05 Nominatim (S1.6). A08 8.5.5 führt diesen Aufruf als Referenzfall mit
// allen drei Ausgängen: verwertbarer Ort (Erfolg), technisch erfolgreiche
// Antwort ohne verwertbaren Ort (fachliche Ablehnung) und technischer Fehler.
// Der Rückgabetyp unterscheidet sie, statt beide Fehlerfälle als Ausnahme zu
// werfen und der UI die Einordnung zu überlassen (A08 8.5.4).
//
// Ausnahme davon ist der Abbruch über ein AbortSignal: Er ist keine der drei
// Fehlerklassen aus A08 8.5.2 — es wurde gar keine fachliche Frage gestellt —
// und wird weiterhin als DOMException geworfen, damit der Aufrufer ihn von
// einem Ergebnis unterscheiden kann.

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  road?: string;
  pedestrian?: string;
  footway?: string;
  house_number?: string;
  postcode?: string;
}

interface NominatimResponse {
  address?: NominatimAddress;
}

const cache = new Map<string, ReverseGeocodingData>();
let lastRequestAt = 0;

function coordinateKey(latitude: number, longitude: number) {
  return `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
}

function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function wait(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (milliseconds <= 0) {
      resolve();
      return;
    }

    const timeoutId = window.setTimeout(resolve, milliseconds);
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeoutId);
        reject(new DOMException("Abgebrochen", "AbortError"));
      },
      { once: true },
    );
  });
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<ReverseGeocodeResult> {
  const key = coordinateKey(latitude, longitude);
  const cachedResult = cache.get(key);

  if (cachedResult) {
    return { kind: "ok", code: "OK", data: cachedResult };
  }

  await wait(Math.max(0, 1000 - (Date.now() - lastRequestAt)), signal);
  lastRequestAt = Date.now();

  const parameters = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    addressdetails: "1",
    zoom: "18",
  });

  let data: NominatimResponse;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${parameters.toString()}`,
      {
        headers: {
          Accept: "application/json",
          "Accept-Language": "de",
        },
        signal,
      },
    );

    // HTTP-Fehler: Es kam keine fachliche Entscheidung zustande (A08 8.5.2).
    if (!response.ok) {
      return { kind: "failed", cause: `HTTP ${response.status}` };
    }

    data = (await response.json()) as NominatimResponse;
  } catch (error) {
    if (isAbort(error)) {
      throw error;
    }

    // Netzwerkfehler oder technisch unlesbare Antwort.
    return { kind: "failed", cause: error };
  }

  const address = data.address;
  const city =
    address?.city ??
    address?.town ??
    address?.village ??
    address?.municipality ??
    address?.county;

  // Technisch erfolgreich, aber fachlich nicht verwertbar (A08 8.5.5).
  if (!city) {
    return { kind: "rejected", code: "GEOCODING_NO_CITY" };
  }

  const street = address?.road ?? address?.pedestrian ?? address?.footway;
  const streetAndNumber = [street, address?.house_number]
    .filter(Boolean)
    .join(" ");
  const formattedAddress = [streetAndNumber, address?.postcode]
    .filter(Boolean)
    .join(", ");
  const result: ReverseGeocodingData = {
    city,
    address: formattedAddress || undefined,
  };

  cache.set(key, result);
  return { kind: "ok", code: "OK", data: result };
}
