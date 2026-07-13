"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Navigation } from "lucide-react";
import { TrackingStatusBadge } from "./tracking-status-badge";
import { formatDate } from "@/lib/utils/format-date";
import type { TrackingEvent } from "@/types/api.types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Cities in the seed data already carry lat/lng; anything created afterwards
// (or without a match) is resolved here so the map still has a point to show.
const geocodeCache = new Map<string, [number, number]>();

async function geocodeCityProvince(
  city: string,
  province: string,
): Promise<[number, number] | null> {
  const key = `${city},${province}`.toLowerCase();
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;
  if (!MAPBOX_TOKEN) return null;

  try {
    const query = encodeURIComponent(`${city}, ${province}, Canada`);
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?country=ca&limit=1&access_token=${MAPBOX_TOKEN}`,
    );
    if (!res.ok) return null;
    const json = await res.json();
    const coords = json?.features?.[0]?.center as [number, number] | undefined;
    if (!coords) return null;
    geocodeCache.set(key, coords);
    return coords;
  } catch {
    return null;
  }
}

interface Props {
  event: TrackingEvent | null | undefined;
}

export function DeliveryMap({ event }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<mapboxgl.Map | null>(null);
  const markerRef    = useRef<mapboxgl.Marker | null>(null);
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [resolving, setResolving] = useState(false);

  const location = event?.locations;

  useEffect(() => {
    let cancelled = false;

    async function resolveCoords() {
      if (!location) {
        setCoords(null);
        return;
      }
      if (location.latitude != null && location.longitude != null) {
        setCoords([location.longitude, location.latitude]);
        return;
      }
      setResolving(true);
      const result = await geocodeCityProvince(location.city, location.province);
      if (!cancelled) {
        setCoords(result);
        setResolving(false);
      }
    }

    resolveCoords();
    return () => {
      cancelled = true;
    };
  }, [location?.city, location?.province, location?.latitude, location?.longitude]);

  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN || !coords) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: coords,
        zoom: 10,
        attributionControl: false,
      });
      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    } else {
      mapRef.current.flyTo({ center: coords, zoom: 10 });
    }

    if (markerRef.current) {
      markerRef.current.setLngLat(coords);
    } else {
      markerRef.current = new mapboxgl.Marker({ color: "#d97706" })
        .setLngLat(coords)
        .addTo(mapRef.current);
    }

    return () => undefined;
  }, [coords]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
        <div className="border-b border-card-border px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Live Location</h2>
        </div>
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <MapPin className="h-8 w-8 text-muted-light" />
          <p className="text-sm font-medium text-muted">Map is not configured</p>
          <p className="text-xs text-muted-light">
            Set NEXT_PUBLIC_MAPBOX_TOKEN to enable the delivery map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground">Live Location</h2>
        {event && (
          <span className="flex items-center gap-1.5">
            <TrackingStatusBadge status={event.tracking_status} />
          </span>
        )}
      </div>

      {!event || !location ? (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <MapPin className="h-8 w-8 text-muted-light" />
          <p className="text-sm font-medium text-muted">No tracking history yet</p>
          <p className="text-xs text-muted-light">
            The map will show the most recent tracking update once one is added.
          </p>
        </div>
      ) : resolving && !coords ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : !coords ? (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <MapPin className="h-8 w-8 text-muted-light" />
          <p className="text-sm font-medium text-muted">
            Couldn&apos;t locate {location.city}, {location.province} on the map
          </p>
        </div>
      ) : (
        <>
          <div ref={containerRef} className="h-64 w-full sm:h-80" />
          <div className="flex flex-wrap items-center gap-3 border-t border-card-border px-6 py-3 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5" />
              {location.city}, {location.province}
            </span>
            <span>Last updated {formatDate(event.event_timestamp)}</span>
          </div>
        </>
      )}
    </div>
  );
}
