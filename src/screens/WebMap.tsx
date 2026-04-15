import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ParkingLot, UserLocation } from '../types/parking';

declare global {
  interface Window {
    L: any;
  }
}

interface WebMapProps {
  parkingLots: ParkingLot[];
  userLocation: UserLocation | null;
  selectedParking: ParkingLot | null;
  onParkingSelect: (parking: ParkingLot) => void;
}

const WebMap: React.FC<WebMapProps> = ({
  parkingLots,
  userLocation,
  selectedParking,
  onParkingSelect,
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMap = async () => {
      try {
        setError(null);
        
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Wait for CSS to load
        await new Promise(resolve => setTimeout(resolve, 100));

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        
        script.onload = () => {
          console.log('✅ Leaflet loaded successfully');
          setMapLoaded(true);
          setTimeout(initializeMap, 100);
        };
        
        script.onerror = () => {
          console.error('❌ Failed to load Leaflet');
          setError('Không thể tải bản đồ');
        };
        
        document.head.appendChild(script);

      } catch (err) {
        console.error('❌ Error loading map:', err);
        setError('Lỗi tải bản đồ');
      }
    };

    loadMap();

    return () => {
      // Cleanup
      const link = document.querySelector('link[href*="leaflet"]');
      const script = document.querySelector('script[src*="leaflet"]');
      if (link) link.remove();
      if (script) script.remove();
    };
  }, []);

  const initializeMap = () => {
    if (!mapContainerRef.current || !window.L) {
      console.log('❌ Map container or Leaflet not available');
      return;
    }

    try {
      console.log('🗺️ Initializing map...');
      console.log('📍 User location:', userLocation);
      console.log('🅿️ Parking lots:', parkingLots.length);

      // Clear existing content
      mapContainerRef.current.innerHTML = '';

      // Initialize map
      const center = userLocation 
        ? [userLocation.latitude, userLocation.longitude]
        : [10.7769, 106.7009];

      const map = window.L.map(mapContainerRef.current).setView(center, 13);

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      console.log('🗺️ Base map created');

      // Add user location marker
      if (userLocation) {
        const userIcon = window.L.divIcon({
          html: '<div style="background: #007AFF; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">👤</div>',
          className: 'user-marker',
          iconSize: [30, 30],
        });
        
        window.L.marker([userLocation.latitude, userLocation.longitude], {
          icon: userIcon,
        })
        .addTo(map)
        .bindPopup('Vị trí của bạn');
        
        console.log('👤 User marker added');
      }

      // Add parking lot markers
      parkingLots.forEach((parking, index) => {
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
          console.log('🅿️ Parking selected:', parking.name);
          onParkingSelect(parking);
        });

        console.log(`🅿️ Parking marker ${index + 1} added: ${parking.name}`);
      });

      // Center on selected parking
      if (selectedParking) {
        map.setView([selectedParking.latitude, selectedParking.longitude], 15);
        console.log('🎯 Centered on selected parking:', selectedParking.name);
      }

      console.log('✅ Map initialized successfully!');

    } catch (error) {
      console.error('❌ Error initializing map:', error);
      setError('Lỗi khởi tạo bản đồ');
    }
  };

  useEffect(() => {
    if (mapLoaded && window.L) {
      initializeMap();
    }
  }, [parkingLots, userLocation, selectedParking, mapLoaded]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <Text style={styles.errorSubtext}>Vui lòng thử lại hoặc kiểm tra kết nối mạng</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <div 
        ref={mapContainerRef}
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: 400,
          backgroundColor: '#f0f0f0',
          position: 'relative'
        }} 
      />
      {!mapLoaded && (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>🗺️ Đang tải bản đồ...</Text>
          <Text style={styles.loadingSubtext}>Vui lòng đợi trong giây lát</Text>
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
    backgroundColor: '#f5f5f5',
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default WebMap;
