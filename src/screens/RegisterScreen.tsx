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
import { registerScreenStyles } from '../styles/registerScreen';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
  onLanguageChange: (lang: 'vi' | 'en' | 'ja') => void;
  currentLanguage: 'vi' | 'en' | 'ja';
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitchToLogin, onLanguageChange, currentLanguage }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [languageDropdownVisible, setLanguageDropdownVisible] = useState(false);

  const { colors } = useTheme();
  const { register } = useAuth();
  const t = useTranslation(currentLanguage);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Lỗi', t.auth.errorFillAll);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', t.auth.errorPasswordMismatch);
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', t.auth.errorPasswordLength);
      return;
    }

    setLoading(true);
    const success = await register(name, email, password);
    setLoading(false);

    if (!success) {
      Alert.alert('Lỗi', t.auth.errorRegisterFailed);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[registerScreenStyles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={registerScreenStyles.languageContainer}>
        <TouchableOpacity
          style={[registerScreenStyles.languageButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setLanguageDropdownVisible(!languageDropdownVisible)}
        >
          <Text style={registerScreenStyles.flag}>
            {currentLanguage === 'vi' ? t.settings.flagVI : currentLanguage === 'en' ? t.settings.flagEN : t.settings.flagJA}
          </Text>
          <Ionicons name={languageDropdownVisible ? 'chevron-up' : 'chevron-down'} size={16} color={colors.text} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
        {languageDropdownVisible && (
          <View style={[registerScreenStyles.languageDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {['vi', 'en', 'ja'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  registerScreenStyles.languageDropdownItem,
                  currentLanguage === lang && { backgroundColor: colors.primary }
                ]}
                onPress={() => {
                  onLanguageChange(lang as 'vi' | 'en' | 'ja');
                  setLanguageDropdownVisible(false);
                }}
              >
                <Text style={registerScreenStyles.flag}>
                  {lang === 'vi' ? t.settings.flagVI : lang === 'en' ? t.settings.flagEN : t.settings.flagJA}
                </Text>
                <Text style={[
                  registerScreenStyles.languageDropdownText,
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
      <View style={registerScreenStyles.content}>
        <View style={registerScreenStyles.logoContainer}>
          <Ionicons name="car" size={80} color={colors.primary} />
          <Text style={[registerScreenStyles.title, { color: colors.text }]}>FindParking</Text>
          <Text style={[registerScreenStyles.subtitle, { color: colors.textSecondary }]}>
            {t.auth.registerTitle}
          </Text>
        </View>

        <View style={registerScreenStyles.form}>
          <View style={[registerScreenStyles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={registerScreenStyles.inputIcon} />
            <TextInput
              style={[registerScreenStyles.input, { color: colors.text }]}
              placeholder={t.auth.name}
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={[registerScreenStyles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={registerScreenStyles.inputIcon} />
            <TextInput
              style={[registerScreenStyles.input, { color: colors.text }]}
              placeholder={t.auth.email}
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={[registerScreenStyles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={registerScreenStyles.inputIcon} />
            <TextInput
              style={[registerScreenStyles.input, { color: colors.text }]}
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

          <View style={[registerScreenStyles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={registerScreenStyles.inputIcon} />
            <TextInput
              style={[registerScreenStyles.input, { color: colors.text }]}
              placeholder={t.auth.confirmPassword}
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[registerScreenStyles.button, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={registerScreenStyles.buttonText}>{loading ? t.auth.registering : t.auth.register}</Text>
          </TouchableOpacity>
        </View>

        <View style={registerScreenStyles.footer}>
          <Text style={[registerScreenStyles.footerText, { color: colors.textSecondary }]}>
            {t.auth.hasAccount}
          </Text>
          <TouchableOpacity onPress={onSwitchToLogin}>
            <Text style={[registerScreenStyles.link, { color: colors.primary }]}>{t.auth.login}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
