import React from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ParkingLot } from "../types/parking";
import { useTheme } from "../contexts/ThemeContext";

interface ParkingDetailScreenProps {
  parkingLot: ParkingLot;
  onBack: () => void;
  onShowOnMap: (parkingLot: ParkingLot) => void;
}

const getParkingImage = (id: string) => {
  switch (id) {
    case '1': return 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a'; // C7
    case '2': return 'https://images.unsplash.com/photo-1590674899484-d5640e854abe'; // D3-D5
    case '3': return 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98'; // D9
    case '4': return 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7'; // D6-D8
    case '5': return 'https://images.unsplash.com/photo-1517649763962-0c623066013b'; // C9
    default: return 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a';
  }
};

export default function ParkingDetailScreen({ parkingLot, onBack, onShowOnMap }: ParkingDetailScreenProps) {
    const { colors, theme } = useTheme();

    // Stats and values
    const distanceVal = parkingLot.distance ? parkingLot.distance.toFixed(1) : '---';
    const dayPrice = parkingLot.pricePerHour;
    const nightPrice = parkingLot.pricePerHour + 1000;
    const overnightPrice = parkingLot.pricePerHour * 2;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Unified Header */}
            <View style={[styles.header, { backgroundColor: colors.header }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.headerText} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.headerText }]} numberOfLines={1}>
                    {parkingLot.name}
                </Text>
                <View style={styles.headerRightSpacer} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Image Card */}
                <View style={[styles.imageCard, { backgroundColor: colors.card }]}>
                    <Image
                        source={{
                            uri: getParkingImage(parkingLot.id),
                        }}
                        style={styles.parkingImage}
                    />
                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                        <Ionicons name="car" size={14} color="#fff" />
                    </View>
                    <Text style={styles.imageTitle}>{parkingLot.name}</Text>
                </View>

                {/* Info Card */}
                <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.rowBetween}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>ĐỊA CHỈ</Text>
                            <Text style={[styles.placeName, { color: colors.text }]}>{parkingLot.name}</Text>
                            <Text style={[styles.addressText, { color: colors.textSecondary }]}>{parkingLot.address}</Text>
                        </View>

                        <TouchableOpacity 
                            style={[styles.iconBox, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={() => onShowOnMap(parkingLot)}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name="directions"
                                size={24}
                                color={colors.primary}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={[styles.statBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <Text style={[styles.statPurple, { color: colors.primary }]}>{dayPrice.toLocaleString('vi-VN')}</Text>
                            <Text style={[styles.statSmall, { color: colors.textSecondary }]}>TRƯỚC</Text>
                            <Text style={[styles.statSmall, { color: colors.textSecondary }]}>18H</Text>
                        </View>

                        <View style={[styles.statBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <Text style={[styles.statGold, { color: theme === 'light' ? '#B9A178' : '#d4af37' }]}>{nightPrice.toLocaleString('vi-VN')}</Text>
                            <Text style={[styles.statSmall, { color: colors.textSecondary }]}>SAU</Text>
                            <Text style={[styles.statSmall, { color: colors.textSecondary }]}>18H</Text>
                        </View>

                        <View style={[styles.statBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <Text style={[styles.statBlack, { color: colors.text }]}>{distanceVal}</Text>
                            <Text style={[styles.statSmall, { color: colors.textSecondary }]}>KM</Text>
                        </View>
                    </View>
                </View>

                {/* Chart Card */}
                <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.rowBetween}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Giờ cao điểm</Text>
                        <View style={styles.liveRow}>
                            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                            <Text style={[styles.liveText, { color: colors.textSecondary }]}>Trực tiếp</Text>
                        </View>
                    </View>

                    <View style={styles.chart}>
                        {[70, 100, 130, 180, 150, 110, 80, 55].map((height, index) => (
                            <View key={index} style={styles.barWrapper}>
                                {index === 3 && (
                                    <View style={[styles.nowBadge, { backgroundColor: colors.primary }]}>
                                        <Text style={styles.nowText}>Now</Text>
                                    </View>
                                )}
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height,
                                            backgroundColor: index === 3 ? colors.primary : (theme === 'light' ? '#DEDCE7' : '#475569'),
                                        },
                                    ]}
                                />
                            </View>
                        ))}
                    </View>

                    <View style={styles.timeRow}>
                        <Text style={[styles.timeText, { color: colors.textSecondary }]}>8 AM</Text>
                        <Text style={[styles.timeText, { color: colors.textSecondary }]}>12 PM</Text>
                        <Text style={[styles.timeText, { color: colors.textSecondary }]}>4 PM</Text>
                        <Text style={[styles.timeText, { color: colors.textSecondary }]}>8 PM</Text>
                    </View>
                </View>

                {/* Price */}
                <Text style={[styles.priceTitle, { color: colors.text }]}>Cơ cấu giá</Text>

                <View style={[styles.priceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: colors.text }]}>6h-18h</Text>
                        <Text style={[styles.priceValue, { color: colors.text }]}>{dayPrice.toLocaleString('vi-VN')} đ</Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: colors.text }]}>Sau 18h</Text>
                        <Text style={[styles.priceValue, { color: colors.text }]}>{nightPrice.toLocaleString('vi-VN')} đ</Text>
                    </View>

                    <View style={[styles.priceRowHighlight, { backgroundColor: theme === 'light' ? '#F3EEFB' : '#1e1b4b' }]}>
                        <Text style={[styles.pricePurple, { color: colors.primary }]}>Qua đêm</Text>
                        <Text style={[styles.pricePurple, { color: colors.primary }]}>{overnightPrice.toLocaleString('vi-VN')} đ</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 80,
        paddingTop: 30,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
        flex: 1,
        marginHorizontal: 16,
    },
    headerRightSpacer: {
        width: 32,
    },
    scrollContent: {
        paddingBottom: 32,
    },
    imageCard: {
        marginHorizontal: 24,
        marginTop: 24,
        height: 250,
        borderRadius: 24,
        overflow: "hidden",
        position: "relative",
    },
    parkingImage: {
        width: "100%",
        height: "100%",
    },
    badge: {
        position: "absolute",
        left: 24,
        bottom: 24,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    imageTitle: {
        position: "absolute",
        left: 68,
        bottom: 24,
        color: "#fff",
        fontSize: 24,
        fontWeight: "800",
        textShadowColor: 'rgba(0, 0, 0, 0.6)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    infoCard: {
        marginHorizontal: 24,
        marginTop: 24,
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    label: {
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 2,
    },
    placeName: {
        marginTop: 4,
        fontSize: 18,
        fontWeight: "800",
    },
    addressText: {
        marginTop: 4,
        fontSize: 13,
        lineHeight: 18,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    statsRow: {
        marginTop: 24,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statBox: {
        flex: 1,
        marginHorizontal: 4,
        height: 80,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    statPurple: {
        fontSize: 16,
        fontWeight: "900",
    },
    statGold: {
        fontSize: 16,
        fontWeight: "900",
    },
    statBlack: {
        fontSize: 16,
        fontWeight: "900",
    },
    statSmall: {
        fontSize: 9,
        fontWeight: "800",
        marginTop: 2,
    },
    chartCard: {
        marginHorizontal: 24,
        marginTop: 24,
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
    },
    liveRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    liveText: {
        fontSize: 12,
        fontWeight: "600",
    },
    chart: {
        marginTop: 24,
        height: 150,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
    },
    barWrapper: {
        alignItems: "center",
        justifyContent: "flex-end",
    },
    bar: {
        width: 24,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
    },
    nowBadge: {
        marginBottom: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    nowText: {
        color: "#fff",
        fontSize: 8,
        fontWeight: "800",
    },
    timeRow: {
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    timeText: {
        fontSize: 10,
        fontWeight: "800",
    },
    priceTitle: {
        marginHorizontal: 28,
        marginTop: 28,
        marginBottom: 12,
        fontSize: 18,
        fontWeight: "900",
    },
    priceCard: {
        marginHorizontal: 24,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
    },
    priceRow: {
        height: 56,
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    priceRowHighlight: {
        height: 56,
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    priceLabel: {
        fontSize: 15,
    },
    priceValue: {
        fontSize: 15,
        fontWeight: "900",
    },
    pricePurple: {
        fontSize: 15,
        fontWeight: "800",
    },
    divider: {
        height: 1,
    },
});