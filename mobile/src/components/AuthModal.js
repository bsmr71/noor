import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/fonts';
import { mobileApiClient } from '../services/apiClient';
import KeyboardSafeModalWrapper from './KeyboardSafeModalWrapper';
import KeyboardAwareScrollView from './KeyboardAwareScrollView';
import { useKeyboardVisible } from '../utils/useKeyboardVisible';

export default function AuthModal({ visible, onClose, onLoginSuccess, initialMode = 'login' }) {
  const isKeyboardVisible = useKeyboardVisible();
  const [isLogin, setIsLogin] = useState(initialMode !== 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setIsLogin(initialMode !== 'register');
    setErrorMsg('');
  }, [initialMode, visible]);

  const handleSubmit = async () => {
    setErrorMsg('');

    if (!email || !password || (!isLogin && !name)) {
      setErrorMsg('Mohon lengkapi seluruh kolom yang wajib diisi.');
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
      const data = isLogin
        ? await mobileApiClient.login(email.trim(), password)
        : await mobileApiClient.register(name.trim(), email.trim(), password, 'jamaah');

      if (data.status === 'success' && data.user) {
        Alert.alert(
          'Alhamdulillah!',
          isLogin
            ? `Assalamu'alaikum, ${data.user.name}! Berhasil masuk ke akun Noor.`
            : `Selamat datang di Noor, ${data.user.name}! Akun Anda telah berhasil dibuat.`
        );
        onLoginSuccess({
          ...data.user,
          isLoggedIn: true,
          token: data.token,
        });
        onClose();
      } else {
        setErrorMsg(data.message || 'Gagal memproses otentikasi. Silakan periksa kembali data Anda.');
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Gagal terhubung ke server Noor. Pastikan koneksi internet Anda aktif.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardSafeModalWrapper backdropColor="rgba(0,0,0,0.65)">
        <View style={styles.sheetContainer}>
          {/* Top Decorative Header */}
          <View style={[styles.headerBlock, isKeyboardVisible && styles.headerBlockCompact]}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#ffffffcc" />
            </TouchableOpacity>

            {!isKeyboardVisible && (
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="mosque" size={28} color="#fe932c" />
              </View>
            )}

            <Text style={styles.headerTitle}>
              {isLogin ? 'Masuk ke Noor' : 'Daftar Akun Baru'}
            </Text>
            {!isKeyboardVisible && (
              <Text style={styles.headerSubtitle}>
                {isLogin
                  ? 'Sinkronkan target tilawah harian & riwayat sedekah'
                  : 'Bergabung dengan ribuan jamaah dalam ekosistem ibadah Noor'}
              </Text>
            )}

            {/* Segmented Switcher */}
            <View style={[styles.tabSwitcher, isKeyboardVisible && { marginTop: 10 }]}>
              <TouchableOpacity
                style={[styles.switchBtn, isLogin && styles.switchBtnActive]}
                onPress={() => {
                  setIsLogin(true);
                  setErrorMsg('');
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="login"
                  size={15}
                  color={isLogin ? '#002721' : '#ffffffcc'}
                />
                <Text style={[styles.switchText, isLogin && styles.switchTextActive]}>
                  Masuk (Login)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.switchBtn, !isLogin && styles.switchBtnActive]}
                onPress={() => {
                  setIsLogin(false);
                  setErrorMsg('');
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="account-plus-outline"
                  size={15}
                  color={!isLogin ? '#002721' : '#ffffffcc'}
                />
                <Text style={[styles.switchText, !isLogin && styles.switchTextActive]}>
                  Daftar (Register)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Content */}
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bodyBlock}
          >
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color="#ba1a1a" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nama Lengkap</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="person-outline" size={18} color="#717976" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Contoh: Ahmad Fauzi"
                    placeholderTextColor="#9ca3af"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Alamat Email</Text>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={18} color="#717976" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="nama@domain.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kata Sandi</Text>
              <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={18} color="#717976" style={styles.fieldIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 6 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#717976"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Konfirmasi Kata Sandi</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#717976" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ulangi kata sandi"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPassword}
                    value={passwordConfirmation}
                    onChangeText={setPasswordConfirmation}
                  />
                </View>
              </View>
            )}

            {/* Action Submit Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>
                    {isLogin ? 'Masuk ke Akun Noor' : 'Buat Akun Jamaah'}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>

            {/* Switch Text */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>
                {isLogin ? 'Belum punya akun jamaah?' : 'Sudah memiliki akun?'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsLogin(!isLogin);
                  setErrorMsg('');
                }}
              >
                <Text style={styles.footerLink}>
                  {isLogin ? 'Daftar Sekarang' : 'Masuk ke Akun'}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </KeyboardSafeModalWrapper>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    maxHeight: '92%',
    flexShrink: 1,
  },
  headerBlock: {
    backgroundColor: '#002721',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
    position: 'relative',
  },
  headerBlockCompact: {
    paddingTop: 14,
    paddingBottom: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(254, 147, 44, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(254, 147, 44, 0.3)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#bbeddd',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 4,
    marginTop: 16,
    width: '100%',
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  switchBtnActive: {
    backgroundColor: '#ffffff',
  },
  switchText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffffcc',
  },
  switchTextActive: {
    color: '#002721',
    fontWeight: 'bold',
  },
  bodyBlock: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffdad6',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#410002',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f4f3',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eceeed',
    paddingHorizontal: 12,
    height: 48,
  },
  fieldIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#191c1b',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    shadowColor: '#002721',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  demoBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#f8faf9',
    borderWidth: 1,
    borderColor: '#eceeed',
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eceeed',
  },
  demoBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
  },
  footerText: {
    fontSize: 12,
    color: '#717976',
  },
  footerLink: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
});
