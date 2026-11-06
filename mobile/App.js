import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, getThemeColors } from './src/theme/colors';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import QuranScreen from './src/screens/QuranScreen';
import QiblaScreen from './src/screens/QiblaScreen';
import DhikrScreen from './src/screens/DhikrScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import AuthScreen from './src/screens/AuthScreen';

// Modals
import CityModal from './src/components/CityModal';
import ProfileModal from './src/components/ProfileModal';
import AuthModal from './src/components/AuthModal';
import DonationModal from './src/components/DonationModal';
import CalendarModal from './src/components/CalendarModal';
import ZakatModal from './src/components/ZakatModal';
import MasjidModal from './src/components/MasjidModal';
import PremiumModal from './src/components/PremiumModal';
import AdzanModal from './src/components/AdzanModal';
import { mobileApiClient } from './src/services/apiClient';
import { useKeyboardVisible } from './src/utils/useKeyboardVisible';
import { playAudioUrl } from './src/utils/audioPlayerService';
import { getCurrentPrayerStatus } from './src/utils/prayerCalculator';
import {
  requestNotificationPermission,
  updatePrayerCountdownNotification,
  triggerAdzanNotification,
  scheduleNativePrayerAlarms,
  stopNativeAdzanAudio,
  cancelPrayerCountdownNotification,
} from './src/services/notificationService';
import { initOfflineDirectories, getMuadzinAudioSource } from './src/services/offlineStorageService';

// Data
import { INDONESIAN_CITIES, getCityWithDynamicTimings } from './src/data/citiesPrayerData';
import { detectUserLocationAndCity, checkLocationPermission } from './src/services/locationService';
import { getKemenagPrayerSchedule } from './src/services/prayerService';
import { QORI_LIST, MUADZIN_LIST, AVATAR_OPTIONS } from './src/data/recitersData';

