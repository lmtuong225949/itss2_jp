import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParkingLot } from '../types/parking';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../utils/translations';
import { parkingListStyles } from '../styles/parkingList';

interface ParkingListProps {
  parkingLots: ParkingLot[];
  selectedParking: ParkingLot | null;
  language: 'vi' | 'en' | 'ja';
  onParkingSelect: (parking: ParkingLot) => void;
}

const ParkingList: React.FC<ParkingListProps> = ({
  parkingLots,
  selectedParking,
  language,
  onParkingSelect,
}) => {
  const { colors } = useTheme();
  const t = useTranslation(language);
  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage < 10) return '#ef4444'; // Red
    if (percentage < 30) return '#f59e0b'; // Amber
    return '#10b981'; // Green
  };

  const getAvailabilityText = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage < 10) return t.list.almostFull;
    if (percentage < 30) return t.list.fewSpaces;
    return t.list.manySpaces;
  };

  const getAvailabilityIconName = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage < 10) return 'close-circle';
    if (percentage < 30) return 'warning';
    return 'checkmark-circle';
  };

  return (
    <ScrollView style={[parkingListStyles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={[parkingListStyles.header, { backgroundColor: colors.card }]}>
        <View style={parkingListStyles.titleRow}>
          <Ionicons name="car-sport" size={24} color={colors.text} style={{ marginRight: 8 }} />
          <Text style={[parkingListStyles.title, { color: colors.text }]}>{t.list.title}</Text>
        </View>
        <View style={parkingListStyles.subtitleContainer}>
          <Text style={[parkingListStyles.subtitle, { color: colors.textSecondary }]}>{parkingLots.length} {t.list.available}</Text>
          <View style={[parkingListStyles.divider, { backgroundColor: colors.border }]} />
          <Text style={[parkingListStyles.subtitleInfo, { color: colors.textSecondary }]}>{t.list.sortByDistance}</Text>
        </View>
      </View>

      {parkingLots.map((parking, index) => (
        <TouchableOpacity
          key={parking.id}
          style={[
            parkingListStyles.parkingCard,
            { backgroundColor: colors.card },
            selectedParking?.id === parking.id && { borderColor: colors.primary }
          ]}
          onPress={() => onParkingSelect(parking)}
          activeOpacity={0.8}
        >
          <View style={parkingListStyles.cardHeader}>
            <View style={parkingListStyles.headerLeft}>
              <Text style={[parkingListStyles.parkingName, { color: colors.text }]}>{parking.name}</Text>
              <View style={parkingListStyles.addressRow}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={[parkingListStyles.address, { color: colors.textSecondary }]}>{parking.address}</Text>
              </View>
            </View>
            <View style={[
              parkingListStyles.availabilityBadge,
              { backgroundColor: getAvailabilityColor(parking.availableSpaces, parking.totalSpaces) }
            ]}>
              <Ionicons 
                name={getAvailabilityIconName(parking.availableSpaces, parking.totalSpaces)} 
                size={14} 
                color="white" 
              />
              <Text style={[parkingListStyles.availabilityText, { color: 'white' }]}>
                {getAvailabilityText(parking.availableSpaces, parking.totalSpaces)}
              </Text>
            </View>
          </View>

          <View style={[parkingListStyles.statsRow, { backgroundColor: colors.background }]}>
            <View style={parkingListStyles.statItem}>
              <View style={parkingListStyles.statIcon}>
                <Ionicons name="car-outline" size={20} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={[parkingListStyles.statValue, { color: colors.text }]}>
                  {parking.availableSpaces}/{parking.totalSpaces}
                </Text>
                <Text style={[parkingListStyles.statLabel, { color: colors.textSecondary }]}>{t.list.spaces}</Text>
              </View>
            </View>
            
            <View style={[parkingListStyles.statDivider, { backgroundColor: colors.border }]} />
            
            <View style={parkingListStyles.statItem}>
              <View style={parkingListStyles.statIcon}>
                <Ionicons name="cash-outline" size={20} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={[parkingListStyles.statValue, { color: colors.text }]}>
                  {parking.pricePerHour.toLocaleString()}đ
                </Text>
                <Text style={[parkingListStyles.statLabel, { color: colors.textSecondary }]}>{t.list.hour}</Text>
              </View>
            </View>

            <View style={[parkingListStyles.statDivider, { backgroundColor: colors.border }]} />

            <View style={parkingListStyles.statItem}>
              <View style={parkingListStyles.statIcon}>
                <Ionicons name="navigate-outline" size={20} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={[parkingListStyles.statValue, { color: colors.text }]}>
                  {parking.distance ? `${parking.distance.toFixed(1)}km` : '---'}
                </Text>
                <Text style={[parkingListStyles.statLabel, { color: colors.textSecondary }]}>{t.list.distance}</Text>
              </View>
            </View>
          </View>
          <View style={parkingListStyles.featuresRow}>
            {parking.features.slice(0, 3).map((feature, index) => (
              <View key={index} style={parkingListStyles.featureTag}>
                <Text style={parkingListStyles.featureText}>✓ {feature}</Text>
              </View>
            ))}
          </View>
          <View style={parkingListStyles.footer}>
            <View style={[
              parkingListStyles.statusBadge,
              { backgroundColor: parking.isOpen ? '#ecfdf5' : '#fef2f2' }
            ]}>
              <Text style={[
                parkingListStyles.statusText,
                { color: parking.isOpen ? colors.primary : colors.textSecondary }
              ]}>
                {parking.isOpen ? `● ${t.list.open}` : `● ${t.list.closed}`}
              </Text>
            </View>
            
            {parking.rating && (
              <View style={parkingListStyles.ratingBadge}>
                <Ionicons name="star" size={12} color="#92400e" />
                <Text style={parkingListStyles.ratingText}>
                  {parking.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default ParkingList;
