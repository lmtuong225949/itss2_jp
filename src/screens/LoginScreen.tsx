import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../utils/translations';
import { loginScreenStyles } from '../styles/loginScreen';

interface LoginScreenProps {
  onSwitchToRegister: () => void;
  onLanguageChange: (lang: 'vi' | 'en' | 'ja') => void;
  currentLanguage: 'vi' | 'en' | 'ja';
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSwitchToRegister, onLanguageChange, currentLanguage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [languageDropdownVisible, setLanguageDropdownVisible] = useState(false);

  const { colors } = useTheme();
  const { login } = useAuth();
  const t = useTranslation(currentLanguage);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', t.auth.errorFillEmailPassword);
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (!success) {
      Alert.alert('Lỗi', t.auth.errorLoginFailed);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[loginScreenStyles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={loginScreenStyles.languageContainer}>
        <TouchableOpacity
          style={[loginScreenStyles.languageButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setLanguageDropdownVisible(!languageDropdownVisible)}
        >
          <Text style={loginScreenStyles.flag}>
            {currentLanguage === 'vi' ? t.settings.flagVI : currentLanguage === 'en' ? t.settings.flagEN : t.settings.flagJA}
          </Text>
          <Ionicons name={languageDropdownVisible ? 'chevron-up' : 'chevron-down'} size={16} color={colors.text} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
        {languageDropdownVisible && (
          <View style={[loginScreenStyles.languageDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {['vi', 'en', 'ja'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  loginScreenStyles.languageDropdownItem,
                  currentLanguage === lang && { backgroundColor: colors.primary }
                ]}
                onPress={() => {
                  onLanguageChange(lang as 'vi' | 'en' | 'ja');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={loginScreenStyles.flag}>
                  {lang === 'vi' ? t.settings.flagVI : lang === 'en' ? t.settings.flagEN : t.settings.flagJA}
                </Text>
                <Text style={[
                  loginScreenStyles.languageDropdownText,
                  { color: currentLanguage === lang ? '#fff' : colors.text },
                  { marginLeft: 8 }
                ]}>
                  {lang === 'vi' ? t.settings.vietnamese : lang === 'en' ? t.settings.english : t.settings.japanese}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      <View style={loginScreenStyles.content}>
        <View style={loginScreenStyles.logoContainer}>
          <Ionicons name="car" size={80} color={colors.primary} />
          <Text style={[loginScreenStyles.title, { color: colors.text }]}>FindParking</Text>
          <Text style={[loginScreenStyles.subtitle, { color: colors.textSecondary }]}>
            {t.auth.loginTitle}
          </Text>
        </View>

        <View style={loginScreenStyles.form}>
          <View style={[loginScreenStyles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={loginScreenStyles.inputIcon} />
            <TextInput
              style={[loginScreenStyles.input, { color: colors.text }]}
              placeholder={t.auth.email}
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={[loginScreenStyles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={loginScreenStyles.inputIcon} />
            <TextInput
              style={[loginScreenStyles.input, { color: colors.text }]}
              placeholder={t.auth.password}
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[loginScreenStyles.button, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={loginScreenStyles.buttonText}>{loading ? t.auth.loggingIn : t.auth.login}</Text>
          </TouchableOpacity>
        </View>

        <View style={loginScreenStyles.footer}>
          <Text style={[loginScreenStyles.footerText, { color: colors.textSecondary }]}>
            {t.auth.noAccount}
          </Text>
          <TouchableOpacity onPress={onSwitchToRegister}>
            <Text style={[loginScreenStyles.link, { color: colors.primary }]}>{t.auth.register}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
