"use client";

import { useEffect, useRef, useState } from "react";
import {
  isMapsConfigured,
  mountAddressAutocomplete,
  type SelectedPlace,
} from "@/lib/services/google-maps";

interface Props {
  onSelect: (place: SelectedPlace) => void;
}

export default function AddressInput({ onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [mapsFailed, setMapsFailed] = useState(false);
  const mapsConfigured = isMapsConfigured();

  useEffect(() => {
    if (!mapsConfigured || !containerRef.current) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    mountAddressAutocomplete(containerRef.current, onSelect)
      .then((fn) => {
        if (cancelled) fn();
        else cleanup = fn;
      })
      .catch(() => setMapsFailed(true));
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [mapsConfigured, onSelect]);

  if (mapsConfigured && !mapsFailed) {
    return (
      <div
        ref={containerRef}
        className="[&>gmp-place-autocomplete]:w-full rounded-xl border border-mist bg-white p-1.5"
      />
    );
  }

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        const address = manualAddress.trim();
        if (address) onSelect({ address, lat: 0, lng: 0 });
      }}
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={manualAddress}
          onChange={(e) => setManualAddress(e.target.value)}
          placeholder="123 Main St, Madison, WI"
          className="flex-1 rounded-xl border border-mist bg-white px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-fern focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-xl bg-pine px-5 py-3 font-medium text-canvas transition hover:bg-pine-deep"
        >
          Get quote
        </button>
      </div>
      <p className="text-sm text-ink-soft">
        {mapsFailed
          ? "Address autocomplete couldn't load — enter the address manually."
          : "Address autocomplete is off (no Google Maps key yet) — enter the address manually."}
      </p>
    </form>
  );
}
