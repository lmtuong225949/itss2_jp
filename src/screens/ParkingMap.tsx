import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ParkingLot, UserLocation } from '../types/parking';

declare global {
  interface Window {
    L: any;
  }
}

interface ParkingMapProps {
  parkingLots: ParkingLot[];
  userLocation: UserLocation | null;
  selectedParking: ParkingLot | null;
  onParkingSelect: (parking: ParkingLot) => void;
}

const ParkingMap: React.FC<ParkingMapProps> = ({
  parkingLots,
  userLocation,
  selectedParking,
  onParkingSelect,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      if (mapRef.current && window.L) {
        initializeMap();
        setMapLoaded(true);
      }
    };
    document.head.appendChild(script);

    return () => {
      if (link.parentNode) link.parentNode.removeChild(link);
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;

    // Initialize map centered on user location or default
    const center = userLocation 
      ? [userLocation.latitude, userLocation.longitude]
      : [10.7769, 106.7009]; // Default: Ho Chi Minh City center

    const map = window.L.map(mapRef.current).setView(center, 13);

    // Add OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add user location marker
    if (userLocation) {
      const userIcon = window.L.divIcon({
        html: '👤',
        className: 'user-marker',
        iconSize: [30, 30]
      });
      
      window.L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon
      })
      .addTo(map)
      .bindPopup('Vị trí của bạn');
    }

    // Add parking lot markers
    parkingLots.forEach(parking => {
      const availability = parking.availableSpaces / parking.totalSpaces;
      let color = '#28a745'; // Green - available
      let icon = '🅿️';

      if (availability < 0.1) {
        color = '#dc3545'; // Red - almost full
        icon = '🔴';
      } else if (availability < 0.3) {
        color = '#ffc107'; // Yellow - limited
        icon = '🟡';
      }

      const parkingIcon = window.L.divIcon({
        html: `<div style="background: ${color}; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px;">${icon}</div>`,
        className: 'parking-marker',
        iconSize: [30, 30]
      });

      const marker = window.L.marker([parking.latitude, parking.longitude], {
        icon: parkingIcon
      })
      .addTo(map)
      .bindPopup(`
        <div style="min-width: 200px;">
          <h4>${parking.name}</h4>
          <p>📍 ${parking.address}</p>
          <p>🚗 Trống: ${parking.availableSpaces}/${parking.totalSpaces}</p>
          <p>💰 ${parking.pricePerHour.toLocaleString()}đ/giờ</p>
          <p>⭐ ${parking.rating || 'N/A'}</p>
          <p>${parking.isOpen ? '🟢 Đang mở' : '🔴 Đã đóng'}</p>
        </div>
      `);

      marker.on('click', () => onParkingSelect(parking));
    });

    // Center on selected parking
    if (selectedParking) {
      map.setView([selectedParking.latitude, selectedParking.longitude], 15);
    }
  };

  useEffect(() => {
    if (mapLoaded && window.L) {
      initializeMap();
    }
  }, [parkingLots, userLocation, selectedParking, mapLoaded]);

  return (
    <View style={styles.container}>
      <div ref={mapRef} style={styles.map} />
      {!mapLoaded && (
        <View style={styles.loading}>
          <Text>Đang tải bản đồ...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    height: '100%',
    width: '100%',
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ParkingMap;
