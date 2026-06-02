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
  const mapInstanceRef = useRef<any>(null);

  // Keep track of Leaflet markers without re-creating the map
  const parkingMarkersRef = useRef<Map<string, any>>(new Map());
  const userMarkerRef = useRef<any>(null);

  // Sync refs to avoid stale closures in timeouts and Leaflet events
  const userLocationRef = useRef(userLocation);
  const parkingLotsRef = useRef(parkingLots);
  const selectedParkingRef = useRef(selectedParking);
  const onParkingSelectRef = useRef(onParkingSelect);

  userLocationRef.current = userLocation;
  parkingLotsRef.current = parkingLots;
  selectedParkingRef.current = selectedParking;
  onParkingSelectRef.current = onParkingSelect;

  const updateMarkers = (map: any) => {
    if (!map || !window.L) return;

    const currentUserLocation = userLocationRef.current;
    const currentParkingLots = parkingLotsRef.current;

    // Update user location marker
    if (currentUserLocation) {
      const userIcon = window.L.divIcon({
        html: '<div style="background: #007AFF; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">👤</div>',
        className: 'user-marker',
        iconSize: [30, 30],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([currentUserLocation.latitude, currentUserLocation.longitude]);
        userMarkerRef.current.setIcon(userIcon);
      } else {
        const userMarker = window.L.marker([currentUserLocation.latitude, currentUserLocation.longitude], {
          icon: userIcon,
        })
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
    currentParkingLots.forEach((parking, index) => {
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

      const popupContent = `
        <div style="min-width: 200px; font-family: Arial, sans-serif;">
          <h4 style="margin: 0 0 8px 0; color: #333;">${parking.name}</h4>
          <p style="margin: 4px 0; color: #666;">${parking.address}</p>
          <p style="margin: 4px 0; color: #666;">Trống: ${parking.availableSpaces}/${parking.totalSpaces}</p>
          <p style="margin: 4px 0; color: #666;">${parking.pricePerHour.toLocaleString()}đ/lượt</p>
          <p style="margin: 4px 0; color: #666;">Đánh giá: ${parking.rating || 'N/A'}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
            <span style="color: ${parking.isOpen ? '#28a745' : '#dc3545'}; font-weight: bold;">${parking.isOpen ? 'Đang mở' : 'Đã đóng'}</span>
            <button onclick="window.showParkingDetails('${parking.id}')" style="background:#5B45D9;color:#fff;border:none;border-radius:6px;padding:4px 8px;font-weight:bold;cursor:pointer;font-size:12px;">Chi tiết →</button>
          </div>
        </div>
      `;

      let marker = parkingMarkersRef.current.get(parking.id);

      if (marker) {
        // Update existing marker in place
        marker.setLatLng([parking.latitude, parking.longitude]);
        marker.setIcon(parkingIcon);
        marker.setPopupContent(popupContent);
      } else {
        // Create new marker
        marker = window.L.marker([parking.latitude, parking.longitude], {
          icon: parkingIcon,
        })
          .addTo(map)
          .bindPopup(popupContent);

        marker.on('click', () => {
          console.log('Parking selected:', parking.name);
          if (onParkingSelectRef.current) {
            const latest = parkingLotsRef.current.find(p => p.id === parking.id) || parking;
            onParkingSelectRef.current(latest);
          }
        });

        parkingMarkersRef.current.set(parking.id, marker);
        console.log(`Parking marker ${index + 1} added: ${parking.name}`);
      }
    });
  };

  const initializeMap = () => {
    if (!mapContainerRef.current || !window.L) {
      console.log('Map container or Leaflet not available');
      return;
    }
    // Only initialize the base map once
    if (mapInstanceRef.current) {
      return;
    }

    try {
      console.log('Initializing map...');

      // Clear existing content only once
      mapContainerRef.current.innerHTML = '';

      // Initialize map
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

      const map = window.L.map(mapContainerRef.current, {
        maxBounds: hanoiBounds,
        maxBoundsViscosity: 1.0
      }).setView(center, 13);

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
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

      mapInstanceRef.current = map;
      console.log('Base map created');

      // Add markers
      updateMarkers(map);

      // Center on selected parking initially if it exists
      const currentSelectedParking = selectedParkingRef.current;
      if (currentSelectedParking) {
        map.setView([currentSelectedParking.latitude, currentSelectedParking.longitude], 15);
      }

      console.log('Map initialized successfully!');

    } catch (error) {
      console.error(' Error initializing map:', error);
      setError('Lỗi khởi tạo bản đồ');
    }
  };

  const initializeMapRef = useRef(initializeMap);
  initializeMapRef.current = initializeMap;

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
          console.log('Leaflet loaded successfully');
          setMapLoaded(true);
          setTimeout(() => {
            if (initializeMapRef.current) {
              initializeMapRef.current();
            }
          }, 100);
        };

        script.onerror = () => {
          console.error('Failed to load Leaflet');
          setError('Không thể tải bản đồ');
        };

        document.head.appendChild(script);

      } catch (err) {
        console.error('Error loading map:', err);
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

  // Update markers when parking lots or user location changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers(mapInstanceRef.current);
    }
  }, [parkingLots, userLocation]);

  // Center on selected parking when selectedParking changes
  useEffect(() => {
    if (mapInstanceRef.current && selectedParking) {
      mapInstanceRef.current.setView([selectedParking.latitude, selectedParking.longitude], 15);
    }
  }, [selectedParking]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}> {error}</Text>
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
          <Text style={styles.loadingText}> Đang tải bản đồ...</Text>
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
