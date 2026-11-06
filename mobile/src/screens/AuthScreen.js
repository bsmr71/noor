import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  SafeAreaView,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/fonts';
import { mobileApiClient } from '../services/apiClient';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';
import { useKeyboardVisible } from '../utils/useKeyboardVisible';

export default function AuthScreen({ onLoginSuccess }) {
  const isKeyboardVisible = useKeyboardVisible();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [selectedRole, setSelectedRole] = useState('jamaah');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    setErrorMsg('');

    if (!email || !password || (!isLogin && !name)) {
      setErrorMsg('Mohon lengkapi seluruh kolom formulir.');
      return;
    }

    if (!isLogin && password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter demi keamanan akun Anda.');
      return;
    }

    if (!isLogin && password !== passwordConfirmation) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok. Silakan ketik ulang.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Attempt API login
        const res = await mobileApiClient.login(email.trim(), password);
        if (res && res.user) {
          Alert.alert(
            'Alhamdulillah!',
            `Assalamu'alaikum, ${res.user.name}!\nPeran Anda: ${res.user.role === 'admin' ? 'Super Administrator' : 'Jamaah Aktif'}`
          );
          onLoginSuccess({
            ...res.user,
            token: res.token,
            isLoggedIn: true,
          });
          return;
        }
      } else {
        // Attempt API register
        const res = await mobileApiClient.register(
          name.trim(),
          email.trim(),
          password,
          selectedRole
        );
        if (res && res.user) {
          Alert.alert(
            'Alhamdulillah!',
            `Pendaftaran berhasil! Selamat datang di Noor, ${res.user.name}.\nPeran: ${res.user.role === 'admin' ? 'Administrator' : 'Jamaah'}`
          );
          onLoginSuccess({
            ...res.user,
            token: res.token,
            isLoggedIn: true,
          });
          return;
        }
      }
    } catch (err) {
      setErrorMsg(
        err?.message || 'Gagal masuk. Periksa kembali email, kata sandi, atau koneksi internet Anda.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isKeyboardVisible && { justifyContent: 'flex-start', paddingTop: 14 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={[styles.brandContainer, isKeyboardVisible && { marginBottom: 10 }]}>
            {!isKeyboardVisible && (
              <View style={styles.logoBadge}>
                <MaterialCommunityIcons name="mosque" size={36} color="#002721" />
              </View>
            )}
            <Text style={[styles.brandTitle, isKeyboardVisible && { fontSize: 22 }]}>Noor</Text>
            {!isKeyboardVisible && (
              <>
                <Text style={styles.brandSubtitle}>
                  Islamic Super App • Ekosistem Ibadah & Syiar
                </Text>
                <View style={styles.authNoticePill}>
                  <MaterialCommunityIcons name="shield-lock-outline" size={14} color="#fe932c" />
                  <Text style={styles.authNoticeText}>
                    Wajib masuk akun untuk sinkronisasi ibadah & peran
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Card Container */}
          <View style={styles.card}>
            {/* Segmented Mode Selector */}
            <View style={styles.modeSelector}>
              <TouchableOpacity
                style={[styles.modeTab, isLogin && styles.modeTabActive]}
                onPress={() => {
                  setIsLogin(true);
                  setErrorMsg('');
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="login"
                  size={16}
                  color={isLogin ? '#ffffff' : '#6f7975'}
                />
                <Text style={[styles.modeTabText, isLogin && styles.modeTabTextActive]}>
                  Masuk Akun
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeTab, !isLogin && styles.modeTabActive]}
                onPress={() => {
                  setIsLogin(false);
                  setErrorMsg('');
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="account-plus-outline"
                  size={16}
                  color={!isLogin ? '#ffffff' : '#6f7975'}
                />
                <Text style={[styles.modeTabText, !isLogin && styles.modeTabTextActive]}>
                  Daftar Baru
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Message Alert */}
            {!!errorMsg && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#ba1a1a" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.formGroup}>
              {/* If Register: Input Full Name */}
              {!isLogin && (
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>
                    Nama Lengkap <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={styles.inputBox}>
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={18}
                      color="#6f7975"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Contoh: Muhammad Ilham"
                      placeholderTextColor="#9ca3af"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              )}

              {/* Email Address */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>
                  Alamat Email <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputBox}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={18}
                    color="#6f7975"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="nama@email.com"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>
                  Kata Sandi <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputBox}>
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={18}
                    color="#6f7975"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Minimal 6 karakter"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#6f7975"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* If Register: Confirm Password */}
              {!isLogin && (
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>
                    Konfirmasi Kata Sandi <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={styles.inputBox}>
                    <MaterialCommunityIcons
                      name="shield-check-outline"
                      size={18}
                      color="#6f7975"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ulangi kata sandi Anda"
                      placeholderTextColor="#9ca3af"
                      value={passwordConfirmation}
                      onChangeText={setPasswordConfirmation}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              )}

              {/* If Register: Role Selection */}
              {!isLogin && (
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>
                    Pilih Peran Akun <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={styles.rolePickerRow}>
                    <TouchableOpacity
                      style={[
                        styles.rolePickerBtn,
                        selectedRole === 'jamaah' && styles.rolePickerBtnActive,
                      ]}
                      onPress={() => setSelectedRole('jamaah')}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.rolePickerText,
                          selectedRole === 'jamaah' && styles.rolePickerTextActive,
                        ]}
                      >
                        🕌 Jamaah
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.rolePickerBtn,
                        selectedRole === 'ustadz' && styles.rolePickerBtnActive,
                      ]}
                      onPress={() => setSelectedRole('ustadz')}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.rolePickerText,
                          selectedRole === 'ustadz' && styles.rolePickerTextActive,
                        ]}
                      >
                        🎓 Ustadz
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name={isLogin ? 'login-variant' : 'account-check-outline'}
                      size={20}
                      color="#ffffff"
                    />
                    <Text style={styles.submitBtnText}>
                      {isLogin ? 'Masuk ke Aplikasi Noor' : 'Daftarkan Akun Sekarang'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Guest / Continue Without Account Button */}
              <TouchableOpacity
                style={styles.guestBtn}
                onPress={() => {
                  onLoginSuccess({
                    id: 'guest',
                    name: 'Jamaah Tamu',
                    email: 'tamu@noor.app',
                    role: 'jamaah',
                    isLoggedIn: true,
                    isGuest: true,
                  });
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="account-arrow-right-outline" size={18} color="#059669" />
                <Text style={styles.guestBtnText}>Lanjutkan Tanpa Akun (Mode Tamu)</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Copyright */}
          <Text style={styles.footerText}>
            © 2026 Noor Islamic Super App • Serene Sanctuary Ecosystem
          </Text>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#002721',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#fe932c',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fe932c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: Fonts.headline,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#a3d9cf',
    marginTop: 4,
    textAlign: 'center',
  },
  authNoticePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(254, 147, 44, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(254, 147, 44, 0.35)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 10,
  },
  authNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffddb3',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f2f4f3',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: '#0f3e36',
    shadowColor: '#0f3e36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6f7975',
  },
  modeTabTextActive: {
    color: '#ffffff',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffdad6',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ffb4ab',
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#ba1a1a',
    fontWeight: '600',
  },
  formGroup: {
    gap: 12,
  },
  inputWrapper: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f3e36',
  },
  requiredStar: {
    color: '#ba1a1a',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faf9',
    borderWidth: 1,
    borderColor: '#dde3e0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#191c1b',
    paddingVertical: 8,
  },
  eyeBtn: {
    padding: 6,
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  rolePickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f2f4f3',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  rolePickerBtnActive: {
    backgroundColor: '#e6f4f1',
    borderColor: '#0f3e36',
  },
  rolePickerBtnActiveGold: {
    backgroundColor: '#fff4e5',
    borderColor: '#fe932c',
  },
  rolePickerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6f7975',
  },
  rolePickerTextActive: {
    color: '#0f3e36',
  },
  rolePickerTextActiveGold: {
    color: '#904d00',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0f3e36',
    borderRadius: 14,
    height: 48,
    marginTop: 6,
    shadowColor: '#0f3e36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  demoBox: {
    marginTop: 18,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#f8faf9',
    borderWidth: 1,
    borderColor: '#e2e8e5',
  },
  demoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f3e36',
  },
  demoBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  demoBtnActiveJamaah: {
    borderColor: '#0f3e36',
    backgroundColor: '#f0fdf9',
  },
  demoBtnActiveAdmin: {
    borderColor: '#fe932c',
    backgroundColor: '#fffbeb',
  },
  demoBadgeJamaah: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  demoBadgeAdmin: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  demoBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#166534',
  },
  demoBadgeTextAdmin: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#92400e',
  },
  demoUserText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  demoEmailText: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  roleInfoCard: {
    marginTop: 16,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#fafaf9',
    borderWidth: 1,
    borderColor: '#ebebeb',
    gap: 6,
  },
  roleInfoTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  roleInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  roleInfoBullet: {
    fontSize: 12,
    marginTop: 1,
  },
  roleInfoDesc: {
    flex: 1,
    fontSize: 10.5,
    color: '#4b5563',
    lineHeight: 15,
  },
  footerText: {
    fontSize: 11,
    color: '#6e9890',
    marginTop: 20,
    textAlign: 'center',
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    backgroundColor: '#ecfdf5',
  },
  guestBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
});

