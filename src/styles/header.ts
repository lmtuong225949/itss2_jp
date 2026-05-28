import { StyleSheet } from 'react-native';

export const headerStyles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  settingsButton: {
    padding: 4,
  },
});
