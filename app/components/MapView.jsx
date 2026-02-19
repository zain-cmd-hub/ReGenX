"use client";

import { useEffect, useMemo, useState } from "react";
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

function MapInteractionLock({ locked }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (locked) {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      if (map.tap) {
        map.tap.disable();
      }
    } else {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      if (map.tap) {
        map.tap.enable();
      }
    }
  }, [locked, map]);

  return null;
}

export default function MapView({ facilities, center, onConnect, labels }) {
  const safeCenter = center || { lat: 28.6139, lng: 77.2090 };
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const safeLabels = labels || {
    yourLocation: "Your location",
    autoCentered: "Auto-centered",
    connect: "Connect",
    whatsapp: "WhatsApp",
    facility: "Facility",
    close: "Close",
  };
  const icons = useMemo(() => ({
    repair: buildMarkerIcon("repair"),
    recycling: buildMarkerIcon("recycling"),
    buyer: buildMarkerIcon("buyer"),
    "second-hand": buildMarkerIcon("buyer"),
    service: buildMarkerIcon("repair"),
    user: buildMarkerIcon("user"),
  }), []);

  useEffect(() => {
    document.body.style.overflow = showContactModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showContactModal]);

  function openContactModal(facility) {
    setSelectedFacility(facility);
    setShowContactModal(true);
  }

  function closeContactModal() {
    setShowContactModal(false);
    setSelectedFacility(null);
  }

  function handleConnect() {
    if (!selectedFacility) return;
    onConnect?.(selectedFacility);
    closeContactModal();
  }

  function handleWhatsApp() {
    if (!selectedFacility?.whatsappLink) return;
    window.open(selectedFacility.whatsappLink, "_blank", "noopener,noreferrer");
    closeContactModal();
  }

  return (
    <div className={`map-wrapper ${showContactModal ? "is-modal" : ""}`}>
      <MapContainer
        center={[safeCenter.lat, safeCenter.lng]}
        zoom={13}
        scrollWheelZoom
        className="map-container"
      >
        <MapInteractionLock locked={showContactModal} />
        <Recenter center={safeCenter} zoom={13} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[safeCenter.lat, safeCenter.lng]} icon={icons.user}>
          <Popup>
            <div className="map-popup">
              <strong>{safeLabels.yourLocation}</strong>
              <span className="map-popup-meta">{safeLabels.autoCentered}</span>
            </div>
          </Popup>
        </Marker>

        {facilities.map((facility) => (
          <Marker
            key={`${facility.name}_${facility.latitude}_${facility.longitude}`}
            position={[facility.latitude, facility.longitude]}
            icon={icons[facility.category] || icons.buyer}
            eventHandlers={{
              click: () => openContactModal(facility),
            }}
          />
        ))}
      </MapContainer>

      {showContactModal ? (
        <div className="map-contact-layer" role="dialog" aria-modal="true">
          <div className="map-contact-overlay" onClick={closeContactModal} />
          <div className="map-contact-card">
            <button
              type="button"
              className="map-contact-close"
              aria-label="Close"
              onClick={closeContactModal}
            >
              ×
            </button>
            <div className="map-contact-icon">📍</div>
            <h3>{selectedFacility?.name || safeLabels.facility}</h3>
            <p className="map-contact-sub">
              {selectedFacility?.type || safeLabels.facility}
            </p>
            <div className="map-contact-actions">
              <button type="button" className="map-contact-btn primary" onClick={handleConnect}>
                {safeLabels.connect}
              </button>
              <button type="button" className="map-contact-btn ghost" onClick={handleWhatsApp}>
                {safeLabels.whatsapp}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