export default function App() {
  const isKeyboardVisible = useKeyboardVisible();
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'quran', 'kiblat', 'dzikir'
  const [currentCity, setCurrentCity] = useState(() => getCityWithDynamicTimings(INDONESIAN_CITIES[0], new Date())); // Jakarta fresh
  const [isCityModalVisible, setIsCityModalVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState('profil');
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [isDonationModalVisible, setIsDonationModalVisible] = useState(false);
  const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);
  const [isZakatModalVisible, setIsZakatModalVisible] = useState(false);
  const [isMasjidModalVisible, setIsMasjidModalVisible] = useState(false);
  const [isPremiumModalVisible, setIsPremiumModalVisible] = useState(false);
  const [catalogCategory, setCatalogCategory] = useState('all');
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const [donationInitial, setDonationInitial] = useState({ campaign: null, amount: null, tab: 'donate' });
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleToggleDarkMode = async () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    await AsyncStorage.setItem('noor_mobile_dark_mode', nextMode ? 'true' : 'false').catch(() => {});
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalVisible(true);
  };

  const handleOpenDonation = (campaign = null, amount = null, tab = 'donate') => {
    setDonationInitial({ campaign, amount, tab });
    setIsDonationModalVisible(true);
  };

  // User Profile (Default Guest state until logged in via API or restored from AsyncStorage)
  const [userProfile, setUserProfile] = useState({
    isLoggedIn: false,
    name: 'Tamu / Jamaah',
    email: '',
    bio: 'Senantiasa berikhtiar istiqomah dalam tilawah & doa.',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    role: 'jamaah',
    token: null,
  });

  useEffect(() => {
    AsyncStorage.getItem('noor_mobile_user').then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.isLoggedIn) setUserProfile(parsed);
        } catch (e) {}
      }
    });
    AsyncStorage.getItem('noor_mobile_city').then(async (raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.name) {
            // Selalu hitung ulang jadwal sholat secara dinamis untuk hari ini
            const freshCity = getCityWithDynamicTimings(parsed, new Date());
            setCurrentCity(freshCity);
            return;
          }
        } catch (e) {}
      }

      // Jika belum ada kota yang dipilih atau pengguna mengaktifkan GPS, coba auto-detect
      const hasPerm = await checkLocationPermission();
      if (hasPerm) {
        try {
          const autoCity = await detectUserLocationAndCity();
          if (autoCity) {
            setCurrentCity(autoCity);
            AsyncStorage.setItem('noor_mobile_city', JSON.stringify(autoCity)).catch(() => {});
            return;
          }
        } catch (e) {}
      }

      setCurrentCity(getCityWithDynamicTimings(INDONESIAN_CITIES[0], new Date()));
    });
    AsyncStorage.getItem('noor_mobile_muadzin').then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.id) setSelectedMuadzin(parsed);
        } catch (e) {}
      }
    });
    AsyncStorage.getItem('noor_mobile_adzan_reminder').then((raw) => {
      if (raw !== null) {
        setAdzanReminder(raw === 'true');
      }
    });
    AsyncStorage.getItem('noor_mobile_statusbar_countdown').then((raw) => {
      if (raw !== null) {
        setStatusBarCountdownEnabled(raw === 'true');
      }
    });
    AsyncStorage.getItem('noor_mobile_dark_mode').then((raw) => {
      if (raw !== null) {
        setIsDarkMode(raw === 'true');
      }
    });

    // Request notification permission on Android 13+
    requestNotificationPermission();

    // Inisialisasi direktori offline audio & Al-Qur'an
    initOfflineDirectories();
  }, []);

  const persistUser = (nextUser) => {
    setUserProfile((prev) => {
      const merged = typeof nextUser === 'function' ? nextUser(prev) : nextUser;
      AsyncStorage.setItem('noor_mobile_user', JSON.stringify(merged)).catch(() => {});
      return merged;
    });
  };

  // Live sync user profile & Noor+ Bebas Iklan status with Backend
  useEffect(() => {
    if (!userProfile?.isLoggedIn || !userProfile?.token) return;
    let active = true;

    const syncUser = () => {
      mobileApiClient
        .getCurrentUser(userProfile.token)
        .then((res) => {
          if (active && res?.user) {
            persistUser((prev) => ({
              ...prev,
              ...res.user,
              isLoggedIn: true,
              token: prev.token,
            }));
          }
        })
        .catch(() => {});
    };

    syncUser();
    const timer = setInterval(syncUser, 8000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [userProfile?.isLoggedIn, userProfile?.token]);

  // Sinkronisasi jadwal sholat resmi Kemenag RI (Bimas Islam) secara otomatis
  useEffect(() => {
    if (!currentCity) return;
    let active = true;
    getKemenagPrayerSchedule(currentCity, new Date()).then(({ timings }) => {
      if (active && timings) {
        setCurrentCity((prev) => {
          if (!prev) return prev;
          if (JSON.stringify(prev.timings) === JSON.stringify(timings)) return prev;
          return {
            ...prev,
            timings: {
              ...prev.timings,
              ...timings,
            },
          };
        });
      }
    }).catch(() => {});

    return () => {
      active = false;
    };
  }, [currentCity?.id, currentCity?.kemenagId]);

  const handleSelectCity = (city) => {
    const freshCity = getCityWithDynamicTimings(city, new Date());
    setCurrentCity(freshCity);
    AsyncStorage.setItem('noor_mobile_city', JSON.stringify(freshCity)).catch(() => {});
    getKemenagPrayerSchedule(freshCity, new Date()).then(({ timings }) => {
      if (timings) {
        setCurrentCity((prev) => ({
          ...prev,
          timings: { ...prev.timings, ...timings },
        }));
      }
    }).catch(() => {});
  };

  const handleLogout = () => {
    Alert.alert(
      'Keluar dari Akun',
      'Apakah Anda yakin ingin keluar dari akun Noor di perangkat ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar Sekarang',
          style: 'destructive',
          onPress: () => {
            const guest = {
              isLoggedIn: false,
              name: 'Tamu / Jamaah',
              email: '',
              bio: 'Senantiasa berikhtiar istiqomah dalam tilawah & doa.',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
              role: 'jamaah',
              token: null,
            };
            persistUser(guest);
            setIsProfileModalVisible(false);
            Alert.alert('Alhamdulillah', 'Anda telah berhasil keluar dari akun Noor.');
          },
        },
      ]
    );
  };

  // Selected Reciters & Adzan States
  const [selectedQori, setSelectedQori] = useState(QORI_LIST[0]); // Mishary Alafasy
  const [selectedMuadzin, setSelectedMuadzin] = useState(
    MUADZIN_LIST.find((m) => m.isDefault) || MUADZIN_LIST[0]
  ); // Syaikh Ali Ahmed Mulla (Bawaan Offline)
  const [adzanReminder, setAdzanReminder] = useState(true);
  const [statusBarCountdownEnabled, setStatusBarCountdownEnabled] = useState(true);
  const [adzanModal, setAdzanModal] = useState({
    visible: false,
    prayerName: 'Dzuhur',
    prayerTime: '11:40',
    isTest: false,
  });
  const lastPlayedAdzanRef = React.useRef('');
  const lastCalculatedDayRef = React.useRef('');

  const handleToggleAdzanReminder = (val) => {
    setAdzanReminder(val);
    AsyncStorage.setItem('noor_mobile_adzan_reminder', String(val)).catch(() => {});
  };

  const handleToggleStatusBarCountdown = (val) => {
    setStatusBarCountdownEnabled(val);
    AsyncStorage.setItem('noor_mobile_statusbar_countdown', String(val)).catch(() => {});
    if (!val) {
      cancelPrayerCountdownNotification();
    } else if (currentCity?.timings) {
      const status = getCurrentPrayerStatus(currentCity.timings, new Date());
      updatePrayerCountdownNotification(status, currentCity.name || 'Jakarta', true, currentCity.timings, true);
    }
  };

  const handleSelectMuadzin = (muadzin) => {
    setSelectedMuadzin(muadzin);
    AsyncStorage.setItem('noor_mobile_muadzin', JSON.stringify(muadzin)).catch(() => {});
  };

  const handleTestAdzan = async (prayerName = 'Dzuhur') => {
    const muadzin = selectedMuadzin || MUADZIN_LIST[0];
    const audioSource = await getMuadzinAudioSource(muadzin);
    playAudioUrl(audioSource);
    setAdzanModal({
      visible: true,
      prayerName,
      prayerTime: currentCity?.timings?.[prayerName.toLowerCase()] || '11:40',
      isTest: true,
      selectedMuadzin: muadzin,
      audioSource,
    });
  };

  const handleTriggerAdzan = async (prayerName, prayerKey, prayerTime) => {
    let muadzin = selectedMuadzin || MUADZIN_LIST[0];
    if (prayerKey === 'subuh') {
      if (selectedMuadzin?.id === 'muzammil') {
        muadzin = MUADZIN_LIST.find((m) => m.id === 'muzammil_fajr') || muadzin;
      } else if (selectedMuadzin?.id === 'salim_bahanan') {
        muadzin = MUADZIN_LIST.find((m) => m.id === 'salim_bahanan_fajr') || muadzin;
      } else if (selectedMuadzin?.id === 'syam_elmarusy') {
        muadzin = MUADZIN_LIST.find((m) => m.id === 'syam_elmarusy_fajr') || muadzin;
      } else if (!selectedMuadzin?.id?.includes('fajr')) {
        const fajr = MUADZIN_LIST.find((m) => m.id === 'muzammil_fajr') || MUADZIN_LIST[3];
        muadzin = fajr || muadzin;
      }
    }
    const audioSource = await getMuadzinAudioSource(muadzin);
    playAudioUrl(audioSource);
    triggerAdzanNotification(prayerName, currentCity?.name || 'Jakarta', prayerTime);
    setAdzanModal({
      visible: true,
      prayerName,
      prayerTime,
      isTest: false,
      selectedMuadzin: muadzin,
      audioSource,
    });
  };

  // Monitor Prayer Times & Update Status Bar Countdown Notification
  useEffect(() => {
    if (!currentCity?.timings) return;

    const checkPrayerTimes = () => {
      const now = new Date();
      const currentH = String(now.getHours()).padStart(2, '0');
      const currentM = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${currentH}:${currentM}`;
      const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

      // Deteksi pergantian hari untuk recalculate jadwal sholat matahari
      if (lastCalculatedDayRef.current && lastCalculatedDayRef.current !== todayKey) {
        lastCalculatedDayRef.current = todayKey;
        setCurrentCity((prev) => getCityWithDynamicTimings(prev, now));
      } else if (!lastCalculatedDayRef.current) {
        lastCalculatedDayRef.current = todayKey;
      }

      // 1. Update status bar countdown notification
      const status = getCurrentPrayerStatus(currentCity.timings, now);
      updatePrayerCountdownNotification(status, currentCity.name || 'Jakarta', statusBarCountdownEnabled, currentCity.timings);

      // 2. Schedule native alarm in Android AlarmManager (tetap berbunyi walau layar mati / HP di kantong)
      scheduleNativePrayerAlarms(
        currentCity.timings,
        currentCity.name || 'Jakarta',
        selectedMuadzin?.id || 'mulla',
        adzanReminder
      );

      // 3. Check Adzan Arrival in Foreground
      if (!adzanReminder) return;

      const prayers = [
        { key: 'subuh', label: 'Subuh' },
        { key: 'dzuhur', label: now.getDay() === 5 ? "Jum'at" : "Dzuhur" },
        { key: 'ashar', label: 'Ashar' },
        { key: 'maghrib', label: 'Maghrib' },
        { key: 'isya', label: 'Isya' },
      ];

      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      for (const p of prayers) {
        const time = currentCity.timings[p.key];
        if (!time) continue;
        const [pH, pM] = time.split(':').map(Number);
        const prayerMinutes = pH * 60 + pM;

        // Trigger jika waktu saat ini berada di rentang [waktu sholat s/d waktu sholat + 2 menit]
        const diff = currentMinutes - prayerMinutes;
        if (diff >= 0 && diff <= 2) {
          const adzanKey = `${todayKey}-${p.key}`;
          if (lastPlayedAdzanRef.current !== adzanKey) {
            lastPlayedAdzanRef.current = adzanKey;
            handleTriggerAdzan(p.label, p.key, time);
            break;
          }
        }
      }
    };

    checkPrayerTimes();
    const interval = setInterval(checkPrayerTimes, 5000);
    return () => clearInterval(interval);
  }, [adzanReminder, statusBarCountdownEnabled, currentCity, selectedMuadzin]);

  const navItems = [
    { key: 'home', label: 'Beranda', icon: 'mosque', activeIcon: 'mosque' },
    { key: 'quran', label: "Al-Qur'an", icon: 'book-open-outline', activeIcon: 'book-open-variant' },
    { key: 'katalog', label: 'Katalog', icon: 'storefront-outline', activeIcon: 'storefront' },
    { key: 'kiblat', label: 'Kiblat', icon: 'compass-outline', activeIcon: 'compass' },
    { key: 'dzikir', label: 'Dzikir', icon: 'all-inclusive', activeIcon: 'all-inclusive' },
  ];

  // Wajib Login Dulu sebelum masuk ke aplikasi utama (100% konsisten dengan Web)
  if (!userProfile?.isLoggedIn) {
    return (
      <AuthScreen
        onLoginSuccess={(user) => {
          persistUser((prev) => ({
            ...prev,
            ...user,
            isLoggedIn: true,
          }));
        }}
      />
    );
  }

  const theme = getThemeColors(isDarkMode);

  return (
    <View style={[styles.root, { backgroundColor: theme.surfaceDim }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.surfaceDim }]}>
        {/* Main Active Screen */}
        <View style={styles.screenContainer}>
          {activeTab === 'home' && (
            <HomeScreen
              currentCity={currentCity}
              onOpenCityModal={() => setIsCityModalVisible(true)}
              onOpenProfileModal={(tab = 'profil') => {
                setProfileInitialTab(tab);
                setIsProfileModalVisible(true);
              }}
              onOpenCalendarModal={() => setIsCalendarModalVisible(true)}
              onOpenZakatModal={() => setIsZakatModalVisible(true)}
              onOpenMasjidModal={() => setIsMasjidModalVisible(true)}
              onOpenPremiumModal={() => setIsPremiumModalVisible(true)}
              onOpenAuthModal={handleOpenAuth}
              onLogout={handleLogout}
              onOpenDonation={handleOpenDonation}
              onOpenCatalog={(cat = 'all') => {
                setCatalogCategory(cat);
                setActiveTab('katalog');
              }}
              onNavigateTab={(tab) => setActiveTab(tab)}
              userProfile={userProfile}
              onOpenSurah={() => setActiveTab('quran')}
              selectedMuadzin={selectedMuadzin}
              onTestAdzan={handleTestAdzan}
              isDarkMode={isDarkMode}
              onToggleDarkMode={handleToggleDarkMode}
            />
          )}

          {activeTab === 'quran' && (
            <QuranScreen selectedQori={selectedQori} isDarkMode={isDarkMode} />
          )}

          {activeTab === 'katalog' && (
            <CatalogScreen
              userProfile={userProfile}
              initialCategory={catalogCategory}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'kiblat' && (
            <QiblaScreen
              currentCity={currentCity}
              onOpenCityModal={() => setIsCityModalVisible(true)}
              onOpenCalendarModal={() => setIsCalendarModalVisible(true)}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'dzikir' && (
            <DhikrScreen isDarkMode={isDarkMode} />
          )}
        </View>

        {/* Bottom Native Tab Bar (hidden when soft keyboard is open) */}
        {!isKeyboardVisible && (
          <View style={[styles.bottomNav, { backgroundColor: theme.navBg, borderTopColor: theme.navBorder }]}>
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              const activeColor = isDarkMode ? '#34d399' : Colors.primary;
              const inactiveColor = isDarkMode ? '#64748b' : '#9ca3af';
              return (
                <TouchableOpacity
                  key={item.key}
                  style={styles.navItem}
                  onPress={() => setActiveTab(item.key)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={isActive ? item.activeIcon : item.icon}
                    size={22}
                    color={isActive ? activeColor : inactiveColor}
                  />
                  <Text
                    style={[
                      styles.navLabel,
                      { color: inactiveColor },
                      isActive && { color: activeColor, fontWeight: 'bold' },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isActive && <View style={[styles.activeDot, { backgroundColor: Colors.secondary }]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* City Selection Modal */}
        <CityModal
          visible={isCityModalVisible}
          onClose={() => setIsCityModalVisible(false)}
          selectedCity={currentCity}
          onSelectCity={handleSelectCity}
        />

        {/* Profile & Settings Modal */}
        <ProfileModal
          visible={isProfileModalVisible}
          initialTab={profileInitialTab}
          onClose={() => setIsProfileModalVisible(false)}
          onOpenAuth={(mode = 'login') => {
            setIsProfileModalVisible(false);
            handleOpenAuth(mode);
          }}
          onOpenDonationHistory={() => {
            setIsProfileModalVisible(false);
            handleOpenDonation(null, null, 'history');
          }}
          onOpenPremium={() => {
            setIsProfileModalVisible(false);
            setIsPremiumModalVisible(true);
          }}
          onLogout={handleLogout}
          userProfile={userProfile}
          onUpdateProfile={persistUser}
          selectedQori={selectedQori}
          onSelectQori={setSelectedQori}
          selectedMuadzin={selectedMuadzin}
          onSelectMuadzin={handleSelectMuadzin}
          adzanReminder={adzanReminder}
          onToggleAdzanReminder={handleToggleAdzanReminder}
          statusBarCountdown={statusBarCountdownEnabled}
          onToggleStatusBarCountdown={handleToggleStatusBarCountdown}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />

        <AuthModal
          visible={isAuthModalVisible}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalVisible(false)}
          onLoginSuccess={(user) => {
            persistUser((prev) => ({ ...prev, ...user, isLoggedIn: true }));
          }}
        />

        <DonationModal
          visible={isDonationModalVisible}
          onClose={() => setIsDonationModalVisible(false)}
          initialCampaign={donationInitial.campaign}
          initialAmount={donationInitial.amount}
          initialTab={donationInitial.tab}
          userProfile={userProfile}
        />

        {/* Islamic & Hijri Calendar Modal */}
        <CalendarModal
          visible={isCalendarModalVisible}
          onClose={() => setIsCalendarModalVisible(false)}
          currentCity={currentCity}
        />

        {/* Zakat Calculator Modal */}
        <ZakatModal
          visible={isZakatModalVisible}
          onClose={() => setIsZakatModalVisible(false)}
          onProceedDonation={(camp, amt) => handleOpenDonation(camp, amt, 'donate')}
        />

        {/* Nearby Mosque Finder Modal */}
        <MasjidModal
          visible={isMasjidModalVisible}
          onClose={() => setIsMasjidModalVisible(false)}
          currentCity={currentCity}
        />

        {/* Noor+ Bebas Iklan (Remove Ads) Modal */}
        <PremiumModal
          visible={isPremiumModalVisible}
          onClose={() => setIsPremiumModalVisible(false)}
          userProfile={userProfile}
          onUpgradeSuccess={(updatedUser) => {
            persistUser((prev) => ({
              ...prev,
              ...updatedUser,
              isLoggedIn: true,
              token: prev.token,
            }));
          }}
        />

        {/* Adzan Alert & Sound Player Modal */}
        <AdzanModal
          visible={adzanModal.visible}
          onClose={() => {
            stopNativeAdzanAudio();
            setAdzanModal((prev) => ({ ...prev, visible: false }));
          }}
          prayerName={adzanModal.prayerName}
          prayerTime={adzanModal.prayerTime}
          cityName={currentCity?.name || 'Jakarta'}
          selectedMuadzin={selectedMuadzin}
          isTest={adzanModal.isTest}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  screenContainer: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f3',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 26 : 14,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 2,
  },
  navLabelActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.secondary,
    position: 'absolute',
    bottom: -2,
  },
});
