import React from 'react';
import { View, Text, Modal, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../utils/translations';
import { settingsModalStyles } from '../styles/settingsModal';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose, onLogout }) => {
  const { theme, toggleTheme, language, setLanguage, colors } = useTheme();
  const t = useTranslation(language).settings;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={settingsModalStyles.overlay}>
        <SafeAreaView style={settingsModalStyles.safeArea}>
          <View style={[settingsModalStyles.container, { backgroundColor: colors.card }]}>
            <View style={settingsModalStyles.header}>
              <Text style={[settingsModalStyles.title, { color: colors.text }]}>{t.title}</Text>
              <TouchableOpacity onPress={onClose} style={settingsModalStyles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={settingsModalStyles.section}>
              <Text style={[settingsModalStyles.sectionTitle, { color: colors.textSecondary }]}>
                {t.theme}
              </Text>
              <View style={settingsModalStyles.optionRow}>
                <TouchableOpacity
                  style={[
                    settingsModalStyles.option,
                    theme === 'light' && settingsModalStyles.activeOption,
                    { backgroundColor: theme === 'light' ? colors.primary : colors.border, borderColor: colors.border }
                  ]}
                  onPress={() => toggleTheme()}
                >
                  <Ionicons
                    name="sunny"
                    size={20}
                    color={theme === 'light' ? '#fff' : colors.text}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[
                    settingsModalStyles.optionText,
                    { color: theme === 'light' ? '#fff' : colors.text }
                  ]}>
                    {t.light}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    settingsModalStyles.option,
                    theme === 'dark' && settingsModalStyles.activeOption,
                    { backgroundColor: theme === 'dark' ? colors.primary : colors.border, borderColor: colors.border }
                  ]}
                  onPress={() => toggleTheme()}
                >
                  <Ionicons
                    name="moon"
                    size={20}
                    color={theme === 'dark' ? '#fff' : colors.text}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[
                    settingsModalStyles.optionText,
                    { color: theme === 'dark' ? '#fff' : colors.text }
                  ]}>
                    {t.dark}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={settingsModalStyles.section}>
              <Text style={[settingsModalStyles.sectionTitle, { color: colors.textSecondary }]}>
                {t.language}
              </Text>
              <View style={settingsModalStyles.optionRow}>
                <TouchableOpacity
                  style={[
                    settingsModalStyles.option,
                    language === 'vi' && settingsModalStyles.activeOption,
                    { backgroundColor: language === 'vi' ? colors.primary : colors.border, borderColor: colors.border }
                  ]}
                  onPress={() => setLanguage('vi')}
                >
                  <Text style={[
                    settingsModalStyles.optionText,
                    { color: language === 'vi' ? '#fff' : colors.text }
                  ]}>
                    {t.vietnamese}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    settingsModalStyles.option,
                    language === 'en' && settingsModalStyles.activeOption,
                    { backgroundColor: language === 'en' ? colors.primary : colors.border, borderColor: colors.border }
                  ]}
                  onPress={() => setLanguage('en')}
                >
                  <Text style={[
                    settingsModalStyles.optionText,
                    { color: language === 'en' ? '#fff' : colors.text }
                  ]}>
                    {t.english}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    settingsModalStyles.option,
                    language === 'ja' && settingsModalStyles.activeOption,
                    { backgroundColor: language === 'ja' ? colors.primary : colors.border, borderColor: colors.border }
                  ]}
                  onPress={() => setLanguage('ja')}
                >
                  <Text style={[
                    settingsModalStyles.optionText,
                    { color: language === 'ja' ? '#fff' : colors.text }
                  ]}>
                    {t.japanese}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {onLogout && (
              <View style={settingsModalStyles.section}>
                <TouchableOpacity
                  style={[settingsModalStyles.logoutButton, { backgroundColor: '#ef4444' }]}
                  onPress={() => {
                    onLogout();
                    onClose();
                  }}
                >
                  <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={settingsModalStyles.logoutButtonText}>{t.logout}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default SettingsModal;
