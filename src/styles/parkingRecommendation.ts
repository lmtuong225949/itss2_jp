import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ThemeColors {
    card: string;
    background: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
}

export const getParkingRecommendationStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        scrollContent: {
            paddingTop: 16,
            paddingBottom: 32,
            paddingHorizontal: 16,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40,
            marginTop: 60,
        },
        emptyText: {
            fontSize: 18,
            textAlign: 'center',
            fontWeight: '700',
            marginBottom: 8,
            color: colors.text,
        },
        emptySubtext: {
            fontSize: 14,
            textAlign: 'center',
            color: colors.textSecondary,
            lineHeight: 20,
        },
        recommendationCard: {
            backgroundColor: colors.card,
            marginBottom: 20,
            borderRadius: 16,
            paddingTop: 24,
            paddingHorizontal: 18,
            paddingBottom: 18,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 16,
            elevation: 4,
            borderWidth: 1,
            borderColor: colors.border,
        },
        topRecommendation: {
            borderWidth: 2,
            borderColor: colors.primary,
            shadowColor: colors.primary,
            shadowOpacity: 0.12,
            shadowRadius: 20,
        },
        topBadge: {
            position: 'absolute',
            top: -12,
            left: 18,
            backgroundColor: colors.primary,
            paddingHorizontal: 14,
            paddingVertical: 5,
            borderRadius: 20,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 4,
            zIndex: 10,
        },
        topBadgeText: {
            color: '#fff',
            fontSize: 11,
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        cardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            marginTop: 4,
        },
        rankBadge: {
            backgroundColor: colors.background,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
            marginRight: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        rankText: {
            color: colors.primary,
            fontSize: 14,
            fontWeight: '800',
        },
        headerText: {
            flex: 1,
        },
        parkingName: {
            fontSize: 17,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 3,
        },
        addressRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        address: {
            fontSize: 13,
            color: colors.textSecondary,
            marginLeft: 4,
            flex: 1,
        },
        statsGrid: {
            flexDirection: 'row',
            gap: 8,
            marginBottom: 16,
        },
        statItem: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: colors.background,
            borderWidth: 0.5,
            borderColor: colors.border,
        },
        statLabel: {
            fontSize: 11,
            fontWeight: '500',
            color: colors.textSecondary,
            marginTop: 4,
            marginBottom: 2,
        },
        statValue: {
            fontSize: 13,
            fontWeight: '700',
            color: colors.text,
        },
        priceSection: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            padding: 14,
            borderRadius: 12,
            backgroundColor: colors.background,
        },
        priceLabel: {
            fontSize: 13,
            fontWeight: '500',
            color: colors.textSecondary,
        },
        price: {
            fontSize: 15,
            fontWeight: '700',
            color: colors.text,
        },
        scoreRow: {
            marginBottom: 16,
        },
        scoreInfo: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
        },
        scoreLabel: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.textSecondary,
        },
        scoreValue: {
            fontSize: 15,
            fontWeight: '700',
            color: colors.primary,
        },
        scoreBar: {
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.border,
            overflow: 'hidden',
        },
        scoreFill: {
            height: '100%',
            borderRadius: 3,
            backgroundColor: colors.primary,
        },
        reasonBox: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            padding: 12,
            borderRadius: 12,
            backgroundColor: colors.background,
            marginBottom: 16,
        },
        reason: {
            flex: 1,
            fontSize: 13,
            lineHeight: 18,
            marginLeft: 8,
            color: colors.text,
        },
        actionButton: {
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 2,
        },
        actionButtonText: {
            color: '#fff',
            fontSize: 15,
            fontWeight: '700',
            letterSpacing: 0.2,
        },
    });