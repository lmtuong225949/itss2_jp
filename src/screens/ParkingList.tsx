import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParkingLot } from '../types/parking';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../utils/translations';
import { getParkingListStyles } from '../styles/parkingList';

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

    const styles = useMemo(() => getParkingListStyles(colors), [colors]);

    // Distinct contrast configurations for the space availability dock
    const getDockConfig = (available: number, total: number) => {
        const ratio = available / total;
        if (ratio <= 0.1) {
            return { bg: '#fef2f2', text: '#ef4444', label: t.list.almostFull || 'Almost Full' };
        }
        if (ratio <= 0.3) {
            return { bg: '#fffbeb', text: '#b45309', label: t.list.fewSpaces || 'Limited Spaces' };
        }
        return { bg: '#f0fdf4', text: '#15803d', label: t.list.manySpaces || 'Spaces Available' };
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>{t.list.title}</Text>
                <Text style={styles.subtitle}>
                    {parkingLots.length} {t.list.available} • {t.list.sortByDistance}
                </Text>
            </View>

            {parkingLots.map((parking) => {
                const isSelected = selectedParking?.id === parking.id;
                const dock = getDockConfig(parking.availableSpaces, parking.totalSpaces);

                return (
                    <TouchableOpacity
                        key={parking.id}
                        style={[styles.parkingCard, isSelected && styles.selectedCard]}
                        onPress={() => onParkingSelect(parking)}
                        activeOpacity={0.85}
                    >
                        {/* Row 1: Identity & Rating Header */}
                        <View style={styles.cardHeader}>
                            <View style={styles.titleBlock}>
                                <Text style={styles.parkingName} numberOfLines={1}>
                                    {parking.name}
                                </Text>
                                <View style={styles.addressRow}>
                                    <Text style={styles.addressText} numberOfLines={1}>
                                        {parking.address}
                                    </Text>
                                </View>
                            </View>

                            {parking.rating && (
                                <View style={styles.ratingBadge}>
                                    <Ionicons name="star" size={12} color="#f59e0b" />
                                    <Text style={styles.ratingText}>{parking.rating.toFixed(1)}</Text>
                                </View>
                            )}
                        </View>

                        {/* Row 2: Isolated Space Counter Dock (High visual prominence) */}
                        <View style={[styles.spaceDock, { backgroundColor: dock.bg }]}>
                            <View style={styles.dockLeft}>
                                <Ionicons name="car" size={16} color={dock.text} style={styles.dockIcon} />
                                <Text style={[styles.dockLabel, { color: dock.text }]}>
                                    {dock.label}
                                </Text>
                            </View>
                            <Text style={[styles.spaceCountText, { color: dock.text }]}>
                                {parking.availableSpaces}<Text style={{ fontSize: 12, fontWeight: '500' }}> / {parking.totalSpaces}</Text>
                            </Text>
                        </View>

                        {/* Row 3: Commercial Band (Pricing and Distances clearly coupled) */}
                        <View style={styles.commercialBand}>
                            <View style={styles.dataGroup}>
                                <Ionicons name="cash-outline" size={15} color={colors.textSecondary} style={styles.dataIcon} />
                                <Text style={styles.dataValue}>
                                    {parking.pricePerHour.toLocaleString()}đ
                                </Text>
                                <Text style={styles.dataLabel}>/{t.list.hour}</Text>
                            </View>

                            <View style={styles.dataGroup}>
                                <Ionicons name="navigate-outline" size={15} color={colors.textSecondary} style={styles.dataIcon} />
                                <Text style={styles.dataValue}>
                                    {parking.distance ? `${parking.distance.toFixed(1)} km` : '---'}
                                </Text>
                                <Text style={styles.dataLabel}>{t.list.distance}</Text>
                            </View>
                        </View>

                        {/* Row 4: Clean Content Tags */}
                        {parking.features && parking.features.length > 0 && (
                            <View style={styles.featuresRow}>
                                {parking.features.slice(0, 3).map((feature, idx) => (
                                    <View key={idx} style={styles.featureTag}>
                                        <Text style={styles.featureText}>{feature}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Row 5: Operating Status & Action Link */}
                        <View style={styles.cardFooter}>
                            <View style={styles.statusGroup}>
                                <View style={[styles.statusDot, { backgroundColor: parking.isOpen ? '#16a34a' : '#ef4444' }]} />
                                <Text style={[styles.statusText, { color: parking.isOpen ? colors.text : colors.textSecondary }]}>
                                    {parking.isOpen ? t.list.open : t.list.closed}
                                </Text>
                            </View>

                            <View style={styles.actionLink}>
                                <Text style={styles.actionLinkText}>{t.recommend.viewOnMap}</Text>
                                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

export default ParkingList;