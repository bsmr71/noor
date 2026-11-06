import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Share,
  Alert,
  Linking,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/fonts';
import { getHijriDate, getIndonesianDayDate, getCurrentPrayerStatus } from '../utils/prayerCalculator';
import { playAudioUrl, stopCurrentAudio } from '../utils/audioPlayerService';
import { mobileApiClient, ADMIN_CONSOLE_URL } from '../services/apiClient';
import {
  getVerseForCurrentTime,
  getRandomVerse,
  getHabitSessionInfo,
} from '../data/dailyWorshipData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

export default function HomeScreen({
  currentCity,
  onOpenCityModal,
  onOpenProfileModal,
  onOpenCalendarModal,
  onOpenZakatModal,
  onOpenMasjidModal,
  onOpenPremiumModal,
  onOpenAuthModal,
  onLogout,
  onOpenDonation,
  onOpenCatalog,
  onNavigateTab,
  userProfile,
  onOpenSurah,
  selectedMuadzin,
  onTestAdzan,
  isDarkMode = false,
  onToggleDarkMode,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [apiPrompt, setApiPrompt] = useState(null);
  const [apiBanners, setApiBanners] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = () => {
      mobileApiClient
        .getSettings()
        .then((res) => {
          if (isMounted && res?.data?.spiritual_prompt) {
            setApiPrompt(res.data.spiritual_prompt);
          }
        })
        .catch(() => { });

      if (!userProfile?.is_premium) {
        mobileApiClient
          .getBanners(userProfile?.token)
          .then((res) => {
            if (isMounted && res?.ad_free) {
              setApiBanners([]);
              return;
            }
            if (isMounted && Array.isArray(res?.data) && res.data.length > 0) {
              const activeOnly = res.data.filter((b) => (b.status || 'active') === 'active');
              if (activeOnly.length > 0) {
                setApiBanners(
                  activeOnly.map((b, idx) => ({
                    id: b.id || idx + 1,
                    title: b.title || 'Kampanye Syiar Berkah',
                    tag: b.tag || 'Kemitraan Syariah',
                    discountBadge: b.discountBadge || b.badge || 'Mitra Resmi',
                    verified: b.verified || b.sponsor || 'Disponsori • Terverifikasi Syariah',
                    detail1: b.detail1 || b.meta1 || b.partner || 'Program Resmi Noor',
                    detail2: b.detail2 || b.meta2 || b.license || 'Amanah & Transparan',
                    oldPrice: b.oldPrice || 'Program Pilihan',
                    price: b.price || 'Penyaluran Resmi',
                    btnText: b.btnText || b.cta || 'Lihat Detail',
                    btnIcon: b.btnIcon || 'heart-outline',
                    image: b.image,
                  }))
                );
              }
            }
          })
          .catch(() => { });
      }
    };

    fetchSettings();
    const interval = setInterval(fetchSettings, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ambient pulse & breathing glow animations for hero prayer countdown
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseDotAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: false,
          }),
          Animated.timing(pulseDotAnim, {
            toValue: 1.4,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: false,
          }),
          Animated.timing(pulseDotAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, []);

  const animatedGlowBorder = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(254, 147, 44, 0.3)', 'rgba(254, 147, 44, 0.9)'],
  });

  const animatedGlowBg = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 0, 0, 0.42)', 'rgba(254, 147, 44, 0.12)'],
  });

  const isFriday = currentTime.getDay() === 5;
  const hijriDate = useMemo(() => getHijriDate(currentTime), [currentTime]);
  const indonesianDate = useMemo(() => getIndonesianDayDate(currentTime), [currentTime]);

  const tzCode = useMemo(() => {
    const tz = currentCity?.timezone || 7;
    if (tz === 9) return 'WIT';
    if (tz === 8) return 'WITA';
    return 'WIB';
  }, [currentCity?.timezone]);

  const liveTimeString = useMemo(() => {
    const h = String(currentTime.getHours()).padStart(2, '0');
    const m = String(currentTime.getMinutes()).padStart(2, '0');
    const s = String(currentTime.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s} ${tzCode}`;
  }, [currentTime, tzCode]);

  const prayerStatus = useMemo(
    () => getCurrentPrayerStatus(currentCity?.timings, currentTime),
    [currentCity, currentTime]
  );
  console.log('PRAYER STATUS IN HOME:', JSON.stringify(prayerStatus));

  // Carousel & Modal states
  const [activeSlide, setActiveSlide] = useState(0);
  const [isEthicsModalVisible, setIsEthicsModalVisible] = useState(false);
  const [isPlayingMurottal, setIsPlayingMurottal] = useState(false);

  // Time-Adaptive Habit Session Tracker (Menyesuaikan dengan waktu sholat & jam saat ini)
  const habitSession = useMemo(() => getHabitSessionInfo(isFriday), [isFriday]);
  const [completedHabitIds, setCompletedHabitIds] = useState([]);
  const todayDateString = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    const storageKey = `@noor_habits_${todayDateString}_${habitSession.sessionKey}`;
    AsyncStorage.getItem(storageKey).then((saved) => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setCompletedHabitIds(parsed);
            return;
          }
        } catch (e) { }
      }
      // Nilai awal: item pertama default selesai sebagai motivasi
      if (habitSession.habits?.[0]?.id) {
        setCompletedHabitIds([habitSession.habits[0].id]);
      }
    });
  }, [todayDateString, habitSession.sessionKey]);

  const toggleHabit = (id) => {
    setCompletedHabitIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      const storageKey = `@noor_habits_${todayDateString}_${habitSession.sessionKey}`;
      AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => { });
      return next;
    });
  };

  const completedHabitsCount = completedHabitIds.length;

  // Ayat Pilihan Hari Ini (Time-Adaptive & Randomizable)
  const [dailyVerse, setDailyVerse] = useState(() => getVerseForCurrentTime());

  const handleRandomizeDailyVerse = () => {
    const nextVerse = getRandomVerse(dailyVerse?.id);
    setDailyVerse(nextVerse);
    if (isPlayingMurottal) {
      stopCurrentAudio();
      setIsPlayingMurottal(false);
    }
  };

  const prayerItems = [
    { key: 'subuh', name: 'Subuh', time: currentCity?.timings?.subuh || '04:09' },
    {
      key: 'dzuhur',
      name: isFriday ? "Jum'at" : "Dzuhur",
      time: currentCity?.timings?.dzuhur || '11:40',
    },
    { key: 'ashar', name: 'Ashar', time: currentCity?.timings?.ashar || '14:54' },
    { key: 'maghrib', name: 'Maghrib', time: currentCity?.timings?.maghrib || '17:49' },
    { key: 'isya', name: 'Isya', time: currentCity?.timings?.isya || '19:00' },
  ];

  // 8 Quick Action Items (2 rows x 4 columns)
  const quickActions = [
    {
      id: 'quran',
      label: "Al-Qur'an",
      icon: 'book-open-variant',
      bgColor: '#e2f5ee',
      iconColor: '#002721',
      action: () => onNavigateTab('quran'),
    },
    {
      id: 'kiblat',
      label: 'Kiblat',
      icon: 'compass-outline',
      bgColor: '#ffe9d6',
      iconColor: '#904d00',
      action: () => onNavigateTab('kiblat'),
    },
    {
      id: 'dzikir',
      label: 'Dzikir Pagi',
      icon: 'all-inclusive',
      bgColor: '#d8f3eb',
      iconColor: '#0b3f34',
      action: () => onNavigateTab('dzikir'),
    },
    {
      id: 'zakat',
      label: 'Hitung Zakat',
      icon: 'calculator-variant-outline',
      bgColor: '#eceeed',
      iconColor: '#002721',
      action: () =>
        onOpenZakatModal
          ? onOpenZakatModal()
          : onOpenDonation
            ? onOpenDonation({ id: 3, title: 'Zakat Maal & Fitrah Pembersih Harta 1445 H' }, 100000)
            : Alert.alert('Hitung Zakat', 'Simulasi Zakat Maal & Fitrah otomatis.'),
    },
    {
      id: 'sholat',
      label: 'Jadwal Sholat',
      icon: 'clock-outline',
      bgColor: '#eceeed',
      iconColor: '#904d00',
      action: () => onNavigateTab('kiblat'),
    },
    {
      id: 'kalender',
      label: 'Kalender',
      icon: 'calendar-sync-outline',
      bgColor: '#eceeed',
      iconColor: '#002721',
      action: () => (onOpenCalendarModal ? onOpenCalendarModal() : onNavigateTab('kiblat')),
    },
    {
      id: 'sedekah',
      label: 'Sedekah',
      icon: 'hand-heart-outline',
      bgColor: '#ffe9d6',
      iconColor: '#904d00',
      action: () => (onOpenDonation ? onOpenDonation() : Alert.alert('Sedekah', 'Salurkan sedekah amanah.')),
    },
    {
      id: 'masjid',
      label: 'Cari Masjid',
      icon: 'map-marker-radius-outline',
      bgColor: '#eceeed',
      iconColor: '#002721',
      action: () => (onOpenMasjidModal ? onOpenMasjidModal() : onNavigateTab('kiblat')),
    },
  ];

  // 4 Carousel Sponsor Slides
  const defaultSponsorSlides = [
    {
      id: 1,
      title: 'Umrah Syahdu Akhir Ramadhan 1445 H',
      tag: 'Pilihan Jamaah',
      discountBadge: 'Early Bird Hemat 2.5 Juta',
      verified: 'Disponsori • Terverifikasi Kemenag RI No. 892/2022',
      detail1: 'Direct Saudia • Hotel Bintang 5',
      detail2: 'Depan Pelataran',
      oldPrice: 'Rp 34.500.000',
      price: 'Rp 31.900.000',
      btnText: 'Lihat Paket Umrah',
      btnIcon: 'arrow-right',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAMnj95EzLYjx-SPWjYmZ5PR_8eTxm7D2JqvL3oNvzabNi9-lkZvwNYVdb-qtX6kdAA36hqwdRDxhw0F00a3uLArlQxfrRhOTVumBuRz-3VcIcw4mg-WXQE80uhMl5HJyz1ELA_Lv8AEDQjHIz3QOTLV_cSciDJgJpTOD3ukifmWCGZM5PtWecKP4s6jmYpBgXv00hy_JrLq7TVCx3rD_O96c9jLLB6w7ewUhcGr2Q',
    },
    {
      id: 2,
      title: "Wakaf 10.000 Al-Qur'an Pelosok Nusantara",
      tag: 'Program Sedekah Jariyah',
      discountBadge: 'Amanah BWI',
      verified: 'Disponsori • Yayasan Wakaf Terdaftar BWI',
      detail1: 'Distribusi: Maluku & Nusa Tenggara',
      detail2: 'Mulai Rp 10.000 / Mushaf',
      oldPrice: 'Infaq Mulai',
      price: 'Rp 10.000',
      btnText: 'Tunaikan Wakaf',
      btnIcon: 'heart-outline',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAH0MkW1bf-vCNPYdhshT419cCOqMO6gI3oTufQb4hwg4-emu0nN3TMbTzV18sMMXDBCKVDxejZ_MJQyCKTKINv-2-6KJQMdiBpTAgOWaCtWf5BlzIkWGaETDGHmuqDwUhtGjSSzpqrFfhS_Ai8sWFgqChm3NEGb1eYvrm5knIqqwzBdfOSZqYTqh0Z7dR-h7gWtImpafP3asyHsUUknUenBIZrFHW5wvOizQ6_B1o',
    },
    {
      id: 3,
      title: 'Ensiklopedia Akhlak & Sirah Nabawiyah',
      tag: 'Literasi Islami',
      discountBadge: 'Diskon 30%',
      verified: 'Disponsori • Penerbit Syiar Sahabat',
      detail1: 'Edisi Eksklusif 3 Jilid Lengkap',
      detail2: 'Gratis Ongkir Se-Jawa',
      oldPrice: 'Rp 450.000',
      price: 'Rp 315.000',
      btnText: 'Beli Sekarang',
      btnIcon: 'shopping-outline',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC1wdUU-JTenP_p92PmY2fQISNjFfAx5nKTrzp6amT8EEZMTfaxVQICmhPWGNCxcdtFBuzLBKexVsngGcheiJCR71o8o7O39ug3f5RzV7c5bcxni7CUI_xnZXa2tcxSqupAOObkxL95AAEySlOQa0tB63r6nJoYA2VAgvfQ-ETjeWusSBPRNcjla1Y3_B9Erc8CCxeu-czGncpDrSzmC-9xy8_S6XJqZnnH9BWRiGM',
    },
    {
      id: 4,
      title: 'Siapkan Qurban Terbaik Dzulhijjah',
      tag: 'Tabungan Qurban',
      discountBadge: 'Cicilan 0%',
      verified: 'Disponsori • Lembaga Qurban Nasional',
      detail1: 'Kambing Premium Berbobot 30kg+',
      detail2: 'Sesuai Syariat',
      oldPrice: 'Mulai Dari',
      price: 'Rp 1.950.000',
      btnText: 'Buka Tabungan',
      btnIcon: 'piggy-bank-outline',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCTItRSefM164ppbvssUWodNfrlD7Jn7KnK7twGaztO7LLrbh_kCjqY-Zb6NlJ5NTkLXkEgdMeMuNegtPtXK-RNwPtfnZKGG0VXKqmjNiYyO_VKA2z6CUDhXIws2CrmKIUpz2hfa0tTODW8YD4rD9QPQgQmYLHQT1vUg9fzI6mj9oyY2zhVWf3DFu5fn25peoa41m5dEOfj5kf8FCMcxZUHbQhAvfB6HHWau9HDFF0',
    },
  ];

  const sponsorSlides = apiBanners || defaultSponsorSlides;

  const handleShareDailyVerse = async () => {
    try {
      await Share.share({
        message: `${dailyVerse?.surahName || 'Al-Qur\'an'}\n"${dailyVerse?.translation || ''}"\n\n- Dibagikan via Aplikasi Noor`,
      });
    } catch (e) { }
  };

  const handlePlayDailyVerseAudio = () => {
    if (isPlayingMurottal) {
      stopCurrentAudio();
      setIsPlayingMurottal(false);
      return;
    }
    const targetUrl = dailyVerse?.audioUrl || 'https://server8.mp3quran.net/afs/002152.mp3';
    playAudioUrl(targetUrl);
    setIsPlayingMurottal(true);
  };

  const handleScrollCarousel = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_WIDTH);
    if (index >= 0 && index < sponsorSlides.length) {
      setActiveSlide(index);
    }
  };

  const userName = userProfile?.isLoggedIn ? userProfile.name.split(' ')[0] : (userProfile?.name || 'Hamba Allah');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {/* 1. Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4isJxxQX51GcSPVfWEtdXbvKNBarrAQtge0W6b0VPuTT4_SyEwFmAd6nR272ds2xAFAlYD9bU5eq08faBbvFhjjDhKi3bUYxKCzVcy8gAyyG4jPo9T4n4yCARSuWfeEP5H8alnhFtY_nSoMub4j4Z84EK8nk_WEsjhlUod8kVNjex7-y_Dbdw6QFAi2PMRXWiG8k_apdI0WyTZKgs6ucLIV9e_WJrvoZ3h9IA6j4',
            }}
            style={styles.logoImg}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandTitle}>Noor</Text>
            <Text style={styles.brandSubtitle}>Beranda</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.themeToggleBtn, isDarkMode && styles.themeToggleBtnDark]}
            onPress={onToggleDarkMode}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDarkMode ? 'sunny' : 'moon'}
              size={15}
              color={isDarkMode ? '#fbbf24' : '#0f3e36'}
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.cityPill, isDarkMode && styles.cityPillDark]} onPress={onOpenCityModal} activeOpacity={0.8}>
            <Ionicons name="navigate-circle-outline" size={15} color={Colors.secondary} />
            <Text style={[styles.cityName, isDarkMode && styles.textWhite]} numberOfLines={1}>
              {currentCity?.name || 'Jakarta'}
            </Text>
          </TouchableOpacity>

          {!userProfile?.isLoggedIn ? (
            <TouchableOpacity
              style={styles.headerAuthPill}
              onPress={() => onOpenAuthModal && onOpenAuthModal('login')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="account-arrow-right-outline" size={15} color={Colors.primary} />
              <Text style={styles.headerAuthPillText}>Masuk / Daftar</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {/* Role Indicator Badge */}
              {userProfile?.role === 'admin' ? (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#fff4e5',
                    borderColor: '#fe932c',
                    borderWidth: 1,
                    borderRadius: 12,
                    paddingHorizontal: 7,
                    paddingVertical: 3.5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 3,
                  }}
                  onPress={() => Linking.openURL(ADMIN_CONSOLE_URL)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="shield-crown" size={13} color="#904d00" />
                  <Text style={{ fontSize: 9.5, fontWeight: 'bold', color: '#904d00' }}>ADMIN</Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={{
                    backgroundColor: '#e6f4f1',
                    borderColor: '#0f3e36',
                    borderWidth: 1,
                    borderRadius: 12,
                    paddingHorizontal: 7,
                    paddingVertical: 3.5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <MaterialCommunityIcons name="account-check" size={13} color="#0f3e36" />
                  <Text style={{ fontSize: 9.5, fontWeight: 'bold', color: '#0f3e36' }}>JAMAAH</Text>
                </View>
              )}

              <TouchableOpacity style={styles.profileBtn} onPress={onOpenProfileModal} activeOpacity={0.8}>
                <Image
                  source={{
                    uri:
                      userProfile?.avatar ||
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQRI0hlcL3m6MrvNK5QcdVCGYA3cqPFXa4cp1I2sSM1DyqrtnF8IpbSaBsqqcKAiOMUuff6g3RQcikKAeHI1xx3vrCi-pNJloy5sqZr1egZt7XBGpL8kVjD0RlAgGgVqIcjAS--gyHtG3eSEhHTv6kMwCPd8q1uLW-W0fzwZf6Bs5rX3zAr-mx6nQfYXMLvpr7PpD3DQ02-eEJ1Kg6Yq__Rlt5DQbr-hzCa0AnXyw',
                  }}
                  style={styles.profileAvatar}
                />
                <View style={styles.profileActiveDot} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerLogoutBtn}
                onPress={onLogout}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="logout" size={16} color="#d32f2f" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* 2. Top Hijri & Context Strip - Luxury Redesign */}
      <View style={styles.contextStrip}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <View style={styles.hijriRow}>
            <TouchableOpacity
              style={styles.hijriBadge}
              onPress={onOpenCalendarModal}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="calendar-month" size={14} color={Colors.secondary} />
              <Text style={styles.hijriText}>{hijriDate}</Text>
              <Text style={{ color: Colors.secondary, opacity: 0.5 }}>•</Text>
              <Text style={styles.fridayBadgeText}>
                {isFriday ? "Jum'at Berkah 🕌" : indonesianDate.dayName}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={13} color={Colors.secondary} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Text style={styles.greetingText}>
              Assalamu'alaikum, <Text style={{ color: Colors.secondary }}>{userName}</Text>
            </Text>
            {userProfile?.role === 'admin' ? (
              <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, borderWidth: 1, borderColor: '#f59e0b' }}>
                <Text style={{ fontSize: 9.5, fontWeight: 'bold', color: '#92400e' }}>👑 Super Admin</Text>
              </View>
            ) : userProfile?.role === 'ustadz' ? (
              <View style={{ backgroundColor: '#ccfbf1', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, borderWidth: 1, borderColor: '#2dd4bf' }}>
                <Text style={{ fontSize: 9.5, fontWeight: 'bold', color: '#115e59' }}>🎓 Ustadz / Qori</Text>
              </View>
            ) : (
              <View style={{ backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, borderWidth: 1, borderColor: '#86efac' }}>
                <Text style={{ fontSize: 9.5, fontWeight: 'bold', color: '#166534' }}>🕌 Jamaah Aktif</Text>
              </View>
            )}
            {userProfile?.is_premium && (
              <TouchableOpacity
                onPress={onOpenPremiumModal}
                activeOpacity={0.8}
                style={{ backgroundColor: '#002721', paddingHorizontal: 7, paddingVertical: 1.5, borderRadius: 6, borderWidth: 1, borderColor: '#fe932c', flexDirection: 'row', alignItems: 'center', gap: 3 }}
              >
                <MaterialCommunityIcons name="crown" size={10} color="#fe932c" />
                <Text style={{ fontSize: 9.5, fontWeight: 'bold', color: '#fe932c' }}>Noor+ Bebas Iklan</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.spiritualPrompt}>
            {apiPrompt ||
              (isFriday
                ? '✨ Perbanyak sholawat & tilawah Surah Al-Kahf di hari mulia ini.'
                : '✨ Semoga setiap ikhtiar ibadah & ikhtiar hari ini diberkahi Allah.')}
          </Text>
        </View>

        <View style={styles.topIconGroup}>
          <TouchableOpacity
            style={styles.topCircleBtn}
            activeOpacity={0.8}
            onPress={() => onTestAdzan ? onTestAdzan(prayerStatus.nextPrayer || 'Dzuhur') : Alert.alert('Notifikasi Adzan', 'Pengingat adzan aktif untuk 5 waktu sholat.')}
          >
            <MaterialCommunityIcons name="bell-ring-outline" size={18} color="#002721" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.topCircleBtn}
            activeOpacity={0.8}
            onPress={() => onNavigateTab && onNavigateTab('quran')}
          >
            <MaterialCommunityIcons name="bookmark-outline" size={18} color="#002721" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Admin Privilege Banner (Only rendered when logged in with Role Admin) */}
      {userProfile?.role === 'admin' && (
        <View style={{ marginHorizontal: 16, marginBottom: 14, backgroundColor: '#fffbeb', borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: '#fde68a', shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="shield-crown" size={18} color="#b45309" />
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#92400e' }}>Mode Administrator Aktif</Text>
            </View>
            <View style={{ backgroundColor: '#f59e0b', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 }}>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#ffffff' }}>FULL ACCESS</Text>
            </View>
          </View>
          <Text style={{ fontSize: 11, color: '#78350f', lineHeight: 15, marginBottom: 10 }}>
            Akun Anda memiliki izin Super Admin untuk mengelola syiar, hisab sholat Kemenag, dan membuka Noor Console backend.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#b45309', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onPress={() => Linking.openURL(ADMIN_CONSOLE_URL)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="monitor-dashboard" size={15} color="#ffffff" />
            <Text style={{ fontSize: 11.5, fontWeight: 'bold', color: '#ffffff' }}>Buka Noor Console Admin</Text>
            <MaterialCommunityIcons name="arrow-top-right" size={14} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Ustadz / Qori Role Banner */}
      {userProfile?.role === 'ustadz' && (
        <View style={{ marginHorizontal: 16, marginBottom: 14, backgroundColor: '#ecfdf5', borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: '#a7f3d0', elevation: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="school" size={18} color="#047857" />
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#065f46' }}>Mode Pembimbing Syiar & Qori</Text>
            </View>
            <View style={{ backgroundColor: '#059669', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 }}>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#ffffff' }}>USTADZ / QORI</Text>
            </View>
          </View>
          <Text style={{ fontSize: 11, color: '#065f46', lineHeight: 15 }}>
            Terima kasih telah membimbing tilawah & kajian umat di ekosistem Noor.
          </Text>
        </View>
      )}

      {/* Guest Login/Register Invitation Card */}
      {!userProfile?.isLoggedIn && (
        <View style={styles.guestBannerCard}>
          <View style={styles.guestBannerIconBox}>
            <MaterialCommunityIcons name="account-group" size={24} color={Colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.guestBannerTitle}>Masuk atau Buat Akun Jamaah</Text>
            <Text style={styles.guestBannerSubtitle}>
              Simpan target tilawah, bookmark surah & histori sedekah otomatis.
            </Text>
            <View style={styles.guestBannerActions}>
              <TouchableOpacity
                style={styles.guestBannerLoginBtn}
                onPress={() => onOpenAuthModal && onOpenAuthModal('login')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="login" size={14} color="#ffffff" />
                <Text style={styles.guestBannerLoginText}>Masuk Akun</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.guestBannerRegisterBtn}
                onPress={() => onOpenAuthModal && onOpenAuthModal('register')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="account-plus-outline" size={14} color={Colors.primary} />
                <Text style={styles.guestBannerRegisterText}>Daftar Baru</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 3. Active Prayer Hero Card - Breathtaking Luxury Glassmorphism Redesign */}
      <View style={styles.heroCard}>
        {/* Top Badges Row */}
        <View style={styles.heroTopRow}>
          <View style={styles.heroStatusBadge}>
            <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseDotAnim }] }]} />
            <Text style={styles.heroStatusText}>MENUJU WAKTU SHOLAT</Text>
            <Text style={{ color: '#bbeddd', opacity: 0.5 }}>•</Text>
            <Text style={styles.heroNextHighlight}>
              {prayerStatus.nextPrayerKey === 'dzuhur' && isFriday ? "JUM'AT" : (prayerStatus.nextPrayer || 'MAGHRIB').toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.heroLocationRow}
            onPress={onOpenCityModal}
            activeOpacity={0.8}
          >
            <Ionicons name={currentCity?.isGpsAuto ? "navigate" : "location-sharp"} size={13} color="#fe932c" />
            <Text style={styles.heroLocationText}>
              {liveTimeString}
            </Text>
            <Ionicons name="chevron-down" size={12} color="#ffffff88" />
          </TouchableOpacity>
        </View>

        {/* Hero Middle Row: Prayer Name + Arabic Calligraphy + Sleek Countdown Glass Dock */}
        <View style={styles.heroMiddleRow}>
          <View style={styles.heroLeftCol}>
            <View style={styles.heroTagRow}>
              <View style={styles.heroSubTitleBadge}>
                <Text style={styles.heroSubTitle}>SHOLAT BERIKUTNYA</Text>
              </View>
              <View style={styles.kemenagTag}>
                <Text style={styles.kemenagTagText}>Kemenag RI</Text>
              </View>
            </View>

            <View style={styles.heroPrayerTitleRow}>
              <Text style={styles.heroPrayerName}>
                {prayerStatus.nextPrayerKey === 'dzuhur' && isFriday ? "Jum'at" : prayerStatus.nextPrayer || 'Maghrib'}
              </Text>
              <View style={styles.arabicPill}>
                <Text style={styles.heroArabicCalligraphy}>
                  {prayerStatus.nextPrayerKey === 'maghrib'
                    ? 'المغرب'
                    : prayerStatus.nextPrayerKey === 'isya'
                      ? 'العشاء'
                      : prayerStatus.nextPrayerKey === 'subuh'
                        ? 'الفجر'
                        : prayerStatus.nextPrayerKey === 'dzuhur' && isFriday
                          ? 'الجمعة'
                          : prayerStatus.nextPrayerKey === 'dzuhur'
                            ? 'الظهر'
                            : 'العصر'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <MaterialCommunityIcons name="clock-check-outline" size={13} color="#fe932c" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#fe932c' }}>
                Waktu Masuk: {prayerStatus.nextPrayerTime || '14:54'} {tzCode}
              </Text>
            </View>

            <Text style={styles.heroPrayerDesc} numberOfLines={2}>
              {prayerStatus.nextPrayerKey === 'maghrib'
                ? 'Terbenamnya matahari • Waktu berbuka puasa & doa'
                : prayerStatus.nextPrayerKey === 'subuh'
                  ? 'Menjelang fajar shodiq • Berkah awal hari & fajar'
                  : isFriday && prayerStatus.nextPrayerKey === 'dzuhur'
                    ? 'Sholat Jum\'at berjamaah & khutbah di masjid'
                    : prayerStatus.nextPrayerKey === 'dzuhur'
                      ? 'Tengah hari matahari condong • Rehat dan sujud'
                      : prayerStatus.nextPrayerKey === 'ashar'
                        ? 'Sore hari menjelang senja • Jaga sholat wustha'
                        : 'Malam hari penutup ibadah • Witir & istirahat'}
            </Text>
          </View>

          {/* High-Tech Digital Countdown Glass Dock with Animated Glow & Micro Progress */}
          <Animated.View
            style={[
              styles.countdownGlassCard,
              {
                borderColor: animatedGlowBorder,
                backgroundColor: animatedGlowBg,
              },
            ]}
          >
            <View style={styles.countdownTopRow}>
              <MaterialCommunityIcons name="timer-sand" size={13} color="#fe932c" />
              <Text style={styles.countdownLabel}>HITUNG MUNDUR</Text>
            </View>

            <Text style={styles.countdownDigitalText} numberOfLines={1}>
              {prayerStatus.hours || '00'} : {prayerStatus.mins || '00'} : {prayerStatus.secs || '00'}
            </Text>

            {/* Micro Progress Bar toward Next Prayer */}
            <View style={styles.countdownProgressTrack}>
              <View
                style={[
                  styles.countdownProgressBar,
                  { width: `${prayerStatus.progressPercent || 0}%` },
                ]}
              />
            </View>

            <View style={styles.qiblaMicroRow}>
              <Ionicons name="compass-outline" size={11} color="#a2d0c4" />
              <Text style={styles.qiblaMicroText}>
                {currentCity?.qiblaAngle || '295.2'}° ({currentCity?.fromWest || '25.2° U-B'})
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* 5 Horizontal Luxury Timeline Cards */}
        <View style={styles.timelinePillGrid}>
          {prayerItems.map((item) => {
            const isActive = prayerStatus.currentPrayerKey === item.key;
            const isNext = prayerStatus.nextPrayerKey === item.key;
            return (
              <View
                key={item.key}
                style={[
                  styles.timelinePill,
                  isActive && styles.timelinePillActive,
                  isNext && !isActive && styles.timelinePillNext,
                ]}
              >
                {isActive && (
                  <View style={styles.pillBadgeActive}>
                    <Text style={styles.pillBadgeActiveText}>SEKARANG</Text>
                  </View>
                )}
                {isNext && !isActive && (
                  <View style={styles.pillBadgeNext}>
                    <Text style={styles.pillBadgeNextText}>NANTI</Text>
                  </View>
                )}

                <Text
                  style={[
                    styles.timelinePillLabel,
                    isActive && styles.timelinePillLabelActive,
                    isNext && styles.timelinePillLabelNext,
                  ]}
                >
                  {item.name}
                </Text>

                <MaterialCommunityIcons
                  name={
                    item.key === 'subuh'
                      ? 'weather-sunset-up'
                      : item.key === 'dzuhur' && isFriday
                        ? 'mosque'
                        : item.key === 'dzuhur'
                          ? 'weather-sunny'
                          : item.key === 'ashar'
                            ? 'weather-partly-cloudy'
                            : item.key === 'maghrib'
                              ? 'weather-sunset-down'
                              : 'weather-night'
                  }
                  size={18}
                  color={isActive ? '#fe932c' : isNext ? '#bbeddd' : 'rgba(255,255,255,0.65)'}
                  style={{ marginVertical: 3 }}
                />

                <Text
                  style={[
                    styles.timelinePillTime,
                    isActive && styles.timelinePillTimeActive,
                    isNext && styles.timelinePillTimeNext,
                  ]}
                >
                  {item.time}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Adzan Quick Action & Audio Test */}
        <View style={styles.heroAdzanBar}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}
            onPress={() => onOpenProfileModal && onOpenProfileModal('muadzin')}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 13 }}>{selectedMuadzin?.flag || '🔊'}</Text>
            <Text style={styles.heroAdzanText} numberOfLines={1}>
              {selectedMuadzin?.name || 'Syaikh Ali Ahmed Mulla'}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroTestAdzanBtn}
            onPress={() => onTestAdzan && onTestAdzan(prayerStatus.nextPrayer || 'Dzuhur')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="play" size={13} color="#002721" />
            <Text style={styles.heroTestAdzanBtnText}>Tes Suara Adzan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. FITUR UTAMA: Carousel Slider Banner Iklan & Kemitraan Islami (Otomatis Disembunyikan untuk Member Noor+ Bebas Iklan) */}
      {!userProfile?.is_premium && (
        <View style={styles.sectionBlock}>
          <View style={styles.sponsorHeader}>
            <View style={styles.sponsorTitleRow}>
              <MaterialCommunityIcons name="check-decagram" size={18} color={Colors.secondary} />
              <Text style={styles.sponsorSectionTitle}>Kemitraan & Syiar Berkah</Text>
            </View>
            <View style={styles.sponsorHeaderRight}>
              {onOpenPremiumModal && (
                <TouchableOpacity
                  onPress={onOpenPremiumModal}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: '#fffbeb',
                    borderWidth: 1,
                    borderColor: '#f59e0b',
                    borderRadius: 10,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <MaterialCommunityIcons name="crown-outline" size={13} color="#b45309" />
                  <Text style={{ fontSize: 10.5, fontWeight: 'bold', color: '#92400e' }}>Hapus Iklan</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.sliderCounterText}>
                {activeSlide + 1}/{sponsorSlides.length}
              </Text>
              <TouchableOpacity
                onPress={() => setIsEthicsModalVisible(true)}
                style={styles.infoIconBtn}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="information-outline" size={16} color="#717976" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Horizontal Swipeable Carousel Track */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 14}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContainer}
            onScroll={handleScrollCarousel}
            scrollEventThrottle={16}
          >
            {sponsorSlides.map((slide) => (
              <View key={slide.id} style={[styles.slideCard, { width: CARD_WIDTH }]}>
                {/* Banner Image with overlay */}
                <View style={styles.slideImageWrapper}>
                  <Image source={{ uri: slide.image }} style={styles.slideImage} resizeMode="cover" />
                  <View style={styles.imageScrim} />

                  {/* Top Badges */}
                  <View style={styles.slideTopBadges}>
                    <View style={styles.slideTagWhite}>
                      <MaterialCommunityIcons name="star" size={12} color={Colors.secondary} />
                      <Text style={styles.slideTagWhiteText}>{slide.tag}</Text>
                    </View>
                    <View style={styles.slideTagOrange}>
                      <Text style={styles.slideTagOrangeText}>{slide.discountBadge}</Text>
                    </View>
                  </View>

                  {/* Bottom title on image */}
                  <View style={styles.slideImageBottomText}>
                    <View style={styles.verifiedRow}>
                      <MaterialCommunityIcons name="shield-check" size={12} color="#bdece0" />
                      <Text style={styles.verifiedText}>{slide.verified}</Text>
                    </View>
                    <Text style={styles.slideTitle} numberOfLines={2}>
                      {slide.title}
                    </Text>
                  </View>
                </View>

                {/* Banner Info & Action */}
                <View style={styles.slideContent}>
                  <View style={styles.slideDetailRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MaterialCommunityIcons name="airplane-takeoff" size={14} color="#002721" />
                      <Text style={styles.slideDetailText}>{slide.detail1}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <MaterialCommunityIcons name="office-building" size={14} color={Colors.secondary} />
                      <Text style={styles.slideDetailText}>{slide.detail2}</Text>
                    </View>
                  </View>

                  <View style={styles.slidePriceRow}>
                    <View>
                      <Text style={styles.slideOldPrice}>{slide.oldPrice}</Text>
                      <Text style={styles.slidePrice}>{slide.price}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.slideBtn}
                      activeOpacity={0.85}
                      onPress={() => {
                        const t = `${slide.title || ''} ${slide.tag || ''}`.toLowerCase();
                        if (t.includes('wakaf') || t.includes('sedekah') || t.includes('infaq') || t.includes('donasi') || t.includes('zakat')) {
                          if (onOpenDonation) {
                            onOpenDonation({ id: slide.id, title: slide.title }, 50000);
                          }
                        } else if (onOpenCatalog) {
                          const cat = t.includes('umrah') || t.includes('haji')
                            ? 'umrah'
                            : t.includes('buku') || t.includes('ensiklopedia') || t.includes('mushaf') || t.includes('literasi')
                              ? 'buku'
                              : t.includes('qurban') || t.includes('aqiqah')
                                ? 'qurban'
                                : 'all';
                          onOpenCatalog(cat);
                        }
                      }}
                    >
                      <Text style={styles.slideBtnText}>{slide.btnText}</Text>
                      <MaterialCommunityIcons name={slide.btnIcon} size={14} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Carousel Pagination Dots & Controls */}
          <View style={styles.carouselBottomRow}>
            <View style={styles.dotsGroup}>
              {sponsorSlides.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.dot, activeSlide === idx ? styles.dotActive : styles.dotInactive]}
                />
              ))}
            </View>

            <View style={styles.ethicsLinksRow}>
              <TouchableOpacity
                style={styles.ethicsLinkBtn}
                onPress={() => setIsEthicsModalVisible(true)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="scale-balance" size={13} color="#717976" />
                <Text style={styles.ethicsLinkText}>Transparansi Syariah</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ethicsLinkBtn}
                onPress={() => (onOpenPremiumModal ? onOpenPremiumModal() : setIsEthicsModalVisible(true))}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="eye-off-outline" size={13} color="#92400e" />
                <Text style={[styles.ethicsLinkText, { color: '#92400e', fontWeight: 'bold' }]}>Sembunyikan Iklan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 5. Quick Action Menu Grid (8 Essential Features in 4 cols x 2 rows) */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Fitur Utama Ibadah</Text>
          <Text style={styles.sectionHeaderSub}>Lengkap & Praktis</Text>
        </View>

        <View style={styles.quickGrid}>
          {quickActions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.quickCard}
              activeOpacity={0.8}
              onPress={item.action}
            >
              <View style={[styles.quickIconBox, { backgroundColor: item.bgColor }]}>
                <MaterialCommunityIcons name={item.icon} size={22} color={item.iconColor} />
              </View>
              <Text style={styles.quickLabel} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 6. Ayat Hari Ini / Inspirasi Qur'ani (Time-Adaptive & Acak) */}
      <View style={[styles.dailyVerseCard, isDarkMode && styles.dailyVerseCardDark]}>
        <View style={styles.dailyVerseHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={styles.verseIconCircle}>
              <MaterialCommunityIcons name="book-open-page-variant" size={16} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.verseBadgeLabel}>
                AYAT PILIHAN • {dailyVerse?.theme ? dailyVerse.theme.toUpperCase() : 'HARI INI'}
              </Text>
              <Text style={[styles.verseSurahTitle, isDarkMode && styles.textWhite]}>
                {dailyVerse?.surahName || 'QS. Al-Baqarah: 152'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {/* Tombol Acak / Ganti Ayat */}
            <TouchableOpacity
              style={[styles.verseActionHeaderBtn, isDarkMode && styles.verseActionHeaderBtnDark]}
              onPress={handleRandomizeDailyVerse}
              activeOpacity={0.7}
              accessibilityLabel="Ganti Ayat Pilihan"
            >
              <MaterialCommunityIcons name="dice-multiple-outline" size={17} color={isDarkMode ? '#34d399' : '#047857'} />
            </TouchableOpacity>

            {/* Tombol Bagikan Ayat */}
            <TouchableOpacity
              style={[styles.verseActionHeaderBtn, isDarkMode && styles.verseActionHeaderBtnDark]}
              onPress={handleShareDailyVerse}
              activeOpacity={0.7}
              accessibilityLabel="Bagikan Ayat"
            >
              <MaterialCommunityIcons name="share-variant-outline" size={17} color={isDarkMode ? '#94a3b8' : '#404846'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Arabic Calligraphy */}
        <View style={[styles.verseArabicBox, isDarkMode && styles.verseArabicBoxDark]}>
          <Text style={[styles.verseArabicText, isDarkMode && styles.textWhite]}>
            {dailyVerse?.arabic || 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ'}
          </Text>
        </View>

        {/* Latin Transliteration */}
        {!!dailyVerse?.latin && (
          <Text style={[styles.verseLatinText, isDarkMode && styles.verseLatinTextDark]}>
            {dailyVerse.latin}
          </Text>
        )}

        {/* Indonesian Translation */}
        <Text style={[styles.verseTranslationText, isDarkMode && styles.verseTranslationTextDark]}>
          "{dailyVerse?.translation || 'Maka ingatlah kepada-Ku, niscaya Aku akan ingat kepadamu.'}"
        </Text>

        {/* Verse Action Buttons */}
        <View style={styles.verseFooter}>
          <TouchableOpacity
            style={[styles.verseAudioBtn, isDarkMode && styles.verseAudioBtnDark]}
            onPress={handlePlayDailyVerseAudio}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={isPlayingMurottal ? 'stop-circle' : 'volume-high'}
              size={16}
              color={isPlayingMurottal ? '#ef4444' : (isDarkMode ? '#34d399' : Colors.primary)}
            />
            <Text style={[styles.verseAudioBtnText, isDarkMode && styles.verseAudioBtnTextDark]}>
              {isPlayingMurottal ? 'Hentikan Audio' : 'Dengarkan Murottal'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.verseTafsirLink}
            onPress={() => onNavigateTab('quran')}
            activeOpacity={0.8}
          >
            <Text style={styles.verseTafsirText}>Buka Al-Qur'an</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 7. Daily Checklist Ibadah Tracker (Time-Adaptive Sesuai Waktu) */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="check-circle" size={18} color={Colors.secondary} />
            <Text style={[styles.sectionHeaderTitle, isDarkMode && styles.textWhite]}>Target Ibadah Hari Ini</Text>
            <View style={[styles.sessionBadge, isDarkMode && styles.sessionBadgeDark]}>
              <Text style={styles.sessionBadgeText}>{habitSession.sessionBadge}</Text>
            </View>
          </View>
          <Text style={[styles.habitScoreText, isDarkMode && styles.textSecondaryLight]}>
            {completedHabitsCount} dari {habitSession.habits.length} Selesai
          </Text>
        </View>

        {/* Habit Progress Bar */}
        <View style={[styles.habitBarBackground, isDarkMode && styles.habitBarBackgroundDark]}>
          <View
            style={[
              styles.habitBarFill,
              { width: `${Math.round((completedHabitsCount / habitSession.habits.length) * 100)}%` },
            ]}
          />
        </View>

        {/* Checklist 2x2 Cards Grid */}
        <View style={styles.habitGrid}>
          {habitSession.habits.map((item) => {
            const isCompleted = completedHabitIds.includes(item.id);
            return (
              <View key={item.id} style={[styles.habitCard, isDarkMode && styles.habitCardDark]}>
                <View style={{ flex: 1, paddingRight: 6 }}>
                  <Text style={[styles.habitCardTitle, isDarkMode && styles.textWhite]}>{item.title}</Text>
                  <Text
                    style={[
                      styles.habitCardSub,
                      isDarkMode && styles.textMuted,
                      isCompleted && { color: '#059669', fontWeight: '600' },
                    ]}
                  >
                    {isCompleted ? '✓ Selesai Dilakukan' : item.sub}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.habitCheckBtn,
                    isCompleted
                      ? styles.habitCheckBtnDone
                      : (isDarkMode ? styles.habitCheckBtnPendingDark : styles.habitCheckBtnPending),
                  ]}
                  onPress={() => toggleHabit(item.id)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="check"
                    size={16}
                    color={isCompleted ? '#ffffff' : (isDarkMode ? '#64748b' : '#9ca3af')}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      {/* 8. Transparansi Kemitraan Syariah Modal Sheet */}
      <Modal
        visible={isEthicsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEthicsModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.ethicsSheetCard}>
            <View style={styles.sheetHandle} />

            <View style={styles.ethicsSheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="shield-check" size={24} color={Colors.primary} />
                <Text style={styles.ethicsSheetTitle}>Transparansi Kemitraan Syariah</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEthicsModalVisible(false)}
                style={styles.sheetCloseBtn}
              >
                <Ionicons name="close" size={22} color="#404846" />
              </TouchableOpacity>
            </View>

            <Text style={styles.ethicsSheetDesc}>
              Setiap promosi sponsor di aplikasi Noor disaring melalui dewan peninjau syariah untuk menjamin:
            </Text>

            <View style={styles.ethicsPointsList}>
              <View style={styles.ethicsPointItem}>
                <MaterialCommunityIcons name="check-circle" size={18} color={Colors.primary} />
                <Text style={styles.ethicsPointText}>
                  Bebas dari unsur gharar, riba, maysir, dan materi non-halal.
                </Text>
              </View>

              <View style={styles.ethicsPointItem}>
                <MaterialCommunityIcons name="check-circle" size={18} color={Colors.primary} />
                <Text style={styles.ethicsPointText}>
                  Biro perjalanan Umrah & Haji wajib memiliki izin resmi PPIU Kemenag RI.
                </Text>
              </View>

              <View style={styles.ethicsPointItem}>
                <MaterialCommunityIcons name="check-circle" size={18} color={Colors.primary} />
                <Text style={styles.ethicsPointText}>
                  Yayasan wakaf & donasi terdaftar di Badan Wakaf Indonesia (BWI) / BAZNAS.
                </Text>
              </View>
            </View>

            {onOpenPremiumModal && !userProfile?.is_premium && (
              <TouchableOpacity
                style={{
                  backgroundColor: '#fffbeb',
                  borderWidth: 1.5,
                  borderColor: '#f59e0b',
                  borderRadius: 14,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 10,
                }}
                activeOpacity={0.85}
                onPress={() => {
                  setIsEthicsModalVisible(false);
                  onOpenPremiumModal();
                }}
              >
                <MaterialCommunityIcons name="crown" size={18} color="#b45309" />
                <Text style={{ fontSize: 12.5, fontWeight: 'bold', color: '#92400e' }}>
                  Ingin Beranda Tanpa Iklan? Aktifkan Noor+
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.ethicsUnderstoodBtn}
              activeOpacity={0.85}
              onPress={() => setIsEthicsModalVisible(false)}
            >
              <Text style={styles.ethicsUnderstoodText}>Saya Memahami</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faf9',
  },
  content: {
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImg: {
    width: 32,
    height: 32,
  },
  brandTitle: {
    fontSize: 20,
    color: '#002721',
    fontFamily: Fonts.serifBold,
    lineHeight: 24,
  },
  brandSubtitle: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#717976',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f4f3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  cityName: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: '#191c1c',
  },
  headerAuthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f4f1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: '#c0e8de',
  },
  headerAuthPillText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  headerLogoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffebee',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  profileBtn: {
    padding: 2,
    position: 'relative',
  },
  profileActiveDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  profileAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#bdece0',
  },
  guestBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#eceeed',
    shadowColor: '#002721',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  guestBannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff4eb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffe2cc',
  },
  guestBannerTitle: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  guestBannerSubtitle: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#6f7975',
    marginTop: 2,
    lineHeight: 15,
  },
  guestBannerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  guestBannerLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  guestBannerLoginText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: '#ffffff',
  },
  guestBannerRegisterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f2f4f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eceeed',
  },
  guestBannerRegisterText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  contextStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 14,
  },
  hijriRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  hijriBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffdcc350',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fe932c30',
    gap: 5,
  },
  hijriText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.secondary,
  },
  fridayBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: '#fe932c',
  },
  greetingText: {
    fontSize: 20,
    color: '#002721',
    fontFamily: Fonts.serifBold,
    marginTop: 2,
  },
  spiritualPrompt: {
    fontSize: 11.5,
    fontFamily: Fonts.regular,
    color: '#404846',
    marginTop: 3,
    lineHeight: 17,
  },
  topIconGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  topCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e3e2',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#fe932c',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  heroCard: {
    backgroundColor: '#002721',
    borderRadius: 26,
    marginHorizontal: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(59, 102, 93, 0.45)',
    shadowColor: '#002721',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  heroStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(162, 208, 196, 0.3)',
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fe932c',
  },
  heroStatusText: {
    fontSize: 9,
    fontFamily: Fonts.bold,
    color: '#a2d0c4',
    letterSpacing: 0.8,
  },
  heroNextHighlight: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#fe932c',
    letterSpacing: 0.5,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 4,
  },
  heroLocationText: {
    fontSize: 11.5,
    fontFamily: Fonts.bold,
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  heroMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  heroLeftCol: {
    flex: 1,
    flexShrink: 1,
    paddingRight: 6,
    justifyContent: 'center',
  },
  heroTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  heroSubTitleBadge: {
    backgroundColor: 'rgba(254, 147, 44, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(254, 147, 44, 0.3)',
  },
  heroSubTitle: {
    fontSize: 9,
    fontFamily: Fonts.bold,
    color: '#ffdcc3',
    letterSpacing: 0.5,
  },
  kemenagTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  kemenagTagText: {
    fontSize: 8.5,
    fontFamily: Fonts.semiBold,
    color: '#bbeddd',
  },
  heroPrayerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  heroPrayerName: {
    fontSize: 23,
    fontFamily: Fonts.serifBold,
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  arabicPill: {
    backgroundColor: 'rgba(254, 147, 44, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 7,
    borderWidth: 0.5,
    borderColor: 'rgba(254, 147, 44, 0.3)',
  },
  heroArabicCalligraphy: {
    fontSize: 15,
    fontFamily: Fonts.serifBold,
    color: '#fe932c',
  },
  heroPrayerDesc: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: 'rgba(187, 237, 221, 0.85)',
    lineHeight: 14,
  },
  countdownGlassCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(254, 147, 44, 0.35)',
    width: 124,
    flexShrink: 0,
  },
  countdownTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  countdownLabel: {
    fontSize: 8,
    fontFamily: Fonts.bold,
    color: '#fe932c',
    letterSpacing: 0.5,
  },
  countdownDigitalText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: '#ffffff',
    letterSpacing: 0.2,
    marginVertical: 2,
  },
  countdownProgressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 3,
  },
  countdownProgressBar: {
    height: '100%',
    backgroundColor: '#fe932c',
    borderRadius: 2,
  },
  qiblaMicroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  qiblaMicroText: {
    fontSize: 8,
    fontFamily: Fonts.medium,
    color: '#a2d0c4',
  },
  timelinePillGrid: {
    flexDirection: 'row',
    width: '100%',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  timelinePill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 2,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
  },
  timelinePillActive: {
    backgroundColor: 'rgba(254, 147, 44, 0.18)',
    borderColor: '#fe932c',
    borderWidth: 1.5,
  },
  timelinePillNext: {
    backgroundColor: 'rgba(11, 63, 52, 0.55)',
    borderColor: 'rgba(162, 208, 196, 0.55)',
    borderWidth: 1.5,
  },
  pillBadgeActive: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#fe932c',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  pillBadgeActiveText: {
    fontSize: 7.5,
    fontFamily: Fonts.bold,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  pillBadgeNext: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#0b3f34',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#bbeddd',
  },
  pillBadgeNextText: {
    fontSize: 7.5,
    fontFamily: Fonts.bold,
    color: '#bbeddd',
    letterSpacing: 0.5,
  },
  timelinePillLabel: {
    fontSize: 10.5,
    fontFamily: Fonts.medium,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 2,
  },
  timelinePillLabelActive: {
    color: '#fe932c',
    fontFamily: Fonts.bold,
  },
  timelinePillLabelNext: {
    color: '#bbeddd',
    fontFamily: Fonts.bold,
  },
  timelinePillTime: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  timelinePillTimeActive: {
    color: '#ffffff',
    fontFamily: Fonts.bold,
  },
  timelinePillTimeNext: {
    color: '#bbeddd',
    fontFamily: Fonts.bold,
  },
  heroAdzanBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroAdzanText: {
    fontSize: 10.5,
    fontFamily: Fonts.medium,
    color: '#bbeddd',
  },
  heroTestAdzanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fe932c',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  heroTestAdzanBtnText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#002721',
  },
  sectionBlock: {
    marginTop: 20,
  },
  sponsorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sponsorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sponsorSectionTitle: {
    fontSize: 15,
    color: '#191c1c',
    fontFamily: Fonts.serifBold,
  },
  sponsorHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sliderCounterText: {
    fontSize: 11,
    color: '#717976',
    fontFamily: Fonts.semiBold,
  },
  infoIconBtn: {
    padding: 2,
  },
  carouselContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    gap: 12,
  },
  slideCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eceeed',
  },
  slideImageWrapper: {
    height: 165,
    width: '100%',
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  imageScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,39,33,0.45)',
  },
  slideTopBadges: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  slideTagWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  slideTagWhiteText: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: '#191c1c',
  },
  slideTagOrange: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  slideTagOrangeText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#ffffff',
  },
  slideImageBottomText: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#bdece0',
  },
  slideTitle: {
    fontSize: 15,
    color: '#ffffff',
    fontFamily: Fonts.serifBold,
    lineHeight: 21,
  },
  slideContent: {
    padding: 12,
    gap: 10,
  },
  slideDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slideDetailText: {
    fontSize: 10.5,
    fontFamily: Fonts.medium,
    color: '#717976',
  },
  slidePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f2f4f3',
  },
  slideOldPrice: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: '#717976',
    textDecorationLine: 'line-through',
  },
  slidePrice: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.secondary,
  },
  slideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002721',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  slideBtnText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: '#ffffff',
  },
  carouselBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  dotsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    height: 5,
    borderRadius: 2.5,
  },
  dotActive: {
    width: 22,
    backgroundColor: Colors.secondary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#e1e3e2',
  },
  ethicsLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ethicsLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ethicsLinkText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#717976',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    color: '#191c1c',
    fontFamily: Fonts.serifBold,
  },
  sectionHeaderSub: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#717976',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  quickCard: {
    width: (width - 24 - 24) / 4,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eceeed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  quickIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickLabel: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: '#191c1c',
    textAlign: 'center',
  },
  dailyVerseCard: {
    backgroundColor: '#f2f4f3',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 18,
    gap: 12,
  },
  dailyVerseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verseIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0f3e36',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseBadgeLabel: {
    fontSize: 9,
    fontFamily: Fonts.bold,
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  verseSurahTitle: {
    fontSize: 15,
    fontFamily: Fonts.serifBold,
    color: '#002721',
  },
  verseShareBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eceeed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseArabicBox: {
    paddingVertical: 4,
  },
  verseArabicText: {
    fontSize: 22,
    lineHeight: 40,
    textAlign: 'right',
    color: '#002721',
    fontFamily: Fonts.serifBold,
  },
  verseTranslationText: {
    fontSize: 12.5,
    lineHeight: 19,
    color: '#404846',
    fontFamily: Fonts.regular,
    fontStyle: 'italic',
  },
  verseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e1e3e2',
  },
  verseAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  verseAudioBtnText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: '#002721',
  },
  verseTafsirLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verseTafsirText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.secondary,
  },
  habitScoreText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  habitBarBackground: {
    height: 6,
    backgroundColor: '#e6e9e8',
    borderRadius: 3,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  habitBarFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 3,
  },
  habitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  habitCard: {
    width: (width - 32 - 10) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#eceeed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  habitCardTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: '#191c1c',
  },
  habitCardSub: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: '#717976',
    marginTop: 2,
  },
  habitCheckBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitCheckBtnDone: {
    backgroundColor: '#002721',
  },
  habitCheckBtnPending: {
    backgroundColor: '#eceeed',
  },
  habitCheckBtnPendingDark: {
    backgroundColor: '#1e293b',
  },
  themeToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
    borderWidth: 1,
    borderColor: '#e2e8e5',
  },
  themeToggleBtnDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  cityPillDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  verseActionHeaderBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eceeed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseActionHeaderBtnDark: {
    backgroundColor: '#1e293b',
  },
  verseLatinText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    fontStyle: 'italic',
    color: '#0f3e36',
    lineHeight: 18,
  },
  verseLatinTextDark: {
    color: '#34d399',
  },
  dailyVerseCardDark: {
    backgroundColor: '#131e2c',
    borderWidth: 1,
    borderColor: '#223447',
  },
  verseArabicBoxDark: {
    borderBottomColor: '#223447',
  },
  verseTranslationTextDark: {
    color: '#cbd5e1',
  },
  verseAudioBtnDark: {
    backgroundColor: 'transparent',
  },
  verseAudioBtnTextDark: {
    color: '#34d399',
  },
  sessionBadge: {
    backgroundColor: '#e6f4f1',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 4,
  },
  sessionBadgeDark: {
    backgroundColor: '#064e3b',
  },
  sessionBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f3e36',
  },
  habitCardDark: {
    backgroundColor: '#131e2c',
    borderColor: '#223447',
  },
  habitBarBackgroundDark: {
    backgroundColor: '#1e293b',
  },
  textWhite: {
    color: '#f8fafc',
  },
  textMuted: {
    color: '#94a3b8',
  },
  textSecondaryLight: {
    color: '#fbbf24',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  ethicsSheetCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 14,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    backgroundColor: '#e1e3e2',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  ethicsSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ethicsSheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#191c1c',
    fontFamily: 'serif',
  },
  sheetCloseBtn: {
    padding: 4,
  },
  ethicsSheetDesc: {
    fontSize: 12,
    color: '#404846',
    lineHeight: 18,
  },
  ethicsPointsList: {
    gap: 10,
  },
  ethicsPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ethicsPointText: {
    flex: 1,
    fontSize: 11,
    color: '#191c1c',
    lineHeight: 16,
  },
  ethicsUnderstoodBtn: {
    backgroundColor: '#002721',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  ethicsUnderstoodText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
