import { useEffect, useRef } from 'react';
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
  const markersRef = useRef<any[]>([]);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const container = containerRef.current;
    container.innerHTML = '';

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
      try {
        const L = (window as any).L;
        if (!L) {
          console.error('Leaflet not loaded');
          return;
        }

        let map = mapInstanceRef.current;

        if (!map) {
          container.innerHTML = '';

          // Initialize map
          const center = userLocation
            ? [userLocation.latitude, userLocation.longitude]
            : [21.0046655, 105.8443058];
          map = L.map(container).setView(center, 20);

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
          }).addTo(map);

          mapInstanceRef.current = map;
        } else {
          // Clear existing markers
          markersRef.current.forEach(marker => marker.remove());
          markersRef.current = [];
        }

        // Add user location marker
        if (userLocation) {
          const userIcon = L.divIcon({
            html: '<div style="background:#6366f1;color:white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:4px solid white;box-shadow:0 4px 12px rgba(99, 102, 241, 0.4);font-size:18px;">👤</div>',
            className: 'user-marker',
            iconSize: [40, 40],
          });

          const userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('Vị trí của bạn');

          markersRef.current.push(userMarker);
        }

        // Add parking lot markers
        parkingLots.forEach(parking => {
          const availability = parking.availableSpaces / parking.totalSpaces;
          let color = '#10b981'; // Green
          const isRecommended = recommendedParkingId === parking.id;

          if (availability < 0.1) {
            color = '#ef4444'; // Red
          } else if (availability < 0.3) {
            color = '#f59e0b'; // Amber
          }

          const parkingIcon = L.divIcon({
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

          const marker = L.marker([parking.latitude, parking.longitude], {
            icon: parkingIcon,
            zIndexOffset: isRecommended ? 1000 : 0,
          })
            .addTo(map)
            .bindPopup(`
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
            `);

          // Add click event with error handling
          marker.on('click', () => {
            try {
              console.log('Marker clicked:', parking.name);
              if (onSelectRef.current) {
                onSelectRef.current(parking);
              }
            } catch (error) {
              console.error('Error in marker click handler:', error);
            }
          });

          markersRef.current.push(marker);
        });

        console.log('Map initialized successfully');
      } catch (error) {
        console.error('Error initializing map:', error);
      }
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
    };
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
