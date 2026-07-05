// Google Maps JavaScript API integration (client-side only).
// All google.* interop is contained here so components deal only in
// SelectedPlace and plain DOM elements.

export interface SelectedPlace {
  address: string;
  lat: number;
  lng: number;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function isMapsConfigured(): boolean {
  return Boolean(API_KEY);
}

/* eslint-disable @typescript-eslint/no-explicit-any */

let loadPromise: Promise<void> | null = null;

function loadMaps(): Promise<void> {
  if (!API_KEY) {
    return Promise.reject(new Error("Google Maps API key is not configured."));
  }
  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const w = window as any;
      if (w.google?.maps?.importLibrary) {
        resolve();
        return;
      }
      w.__gmapsReady = () => resolve();
      const script = document.createElement("script");
      const params = new URLSearchParams({
        key: API_KEY,
        v: "weekly",
        libraries: "places,marker",
        loading: "async",
        callback: "__gmapsReady",
      });
      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      script.onerror = () => reject(new Error("Failed to load Google Maps."));
      document.head.appendChild(script);
    });
  }
  return loadPromise;
}

/**
 * Mount a Places autocomplete input (PlaceAutocompleteElement) inside
 * `container`. Returns a cleanup function that removes the element.
 * Requires "Places API (New)" to be enabled for the API key.
 */
export async function mountAddressAutocomplete(
  container: HTMLElement,
  onSelect: (place: SelectedPlace) => void
): Promise<() => void> {
  await loadMaps();
  const g = (window as any).google;
  const { PlaceAutocompleteElement } = await g.maps.importLibrary("places");

  const element = new PlaceAutocompleteElement();
  element.addEventListener("gmp-select", async (event: any) => {
    const place = event.placePrediction.toPlace();
    await place.fetchFields({ fields: ["formattedAddress", "location"] });
    if (!place.location) return;
    onSelect({
      address: place.formattedAddress ?? "",
      lat: place.location.lat(),
      lng: place.location.lng(),
    });
  });

  container.appendChild(element);
  return () => element.remove();
}

/**
 * Render a satellite map of the property with a marker at (lat, lng).
 */
export async function mountPropertyMap(
  container: HTMLElement,
  lat: number,
  lng: number
): Promise<void> {
  await loadMaps();
  const g = (window as any).google;
  const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
    g.maps.importLibrary("maps"),
    g.maps.importLibrary("marker"),
  ]);

  const map = new Map(container, {
    center: { lat, lng },
    zoom: 19,
    mapId: "LANDSCAPE_BOOKING_MAP",
    mapTypeId: "hybrid",
    disableDefaultUI: true,
    zoomControl: true,
  });
  new AdvancedMarkerElement({ map, position: { lat, lng } });
}
