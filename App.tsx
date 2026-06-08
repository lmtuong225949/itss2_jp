import { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity, ActivityIndicator, SafeAreaView, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import MapView from './src/screens/MapView';
import ParkingList from './src/screens/ParkingList';
import ParkingRecommendationComponent from './src/screens/ParkingRecommendation';
import SettingsModal from './src/screens/SettingsModal';
import ParkingDetailScreen from './src/screens/ParkingDetails';
import { ParkingService } from './src/utils/parkingService';
import { ParkingLot, UserLocation, ParkingRecommendation as RecommendationType, Destination } from './src/types/parking';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { useTranslation } from './src/utils/translations';
import { commonStyles, recommendStyles } from './src/styles/common';
import { headerStyles } from './src/styles/header';
import { mockDestinations } from './src/data/destinationData';
import { mockParkingLots } from './src/data/mockData';
import Input from './src/components/Input/Input';

function AppContent() {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedParking, setSelectedParking] = useState<ParkingLot | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'recommend'>('recommend');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [viewingDetails, setViewingDetails] = useState<ParkingLot | null>(null);
  const [criteria, setCriteria] = useState<'balanced' | 'closest' | 'cheapest' | 'empty'>('balanced');
  const [activeRouteParkingId, setActiveRouteParkingId] = useState<string | null>(null);

  // Destination Search States
  const [destination, setDestination] = useState<Destination | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAllDestinationsOnMap, setShowAllDestinationsOnMap] = useState(false);
  const [showAllParkingOnMap, setShowAllParkingOnMap] = useState(false);
  const [editableDestinations, setEditableDestinations] = useState<Destination[]>(mockDestinations);
  const [editableParkingLots, setEditableParkingLots] = useState<ParkingLot[]>(mockParkingLots);
  const [exporterCollapsed, setExporterCollapsed] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'copy' | 'copied'>('copy');

  const handleUpdateDestinationCoords = useCallback((id: string, lat: number, lon: number) => {
    setEditableDestinations(prev => {
      const updated = prev.map(dest => {
        if (dest.id === id) {
          return { ...dest, latitude: parseFloat(lat.toFixed(6)), longitude: parseFloat(lon.toFixed(6)) };
        }
        return dest;
      });

      // Update currently active destination if its coordinates were moved
      setDestination(curr => {
        if (curr && curr.id === id) {
          return { ...curr, latitude: parseFloat(lat.toFixed(6)), longitude: parseFloat(lon.toFixed(6)) };
        }
        return curr;
      });

      return updated;
    });
  }, []);

  const getExporterCode = () => {
    const lines = editableDestinations.map(d => `  {
    id: '${d.id}',
    name: '${d.name}',
    address: '${d.address}',
    latitude: ${d.latitude},
    longitude: ${d.longitude},
  }`).join(',\n');

    return `[\n${lines}\n]`;
  };

  const getParkingExporterCode = () => {
    const lines = editableParkingLots.map(p => `  {
    id: '${p.id}',
    name: '${p.name}',
    address: '${p.address}',
    latitude: ${p.latitude},
    longitude: ${p.longitude},
    totalSpaces: ${p.totalSpaces},
    availableSpaces: ${p.availableSpaces},
    pricePerHour: ${p.pricePerHour},
    isOpen: ${p.isOpen},
    rating: ${p.rating},
    features: [${p.features.map(f => `'${f}'`).join(', ')}],
    lastUpdated: new Date(),
  }`).join(',\n');

    return `[\n${lines}\n]`;
  };

  const handleCopy = () => {
    const code = showAllDestinationsOnMap ? getExporterCode() : getParkingExporterCode();
    if (typeof window !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('copy'), 2000);
      });
    } else {
      alert('Không thể copy tự động. Hãy copy thủ công ở ô mã nguồn.');
    }
  };

  const { colors, language } = useTheme();
  const t = useTranslation(language);

  const parkingService = ParkingService.getInstance();

  const DEFAULT_LOCATION: UserLocation = { latitude: 21.0046655, longitude: 105.8443058 };

  const refreshParkingData = useCallback(async (location: UserLocation, dest: Destination | null = null, currentCriteria = criteria, resetRoute = false) => {
    const refLocation = dest ? { latitude: dest.latitude, longitude: dest.longitude } : location;
    const nearbyLots = await parkingService.getNearbyParkingLots(refLocation, location);
    setParkingLots(nearbyLots);

    const recs = await parkingService.getParkingRecommendations(
      location,
      dest ? { latitude: dest.latitude, longitude: dest.longitude } : null,
      5,
      currentCriteria
    );
    setRecommendations(recs);

    // Auto-select or preserve the route target
    if (recs.length > 0) {
      setActiveRouteParkingId(prev => {
        if (!resetRoute && prev && nearbyLots.some(p => p.id === prev)) {
          return prev;
        }
        return recs[0].parkingLot.id;
      });
    } else {
      setActiveRouteParkingId(null);
    }
  }, [parkingService, criteria]);

  const handleUpdateParkingCoords = useCallback((id: string, lat: number, lon: number) => {
    // Update coordinates in ParkingService so logic functions use them
    ParkingService.getInstance().updateParkingLotCoordinates(id, lat, lon);

    setEditableParkingLots(prev => {
      return prev.map(p => {
        if (p.id === id) {
          return { ...p, latitude: parseFloat(lat.toFixed(6)), longitude: parseFloat(lon.toFixed(6)) };
        }
        return p;
      });
    });

    // Refresh map data to update recommendations
    if (userLocation) {
      refreshParkingData(userLocation, destination);
    }
  }, [userLocation, destination, refreshParkingData]);

  const handleUpdateUserLocation = useCallback((location: UserLocation) => {
    setUserLocation(location);
  }, []);

  const requestUserLocation = async (): Promise<UserLocation> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });

    return {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    };
  };

  const initializeApp = async () => {
    try {
      setLoading(true);
      let location = DEFAULT_LOCATION;
      try {
        location = await requestUserLocation();
      } catch (error) {
        console.warn('Using fallback location:', error);
      }

      setUserLocation(location);
      await refreshParkingData(location, null);
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  // Update parking slot occupancy updates periodically (preserve selection)
  useEffect(() => {
    if (!userLocation) return;

    const intervalId = setInterval(async () => {
      if (parkingLots.length === 0) return;

      const target = parkingLots[Math.floor(Math.random() * parkingLots.length)];
      const magnitude = Math.ceil(Math.random() * 3);
      const change = Math.random() > 0.5 ? magnitude : -magnitude;

      await parkingService.updateParkingLotAvailability(target.id, change);
      await refreshParkingData(userLocation, destination, criteria, false);
    }, 6000);

    return () => clearInterval(intervalId);
  }, [parkingLots, parkingService, refreshParkingData, userLocation, destination, criteria]);

  // Update data when destination or criteria changes (reset selection)
  useEffect(() => {
    if (userLocation) {
      refreshParkingData(userLocation, destination, criteria, true);
    }
  }, [destination, userLocation, criteria]);

  const handleRecommendationSelect = useCallback((recommendation: RecommendationType) => {
    setSelectedParking(recommendation.parkingLot);
    setActiveRouteParkingId(recommendation.parkingLot.id);
    setViewingDetails(recommendation.parkingLot);
    setActiveTab('map');
  }, []);

  const handleParkingSelect = useCallback((parking: ParkingLot) => {
    setSelectedParking(parking);
    setActiveRouteParkingId(parking.id);
    setViewingDetails(parking);
    setActiveTab('map');
  }, []);

  const handleSelectRouteParking = useCallback((id: string) => {
    setActiveRouteParkingId(id);
    if (viewingDetails) {
      const parking = parkingLots.find(p => p.id === id);
      if (parking) {
        setViewingDetails(parking);
      }
    }
  }, [viewingDetails, parkingLots]);

  const selectDestination = (dest: Destination) => {
    setDestination(dest);
    setSearchQuery(dest.name);
    setShowSuggestions(false);
  };

  const clearDestination = () => {
    setDestination(null);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const toggleShowAllDestinations = () => {
    setShowAllDestinationsOnMap(prev => {
      const next = !prev;
      if (next) {
        setShowAllParkingOnMap(false);
        setActiveTab('map');
      }
      return next;
    });
  };

  const toggleShowAllParking = () => {
    setShowAllParkingOnMap(prev => {
      const next = !prev;
      if (next) {
        setShowAllDestinationsOnMap(false);
        setActiveTab('map');
      }
      return next;
    });
  };

  const handleMapClick = useCallback((lat: number, lon: number) => {
    const customDest: Destination = {
      id: 'custom',
      name: t.recommend.customDestination || 'Địa điểm chọn trên bản đồ',
      address: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
      latitude: lat,
      longitude: lon,
    };
    setDestination(customDest);
    setSearchQuery(customDest.name);
    setShowSuggestions(false);
  }, [t]);

  const filteredDestinations = editableDestinations.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={commonStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[commonStyles.loadingText, { color: colors.textSecondary }]}>{t.loading}</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'map':
        return (
          <View style={{ flex: 1, flexDirection: 'row' }}>
            {viewingDetails && (
              <View style={{ width: 380, borderRightWidth: 1, borderRightColor: colors.border }}>
                <ParkingDetailScreen
                  parkingLot={viewingDetails}
                  onBack={() => setViewingDetails(null)}
                  onShowOnMap={(parkingLot) => {
                    setSelectedParking(parkingLot);
                    setActiveRouteParkingId(parkingLot.id);
                  }}
                  isSidebar={true}
                />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <MapView
                parkingLots={parkingLots}
                userLocation={userLocation}
                recommendedParkingId={activeRouteParkingId || recommendations[0]?.parkingLot.id}
                onSelect={handleParkingSelect}
                destinationLocation={destination ? { latitude: destination.latitude, longitude: destination.longitude } : null}
                destinationName={destination ? destination.name : null}
                onMapClick={handleMapClick}
                showAllDestinations={showAllDestinationsOnMap}
                destinationsList={editableDestinations}
                onUpdateDestinationCoords={handleUpdateDestinationCoords}
                editParkingMode={showAllParkingOnMap}
                onUpdateParkingCoords={handleUpdateParkingCoords}
                onSelectRouteParking={handleSelectRouteParking}
                onUpdateUserLocation={handleUpdateUserLocation}
              />
            </View>
          </View>
        );
      case 'list':
        return (
          <ParkingList
            parkingLots={parkingLots}
            selectedParking={selectedParking}
            language={language}
            onParkingSelect={handleParkingSelect}
            hasDestination={!!destination}
          />
        );
      case 'recommend':
        return (
          <View style={recommendStyles.recommendContainer}>
            <ParkingRecommendationComponent
              recommendations={recommendations}
              language={language}
              onRecommendationSelect={handleRecommendationSelect}
              hasDestination={!!destination}
            />
          </View>
        );
      default:
        return null;
    }
  };



  return (
    <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <View style={[headerStyles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={headerStyles.headerContent}>
          <View style={headerStyles.leftContainer}>
            <Text style={[headerStyles.headerTitle, { color: colors.text }]}>
              Shiranui<Text style={{ color: colors.primary }}>Parker</Text>
            </Text>
          </View>
          <TouchableOpacity onPress={() => setSettingsVisible(true)} style={headerStyles.settingsButton} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Destination Search Bar Component */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        {!(showAllDestinationsOnMap || showAllParkingOnMap) && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1, position: 'relative' }}>
              <Input
                placeholder={t.recommend.searchPlaceholder}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                leftIcon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
                rightIcon={
                  searchQuery ? (
                    <TouchableOpacity onPress={clearDestination}>
                      <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  ) : null
                }
                style={styles.searchInput}
              />
              {showSuggestions && searchQuery.length > 0 && (
                <View style={[styles.suggestionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled">
                    {filteredDestinations.map((dest) => (
                      <TouchableOpacity
                        key={dest.id}
                        style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                        onPress={() => selectDestination(dest)}
                      >
                        <Ionicons name="location-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.suggestionName, { color: colors.text }]}>{dest.name}</Text>
                          <Text style={[styles.suggestionAddress, { color: colors.textSecondary }]} numberOfLines={1}>{dest.address}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                    {filteredDestinations.length === 0 && (
                      <View style={styles.emptySuggestion}>
                        <Text style={{ color: colors.textSecondary }}>Không tìm thấy địa điểm</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
            
            {/* Criteria Mini Selector */}
            <View style={[styles.miniCriteriaSelector, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <select
                value={criteria}
                onChange={(e) => setCriteria(e.target.value as any)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: colors.text,
                  fontSize: 13,
                  fontWeight: '700',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="balanced" style={{ background: colors.card, color: colors.text }}>⚖️ {(t.recommend as any).criteria?.balanced}</option>
                <option value="closest" style={{ background: colors.card, color: colors.text }}>📍 {(t.recommend as any).criteria?.closest}</option>
                <option value="cheapest" style={{ background: colors.card, color: colors.text }}>💵 {(t.recommend as any).criteria?.cheapest}</option>
                <option value="empty" style={{ background: colors.card, color: colors.text }}>🚗 {(t.recommend as any).criteria?.empty}</option>
              </select>
            </View>
          </View>
        )}
      </View>

      {!showAllDestinationsOnMap && (
        <View style={[commonStyles.tabContainer, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[commonStyles.tab, activeTab === 'recommend' && { backgroundColor: colors.primary }]}
            onPress={() => {
              setActiveTab('recommend');
              setShowSuggestions(false);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="star"
              size={20}
              color={activeTab === 'recommend' ? '#fff' : colors.textSecondary}
            />
            <Text style={[commonStyles.tabText, activeTab === 'recommend' && commonStyles.activeTabText, { color: activeTab === 'recommend' ? '#fff' : colors.textSecondary }]}>
              {t.tabs.recommend}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[commonStyles.tab, activeTab === 'map' && { backgroundColor: colors.primary }]}
            onPress={() => {
              setActiveTab('map');
              setShowSuggestions(false);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="map"
              size={20}
              color={activeTab === 'map' ? '#fff' : colors.textSecondary}
            />
            <Text style={[commonStyles.tabText, activeTab === 'map' && commonStyles.activeTabText, { color: activeTab === 'map' ? '#fff' : colors.textSecondary }]}>
              {t.tabs.map}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[commonStyles.tab, activeTab === 'list' && { backgroundColor: colors.primary }]}
            onPress={() => {
              setActiveTab('list');
              setShowSuggestions(false);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="list"
              size={20}
              color={activeTab === 'list' ? '#fff' : colors.textSecondary}
            />
            <Text style={[commonStyles.tabText, activeTab === 'list' && commonStyles.activeTabText, { color: activeTab === 'list' ? '#fff' : colors.textSecondary }]}>
              {t.tabs.list}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[commonStyles.content, { backgroundColor: colors.background, zIndex: 1 }]}>
        {renderContent()}
        {activeTab === 'map' && (showAllDestinationsOnMap || showAllParkingOnMap) && (
          <View style={[styles.exporterContainer, { backgroundColor: colors.card + 'ee', borderColor: colors.border }]}>
            <View style={styles.exporterHeader}>
              <Text style={[styles.exporterTitle, { color: colors.text }]}>
                {showAllDestinationsOnMap ? "🛠️ Trình Xuất Tọa Độ Landmark" : "🛠️ Trình Xuất Tọa Độ Bãi Đỗ Xe"}
              </Text>
              <TouchableOpacity onPress={() => setExporterCollapsed(!exporterCollapsed)}>
                <Ionicons
                  name={exporterCollapsed ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {!exporterCollapsed && (
              <>
                <Text style={[styles.exporterDesc, { color: colors.textSecondary }]}>
                  {showAllDestinationsOnMap
                    ? "Kéo các nhãn địa điểm trên bản đồ để sửa tọa độ. Đoạn mã dưới đây tự động cập nhật theo thời gian thực:"
                    : "Kéo các vòng tròn bãi đỗ xe trên bản đồ để sửa tọa độ. Đoạn mã dưới đây tự động cập nhật theo thời gian thực:"
                  }
                </Text>
                <TextInput
                  style={styles.codeBlock}
                  multiline={true}
                  editable={false}
                  value={showAllDestinationsOnMap ? getExporterCode() : getParkingExporterCode()}
                  selectTextOnFocus={true}
                />
                <TouchableOpacity
                  onPress={handleCopy}
                  style={[styles.copyBtn, { backgroundColor: colors.primary }]}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={copyStatus === 'copied' ? "checkmark-circle" : "copy-outline"}
                    size={18}
                    color="#fff"
                  />
                  <Text style={styles.copyBtnText}>
                    {copyStatus === 'copied' ? "Đã copy thành công!" : "Copy toàn bộ code"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 100,
    position: 'relative',
  },
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
    height: 48,
    paddingVertical: 0,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 999,
  },
  miniCriteriaSelector: {
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionAddress: {
    fontSize: 12,
    marginTop: 2,
  },
  emptySuggestion: {
    padding: 16,
    alignItems: 'center',
  },
  debugRow: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'flex-start',
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  debugButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  exporterContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  exporterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exporterTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  exporterDesc: {
    fontSize: 11,
    marginTop: 6,
    marginBottom: 8,
    lineHeight: 15,
  },
  codeBlock: {
    fontFamily: 'monospace',
    fontSize: 11,
    backgroundColor: '#1e1e2e',
    color: '#cdd6f4',
    padding: 10,
    borderRadius: 8,
    height: 120,
    textAlignVertical: 'top',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  copyBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
});

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
