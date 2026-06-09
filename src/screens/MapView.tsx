import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ParkingLot, UserLocation, Destination } from '../types/parking';
import { formatDistance } from '../utils/helpers';
import { mockDestinations } from '../data/destinationData';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../utils/translations';
import { getLocalizedText } from '../utils/localization';

const fetchRoute = async (
  start: UserLocation,
  end: UserLocation,
  profile: 'cycling' | 'foot'
): Promise<[number, number][] | null> => {
  try {
    // Use routing.openstreetmap.de per-profile servers:
    // routed-bike  → cycling/motorbike — uses service roads & internal campus paths
    // routed-foot  → pedestrian — follows footpaths & sidewalks
    const url = profile === 'foot'
      ? `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      : `https://routing.openstreetmap.de/routed-bike/route/v1/bike/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return null;
    }
    return data.routes[0].geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]] // Leaflet uses [lat, lng]
    );
  } catch (error) {
    console.error('Error fetching route:', error);
    return null;
  }
};

interface MapProps {
  selectedParking?: ParkingLot | null;
  parkingLots: ParkingLot[];
  userLocation: UserLocation | null;
  recommendedParkingId?: string;
  onSelect: (parking: ParkingLot) => void;
  destinationLocation?: UserLocation | null;
  destinationName?: string | null;
  onMapClick?: (latitude: number, longitude: number) => void;
  showAllDestinations?: boolean;
  destinationsList?: Destination[];
  onUpdateDestinationCoords?: (id: string, lat: number, lon: number) => void;
  editParkingMode?: boolean;
  onUpdateParkingCoords?: (id: string, lat: number, lon: number) => void;
  onSelectRouteParking?: (id: string) => void;
  activeCriteria?: 'balanced' | 'closest' | 'cheapest' | 'empty';
  onCriteriaChange?: (criteria: 'balanced' | 'closest' | 'cheapest' | 'empty') => void;
  onUpdateUserLocation?: (location: UserLocation) => void;
}

const MAP_STYLE_ID = 'parking-map-animations';

