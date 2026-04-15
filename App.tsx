import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import MapView from './src/screens/MapView';
import ParkingList from './src/screens/ParkingList';
import ParkingRecommendationComponent from './src/screens/ParkingRecommendation';
import SettingsModal from './src/screens/SettingsModal';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { ParkingService } from './src/utils/parkingService';
import { ParkingLot, UserLocation, ParkingRecommendation as RecommendationType } from './src/types/parking';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { useTranslation } from './src/utils/translations';
import { commonStyles, recommendStyles } from './src/styles/common';
import { headerStyles } from './src/styles/header';

function AppContent() {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedParking, setSelectedParking] = useState<ParkingLot | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'recommend'>('recommend');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [authScreen, setAuthScreen] = useState<'login' | 'register' | null>('login');

  const { colors, language, setLanguage } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const t = useTranslation(language);

  const parkingService = ParkingService.getInstance();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      const mockUserLocation: UserLocation = { latitude: 10.7769, longitude: 106.7009 };
      setUserLocation(mockUserLocation);

      const nearbyLots = await parkingService.getNearbyParkingLots(mockUserLocation);
      setParkingLots(nearbyLots);

      const recs = await parkingService.getParkingRecommendations(mockUserLocation);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationSelect = (recommendation: RecommendationType) => {
    setSelectedParking(recommendation.parkingLot);
    setActiveTab('map');
  };

  const handleParkingSelect = (parking: ParkingLot) => {
    setSelectedParking(parking);
  };

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
            />
          </View>
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    if (authScreen === 'login') {
      return (
        <LoginScreen 
          onSwitchToRegister={() => setAuthScreen('register')} 
          onLanguageChange={setLanguage}
          currentLanguage={language}
        />
      );
    } else {
      return (
        <RegisterScreen 
          onSwitchToLogin={() => setAuthScreen('login')} 
          onLanguageChange={setLanguage}
          currentLanguage={language}
        />
      );
    }
  }

  return (
    <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <View style={[headerStyles.header, { backgroundColor: colors.header }]}>
        <View style={headerStyles.headerContent}>
          <View style={headerStyles.logoContainer}>
            <View style={headerStyles.titleContainer}>
              <Ionicons name="car" size={32} color={colors.headerText} />
              <Text style={[headerStyles.headerTitle, { color: colors.headerText }]}>{t.app.title}</Text>
            </View>
            <TouchableOpacity onPress={() => setSettingsVisible(true)} style={headerStyles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color={colors.headerText} />
            </TouchableOpacity>
          </View>
          <Text style={[headerStyles.subtitle, { color: colors.headerText }]}>{t.app.subtitle}</Text>
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
        onLogout={logout}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
