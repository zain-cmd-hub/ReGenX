"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
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

function MapSizeUpdater({ active }) {
  const map = useMap();

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 120);
    return () => clearTimeout(timer);
  }, [active, map]);

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

export default memo(function MapView({ facilities, center, onConnect, labels }) {
  const safeCenter = useMemo(() => center || { lat: 28.6139, lng: 77.2090 }, [center]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const safeLabels = useMemo(() => labels || {
    yourLocation: "Your location",
    autoCentered: "Auto-centered",
    connect: "Connect",
    whatsapp: "WhatsApp",
    facility: "Facility",
    close: "Close",
  }, [labels]);
  const centerPos = useMemo(() => [safeCenter.lat, safeCenter.lng], [safeCenter.lat, safeCenter.lng]);
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

  const openContactModal = useCallback((facility) => {
    setShowContactModal((prev) => {
      if (prev) return prev;
      setSelectedFacility(facility);
      return true;
    });
  }, []);

  const closeContactModal = useCallback(() => {
    setShowContactModal(false);
    setSelectedFacility(null);
  }, []);

  const handleConnect = useCallback(() => {
    if (!selectedFacility) return;
    onConnect?.(selectedFacility);
    setShowContactModal(false);
    setSelectedFacility(null);
  }, [selectedFacility, onConnect]);

  const handleWhatsApp = useCallback(() => {
    if (!selectedFacility?.whatsappLink) return;
    window.open(selectedFacility.whatsappLink, "_blank", "noopener,noreferrer");
    setShowContactModal(false);
    setSelectedFacility(null);
  }, [selectedFacility]);

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
        <div className="map-modal-layer" role="dialog" aria-modal="true">
          <div className="map-modal-overlay" onClick={closeContactModal} />
          <div className="map-modal-card">
            <button
              type="button"
              className="map-modal-close"
              aria-label="Close"
              onClick={closeContactModal}
            >
              ×
            </button>
            <div className="map-modal-header">
              <div className="map-modal-title">
                {selectedFacility?.name || safeLabels.facility}
              </div>
              <div className="map-modal-meta">
                {selectedFacility?.distance ? `${selectedFacility.distance} km away` : selectedFacility?.type || safeLabels.facility}
              </div>
            </div>
            <div className="map-modal-icon">
              <iconify-icon icon="logos:whatsapp-icon" />
            </div>
            <div className="map-modal-map">
              <MapContainer
                center={[
                  selectedFacility?.latitude || safeCenter.lat,
                  selectedFacility?.longitude || safeCenter.lng,
                ]}
                zoom={13}
                scrollWheelZoom
                className="map-modal-map-inner"
              >
                <MapSizeUpdater active={showContactModal} />
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
                {selectedFacility ? (
                  <Marker
                    position={[selectedFacility.latitude, selectedFacility.longitude]}
                    icon={icons[selectedFacility.category] || icons.buyer}
                  />
                ) : null}
              </MapContainer>
            </div>
            <div className="map-modal-actions">
              <button type="button" className="map-modal-btn primary" onClick={handleConnect}>
                {safeLabels.connect}
              </button>
              <button type="button" className="map-modal-btn ghost" onClick={handleWhatsApp}>
                {safeLabels.whatsapp}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
});