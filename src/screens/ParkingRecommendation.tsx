import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParkingRecommendation as RecommendationType } from '../types/parking';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../utils/translations';
import { localizeParkingLot } from '../utils/localization';
import { parkingRecommendationStyles } from '../styles/parkingRecommendation';
import { formatDistance } from '../utils/helpers';

interface ParkingRecommendationProps {
  recommendations: RecommendationType[];
  language: 'vi' | 'en' | 'ja';
  onRecommendationSelect: (recommendation: RecommendationType) => void;
  hasDestination?: boolean;
}

const ParkingRecommendationComponent: React.FC<ParkingRecommendationProps> = ({
  recommendations,
  language,
  onRecommendationSelect,
  hasDestination = false,
}) => {
  const { colors } = useTheme();
  const t = useTranslation(language);

  if (recommendations.length === 0) {
    return (
      <View style={parkingRecommendationStyles.emptyContainer}>
        <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
        <Text style={[parkingRecommendationStyles.emptyText, { color: colors.text }]}>{t.recommend.empty}</Text>
        <Text style={[parkingRecommendationStyles.emptySubtext, { color: colors.textSecondary }]}>{t.recommend.emptySubtext}</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={parkingRecommendationStyles.scrollContent}>
      {recommendations.map((recommendation, index) => {
        const displayParking = localizeParkingLot(recommendation.parkingLot, language);

        return (
        <View
          key={recommendation.parkingLot.id}
          style={[
            parkingRecommendationStyles.recommendationCard,
            { backgroundColor: colors.card },
            index === 0 && [parkingRecommendationStyles.topRecommendation, { borderColor: colors.primary }]
          ]}
        >
          {index === 0 && (
            <View style={[parkingRecommendationStyles.topBadge, { backgroundColor: colors.primary }]}>
              <Text style={parkingRecommendationStyles.topBadgeText}>{t.recommend.best}</Text>
            </View>
          )}

          <View style={parkingRecommendationStyles.cardHeader}>
            <View style={parkingRecommendationStyles.rankBadge}>
              <Text style={parkingRecommendationStyles.rankText}>#{index + 1}</Text>
            </View>
            <View style={parkingRecommendationStyles.headerText}>
              <Text style={[parkingRecommendationStyles.parkingName, { color: colors.text }]} numberOfLines={1}>
                {displayParking.name}
              </Text>
              <View style={parkingRecommendationStyles.addressRow}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={[parkingRecommendationStyles.address, { color: colors.textSecondary }]} numberOfLines={1}>
                  {displayParking.address}
                </Text>
              </View>
            </View>
          </View>

          <View style={parkingRecommendationStyles.statsGrid}>
            <View style={[parkingRecommendationStyles.statItem, { backgroundColor: colors.background }]}>
              <Ionicons name="car-outline" size={20} color={colors.textSecondary} />
              <Text style={[parkingRecommendationStyles.statLabel, { color: colors.textSecondary }]}>{t.recommend.availableSpaces}</Text>
              <Text style={[parkingRecommendationStyles.statValue, { color: colors.text }]}>
                {recommendation.parkingLot.availableSpaces}/{recommendation.parkingLot.totalSpaces}
              </Text>
            </View>

            <View style={[parkingRecommendationStyles.statItem, { backgroundColor: colors.background }]}>
              <Ionicons name={hasDestination ? "walk" : "navigate-outline"} size={20} color={colors.textSecondary} />
              <Text style={[parkingRecommendationStyles.statLabel, { color: colors.textSecondary }]}>
                {hasDestination ? t.recommend.walkingDistance : t.recommend.distance}
              </Text>
              <Text style={[parkingRecommendationStyles.statValue, { color: colors.text }]}>
                {formatDistance(hasDestination ? (recommendation.walkingDistance || recommendation.distance) : recommendation.distance)}
              </Text>
            </View>

            <View style={[parkingRecommendationStyles.statItem, { backgroundColor: colors.background }]}>
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <Text style={[parkingRecommendationStyles.statLabel, { color: colors.textSecondary }]}>{t.recommend.time}</Text>
              <Text style={[parkingRecommendationStyles.statValue, { color: colors.text }]}>{recommendation.estimatedTime}ph</Text>
            </View>
          </View>

          {hasDestination && (
            <View style={[localStyles.segmentContainer, { backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }]}>
              <Ionicons name="car-outline" size={20} color={colors.textSecondary} />
              <Text style={[localStyles.segmentText, { color: colors.textSecondary }]}>
                {t.recommend.drivingDistance}: <Text style={{ color: colors.text }}>{formatDistance(recommendation.drivingDistance || 0)}</Text>
              </Text>
            </View>
          )}

          <View style={[parkingRecommendationStyles.priceSection, { backgroundColor: colors.background }]}>
            <Text style={[parkingRecommendationStyles.priceLabel, { color: colors.textSecondary }]}>{t.recommend.price}:</Text>
            <Text style={[parkingRecommendationStyles.price, { color: colors.text }]}>
              {recommendation.parkingLot.pricePerHour.toLocaleString()}đ{t.recommend.perHour}
            </Text>
          </View>

          <View style={parkingRecommendationStyles.scoreRow}>
            <View style={parkingRecommendationStyles.scoreInfo}>
              <Text style={[parkingRecommendationStyles.scoreLabel, { color: colors.textSecondary }]}>{t.recommend.score}</Text>
              <Text style={[parkingRecommendationStyles.scoreValue, { color: colors.primary }]}>
                {Math.round(recommendation.availabilityScore * 100)}%
              </Text>
            </View>
            <View style={[parkingRecommendationStyles.scoreBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  parkingRecommendationStyles.scoreFill,
                  { width: `${recommendation.availabilityScore * 100}%`, backgroundColor: colors.primary }
                ]}
              />
            </View>
          </View>

          <View style={[parkingRecommendationStyles.reasonBox, { backgroundColor: colors.background }]}>
            <Ionicons name="bulb-outline" size={16} color={colors.primary} />
            <Text style={[parkingRecommendationStyles.reason, { color: colors.text }]} numberOfLines={2}>
              {recommendation.reasonKeys.map(key => t.recommend[key as keyof typeof t.recommend]).join(', ')}
            </Text>
          </View>

          <View style={parkingRecommendationStyles.buttonRow}>
            <TouchableOpacity
              style={[parkingRecommendationStyles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => onRecommendationSelect(recommendation)}
              activeOpacity={0.7}
            >
              <Text style={parkingRecommendationStyles.actionButtonText}>{t.recommend.viewOnMap}</Text>
            </TouchableOpacity>
          </View>
        </View>
        );
      })}
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  segmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default ParkingRecommendationComponent;

