import { StyleSheet } from 'react-native';

interface ThemeColors {
    card: string;
    background: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
}

export const getParkingListStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollContent: {
            paddingTop: 16,
            paddingBottom: 32,
            paddingHorizontal: 16,
        },
        header: {
            marginBottom: 16,
            paddingHorizontal: 4,
        },
        title: {
            fontSize: 22,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.5,
        },
        subtitle: {
            fontSize: 13,
            color: colors.textSecondary,
            marginTop: 2,
        },
        parkingCard: {
            backgroundColor: colors.card,
            marginBottom: 14,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
        },
        selectedCard: {
            borderColor: colors.primary,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
        },
        // Top Row Structure
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
        },
        titleBlock: {
            flex: 1,
            paddingRight: 12,
        },
        parkingName: {
            fontSize: 17,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.3,
            marginBottom: 4,
        },
        addressRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        addressText: {
            fontSize: 13,
            color: colors.textSecondary,
        },
        ratingBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: `${colors.textSecondary}08`,
            paddingHorizontal: 6,
            paddingVertical: 3,
            borderRadius: 6,
        },
        ratingText: {
            fontSize: 12,
            fontWeight: '700',
            color: colors.text,
            marginLeft: 4,
        },
        // The "Split-Dock" Space counter layout
        spaceDock: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 8,
            marginBottom: 12,
        },
        dockLeft: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        dockIcon: {
            marginRight: 8,
        },
        dockLabel: {
            fontSize: 12,
            fontWeight: '500',
        },
        spaceCountText: {
            fontSize: 15,
            fontWeight: '700',
        },
        // Commercial Metric Band (Price & Distance Side-by-Side)
        commercialBand: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 10,
            borderTopWidth: 0.5,
            borderBottomWidth: 0.5,
            borderColor: colors.border,
            marginBottom: 12,
        },
        dataGroup: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        dataIcon: {
            marginRight: 6,
            opacity: 0.7,
        },
        dataValue: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        dataLabel: {
            fontSize: 12,
            color: colors.textSecondary,
            marginLeft: 2,
        },
        // Feature Tags Area
        featuresRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
            marginBottom: 14,
        },
        featureTag: {
            backgroundColor: colors.background,
            borderWidth: 0.5,
            borderColor: colors.border,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
        },
        featureText: {
            fontSize: 11,
            color: colors.textSecondary,
            fontWeight: '500',
        },
        // Clean Action Footer Block
        cardFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        statusGroup: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        statusDot: {
            width: 6,
            height: 6,
            borderRadius: 3,
            marginRight: 6,
        },
        statusText: {
            fontSize: 12,
            fontWeight: '600',
        },
        actionLink: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        actionLinkText: {
            fontSize: 13,
            fontWeight: '700',
            color: colors.primary,
            marginRight: 2,
        },
    });