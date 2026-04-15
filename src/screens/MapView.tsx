import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { ParkingLot, UserLocation } from '../types/parking';

interface MapProps {
  parkingLots: ParkingLot[];
  userLocation: UserLocation | null;
  onSelect: (parking: ParkingLot) => void;
}

export default function MapView({ parkingLots, userLocation, onSelect }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const container = containerRef.current;
    container.innerHTML = '';

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

        // Initialize map
        const center = userLocation 
          ? [userLocation.latitude, userLocation.longitude] 
          : [10.7769, 106.7009];
        const map = L.map(container).setView(center, 13);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        // Add user location marker
        if (userLocation) {
          const userIcon = L.divIcon({
            html: '<div style="background:#6366f1;color:white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:4px solid white;box-shadow:0 4px 12px rgba(99, 102, 241, 0.4);font-size:18px;">👤</div>',
            className: 'user-marker',
            iconSize: [40, 40],
          });
          
          L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('Vị trí của bạn');
        }

        // Add parking lot markers
        parkingLots.forEach(parking => {
          const availability = parking.availableSpaces / parking.totalSpaces;
          let color = '#10b981'; // Green
          
          if (availability < 0.1) {
            color = '#ef4444'; // Red
          } else if (availability < 0.3) {
            color = '#f59e0b'; // Amber
          }

          const parkingIcon = L.divIcon({
            html: `<div style="background:${color};color:white;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:4px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-weight:bold;font-size:15px;">${parking.availableSpaces}</div>`,
            className: 'parking-marker',
            iconSize: [44, 44],
          });

          const marker = L.marker([parking.latitude, parking.longitude], { icon: parkingIcon })
            .addTo(map)
            .bindPopup(`
              <div style="min-width: 240px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <div style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                  ${parking.name}
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
                  <span style="color: #64748b; font-size: 14px;">🚗 Chỗ trống:</span>
                  <span style="font-weight: 700; color: ${color}; font-size: 15px;">${parking.availableSpaces}/${parking.totalSpaces}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
                  <span style="color: #64748b; font-size: 14px;">💰 Giá:</span>
                  <span style="font-weight: 700; color: #6366f1; font-size: 15px;">${parking.pricePerHour.toLocaleString('vi-VN')}đ/giờ</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
                  <span style="color: #64748b; font-size: 14px;">📍 Khoảng cách:</span>
                  <span style="font-weight: 600; color: #1e293b; font-size: 15px;">${parking.distance ? parking.distance.toFixed(1) + 'km' : '---'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
                  <span style="color: #64748b; font-size: 14px;">⭐ Đánh giá:</span>
                  <span style="font-weight: 600; color: #1e293b; font-size: 15px;">${parking.rating ? '⭐ ' + parking.rating.toFixed(1) : 'N/A'}</span>
                </div>
                <div style="margin-top: 12px; padding-top: 12px; border-top: 2px solid #e2e8f0;">
                  <span style="display: inline-block; padding: 6px 12px; background: ${parking.isOpen ? '#ecfdf5' : '#fef2f2'}; color: ${parking.isOpen ? '#059669' : '#dc2626'}; border-radius: 8px; font-size: 13px; font-weight: 700;">
                    ${parking.isOpen ? '● ĐANG MỞ' : '● ĐÃ ĐÓNG'}
                  </span>
                </div>
              </div>
            `);

          // Add click event with error handling
          marker.on('click', () => {
            try {
              console.log('Marker clicked:', parking.name);
              if (onSelect && typeof onSelect === 'function') {
                onSelect(parking);
              } else {
                console.error('onSelect is not a function');
              }
            } catch (error) {
              console.error('Error in marker click handler:', error);
            }
          });
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
    };
  }, [parkingLots, userLocation, onSelect]);

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
