export interface ReverseGeocodingResult {
  city: string;
  address?: string;
}

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

const cache = new Map<string, ReverseGeocodingResult>();
let lastRequestAt = 0;

function coordinateKey(latitude: number, longitude: number) {
  return `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
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
): Promise<ReverseGeocodingResult> {
  const key = coordinateKey(latitude, longitude);
  const cachedResult = cache.get(key);

  if (cachedResult) {
    return cachedResult;
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

  if (!response.ok) {
    throw new Error("GEOCODING_UNAVAILABLE");
  }

  const data = (await response.json()) as NominatimResponse;
  const address = data.address;
  const city =
    address?.city ??
    address?.town ??
    address?.village ??
    address?.municipality ??
    address?.county;

  if (!city) {
    throw new Error("GEOCODING_NO_CITY");
  }

  const street = address?.road ?? address?.pedestrian ?? address?.footway;
  const streetAndNumber = [street, address?.house_number]
    .filter(Boolean)
    .join(" ");
  const formattedAddress = [streetAndNumber, address?.postcode]
    .filter(Boolean)
    .join(", ");
  const result: ReverseGeocodingResult = {
    city,
    address: formattedAddress || undefined,
  };

  cache.set(key, result);
  return result;
}
