import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ParkingLot, UserLocation } from '../types/parking';
import { formatDistance } from '../utils/helpers';

interface MapProps {
  parkingLots: ParkingLot[];
  userLocation: UserLocation | null;
  recommendedParkingId?: string;
  onSelect: (parking: ParkingLot) => void;
}

const MAP_STYLE_ID = 'parking-map-animations';

export default function MapView({ parkingLots, userLocation, recommendedParkingId, onSelect }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Keep track of Leaflet markers without re-creating the map
  const parkingMarkersRef = useRef<Map<string, any>>(new Map());
  const userMarkerRef = useRef<any>(null);

  // Sync refs to avoid stale closures in timeouts and Leaflet events
  const userLocationRef = useRef(userLocation);
  const parkingLotsRef = useRef(parkingLots);
  const recommendedParkingIdRef = useRef(recommendedParkingId);
  const onSelectRef = useRef(onSelect);

  userLocationRef.current = userLocation;
  parkingLotsRef.current = parkingLots;
  recommendedParkingIdRef.current = recommendedParkingId;
  onSelectRef.current = onSelect;

  const updateMarkers = (map: any) => {
    if (!map || !window.L) return;

    const currentUserLocation = userLocationRef.current;
    const currentParkingLots = parkingLotsRef.current;
    const currentRecommendedId = recommendedParkingIdRef.current;

    // Update user location marker
    if (currentUserLocation) {
      const userIcon = window.L.divIcon({
        html: '<div style="background:#6366f1;color:white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:4px solid white;box-shadow:0 4px 12px rgba(99, 102, 241, 0.4);font-size:18px;">👤</div>',
        className: 'user-marker',
        iconSize: [40, 40],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([currentUserLocation.latitude, currentUserLocation.longitude]);
        userMarkerRef.current.setIcon(userIcon);
      } else {
        const userMarker = window.L.marker([currentUserLocation.latitude, currentUserLocation.longitude], { icon: userIcon })
          .addTo(map)
          .bindPopup('Vị trí của bạn');
        userMarkerRef.current = userMarker;
      }
    } else {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    }

    // Keep track of current parking lot IDs to remove obsolete ones
    const currentIds = new Set(currentParkingLots.map(p => p.id));

    // Remove markers that are no longer in parkingLots
    parkingMarkersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        parkingMarkersRef.current.delete(id);
      }
    });

    // Add or update parking lot markers
    currentParkingLots.forEach((parking) => {
      const availability = parking.availableSpaces / parking.totalSpaces;
      let color = '#10b981'; // Green
      const isRecommended = currentRecommendedId === parking.id;

      if (availability < 0.1) {
        color = '#ef4444'; // Red
      } else if (availability < 0.3) {
        color = '#f59e0b'; // Amber
      }

      const parkingIcon = window.L.divIcon({
        html: isRecommended
          ? `
            <div class="recommended-marker">
              <div class="recommended-pulse"></div>
              <div class="recommended-badge" style="background:#0ea5e9;">${parking.availableSpaces}</div>
            </div>
          `
          : `<div style="background:${color};color:white;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:4px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-weight:bold;font-size:15px;">${parking.availableSpaces}</div>`,
        className: isRecommended ? 'parking-marker recommended' : 'parking-marker',
        iconSize: isRecommended ? [52, 52] : [44, 44],
      });

      const popupContent = `
        <div style="min-width: 240px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
            ${parking.name}
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
            <span style="color: #64748b; font-size: 14px;">Chỗ trống:</span>
            <span style="font-weight: 700; color: ${color}; font-size: 15px;">${parking.availableSpaces}/${parking.totalSpaces}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
            <span style="color: #64748b; font-size: 14px;">Giá:</span>
            <span style="font-weight: 700; color: #6366f1; font-size: 15px;">${parking.pricePerHour.toLocaleString('vi-VN')}đ/Lượt</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
            <span style="color: #64748b; font-size: 14px;">Khoảng cách:</span>
            <span style="font-weight: 600; color: #1e293b; font-size: 15px;">${parking.distance ? formatDistance(parking.distance) : '---'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
            <span style="color: #64748b; font-size: 14px;">Đánh giá:</span>
            <span style="font-weight: 600; color: #1e293b; font-size: 15px;">${parking.rating ? '⭐ ' + parking.rating.toFixed(1) : 'N/A'}</span>
          </div>
          <div style="margin-top: 12px; padding-top: 12px; border-top: 2px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
            <span style="display: inline-block; padding: 6px 12px; background: ${parking.isOpen ? '#ecfdf5' : '#fef2f2'}; color: ${parking.isOpen ? '#059669' : '#dc2626'}; border-radius: 8px; font-size: 13px; font-weight: 700;">
              ${parking.isOpen ? '● ĐANG MỞ' : '● ĐÃ ĐÓNG'}
            </span>
            <button onclick="window.showParkingDetails('${parking.id}')" style="background:#5B45D9;color:#fff;border:none;border-radius:8px;padding:6px 12px;font-weight:700;cursor:pointer;font-size:13px;box-shadow:0 2px 4px rgba(91,69,217,0.2);">Chi tiết →</button>
          </div>
        </div>
      `;

      let marker = parkingMarkersRef.current.get(parking.id);

      if (marker) {
        marker.setLatLng([parking.latitude, parking.longitude]);
        marker.setIcon(parkingIcon);
        marker.setPopupContent(popupContent);
        marker.setZIndexOffset(isRecommended ? 1000 : 0);
      } else {
        marker = window.L.marker([parking.latitude, parking.longitude], {
          icon: parkingIcon,
          zIndexOffset: isRecommended ? 1000 : 0,
        })
          .addTo(map)
          .bindPopup(popupContent);

        marker.on('click', () => {
          try {
            console.log('Marker clicked:', parking.name);
            if (onSelectRef.current) {
              const latest = parkingLotsRef.current.find(p => p.id === parking.id) || parking;
              onSelectRef.current(latest);
            }
          } catch (error) {
            console.error('Error in marker click handler:', error);
          }
        });

        parkingMarkersRef.current.set(parking.id, marker);
      }
    });
  };

  const initializeMap = () => {
    if (!containerRef.current || !window.L) {
      console.log('Map container or Leaflet not available');
      return;
    }
    // Only initialize the base map once
    if (mapInstanceRef.current) {
      return;
    }

    try {
      console.log('Initializing map...');
      containerRef.current.innerHTML = '';

      const currentUserLocation = userLocationRef.current;
      const isUserInHanoi = currentUserLocation &&
                            currentUserLocation.latitude >= 20.94 &&
                            currentUserLocation.latitude <= 21.07 &&
                            currentUserLocation.longitude >= 105.77 &&
                            currentUserLocation.longitude <= 105.91;

      const center = isUserInHanoi
        ? [currentUserLocation.latitude, currentUserLocation.longitude]
        : [21.0046655, 105.8443058];

      const hanoiBounds = [
        [20.94, 105.77], // South-West (SW)
        [21.07, 105.91]  // North-East (NE)
      ];

      const map = window.L.map(containerRef.current, {
        maxBounds: hanoiBounds,
        maxBoundsViscosity: 1.0
      }).setView(center, 20);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Dynamically calculate and restrict zoom so the visible area does not exceed 100 km²
      const limitZoomTo100Km2 = () => {
        if (!map) return;
        const size = map.getSize();
        if (size.x === 0 || size.y === 0) return;

        const centerLatLng = map.getCenter();
        const cosLat = Math.cos(centerLatLng.lat * Math.PI / 180);

        // 100 km2 is 100,000,000 m2.
        // We want the area of the viewport to be <= 100,000,000 m2.
        // Area = width_px * height_px * resolution^2
        // resolution = 156543.03392 * cosLat / 2^zoom
        // So Area = width_px * height_px * (156543.03392 * cosLat)^2 / 2^(2*zoom) <= 100,000,000
        // 2^(2*zoom) >= width_px * height_px * (156543.03392 * cosLat)^2 / 100,000,000
        // 2^zoom >= sqrt(width_px * height_px) * 156543.03392 * cosLat / 10,000
        // zoom >= log2(sqrt(width_px * height_px) * 156543.03392 * cosLat / 10,000)
        const val = (Math.sqrt(size.x * size.y) * 156543.03392 * cosLat) / 10000;
        let minZoom = Math.ceil(Math.log2(val));

        // Clamp minZoom to standard Leaflet zoom levels
        minZoom = Math.max(0, Math.min(19, minZoom));

        if (map.getMinZoom() !== minZoom) {
          map.setMinZoom(minZoom);
        }

        if (map.getZoom() < minZoom) {
          map.setZoom(minZoom);
        }
      };

      map.whenReady(() => {
        limitZoomTo100Km2();
      });

      map.on('resize', limitZoomTo100Km2);
      map.on('moveend', limitZoomTo100Km2);

      mapInstanceRef.current = map;
      console.log('Base map created');

      updateMarkers(map);
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const initializeMapRef = useRef(initializeMap);
  initializeMapRef.current = initializeMap;

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    if (!document.getElementById(MAP_STYLE_ID)) {
      const style = document.createElement('style');
      style.id = MAP_STYLE_ID;
      style.textContent = `
        @keyframes recommendedPulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          70% { transform: scale(1.6); opacity: 0.0; }
          100% { transform: scale(1.6); opacity: 0.0; }
        }
        .recommended-marker { position: relative; width: 52px; height: 52px; }
        .recommended-pulse {
          position: absolute;
          top: -6px;
          left: -6px;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(14, 165, 233, 0.35);
          animation: recommendedPulse 1.6s ease-out infinite;
          z-index: 1;
        }
        .recommended-badge {
          position: absolute;
          top: 6px;
          left: 6px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          border: 4px solid white;
          box-shadow: 0 6px 16px rgba(14, 165, 233, 0.45);
          z-index: 2;
          font-size: 15px;
        }
      `;
      document.head.appendChild(style);
    }

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

    script.onload = () => {
      console.log('Leaflet script loaded');
      setMapLoaded(true);
      setTimeout(() => {
        if (initializeMapRef.current) {
          initializeMapRef.current();
        }
      }, 100);
    };

    script.onerror = () => {
      console.error('Failed to load Leaflet script');
    };

    document.head.appendChild(script);

    return () => {
      if (link.parentNode) link.remove();
      if (script.parentNode) script.remove();
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.error('Error removing map instance:', e);
        }
        mapInstanceRef.current = null;
      }
      parkingMarkersRef.current.clear();
      userMarkerRef.current = null;
    };
  }, []);

  // Update markers when parking lots, recommended parking, or user location changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers(mapInstanceRef.current);
    }
  }, [parkingLots, recommendedParkingId, userLocation]);

  return (
    <View style={styles.container}>
      <div ref={containerRef} style={styles.map} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    overflow: 'hidden',
  },
});
