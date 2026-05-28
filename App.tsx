import { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity, ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import MapView from './src/screens/MapView';
import ParkingList from './src/screens/ParkingList';
import ParkingRecommendationComponent from './src/screens/ParkingRecommendation';
import SettingsModal from './src/screens/SettingsModal';
import ParkingDetailScreen from './src/screens/ParkingDetails';
import { ParkingService } from './src/utils/parkingService';
import { ParkingLot, UserLocation, ParkingRecommendation as RecommendationType } from './src/types/parking';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { useTranslation } from './src/utils/translations';
import { commonStyles, recommendStyles } from './src/styles/common';
import { headerStyles } from './src/styles/header';

function AppContent() {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [selectedParking, setSelectedParking] = useState<ParkingLot | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'recommend'>('recommend');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [viewingDetails, setViewingDetails] = useState<ParkingLot | null>(null);

  const { colors, language, setLanguage } = useTheme();
  const t = useTranslation(language);

  const parkingService = ParkingService.getInstance();

  useEffect(() => {
    initializeApp();
  }, []);

  const DEFAULT_LOCATION: UserLocation = { latitude: 21.0046655, longitude: 105.8443058 };

  const refreshParkingData = useCallback(async (location: UserLocation) => {
    const nearbyLots = await parkingService.getNearbyParkingLots(location);
    setParkingLots(nearbyLots);

    const recs = await parkingService.getParkingRecommendations(location);
    setRecommendations(recs);
  }, [parkingService]);

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
      await refreshParkingData(location);
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLocation) return;

    const intervalId = setInterval(async () => {
      if (parkingLots.length === 0) return;

      const target = parkingLots[Math.floor(Math.random() * parkingLots.length)];
      const magnitude = Math.ceil(Math.random() * 3);
      const change = Math.random() > 0.5 ? magnitude : -magnitude;

      await parkingService.updateParkingLotAvailability(target.id, change);
      await refreshParkingData(userLocation);
    }, 6000);

    return () => clearInterval(intervalId);
  }, [parkingLots, parkingService, refreshParkingData, userLocation]);

  const handleRecommendationSelect = useCallback((recommendation: RecommendationType) => {
    setSelectedParking(recommendation.parkingLot);
    setActiveTab('map');
  }, []);

  const handleParkingSelect = useCallback((parking: ParkingLot) => {
    setSelectedParking(parking);
    setViewingDetails(parking);
  }, []);

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
          <MapView
            parkingLots={parkingLots}
            userLocation={userLocation}
            recommendedParkingId={recommendations[0]?.parkingLot.id}
            onSelect={handleParkingSelect}
          />
        );
      case 'list':
        return (
          <ParkingList
            parkingLots={parkingLots}
            selectedParking={selectedParking}
            language={language}
            onParkingSelect={handleParkingSelect}
          />
        );
      case 'recommend':
        return (
          <View style={recommendStyles.recommendContainer}>
            <View style={recommendStyles.recommendHeader}>
              <Text style={[recommendStyles.recommendTitle, { color: colors.text }]}>{t.recommend.title}</Text>
              <Text style={[recommendStyles.recommendSubtitle, { color: colors.textSecondary }]}>{t.recommend.subtitle}</Text>
            </View>
            <ParkingRecommendationComponent
              recommendations={recommendations}
              language={language}
              onRecommendationSelect={(rec) => {
                setSelectedParking(rec.parkingLot);
                setActiveTab('map');
              }}
              onDetailSelect={handleParkingSelect}
            />
          </View>
        );
      default:
        return null;
    }
  };

  if (viewingDetails) {
    return (
      <ParkingDetailScreen
        parkingLot={viewingDetails}
        onBack={() => setViewingDetails(null)}
        onShowOnMap={(parkingLot) => {
          setSelectedParking(parkingLot);
          setViewingDetails(null);
          setActiveTab('map');
        }}
      />
    );
  }

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

      <View style={[commonStyles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[commonStyles.tab, activeTab === 'recommend' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('recommend')}
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
          onPress={() => setActiveTab('map')}
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
          onPress={() => setActiveTab('list')}
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

      <View style={[commonStyles.content, { backgroundColor: colors.background }]}>
        {renderContent()}
      </View>

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
