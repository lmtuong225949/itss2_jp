import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ParkingLot, UserLocation } from '../types/parking';

interface StaticMapProps {
  parkingLots: ParkingLot[];
  userLocation: UserLocation | null;
  selectedParking: ParkingLot | null;
  onParkingSelect: (parking: ParkingLot) => void;
}

const StaticMap: React.FC<StaticMapProps> = ({
  parkingLots,
  userLocation,
  selectedParking,
  onParkingSelect,
}) => {
  // Tạo URL cho OpenStreetMap static map
  const getMapImageUrl = () => {
    if (!userLocation) return null;
    
    const markers = parkingLots.slice(0, 5).map(parking => {
      const color = parking.availableSpaces > 10 ? 'green' : 
                   parking.availableSpaces > 3 ? 'yellow' : 'red';
      return `${color},${parking.latitude},${parking.longitude}`;
    }).join('|');

    const userMarker = `blue,${userLocation.latitude},${userLocation.longitude}`;
    const allMarkers = markers ? `${userMarker}|${markers}` : userMarker;

    return `https://maps.googleapis.com/maps/api/staticmap?center=${userLocation.latitude},${userLocation.longitude}&zoom=13&size=600x400&maptype=roadmap&markers=${allMarkers}&key=YOUR_API_KEY`;
  };

  const getOpenStreetMapUrl = () => {
    if (!userLocation) return null;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.longitude - 0.01},${userLocation.latitude - 0.01},${userLocation.longitude + 0.01},${userLocation.latitude + 0.01}&layer=mapnik&marker=${userLocation.latitude},${userLocation.longitude}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapHeader}>
        <Text style={styles.mapTitle}>🗺️ Bản đồ bãi đỗ xe</Text>
        <Text style={styles.mapSubtitle}>
          Hiển thị {parkingLots.length} bãi xe gần bạn
        </Text>
      </View>

      {/* Static Map Image */}
      <View style={styles.mapContainer}>
        <iframe
          src={getOpenStreetMapUrl() || ''}
          style={styles.mapFrame}
          allowFullScreen
        />
        
        {/* Overlay markers info */}
        <View style={styles.overlayInfo}>
          <Text style={styles.overlayTitle}>📍 Các bãi đỗ xe</Text>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#28a745' }]} />
              <Text style={styles.legendText}>Nhiều chỗ</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ffc107' }]} />
              <Text style={styles.legendText}>Ít chỗ</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#dc3545' }]} />
              <Text style={styles.legendText}>Gần đầy</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Parking List on Map */}
      <ScrollView style={styles.parkingList}>
        <Text style={styles.listTitle}>🅿️ Bãi đỗ xe gần đây</Text>
        
        {parkingLots.slice(0, 3).map((parking) => (
          <TouchableOpacity
            key={parking.id}
            style={[
              styles.parkingCard,
              selectedParking?.id === parking.id && styles.selectedCard
            ]}
            onPress={() => onParkingSelect(parking)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.parkingName}>{parking.name}</Text>
              <View style={[
                styles.availabilityBadge,
                { 
                  backgroundColor: parking.availableSpaces > 10 ? '#28a745' :
                                   parking.availableSpaces > 3 ? '#ffc107' : '#dc3545'
                }
              ]}>
                <Text style={styles.badgeText}>
                  {parking.availableSpaces} chỗ
                </Text>
              </View>
            </View>
            
            <Text style={styles.address}>📍 {parking.address}</Text>
            
            <View style={styles.cardFooter}>
              <Text style={styles.price}>💰 {parking.pricePerHour.toLocaleString()}đ/giờ</Text>
              <Text style={styles.distance}>
                🚗 {parking.distance ? `${parking.distance.toFixed(1)}km` : '---'}
              </Text>
              <Text style={[
                styles.status,
                { color: parking.isOpen ? '#28a745' : '#dc3545' }
              ]}>
                {parking.isOpen ? '🟢 Mở' : '🔴 Đóng'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* User Location Info */}
      {userLocation && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationTitle}>📍 Vị trí của bạn</Text>
          <Text style={styles.coords}>
            {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapHeader: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  mapSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  mapContainer: {
    height: 300,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  mapFrame: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  overlayInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 8,
  },
  overlayTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  legend: {
    flexDirection: 'column',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 10,
    color: '#666',
  },
  parkingList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  parkingCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  parkingName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationInfo: {
    backgroundColor: '#fff',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  coords: {
    fontSize: 12,
    color: '#666',
  },
});

export default StaticMap;
