import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParkingRecommendation as RecommendationType } from '../types/parking';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../utils/translations';
import { parkingRecommendationStyles } from '../styles/parkingRecommendation';

interface ParkingRecommendationProps {
  recommendations: RecommendationType[];
  language: 'vi' | 'en' | 'ja';
  onRecommendationSelect: (recommendation: RecommendationType) => void;
}

const ParkingRecommendationComponent: React.FC<ParkingRecommendationProps> = ({
  recommendations,
  language,
  onRecommendationSelect,
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
      {recommendations.map((recommendation, index) => (
        <TouchableOpacity
          key={recommendation.parkingLot.id}
          style={[
            parkingRecommendationStyles.recommendationCard,
            { backgroundColor: colors.card },
            index === 0 && [parkingRecommendationStyles.topRecommendation, { borderColor: colors.primary }]
          ]}
          onPress={() => onRecommendationSelect(recommendation)}
          activeOpacity={0.8}
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
                {recommendation.parkingLot.name}
              </Text>
              <View style={parkingRecommendationStyles.addressRow}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={[parkingRecommendationStyles.address, { color: colors.textSecondary }]} numberOfLines={1}>
                  {recommendation.parkingLot.address}
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
              <Ionicons name="navigate-outline" size={20} color={colors.textSecondary} />
              <Text style={[parkingRecommendationStyles.statLabel, { color: colors.textSecondary }]}>{t.recommend.distance}</Text>
              <Text style={[parkingRecommendationStyles.statValue, { color: colors.text }]}>{recommendation.distance.toFixed(1)}km</Text>
            </View>

            <View style={[parkingRecommendationStyles.statItem, { backgroundColor: colors.background }]}>
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <Text style={[parkingRecommendationStyles.statLabel, { color: colors.textSecondary }]}>{t.recommend.time}</Text>
              <Text style={[parkingRecommendationStyles.statValue, { color: colors.text }]}>{recommendation.estimatedTime}ph</Text>
            </View>
          </View>

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

          <View style={[parkingRecommendationStyles.actionButton, { backgroundColor: colors.primary }]}>
            <Text style={parkingRecommendationStyles.actionButtonText}>{t.recommend.viewOnMap}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default ParkingRecommendationComponent;

