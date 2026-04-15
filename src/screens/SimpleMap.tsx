import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ParkingLot, UserLocation } from '../types/parking';

interface SimpleMapProps {
  parkingLots: ParkingLot[];
  userLocation: UserLocation | null;
  selectedParking: ParkingLot | null;
  onParkingSelect: (parking: ParkingLot) => void;
}

const { width, height } = Dimensions.get('window');

const SimpleMap: React.FC<SimpleMapProps> = ({
  parkingLots,
  userLocation,
  selectedParking,
  onParkingSelect,
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

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
      console.log('Leaflet loaded successfully');
      setMapLoaded(true);
      initializeMap();
    };
    script.onerror = () => {
      console.error('Failed to load Leaflet');
    };
    document.head.appendChild(script);

    return () => {
      if (link.parentNode) link.parentNode.removeChild(link);
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.L) {
      console.log('Map ref or window.L not available');
      return;
    }

    try {
      // Clear existing map
      mapRef.current.innerHTML = '';

      // Initialize map
      const center = userLocation 
        ? [userLocation.latitude, userLocation.longitude]
        : [10.7769, 106.7009];

      const map = window.L.map(mapRef.current).setView(center, 13);

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add user location marker
      if (userLocation) {
        const userIcon = window.L.divIcon({
          html: '<div style="background: #007AFF; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px;">👤</div>',
          className: 'user-marker',
          iconSize: [30, 30],
        });
        
        window.L.marker([userLocation.latitude, userLocation.longitude], {
          icon: userIcon,
        })
        .addTo(map)
        .bindPopup('Vị trí của bạn');
      }

      // Add parking lot markers
      parkingLots.forEach(parking => {
        const availability = parking.availableSpaces / parking.totalSpaces;
        let color = '#28a745'; // Green
        let icon = '🅿️';

        if (availability < 0.1) {
          color = '#dc3545'; // Red
          icon = '🔴';
        } else if (availability < 0.3) {
          color = '#ffc107'; // Yellow
          icon = '🟡';
        }

        const parkingIcon = window.L.divIcon({
          html: `<div style="background: ${color}; border: 2px solid white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${icon}</div>`,
          className: 'parking-marker',
          iconSize: [30, 30],
        });

        const marker = window.L.marker([parking.latitude, parking.longitude], {
          icon: parkingIcon,
        })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 200px; font-family: Arial, sans-serif;">
            <h4 style="margin: 0 0 8px 0; color: #333;">${parking.name}</h4>
            <p style="margin: 4px 0; color: #666;">📍 ${parking.address}</p>
            <p style="margin: 4px 0; color: #666;">🚗 Trống: ${parking.availableSpaces}/${parking.totalSpaces}</p>
            <p style="margin: 4px 0; color: #666;">💰 ${parking.pricePerHour.toLocaleString()}đ/giờ</p>
            <p style="margin: 4px 0; color: #666;">⭐ ${parking.rating || 'N/A'}</p>
            <p style="margin: 4px 0; color: ${parking.isOpen ? '#28a745' : '#dc3545'};">${parking.isOpen ? '🟢 Đang mở' : '🔴 Đã đóng'}</p>
          </div>
        `);

        marker.on('click', () => {
          console.log('Parking selected:', parking.name);
          onParkingSelect(parking);
        });
      });

      // Center on selected parking
      if (selectedParking) {
        map.setView([selectedParking.latitude, selectedParking.longitude], 15);
      }

      console.log('Map initialized successfully with', parkingLots.length, 'parking lots');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  useEffect(() => {
    if (mapLoaded && window.L) {
      initializeMap();
    }
  }, [parkingLots, userLocation, selectedParking, mapLoaded]);

  return (
    <View style={styles.container}>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: 400,
          backgroundColor: '#f0f0f0'
        }} 
      />
      {!mapLoaded && (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>🗺️ Đang tải bản đồ...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    minHeight: 400,
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
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default SimpleMap;
