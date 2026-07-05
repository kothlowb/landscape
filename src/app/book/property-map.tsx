"use client";

import { useEffect, useRef } from "react";
import { mountPropertyMap } from "@/lib/services/google-maps";

export default function PropertyMap({ lat, lng }: { lat: number; lng: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    mountPropertyMap(ref.current, lat, lng).catch(() => {
      // Map is a nice-to-have; the booking flow works without it.
    });
  }, [lat, lng]);

  return (
    <div
      ref={ref}
      className="h-60 w-full overflow-hidden rounded-xl border border-mist bg-mist/40"
    />
  );
}
