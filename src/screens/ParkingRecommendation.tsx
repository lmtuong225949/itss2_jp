import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParkingRecommendation as RecommendationType } from '../types/parking';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../utils/translations';
import { getParkingRecommendationStyles } from '../styles/parkingRecommendation';

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

    // Memoize styles to prevent useless recalculations on re-renders
    const styles = useMemo(() => getParkingRecommendationStyles(colors), [colors]);

    if (recommendations.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={54} color={colors.textSecondary} style={{ marginBottom: 12 }} />
                <Text style={styles.emptyText}>{t.recommend.empty}</Text>
                <Text style={styles.emptySubtext}>{t.recommend.emptySubtext}</Text>
            </View>
        );
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {recommendations.map((recommendation, index) => {
                const isTopRecommend = index === 0;
                const availabilityPercent = Math.round(recommendation.availabilityScore * 100);

                return (
                    <TouchableOpacity
                        key={recommendation.parkingLot.id}
                        style={[
                            styles.recommendationCard,
                            isTopRecommend && styles.topRecommendation
                        ]}
                        onPress={() => onRecommendationSelect(recommendation)}
                        activeOpacity={0.85}
                    >
                        {isTopRecommend && (
                            <View style={styles.topBadge}>
                                <Text style={styles.topBadgeText}>{t.recommend.best}</Text>
                            </View>
                        )}

                        <View style={styles.cardHeader}>
                            <View style={styles.rankBadge}>
                                <Text style={styles.rankText}>#{index + 1}</Text>
                            </View>
                            <View style={styles.headerText}>
                                <Text style={styles.parkingName} numberOfLines={1}>
                                    {recommendation.parkingLot.name}
                                </Text>
                                <View style={styles.addressRow}>
                                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                                    <Text style={styles.address} numberOfLines={1}>
                                        {recommendation.parkingLot.address}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.statsGrid}>
                            <View style={styles.statItem}>
                                <Ionicons name="car-outline" size={18} color={colors.primary} />
                                <Text style={styles.statLabel}>{t.recommend.availableSpaces}</Text>
                                <Text style={styles.statValue}>
                                    {recommendation.parkingLot.availableSpaces}/{recommendation.parkingLot.totalSpaces}
                                </Text>
                            </View>

                            <View style={styles.statItem}>
                                <Ionicons name="navigate-outline" size={18} color={colors.primary} />
                                <Text style={styles.statLabel}>{t.recommend.distance}</Text>
                                <Text style={styles.statValue}>{recommendation.distance.toFixed(1)} km</Text>
                            </View>

                            <View style={styles.statItem}>
                                <Ionicons name="time-outline" size={18} color={colors.primary} />
                                <Text style={styles.statLabel}>{t.recommend.time}</Text>
                                <Text style={styles.statValue}>{recommendation.estimatedTime} ph</Text>
                            </View>
                        </View>

                        <View style={styles.priceSection}>
                            <Text style={styles.priceLabel}>{t.recommend.price}</Text>
                            <Text style={styles.price}>
                                {recommendation.parkingLot.pricePerHour.toLocaleString()}đ {t.recommend.perHour}
                            </Text>
                        </View>

                        <View style={styles.scoreRow}>
                            <View style={styles.scoreInfo}>
                                <Text style={styles.scoreLabel}>{t.recommend.score}</Text>
                                <Text style={styles.scoreValue}>{availabilityPercent}%</Text>
                            </View>
                            <View style={styles.scoreBar}>
                                <View style={[styles.scoreFill, { width: `${availabilityPercent}%` }]} />
                            </View>
                        </View>

                        <View style={styles.reasonBox}>
                            <Ionicons name="bulb-outline" size={16} color={colors.primary} style={{ marginTop: 1 }} />
                            <Text style={styles.reason} numberOfLines={2}>
                                {recommendation.reasonKeys.map(key => t.recommend[key as keyof typeof t.recommend]).join(', ')}
                            </Text>
                        </View>

                        <View style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>{t.recommend.viewOnMap}</Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

export default ParkingRecommendationComponent;