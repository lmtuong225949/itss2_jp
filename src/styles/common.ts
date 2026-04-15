import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
    tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeTabText: {
    color: '#fff',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
});

export const recommendStyles = StyleSheet.create({
  recommendContainer: {
    flex: 1,
    padding: 16,
  },
  recommendHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  recommendTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  recommendSubtitle: {
    fontSize: 14,
  },
});
