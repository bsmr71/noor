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
import { Colors } from './src/theme/colors';

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
import { mobileApiClient } from './src/services/apiClient';
import { useKeyboardVisible } from './src/utils/useKeyboardVisible';

// Data
import { INDONESIAN_CITIES } from './src/data/citiesPrayerData';
import { QORI_LIST, MUADZIN_LIST, AVATAR_OPTIONS } from './src/data/recitersData';

export default function App() {
  const isKeyboardVisible = useKeyboardVisible();
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'quran', 'kiblat', 'dzikir'
  const [currentCity, setCurrentCity] = useState(INDONESIAN_CITIES[0]); // Jakarta
  const [isCityModalVisible, setIsCityModalVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [isDonationModalVisible, setIsDonationModalVisible] = useState(false);
  const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);
  const [isZakatModalVisible, setIsZakatModalVisible] = useState(false);
  const [isMasjidModalVisible, setIsMasjidModalVisible] = useState(false);
  const [isPremiumModalVisible, setIsPremiumModalVisible] = useState(false);
  const [catalogCategory, setCatalogCategory] = useState('all');
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const [donationInitial, setDonationInitial] = useState({ campaign: null, amount: null, tab: 'donate' });

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
    AsyncStorage.getItem('noor_mobile_city').then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.name) setCurrentCity(parsed);
        } catch (e) {}
      }
    });
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

  const handleSelectCity = (city) => {
    setCurrentCity(city);
    AsyncStorage.setItem('noor_mobile_city', JSON.stringify(city)).catch(() => {});
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

  // Selected Reciters
  const [selectedQori, setSelectedQori] = useState(QORI_LIST[0]); // Mishary Alafasy
  const [selectedMuadzin, setSelectedMuadzin] = useState(MUADZIN_LIST[0]); // Ali Ahmed Mulla

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

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        {/* Main Active Screen */}
        <View style={styles.screenContainer}>
          {activeTab === 'home' && (
            <HomeScreen
              currentCity={currentCity}
              onOpenCityModal={() => setIsCityModalVisible(true)}
              onOpenProfileModal={() => setIsProfileModalVisible(true)}
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
            />
          )}

          {activeTab === 'quran' && (
            <QuranScreen selectedQori={selectedQori} />
          )}

          {activeTab === 'katalog' && (
            <CatalogScreen
              userProfile={userProfile}
              initialCategory={catalogCategory}
            />
          )}

          {activeTab === 'kiblat' && (
            <QiblaScreen
              currentCity={currentCity}
              onOpenCityModal={() => setIsCityModalVisible(true)}
              onOpenCalendarModal={() => setIsCalendarModalVisible(true)}
            />
          )}

          {activeTab === 'dzikir' && (
            <DhikrScreen />
          )}
        </View>

        {/* Bottom Native Tab Bar (hidden when soft keyboard is open) */}
        {!isKeyboardVisible && (
          <View style={styles.bottomNav}>
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
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
                    color={isActive ? Colors.primary : '#9ca3af'}
                  />
                  <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                    {item.label}
                  </Text>
                  {isActive && <View style={styles.activeDot} />}
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
          onSelectMuadzin={setSelectedMuadzin}
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
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
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