export default function MapView({
  selectedParking,
  parkingLots,
  userLocation,
  recommendedParkingId,
  onSelect,
  destinationLocation,
  destinationName,
  onMapClick,
  showAllDestinations = false,
  destinationsList = [],
  onUpdateDestinationCoords,
  editParkingMode = false,
  onUpdateParkingCoords,
  onSelectRouteParking,
  activeCriteria = 'balanced',
  onCriteriaChange,
  onUpdateUserLocation,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const { colors, language } = useTheme();
  const t = useTranslation(language);
  const criteriaKeys: ('balanced' | 'closest' | 'cheapest' | 'empty')[] = ['balanced', 'closest', 'cheapest', 'empty'];
  const [mapLoaded, setMapLoaded] = useState(false);
  const fittedDestinationsRef = useRef(false);
  const fittedParkingRef = useRef(false);
  const lastFittedRouteKeyRef = useRef<string>('');

  // Keep track of Leaflet markers without re-creating the map
  const parkingMarkersRef = useRef<Map<string, any>>(new Map());
  const userMarkerRef = useRef<any>(null);
  const destinationMarkerRef = useRef<any>(null);
  const routesRef = useRef<any[]>([]);
  const allDestinationsMarkersRef = useRef<Map<string, any>>(new Map());

  const [drivingRoute, setDrivingRoute] = useState<[number, number][] | null>(null);
  const [walkingRoute, setWalkingRoute] = useState<[number, number][] | null>(null);

  const currentTargetParking = parkingLots.find(p => p.id === recommendedParkingId) || parkingLots[0];

  // Sync refs to avoid stale closures in timeouts and Leaflet events
  const selectedParkingRef = useRef(selectedParking);
  const userLocationRef = useRef(userLocation);
  const parkingLotsRef = useRef(parkingLots);
  const recommendedParkingIdRef = useRef(recommendedParkingId);
  const onSelectRef = useRef(onSelect);
  const destinationLocationRef = useRef(destinationLocation);
  const destinationNameRef = useRef(destinationName);
  const onMapClickRef = useRef(onMapClick);
  const drivingRouteRef = useRef(drivingRoute);
  const walkingRouteRef = useRef(walkingRoute);
  const showAllDestinationsRef = useRef(showAllDestinations);
  const destinationsListRef = useRef(destinationsList);
  const onUpdateDestinationCoordsRef = useRef(onUpdateDestinationCoords);
  const editParkingModeRef = useRef(editParkingMode);
  const onUpdateParkingCoordsRef = useRef(onUpdateParkingCoords);
  const onSelectRouteParkingRef = useRef(onSelectRouteParking);
  const onUpdateUserLocationRef = useRef(onUpdateUserLocation);

  selectedParkingRef.current = selectedParking;
  userLocationRef.current = userLocation;
  parkingLotsRef.current = parkingLots;
  recommendedParkingIdRef.current = recommendedParkingId;
  onSelectRef.current = onSelect;
  destinationLocationRef.current = destinationLocation;
  destinationNameRef.current = destinationName;
  onMapClickRef.current = onMapClick;
  drivingRouteRef.current = drivingRoute;
  walkingRouteRef.current = walkingRoute;
  showAllDestinationsRef.current = showAllDestinations;
  destinationsListRef.current = destinationsList;
  onUpdateDestinationCoordsRef.current = onUpdateDestinationCoords;
  editParkingModeRef.current = editParkingMode;
  onUpdateParkingCoordsRef.current = onUpdateParkingCoords;
  onSelectRouteParkingRef.current = onSelectRouteParking;
  onUpdateUserLocationRef.current = onUpdateUserLocation;

  useEffect(() => {
    (window as any).showParkingDetails = (id: string) => {
      const parking = parkingLotsRef.current.find(p => p.id === id);
      if (parking && onSelectRef.current) {
        onSelectRef.current(parking);
      }
    };
    (window as any).setActiveRouteParking = (id: string) => {
      if (onSelectRouteParkingRef.current) {
        onSelectRouteParkingRef.current(id);
      }
    };
    return () => {
      delete (window as any).showParkingDetails;
      delete (window as any).setActiveRouteParking;
    };
  }, []);

  const updateMarkers = (map: any) => {
    if (!map || !window.L) return;

    const currentUserLocation = userLocationRef.current;
    const currentParkingLots = parkingLotsRef.current;
    const currentRecommendedId = recommendedParkingIdRef.current;
    const currentDestinationLocation = destinationLocationRef.current;
    const currentDestinationName = destinationNameRef.current;

    const currentShowAll = showAllDestinationsRef.current;
    const currentEditParkingMode = editParkingModeRef.current;
    const isDebugging = currentShowAll || currentEditParkingMode;

    // Update user location marker
    if (currentUserLocation && !isDebugging) {
      const userIcon = window.L.divIcon({
        html: `
          <div class="user-pulse-container">
            <div class="user-pulse-ring"></div>
            <div class="user-pulse-dot"></div>
          </div>
        `,
        className: 'user-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([currentUserLocation.latitude, currentUserLocation.longitude]);
        userMarkerRef.current.setIcon(userIcon);
        if (userMarkerRef.current.dragging) {
          userMarkerRef.current.dragging.enable();
        }
      } else {
        const userMarker = window.L.marker([currentUserLocation.latitude, currentUserLocation.longitude], {
          icon: userIcon,
          draggable: true
        })
          .addTo(map)
          .bindPopup('Vị trí của bạn (Kéo để di chuyển vị trí giả lập)');
        
        userMarker.on('dragend', (e: any) => {
          const latLng = e.target.getLatLng();
          if (onUpdateUserLocationRef.current) {
            onUpdateUserLocationRef.current({
              latitude: parseFloat(latLng.lat.toFixed(6)),
              longitude: parseFloat(latLng.lng.toFixed(6))
            });
          }
        });
        
        userMarkerRef.current = userMarker;
      }
    } else {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    }

    // Update destination marker
    if (currentDestinationLocation && !isDebugging) {
      const destIcon = window.L.divIcon({
        html: `
          <div class="destination-pin-container">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
              <circle cx="12" cy="9" r="3" fill="#ffffff"/>
            </svg>
          </div>
        `,
        className: 'destination-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setLatLng([currentDestinationLocation.latitude, currentDestinationLocation.longitude]);
        destinationMarkerRef.current.setIcon(destIcon);
        destinationMarkerRef.current.setPopupContent(currentDestinationName || 'Điểm đến');
      } else {
        const destMarker = window.L.marker([currentDestinationLocation.latitude, currentDestinationLocation.longitude], { icon: destIcon })
          .addTo(map)
          .bindPopup(currentDestinationName || 'Điểm đến');
        destinationMarkerRef.current = destMarker;
      }
    } else {
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.remove();
        destinationMarkerRef.current = null;
      }
    }

    // Keep track of current parking lot IDs to remove obsolete ones
    const currentIds = new Set(currentParkingLots.map(p => p.id));

    // Remove markers that are no longer in parkingLots (or all of them in landmark debug mode)
    parkingMarkersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id) || (currentShowAll && !currentEditParkingMode)) {
        marker.remove();
        parkingMarkersRef.current.delete(id);
      }
    });

    // Add or update parking lot markers
    if (!currentShowAll || currentEditParkingMode) {
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

        let marker = parkingMarkersRef.current.get(parking.id);

        if (marker) {
          marker.setLatLng([parking.latitude, parking.longitude]);
          marker.setIcon(parkingIcon);
          marker.setZIndexOffset(isRecommended ? 1000 : 0);
          if (marker.getPopup()) {
            marker.unbindPopup();
          }
          
          marker.off('click');
          marker.on('click', () => {
            if (editParkingModeRef.current) return;
            try {
              if (onSelectRouteParkingRef.current) {
                onSelectRouteParkingRef.current(parking.id);
              }
              if (onSelectRef.current) {
                const latest = parkingLotsRef.current.find(p => p.id === parking.id) || parking;
                onSelectRef.current(latest);
              }
            } catch (error) {
              console.error('Error in marker click handler:', error);
            }
          });
          
          if (currentEditParkingMode) {
            if (marker.dragging) marker.dragging.enable();
          } else {
            if (marker.dragging) marker.dragging.disable();
          }
        } else {
          marker = window.L.marker([parking.latitude, parking.longitude], {
            icon: parkingIcon,
            zIndexOffset: isRecommended ? 1000 : 0,
            draggable: currentEditParkingMode
          })
            .addTo(map);

          marker.on('click', () => {
            if (editParkingModeRef.current) return;
            try {
              console.log('Marker clicked:', getLocalizedText(parking.name, language));
              if (onSelectRouteParkingRef.current) {
                onSelectRouteParkingRef.current(parking.id);
              }
              if (onSelectRef.current) {
                const latest = parkingLotsRef.current.find(p => p.id === parking.id) || parking;
                onSelectRef.current(latest);
              }
            } catch (error) {
              console.error('Error in marker click handler:', error);
            }
          });

          marker.on('dragend', (e: any) => {
            const latLng = e.target.getLatLng();
            if (onUpdateParkingCoordsRef.current) {
              onUpdateParkingCoordsRef.current(parking.id, latLng.lat, latLng.lng);
            }
          });

          parkingMarkersRef.current.set(parking.id, marker);
        }
      });

      // Fit bounds to show all parking lots, but only once when enabled
      if (currentEditParkingMode && !fittedParkingRef.current) {
        try {
          const bounds = window.L.latLngBounds(currentParkingLots.map(p => [p.latitude, p.longitude]));
          map.fitBounds(bounds, { padding: [50, 50] });
          fittedParkingRef.current = true;
        } catch (e) {
          console.warn('Could not fit parking lots bounds:', e);
        }
      }
    }

    // Clear previous routes
    if (routesRef.current) {
      routesRef.current.forEach(line => line.remove());
      routesRef.current = [];
    }

    // Draw route lines if destination is set
    if (currentUserLocation && currentDestinationLocation && currentParkingLots.length > 0 && !isDebugging) {
      const targetParking = currentParkingLots.find(p => p.id === currentRecommendedId) || currentParkingLots[0];

      if (targetParking) {
        // Use drivingRoute state if available, otherwise fallback to straight line
        const driveCoords = drivingRouteRef.current || [
          [currentUserLocation.latitude, currentUserLocation.longitude],
          [targetParking.latitude, targetParking.longitude]
        ];

        const driveRoute = window.L.polyline(driveCoords, {
          color: '#6366f1',
          weight: 5,
          opacity: 0.8,
          lineJoin: 'round'
        }).addTo(map).bindPopup('Tuyến đường lái xe (Driving route)');
        routesRef.current.push(driveRoute);

        // Use walkingRoute state if available, otherwise fallback to straight line
        const walkCoords = walkingRouteRef.current || [
          [targetParking.latitude, targetParking.longitude],
          [currentDestinationLocation.latitude, currentDestinationLocation.longitude]
        ];

        const walkRoute = window.L.polyline(walkCoords, {
          color: '#10b981',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8',
          lineJoin: 'round'
        }).addTo(map).bindPopup('Tuyến đường đi bộ (Walking route)');
        routesRef.current.push(walkRoute);

        // Auto-fit bounds only when the route changes or detailed route loads
        const hasDetailedRoute = !!drivingRouteRef.current;
        const routeKey = `${currentUserLocation.latitude},${currentUserLocation.longitude}_${currentDestinationLocation.latitude},${currentDestinationLocation.longitude}_${targetParking.id}_${hasDetailedRoute}`;
        const shouldFitBounds = !selectedParkingRef.current;
        
        if (shouldFitBounds && lastFittedRouteKeyRef.current !== routeKey) {
          try {
            const bounds = window.L.latLngBounds([
              ...driveCoords,
              ...walkCoords
            ]);
            map.fitBounds(bounds, { padding: [50, 50] });
            lastFittedRouteKeyRef.current = routeKey;
          } catch (e) {
            console.warn('Could not fit map bounds:', e);
          }
        }
      }
    } else {
      lastFittedRouteKeyRef.current = '';
    }

    // Handle Show All Destinations Debug Feature
    if (currentShowAll) {
      const listToUse = destinationsListRef.current && destinationsListRef.current.length > 0
        ? destinationsListRef.current
        : mockDestinations;

      listToUse.forEach((dest) => {
        let marker = allDestinationsMarkersRef.current.get(dest.id);
        const labelIcon = window.L.divIcon({
          html: `<div style="background:#8b5cf6;color:white;border-radius:12px;padding:4px 8px;font-size:10px;font-weight:bold;white-space:nowrap;border:1px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);cursor:grab;">${dest.name}</div>`,
          className: 'dest-label-marker',
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        });

        if (marker) {
          marker.setLatLng([dest.latitude, dest.longitude]);
          marker.setIcon(labelIcon);
        } else {
          marker = window.L.marker([dest.latitude, dest.longitude], {
            icon: labelIcon,
            draggable: true
          })
            .addTo(map)
            .bindPopup(`<b>${dest.name}</b><br/>${dest.address}<br/><small style="color:#8b5cf6;font-weight:bold;">📍 Kéo nhãn để sửa vị trí (Drag to move)</small>`);

          marker.on('dragend', (e: any) => {
            const latLng = e.target.getLatLng();
            if (onUpdateDestinationCoordsRef.current) {
              onUpdateDestinationCoordsRef.current(dest.id, latLng.lat, latLng.lng);
            }
          });

          allDestinationsMarkersRef.current.set(dest.id, marker);
        }
      });

      // Fit bounds to show all destinations, but only once when enabled
      if (!fittedDestinationsRef.current) {
        try {
          const bounds = window.L.latLngBounds(listToUse.map(d => [d.latitude, d.longitude]));
          map.fitBounds(bounds, { padding: [50, 50] });
          fittedDestinationsRef.current = true;
        } catch (e) {
          console.warn('Could not fit destinations bounds:', e);
        }
      }
    } else {
      allDestinationsMarkersRef.current.forEach((m) => m.remove());
      allDestinationsMarkersRef.current.clear();
    }
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
      const currentSelectedParking = selectedParkingRef.current;
      const currentDestinationLocation = destinationLocationRef.current;

      let center = [21.0046655, 105.8443058];
      let zoom = 15;

      if (currentSelectedParking) {
        center = [currentSelectedParking.latitude, currentSelectedParking.longitude];
        zoom = 17;
      } else if (currentDestinationLocation) {
        center = [currentDestinationLocation.latitude, currentDestinationLocation.longitude];
        zoom = 17;
      } else if (currentUserLocation) {
        center = [currentUserLocation.latitude, currentUserLocation.longitude];
        zoom = 17;
      }

      const hanoiBounds = [
        [20.94, 105.77], // South-West (SW)
        [21.07, 105.91]  // North-East (NE)
      ];

      const map = window.L.map(containerRef.current, {
        maxBounds: hanoiBounds,
        maxBoundsViscosity: 1.0
      }).setView(center, zoom);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Support map-click to set custom destination
      map.on('click', (e: any) => {
        if (showAllDestinationsRef.current || editParkingModeRef.current) return; // Ignore clicks in debug mode
        if (onMapClickRef.current) {
          onMapClickRef.current(e.latlng.lat, e.latlng.lng);
        }
      });

      // Dynamically calculate and restrict zoom so the visible area does not exceed 100 km²
      const limitZoomTo100Km2 = () => {
        if (!map) return;
        const size = map.getSize();
        if (size.x === 0 || size.y === 0) return;

        const centerLatLng = map.getCenter();
        const cosLat = Math.cos(centerLatLng.lat * Math.PI / 180);

        const val = (Math.sqrt(size.x * size.y) * 156543.03392 * cosLat) / 10000;
        let minZoom = Math.ceil(Math.log2(val));

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
        @keyframes userPulse {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .user-pulse-container {
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-pulse-ring {
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: rgba(99, 102, 241, 0.4);
          animation: userPulse 2s ease-out infinite;
        }
        .user-pulse-dot {
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background-color: #6366f1;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(99, 102, 241, 0.6);
        }
        .destination-pin-container {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.45));
          animation: pinBounce 1s ease-in-out infinite alternate;
        }
        @keyframes pinBounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-6px); }
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
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current = null;
      }
      if (routesRef.current) {
        routesRef.current = [];
      }
      allDestinationsMarkersRef.current.forEach((m) => m.remove());
      allDestinationsMarkersRef.current.clear();
    };
  }, []);

  // Fetch actual road routing coordinates from OSRM
  useEffect(() => {
    // Immediately clear routes so we don't render stale ones
    setDrivingRoute(null);
    setWalkingRoute(null);

    const currentUserLocation = userLocationRef.current;
    const currentDestinationLocation = destinationLocationRef.current;
    const currentRecommendedId = recommendedParkingIdRef.current;
    const currentParkingLots = parkingLotsRef.current;

    if (showAllDestinations || editParkingMode || !currentUserLocation || !currentDestinationLocation || currentParkingLots.length === 0) {
      return;
    }

    const targetParking = currentParkingLots.find(p => p.id === currentRecommendedId) || currentParkingLots[0];
    if (!targetParking) return;

    let active = true;

    const loadRoutes = async () => {
      // 1. Driving route: user → parking lot
      const driveCoords = await fetchRoute(currentUserLocation, targetParking, 'cycling');
      if (!active) return;

      if (driveCoords && driveCoords.length > 0) {
        setDrivingRoute(driveCoords);
      } else {
        // Last-resort straight line if OSRM returned nothing
        setDrivingRoute([
          [currentUserLocation.latitude, currentUserLocation.longitude],
          [targetParking.latitude, targetParking.longitude]
        ]);
      }

      // 2. Walking route: parking lot → destination (foot profile)
      const walkCoords = await fetchRoute(
        { latitude: targetParking.latitude, longitude: targetParking.longitude },
        currentDestinationLocation,
        'foot'
      );
      if (!active) return;

      if (walkCoords && walkCoords.length > 0) {
        setWalkingRoute(walkCoords);
      } else {
        // Last-resort straight line if OSRM returned nothing
        setWalkingRoute([
          [targetParking.latitude, targetParking.longitude],
          [currentDestinationLocation.latitude, currentDestinationLocation.longitude]
        ]);
      }
    };

    loadRoutes();

    return () => {
      active = false;
    };
  }, [
    userLocation?.latitude,
    userLocation?.longitude,
    destinationLocation?.latitude,
    destinationLocation?.longitude,
    recommendedParkingId,
    currentTargetParking?.latitude,
    currentTargetParking?.longitude,
    showAllDestinations,
    editParkingMode
  ]);

  useEffect(() => {
    if (!showAllDestinations) {
      fittedDestinationsRef.current = false;
    }
  }, [showAllDestinations]);

  useEffect(() => {
    if (!editParkingMode) {
      fittedParkingRef.current = false;
    }
  }, [editParkingMode]);

  // Update markers when parking lots, recommended parking, user location, destination, routes, showAllDestinations, or editParkingMode change
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers(mapInstanceRef.current);
    }
  }, [parkingLots, recommendedParkingId, userLocation, destinationLocation, drivingRoute, walkingRoute, showAllDestinations, editParkingMode]);

  // Zoom to selected parking lot when it changes
  useEffect(() => {
    if (selectedParking && mapInstanceRef.current) {
      mapInstanceRef.current.setView([selectedParking.latitude, selectedParking.longitude], 17);
    }
  }, [selectedParking?.id, selectedParking?.latitude, selectedParking?.longitude]);

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
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    overflow: 'hidden',
  },
});
