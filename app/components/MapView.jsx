"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function Recenter({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.flyTo([center.lat, center.lng], zoom, { duration: 0.9 });
  }, [center, map, zoom]);

  return null;
}

function buildMarkerIcon(category) {
  const className = category ? `map-marker map-marker--${category}` : "map-marker";
  return L.divIcon({
    className,
    html: "<span></span>",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

export default function MapView({ facilities, center, onConnect }) {
  const safeCenter = center || { lat: 28.6139, lng: 77.2090 };
  const icons = useMemo(() => ({
    repair: buildMarkerIcon("repair"),
    recycling: buildMarkerIcon("recycling"),
    buyer: buildMarkerIcon("buyer"),
    "second-hand": buildMarkerIcon("buyer"),
    service: buildMarkerIcon("repair"),
    user: buildMarkerIcon("user"),
  }), []);

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[safeCenter.lat, safeCenter.lng]}
        zoom={13}
        scrollWheelZoom
        className="map-container"
      >
        <Recenter center={safeCenter} zoom={13} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[safeCenter.lat, safeCenter.lng]} icon={icons.user}>
          <Popup>
            <div className="map-popup">
              <strong>Your location</strong>
              <span className="map-popup-meta">Auto-centered</span>
            </div>
          </Popup>
        </Marker>

        {facilities.map((facility) => (
          <Marker
            key={`${facility.name}_${facility.latitude}_${facility.longitude}`}
            position={[facility.latitude, facility.longitude]}
            icon={icons[facility.category] || icons.buyer}
          >
            <Popup>
              <div className="map-popup">
                <strong>{facility.name}</strong>
                <span className="map-popup-meta">{facility.type}</span>
                <div className="map-popup-actions">
                  <button
                    type="button"
                    className="map-popup-btn primary"
                    onClick={() => onConnect?.(facility)}
                  >
                    Contact
                  </button>
                  <a
                    className="map-popup-btn ghost"
                    href={facility.whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
