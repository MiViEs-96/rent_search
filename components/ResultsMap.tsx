'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ScoredProperty } from '@/lib/scoring-engine';

// Fix for Leaflet default icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const HomeIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const WorkIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

interface MapProps {
  properties: ScoredProperty[];
  workers: Array<{ lat: number; lon: number; address: string }>;
  selectedProperty?: string;
}

export default function ResultsMap({ properties, workers, selectedProperty }: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full w-full bg-gray-100 animate-pulse rounded-3xl" />;

  const center: [number, number] = [53.3498, -6.2603]; // Dublin center

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="h-full w-full rounded-3xl shadow-inner z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {properties.map((p) => (
        <Marker
          key={p.id}
          position={[p.latitude, p.longitude]}
          icon={HomeIcon}
          opacity={selectedProperty && selectedProperty !== p.id ? 0.5 : 1}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-sm">{p.title}</h3>
              <p className="text-emerald-600 font-semibold">€{p.price}/mo</p>
              <p className="text-xs text-gray-500">{p.bedrooms} Bed • {p.bathrooms} Bath</p>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-center bg-emerald-600 text-white text-xs py-1 rounded hover:bg-emerald-700 transition-colors"
              >
                View on Daft.ie
              </a>
            </div>
          </Popup>
        </Marker>
      ))}

      {workers.map((w, i) => (
        <Marker key={`worker-${i}`} position={[w.lat, w.lon]} icon={WorkIcon}>
          <Popup>Workplace {i + 1}</Popup>
        </Marker>
      ))}

      <ChangeView center={center} zoom={12} />
    </MapContainer>
  );
}
