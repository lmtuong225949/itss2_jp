import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ParkingLot, UserLocation } from '../types/parking';
import { useTheme } from '../contexts/ThemeContext';
import { localizeParkingLot } from '../utils/localization';

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
  const { language } = useTheme();

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
    const isUserInHanoi = userLocation &&
                          userLocation.latitude >= 20.94 &&
                          userLocation.latitude <= 21.07 &&
                          userLocation.longitude >= 105.77 &&
                          userLocation.longitude <= 105.91;

    const center = isUserInHanoi
      ? [userLocation.latitude, userLocation.longitude]
      : [21.0046655, 105.8443058];

    const hanoiBounds = [
      [20.94, 105.77], // South-West (SW)
      [21.07, 105.91]  // North-East (NE)
    ];

    const map = window.L.map(mapRef.current, {
      maxBounds: hanoiBounds,
      maxBoundsViscosity: 1.0
    }).setView(center, 13);

    // Add OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Dynamically calculate and restrict zoom so the visible area does not exceed 100 km²
    const limitZoomTo100Km2 = () => {
      if (!map) return;
      const size = map.getSize();
      if (size.x === 0 || size.y === 0) return;

      const centerLatLng = map.getCenter();
      const cosLat = Math.cos(centerLatLng.lat * Math.PI / 180);

      // 100 km2 is 100,000,000 m2.
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
      const displayParking = localizeParkingLot(parking, language);
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
          <h4>${displayParking.name}</h4>
          <p>📍 ${displayParking.address}</p>
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
