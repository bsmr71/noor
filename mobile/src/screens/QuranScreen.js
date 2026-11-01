import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { ALL_SURAHS, getSurahAudioUrl, getAyahAudioUrl } from '../data/surahList';
import { SAMPLE_SURAHS_DETAIL } from '../data/sampleSurahData';
import { playAudioUrl, stopCurrentAudio } from '../utils/audioPlayerService';
import { renderTajweedArabic, getAyahTajweedRules, TAJWEED_LEGEND } from '../utils/tajweedParser';
import {
  cacheSurahText,
  getCachedSurahText,
  isSurahTextDownloaded,
  isSurahAudioOffline,
  getSurahAudioSource,
  downloadSurahAudio,
  deleteSurahAudio,
  isAyahAudioOffline,
  getAyahAudioSource,
  downloadAyahAudio,
  cacheSurahTafsir,
  getCachedSurahTafsir,
  saveLastRead,
  getLastRead,
  getBookmarks,
  toggleBookmark,
} from '../services/offlineStorageService';

export default function QuranScreen({ selectedQori, isDarkMode = false }) {
  const [search, setSearch] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [surahDetail, setSurahDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playingAyahNumber, setPlayingAyahNumber] = useState(null);

  // Offline Audio & Surah State
  const [isTextOffline, setIsTextOffline] = useState(false);
  const [isAudioOffline, setIsAudioOffline] = useState(false);
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const [downloadedAyat, setDownloadedAyat] = useState({});
  const [downloadingAyahNum, setDownloadingAyahNum] = useState(null);

  // Tab & History & Bookmark State
  const [activeListTab, setActiveListTab] = useState('surah'); // 'surah' | 'bookmarks'
  const [lastRead, setLastRead] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);

  // Tajweed & Tafsir State
  const [isTajweedEnabled, setIsTajweedEnabled] = useState(true);
  const [isTajweedGuideVisible, setIsTajweedGuideVisible] = useState(false);
  const [isTafsirModalVisible, setIsTafsirModalVisible] = useState(false);
  const [selectedTafsirAyah, setSelectedTafsirAyah] = useState(null);
  const [surahTafsirMap, setSurahTafsirMap] = useState({});
  const [isLoadingTafsir, setIsLoadingTafsir] = useState(false);

  // Load Bookmarks & Last Read on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const lr = await getLastRead();
    if (lr) setLastRead(lr);
    const bms = await getBookmarks();
    setBookmarks(bms);
  };

  const handleSetLastRead = async (ayah) => {
    if (!selectedSurah) return;
    const count = selectedSurah.ayahCount || selectedSurah.numberOfAyat || surahDetail?.jumlahAyat || 7;
    const saved = await saveLastRead(selectedSurah.number, selectedSurah.latin, ayah.nomorAyat, count);
    setLastRead(saved);
    Alert.alert(
      'Tersimpan Sebagai Terakhir Dibaca',
      `QS. ${selectedSurah.latin} ayat ${ayah.nomorAyat} kini menjadi titik bacaan terakhir Anda.`
    );
  };

  const handleToggleAyahBookmark = async (ayah) => {
    if (!selectedSurah) return;
    const isNowBookmarked = await toggleBookmark({
      surahNumber: selectedSurah.number,
      surahLatin: selectedSurah.latin,
      ayahNumber: ayah.nomorAyat,
      teksArab: ayah.teksArab,
      teksIndonesia: ayah.teksIndonesia,
    });
    const bms = await getBookmarks();
    setBookmarks(bms);
  };

  const loadSurahTafsir = async (surahNumber) => {
    // 1. Cek penyimpanan offline/cache
    const cached = await getCachedSurahTafsir(surahNumber);
    if (cached && Array.isArray(cached.tafsir)) {
      const map = {};
      cached.tafsir.forEach((t) => {
        map[t.ayat] = t.teks;
      });
      setSurahTafsirMap(map);
      return map;
    }

    // 2. Ambil dari API resmi Kemenag RI (eQuran.id v2)
    try {
      setIsLoadingTafsir(true);
      const res = await fetch(`https://equran.id/api/v2/tafsir/${surahNumber}`);
      const json = await res.json();
      if (json?.data?.tafsir) {
        await cacheSurahTafsir(surahNumber, json.data);
        const map = {};
        json.data.tafsir.forEach((t) => {
          map[t.ayat] = t.teks;
        });
        setSurahTafsirMap(map);
        return map;
      }
    } catch (e) {
      console.warn('Gagal memuat tafsir:', e);
    } finally {
      setIsLoadingTafsir(false);
    }
    return {};
  };

  const handleOpenTafsir = async (ayah) => {
    setSelectedTafsirAyah({
      surahNumber: selectedSurah.number,
      surahLatin: selectedSurah.latin,
      ayahNumber: ayah.nomorAyat,
      teksArab: ayah.teksArab,
      teksIndonesia: ayah.teksIndonesia,
      tafsirTeks: surahTafsirMap[ayah.nomorAyat] || '',
    });
    setIsTafsirModalVisible(true);

    if (!surahTafsirMap[ayah.nomorAyat]) {
      const map = await loadSurahTafsir(selectedSurah.number);
      if (map[ayah.nomorAyat]) {
        setSelectedTafsirAyah((prev) => ({
          ...prev,
          tafsirTeks: map[ayah.nomorAyat],
        }));
      }
    }
  };

  // Filter surahs
  const filteredSurahs = useMemo(() => {
    if (!search.trim()) return ALL_SURAHS;
    const q = search.toLowerCase();
    return ALL_SURAHS.filter(
      (s) =>
        s.latin?.toLowerCase().includes(q) ||
        s.name?.toLowerCase().includes(q) ||
        s.arti?.toLowerCase().includes(q) ||
        s.translation?.toLowerCase().includes(q) ||
        String(s.number) === q
    );
  }, [search]);

  // Check offline audio status for this surah & its verses
  const checkOfflineAudios = async (surahNum, ayatList = []) => {
    const qoriId = selectedQori?.id || 'alafasy';
    const hasSurahAudio = await isSurahAudioOffline(surahNum, qoriId);
    setIsAudioOffline(hasSurahAudio);

    const ayatMap = {};
    for (const ay of ayatList) {
      if (ay?.nomorAyat) {
        ayatMap[ay.nomorAyat] = await isAyahAudioOffline(surahNum, ay.nomorAyat, qoriId);
      }
    }
    setDownloadedAyat(ayatMap);
  };

  // Open Surah Reader
  const handleOpenSurah = async (surah) => {
    setSelectedSurah(surah);
    setIsLoadingDetail(true);
    setPlayingAyahNumber(null);
    setIsAudioOffline(false);
    setIsTextOffline(false);

    // Stop any existing sound
    stopCurrentAudio();
    setIsPlayingAudio(false);

    // 0. Check offline cache first (Instant load without network!)
    const cached = await getCachedSurahText(surah.number);
    if (cached && Array.isArray(cached.ayat) && cached.ayat.length > 0) {
      setSurahDetail(cached);
      setIsLoadingDetail(false);
      setIsTextOffline(true);
      checkOfflineAudios(surah.number, cached.ayat);
      return;
    }

    try {
      // 1. Try public eQuran.id API v2 (Official, very fast & accurate)
      const res = await fetch(`https://equran.id/api/v2/surat/${surah.number}`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        if (data && Array.isArray(data.ayat) && data.ayat.length > 0) {
          setSurahDetail(data);
          setIsLoadingDetail(false);
          setIsTextOffline(true);
          await cacheSurahText(surah.number, data);
          checkOfflineAudios(surah.number, data.ayat);
          return;
        }
      }

      // 2. Fallback to api.quran.gading.dev
      const gadingRes = await fetch(`https://api.quran.gading.dev/surah/${surah.number}`);
      if (gadingRes.ok) {
        const gadingJson = await gadingRes.json();
        const gData = gadingJson.data;
        if (gData && Array.isArray(gData.verses)) {
          const formatted = {
            nomor: gData.number,
            namaLatin: gData.name?.transliteration?.id || surah.latin,
            nama: gData.name?.short || surah.arabic,
            arti: gData.name?.translation?.id || surah.arti,
            jumlahAyat: gData.numberOfVerses || surah.ayahCount,
            tempatTurun: gData.revelation?.id || surah.type,
            ayat: gData.verses.map((v) => ({
              nomorAyat: v.number?.inSurah,
              teksArab: v.text?.arab,
              teksLatin: v.text?.transliteration?.en || '',
              teksIndonesia: v.translation?.id || '',
              audio: v.audio?.secondary?.[0] || v.audio?.primary || null,
            })),
          };
          setSurahDetail(formatted);
          setIsLoadingDetail(false);
          setIsTextOffline(true);
          await cacheSurahText(surah.number, formatted);
          checkOfflineAudios(surah.number, formatted.ayat);
          return;
        }
      }

      // 3. Fallback to offline cached sample surahs
      const offlineSample = SAMPLE_SURAHS_DETAIL[surah.number];
      if (offlineSample && Array.isArray(offlineSample.verses)) {
        const sampleData = {
          nomor: offlineSample.number,
          namaLatin: offlineSample.name,
          nama: offlineSample.arabicName,
          arti: offlineSample.translation,
          jumlahAyat: offlineSample.versesCount,
          tempatTurun: offlineSample.revelation,
          ayat: offlineSample.verses.map((v) => ({
            nomorAyat: v.number,
            teksArab: v.arabic,
            teksLatin: v.latin,
            teksIndonesia: v.translation,
          })),
        };
        setSurahDetail(sampleData);
        setIsLoadingDetail(false);
        setIsTextOffline(true);
        await cacheSurahText(surah.number, sampleData);
        checkOfflineAudios(surah.number, sampleData.ayat);
        return;
      }

      // 4. Default single ayah fallback if completely unreachable
      setSurahDetail({
        nomor: surah.number,
        namaLatin: surah.latin,
        nama: surah.arabic,
        arti: surah.arti,
        jumlahAyat: surah.ayahCount,
        tempatTurun: surah.type,
        ayat: [
          {
            nomorAyat: 1,
            teksArab: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            teksLatin: 'Bismillaahir-rahmaanir-rahiim',
            teksIndonesia: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
          },
        ],
      });
    } catch (e) {
      const offlineSample = SAMPLE_SURAHS_DETAIL[surah.number];
      if (offlineSample && Array.isArray(offlineSample.verses)) {
        setSurahDetail({
          nomor: offlineSample.number,
          namaLatin: offlineSample.name,
          nama: offlineSample.arabicName,
          arti: offlineSample.translation,
          jumlahAyat: offlineSample.versesCount,
          tempatTurun: offlineSample.revelation,
          ayat: offlineSample.verses.map((v) => ({
            nomorAyat: v.number,
            teksArab: v.arabic,
            teksLatin: v.latin,
            teksIndonesia: v.translation,
          })),
        });
      }
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleDownloadSurahAudio = async () => {
    if (!selectedSurah) return;
    const qoriId = selectedQori?.id || 'alafasy';
    const paddedNum = String(selectedSurah.number).padStart(3, '0');
    const remoteUrl =
      surahDetail?.audioFull?.['05'] ||
      surahDetail?.audioFull?.['01'] ||
      `${selectedQori?.surahServer || 'https://server8.mp3quran.net/afs/'}${paddedNum}.mp3`;

    try {
      setIsDownloadingAudio(true);
      await downloadSurahAudio(selectedSurah.number, qoriId, remoteUrl);
      setIsAudioOffline(true);
      Alert.alert(
        'Berhasil Diunduh',
        `Audio Surat ${selectedSurah.latin} (${selectedQori?.name || 'Misyari Rasyid'}) kini tersimpan offline di HP Anda.`
      );
    } catch (e) {
      Alert.alert('Gagal Mengunduh', 'Pastikan koneksi internet stabil saat mengunduh audio surat.');
    } finally {
      setIsDownloadingAudio(false);
    }
  };

  const handleDeleteSurahAudio = () => {
    if (!selectedSurah) return;
    const qoriId = selectedQori?.id || 'alafasy';
    Alert.alert('Hapus Audio Surat', `Hapus audio offline Surat ${selectedSurah.latin}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          await deleteSurahAudio(selectedSurah.number, qoriId);
          setIsAudioOffline(false);
        },
      },
    ]);
  };

  const handleToggleDownloadAyah = async (ayah) => {
    if (!selectedSurah) return;
    const qoriId = selectedQori?.id || 'alafasy';

    if (downloadedAyat[ayah.nomorAyat]) {
      Alert.alert('Audio Offline', `Audio ayat ${ayah.nomorAyat} sudah tersimpan offline di memori HP.`);
      return;
    }

    const ayahUrl =
      ayah.audio?.['05'] ||
      ayah.audio?.['01'] ||
      (typeof ayah.audio === 'string' ? ayah.audio : null) ||
      getAyahAudioUrl(selectedSurah.number, ayah.nomorAyat, selectedQori);

    try {
      setDownloadingAyahNum(ayah.nomorAyat);
      await downloadAyahAudio(selectedSurah.number, ayah.nomorAyat, qoriId, ayahUrl);
      setDownloadedAyat((prev) => ({ ...prev, [ayah.nomorAyat]: true }));
    } catch (e) {
      Alert.alert('Gagal', 'Tidak dapat mengunduh audio ayat. Cek koneksi internet.');
    } finally {
      setDownloadingAyahNum(null);
    }
  };

  const handleToggleSurahAudio = async () => {
    if (!selectedSurah) return;

    if (isPlayingAudio) {
      stopCurrentAudio();
      setIsPlayingAudio(false);
      setPlayingAyahNumber(null);
      return;
    }

    const qoriId = selectedQori?.id || 'alafasy';
    const paddedNum = String(selectedSurah.number).padStart(3, '0');
    const remoteUrl =
      surahDetail?.audioFull?.['05'] ||
      surahDetail?.audioFull?.['01'] ||
      `${selectedQori?.surahServer || 'https://server8.mp3quran.net/afs/'}${paddedNum}.mp3`;

    const audioSource = await getSurahAudioSource(selectedSurah.number, qoriId, remoteUrl);

    playAudioUrl(audioSource);
    setIsPlayingAudio(true);
    setPlayingAyahNumber(null);
  };

  const handlePlayAyahAudio = async (ayah) => {
    if (!selectedSurah) return;

    if (playingAyahNumber === ayah.nomorAyat) {
      stopCurrentAudio();
      setPlayingAyahNumber(null);
      return;
    }

    stopCurrentAudio();
    setIsPlayingAudio(false);

    const qoriId = selectedQori?.id || 'alafasy';
    const remoteAyahUrl =
      ayah.audio?.['05'] ||
      ayah.audio?.['01'] ||
      (typeof ayah.audio === 'string' ? ayah.audio : null) ||
      getAyahAudioUrl(selectedSurah.number, ayah.nomorAyat, selectedQori);

    const ayahSource = await getAyahAudioSource(
      selectedSurah.number,
      ayah.nomorAyat,
      qoriId,
      remoteAyahUrl
    );

    playAudioUrl(ayahSource);
    setPlayingAyahNumber(ayah.nomorAyat);
  };

  const handleShareAyah = (ayah) => {
    if (!selectedSurah) return;
    const shareText = `QS. ${selectedSurah.latin} [${selectedSurah.number}:${ayah.nomorAyat}]:\n\n${ayah.teksArab}\n\n"${ayah.teksIndonesia}"\n\nDibagikan melalui Aplikasi Noor (Muslim Pro).`;
    Share.share({ message: shareText }).catch(() => { });
  };

  const handleCloseModal = () => {
    stopCurrentAudio();
    setIsPlayingAudio(false);
    setPlayingAyahNumber(null);
    setSelectedSurah(null);
    setSurahDetail(null);
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#070c12' }]}>
      {/* Header Search & Title */}
      <View style={[styles.header, isDarkMode && { backgroundColor: '#0d1620', borderBottomColor: '#1e293b' }]}>
        <Text style={[styles.headerTitle, isDarkMode && { color: '#f8fafc' }]}>Al-Qur'an Al-Karim</Text>
        <Text style={[styles.headerSub, isDarkMode && { color: '#94a3b8' }]}>
          114 Surah • Terjemahan Kemenag RI, Tajwid Warna & Tafsir
        </Text>

        {/* Banner Riwayat Terakhir Membaca */}
        {lastRead && (
          <TouchableOpacity
            style={[styles.lastReadCard, isDarkMode && styles.lastReadCardDark]}
            onPress={() => {
              const surah = ALL_SURAHS.find((s) => s.number === lastRead.surahNumber) || ALL_SURAHS[0];
              handleOpenSurah(surah, lastRead.ayahNumber);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.lastReadLeft}>
              <View style={styles.lastReadIconCircle}>
                <Ionicons name="bookmark" size={15} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.lastReadBadge}>TERAKHIR DIBACA</Text>
                <Text style={[styles.lastReadSurahName, isDarkMode && { color: '#f8fafc' }]}>
                  QS. {lastRead.surahLatin} • Ayat {lastRead.ayahNumber}
                </Text>
              </View>
            </View>
            <View style={styles.lastReadAction}>
              <Text style={styles.lastReadActionText}>Lanjutkan Baca</Text>
              <Ionicons name="chevron-forward" size={14} color="#059669" />
            </View>
          </TouchableOpacity>
        )}

        {/* Tab Switcher: Semua Surat vs Ayat Ditandai */}
        <View style={[styles.quranTabSwitcher, isDarkMode && styles.quranTabSwitcherDark]}>
          <TouchableOpacity
            style={[styles.quranTabBtn, activeListTab === 'surah' && styles.quranTabBtnActive]}
            onPress={() => setActiveListTab('surah')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="book-outline"
              size={13}
              color={activeListTab === 'surah' ? '#ffffff' : (isDarkMode ? '#94a3b8' : '#6f7975')}
            />
            <Text style={[styles.quranTabBtnText, activeListTab === 'surah' && styles.quranTabBtnTextActive]}>
              Semua Surat (114)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quranTabBtn, activeListTab === 'bookmarks' && styles.quranTabBtnActive]}
            onPress={() => setActiveListTab('bookmarks')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="bookmark"
              size={13}
              color={activeListTab === 'bookmarks' ? '#ffffff' : (isDarkMode ? '#94a3b8' : '#6f7975')}
            />
            <Text style={[styles.quranTabBtnText, activeListTab === 'bookmarks' && styles.quranTabBtnTextActive]}>
              Ayat Ditandai ({bookmarks.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeListTab === 'surah' && (
          <View style={[styles.searchBar, isDarkMode && { backgroundColor: '#152232', borderColor: '#223447' }]}>
            <Ionicons name="search" size={18} color={isDarkMode ? '#94a3b8' : '#6f7975'} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, isDarkMode && { color: '#f8fafc' }]}
              placeholder="Cari nama Surah, arti, atau nomor (1-114)..."
              placeholderTextColor={isDarkMode ? '#64748b' : '#9ca3af'}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={isDarkMode ? '#94a3b8' : '#6f7975'} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Main List Content */}
      {activeListTab === 'surah' ? (
        <FlatList
          data={filteredSurahs}
          keyExtractor={(item) => String(item.number)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.surahItem, isDarkMode && { backgroundColor: '#131e2c', borderColor: '#223447' }]}
              activeOpacity={0.8}
              onPress={() => handleOpenSurah(item)}
            >
              {/* Number badge */}
              <View style={[styles.numBadge, isDarkMode && { backgroundColor: '#1e293b' }]}>
                <Text style={[styles.numText, isDarkMode && { color: '#34d399' }]}>{item.number}</Text>
              </View>

              {/* Title & Info */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.latinName, isDarkMode && { color: '#f8fafc' }]}>{item.latin}</Text>
                  <View style={[styles.typeBadge, item.type === 'Madaniyah' && styles.typeBadgeMadaniyah]}>
                    <Text style={[styles.typeText, item.type === 'Madaniyah' && styles.typeTextMadaniyah]}>
                      {item.type}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.meaningText, isDarkMode && { color: '#94a3b8' }]}>
                  {item.arti} • {item.ayahCount} Ayat
                </Text>
              </View>

              {/* Arabic calligraphy */}
              <Text style={[styles.arabicName, isDarkMode && { color: '#34d399' }]}>{item.arabic}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        /* Bookmarks List Tab */
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {bookmarks.length === 0 ? (
            <View style={styles.emptyBookmarksBox}>
              <Ionicons name="bookmark-outline" size={48} color={isDarkMode ? '#475569' : '#cbd5e1'} />
              <Text style={[styles.emptyBookmarksTitle, isDarkMode && { color: '#f8fafc' }]}>
                Belum Ada Ayat yang Ditandai
              </Text>
              <Text style={[styles.emptyBookmarksDesc, isDarkMode && { color: '#94a3b8' }]}>
                Saat membaca surat, tekan ikon penanda (bookmark) pada ayat untuk menyimpannya di sini agar mudah dibuka kembali kapan saja.
              </Text>
            </View>
          ) : (
            bookmarks.map((b) => (
              <View key={b.id} style={[styles.bookmarkCard, isDarkMode && styles.bookmarkCardDark]}>
                <View style={styles.bookmarkHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="bookmark" size={14} color="#fe932c" />
                    <Text style={[styles.bookmarkSurahTitle, isDarkMode && { color: '#f8fafc' }]}>
                      QS. {b.surahLatin} Ayat {b.ayahNumber}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={async () => {
                      await toggleBookmark(b);
                      const bms = await getBookmarks();
                      setBookmarks(bms);
                    }}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.bookmarkArabic, isDarkMode && { color: '#f8fafc' }]}>{b.teksArab}</Text>
                <Text style={[styles.bookmarkIndo, isDarkMode && { color: '#cbd5e1' }]}>"{b.teksIndonesia}"</Text>

                <TouchableOpacity
                  style={styles.openBookmarkBtn}
                  onPress={() => {
                    const surah = ALL_SURAHS.find((s) => s.number === b.surahNumber) || ALL_SURAHS[0];
                    handleOpenSurah(surah, b.ayahNumber);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="book-open-outline" size={14} color="#ffffff" />
                  <Text style={styles.openBookmarkBtnText}>Buka Surat & Baca Ayat</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Surah Reader Modal */}
      <Modal visible={!!selectedSurah} animationType="slide" onRequestClose={handleCloseModal}>
        <View style={[styles.readerModalContainer, isDarkMode && { backgroundColor: '#070c12' }]}>
          {/* Modal Top Bar */}
          <View style={[styles.readerTopBar, isDarkMode && { backgroundColor: '#0d1620', borderBottomColor: '#1e293b' }]}>
            <TouchableOpacity onPress={handleCloseModal} style={styles.closeBtn}>
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#34d399' : '#002721'} />
            </TouchableOpacity>

            <View style={{ alignItems: 'center', flex: 1, paddingHorizontal: 8 }}>
              <Text style={[styles.readerSurahName, isDarkMode && { color: '#f8fafc' }]}>{selectedSurah?.latin}</Text>
              <Text style={[styles.readerSurahSub, isDarkMode && { color: '#94a3b8' }]}>
                Surah ke-{selectedSurah?.number} • {selectedSurah?.arti} • {selectedSurah?.ayahCount} Ayat ({selectedSurah?.type})
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleToggleSurahAudio}
              style={[styles.audioPlayBtn, isPlayingAudio && styles.audioPlayBtnActive]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={isPlayingAudio ? 'pause' : 'play'}
                size={20}
                color="#ffffff"
              />
            </TouchableOpacity>
          </View>

          {/* Offline Actions Bar & Tajweed Controls */}
          <View style={[styles.offlineControlBar, isDarkMode && { backgroundColor: '#0d1620', borderBottomColor: '#1e293b' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.offlineTextPill}>
                <Ionicons name="checkmark-circle" size={12} color="#059669" />
                <Text style={styles.offlineTextLabel}>Offline</Text>
              </View>

              {/* Tajweed Toggle Pill */}
              <TouchableOpacity
                style={[
                  styles.tajweedPill,
                  isTajweedEnabled && styles.tajweedPillActive,
                  isDarkMode && { borderColor: '#1e293b' },
                ]}
                onPress={() => setIsTajweedEnabled((prev) => !prev)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="color-palette"
                  size={12}
                  color={isTajweedEnabled ? '#ffffff' : (isDarkMode ? '#94a3b8' : '#475569')}
                />
                <Text style={[styles.tajweedText, isTajweedEnabled && styles.tajweedTextActive]}>
                  {isTajweedEnabled ? 'Tajwid On' : 'Tajwid Off'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tajweedHelpBtn}
                onPress={() => setIsTajweedGuideVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="help-circle-outline" size={17} color={isDarkMode ? '#34d399' : Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Audio Surah Offline Status / Download */}
            {isAudioOffline ? (
              <View style={styles.audioOfflineGroup}>
                <View style={styles.audioOfflineBadge}>
                  <Ionicons name="cloud-done" size={12} color="#059669" />
                  <Text style={styles.audioOfflineText}>Audio Offline</Text>
                </View>
                <TouchableOpacity
                  onPress={handleDeleteSurahAudio}
                  style={styles.deleteAudioBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={13} color="#dc2626" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.downloadAudioBtn}
                onPress={handleDownloadSurahAudio}
                disabled={isDownloadingAudio}
                activeOpacity={0.8}
              >
                {isDownloadingAudio ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="cloud-download-outline" size={12} color="#ffffff" />
                    <Text style={styles.downloadAudioBtnText}>
                      Unduh Audio
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Reader Content */}
          {isLoadingDetail ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Memuat mushaf ayat Al-Qur'an...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.readerScroll}
              contentContainerStyle={styles.readerContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Bismillah Header (kecuali Surah ke-9 At-Taubah, dan Surah ke-1 Al-Fatihah ayat 1 sudah bismillah) */}
              {selectedSurah?.number !== 9 && selectedSurah?.number !== 1 && (
                <View style={styles.bismillahBox}>
                  <Text style={styles.bismillahArabic}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
                  <Text style={styles.bismillahLatin}>Bismillāhir-raḥmānir-raḥīm</Text>
                  <Text style={styles.bismillahTrans}>Dengan nama Allah Yang Maha Pengasih, Maha Penyayang</Text>
                </View>
              )}

              {/* Ayah Cards */}
              {surahDetail?.ayat?.map((ayah) => {
                const isThisAyahPlaying = playingAyahNumber === ayah.nomorAyat;
                const isBookmarked = bookmarks.some(
                  (b) => b.surahNumber === selectedSurah?.number && b.ayahNumber === ayah.nomorAyat
                );
                const isLastReadAyah =
                  lastRead?.surahNumber === selectedSurah?.number && lastRead?.ayahNumber === ayah.nomorAyat;

                return (
                  <View
                    key={ayah.nomorAyat}
                    style={[
                      styles.ayahCard,
                      isDarkMode && { backgroundColor: '#131e2c', borderColor: '#223447' },
                      isThisAyahPlaying && styles.ayahCardPlaying,
                      isLastReadAyah && styles.ayahCardLastRead,
                    ]}
                  >
                    {/* Ayah Header */}
                    <View style={styles.ayahHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.ayahNumberBadge, isDarkMode && { backgroundColor: '#1e293b' }]}>
                          <Text style={[styles.ayahNumberText, isDarkMode && { color: '#34d399' }]}>
                            {ayah.nomorAyat}
                          </Text>
                        </View>
                        {isLastReadAyah && (
                          <View style={styles.lastReadMarkerBadge}>
                            <Ionicons name="bookmark" size={10} color="#059669" />
                            <Text style={styles.lastReadMarkerText}>Terakhir Dibaca</Text>
                          </View>
                        )}
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {/* Tafsir Button */}
                        <TouchableOpacity
                          onPress={() => handleOpenTafsir(ayah)}
                          style={[styles.ayahTafsirBtn, isDarkMode && styles.ayahTafsirBtnDark]}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="book-outline" size={12} color={isDarkMode ? '#34d399' : Colors.primary} />
                          <Text style={[styles.ayahTafsirText, isDarkMode && { color: '#34d399' }]}>Tafsir</Text>
                        </TouchableOpacity>

                        {/* Bookmark Button */}
                        <TouchableOpacity
                          onPress={() => handleToggleAyahBookmark(ayah)}
                          style={styles.ayahActionBtn}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                            size={18}
                            color={isBookmarked ? '#fe932c' : (isDarkMode ? '#94a3b8' : '#6f7975')}
                          />
                        </TouchableOpacity>

                        {/* Set As Last Read Button */}
                        <TouchableOpacity
                          onPress={() => handleSetLastRead(ayah)}
                          style={styles.ayahActionBtn}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={isLastReadAyah ? 'time' : 'time-outline'}
                            size={18}
                            color={isLastReadAyah ? '#059669' : (isDarkMode ? '#94a3b8' : '#6f7975')}
                          />
                        </TouchableOpacity>

                        {/* Download / Offline Ayah Audio Button */}
                        <TouchableOpacity
                          onPress={() => handleToggleDownloadAyah(ayah)}
                          style={styles.ayahDownloadBtn}
                          activeOpacity={0.7}
                          disabled={downloadingAyahNum === ayah.nomorAyat}
                        >
                          {downloadingAyahNum === ayah.nomorAyat ? (
                            <ActivityIndicator size="small" color="#059669" />
                          ) : (
                            <Ionicons
                              name={downloadedAyat[ayah.nomorAyat] ? 'checkmark-circle' : 'cloud-download-outline'}
                              size={18}
                              color={downloadedAyat[ayah.nomorAyat] ? '#059669' : (isDarkMode ? '#64748b' : '#9ca3af')}
                            />
                          )}
                        </TouchableOpacity>

                        {/* Play Ayah Audio */}
                        <TouchableOpacity
                          onPress={() => handlePlayAyahAudio(ayah)}
                          style={[styles.ayahActionBtn, isThisAyahPlaying && styles.ayahActionBtnActive]}
                          activeOpacity={0.8}
                        >
                          <MaterialCommunityIcons
                            name={isThisAyahPlaying ? 'stop-circle' : 'play-circle-outline'}
                            size={20}
                            color={isThisAyahPlaying ? '#dc2626' : (isDarkMode ? '#34d399' : Colors.primary)}
                          />
                        </TouchableOpacity>

                        {/* Share Ayah */}
                        <TouchableOpacity
                          onPress={() => handleShareAyah(ayah)}
                          style={styles.ayahActionBtn}
                          activeOpacity={0.8}
                        >
                          <MaterialCommunityIcons
                            name="share-variant-outline"
                            size={18}
                            color={isDarkMode ? '#94a3b8' : '#6f7975'}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Arabic text with Color-Coded Tajweed */}
                    {renderTajweedArabic(
                      ayah.teksArab,
                      [styles.ayahArabic, isDarkMode && { color: '#f8fafc' }],
                      isTajweedEnabled
                    )}

                    {/* Tajweed Rules Summary Pills */}
                    {isTajweedEnabled && getAyahTajweedRules(ayah.teksArab).length > 0 && (
                      <View style={styles.tajweedPillsContainer}>
                        {getAyahTajweedRules(ayah.teksArab).map((rule, rIdx) => (
                          <View
                            key={`rule_${rIdx}`}
                            style={[
                              styles.tajweedPill,
                              {
                                borderColor: rule.color + '45',
                                backgroundColor: isDarkMode ? rule.color + '18' : rule.color + '10',
                              },
                            ]}
                          >
                            <View style={[styles.tajweedPillDot, { backgroundColor: rule.color }]} />
                            <Text style={[styles.tajweedPillName, { color: rule.color }]}>
                              {rule.name}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Latin Transliteration */}
                    {!!ayah.teksLatin && (
                      <Text style={[styles.ayahLatin, isDarkMode && { color: '#34d399' }]}>{ayah.teksLatin}</Text>
                    )}

                    {/* Indonesian Translation */}
                    <Text style={[styles.ayahTrans, isDarkMode && { color: '#cbd5e1' }]}>{ayah.teksIndonesia}</Text>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Modal Tafsir Kemenag RI */}
      <Modal
        visible={isTafsirModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsTafsirModalVisible(false)}
      >
        <View style={styles.tafsirModalBackdrop}>
          <View style={[styles.tafsirModalCard, isDarkMode && styles.tafsirModalCardDark]}>
            <View style={styles.tafsirHeaderRow}>
              <View>
                <View style={styles.tafsirBadge}>
                  <Text style={styles.tafsirBadgeText}>TAFSIR KEMENAG RI</Text>
                </View>
                <Text style={[styles.tafsirSurahTitle, isDarkMode && { color: '#f8fafc' }]}>
                  QS. {selectedTafsirAyah?.surahLatin} Ayat {selectedTafsirAyah?.ayahNumber}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsTafsirModalVisible(false)}
                style={styles.tafsirCloseBtn}
              >
                <Ionicons name="close" size={20} color={isDarkMode ? '#94a3b8' : '#64748b'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.tafsirScroll} showsVerticalScrollIndicator={false}>
              {/* Teks Arab & Terjemahan Ringkas */}
              <View style={[styles.tafsirAyatBox, isDarkMode && styles.tafsirAyatBoxDark]}>
                <Text style={[styles.tafsirArabic, isDarkMode && { color: '#34d399' }]}>
                  {selectedTafsirAyah?.teksArab}
                </Text>
                <Text style={[styles.tafsirIndo, isDarkMode && { color: '#cbd5e1' }]}>
                  "{selectedTafsirAyah?.teksIndonesia}"
                </Text>
              </View>

              {/* Isi Tafsir Lengkap */}
              <View style={styles.tafsirBodyBox}>
                <Text style={[styles.tafsirBodyTitle, isDarkMode && { color: '#34d399' }]}>
                  Penjelasan & Tafsir Ayat
                </Text>

                {isLoadingTafsir ? (
                  <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
                      Mengambil tafsir lengkap dari Kemenag RI...
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.tafsirBodyText, isDarkMode && styles.tafsirBodyTextDark]}>
                    {selectedTafsirAyah?.tafsirTeks ||
                      'Tafsir untuk ayat ini sedang dipersiapkan atau dapat dibaca langsung dengan menyambungkan koneksi internet.'}
                  </Text>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Panduan Warna Tajwid */}
      <Modal
        visible={isTajweedGuideVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsTajweedGuideVisible(false)}
      >
        <View style={styles.tajweedModalBackdrop}>
          <View style={[styles.tajweedModalCard, isDarkMode && styles.tajweedModalCardDark]}>
            <View style={styles.tajweedHeaderRow}>
              <View>
                <Text style={[styles.tajweedModalTitle, isDarkMode && { color: '#f8fafc' }]}>
                  Panduan Warna Tajwid
                </Text>
                <Text style={[styles.tajweedModalSub, isDarkMode && { color: '#94a3b8' }]}>
                  Standar Pewarnaan Mushaf Tajwid Noor
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsTajweedGuideVisible(false)}
                style={styles.tafsirCloseBtn}
              >
                <Ionicons name="close" size={20} color={isDarkMode ? '#94a3b8' : '#64748b'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.tajweedList} showsVerticalScrollIndicator={false}>
              {TAJWEED_LEGEND.map((item, idx) => (
                <View key={idx} style={[styles.tajweedItem, isDarkMode && styles.tajweedItemDark]}>
                  <View style={[styles.tajweedColorDot, { backgroundColor: item.color }]} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[styles.tajweedItemName, { color: item.color }]}>{item.name}</Text>
                      <Text style={[styles.tajweedItemExample, isDarkMode && { color: '#34d399' }]}>
                        {item.example}
                      </Text>
                    </View>
                    <Text style={[styles.tajweedItemRule, isDarkMode && { color: '#94a3b8' }]}>{item.rule}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.tajweedCloseBtn}
              onPress={() => setIsTajweedGuideVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.tajweedCloseBtnText}>Tutup Panduan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faf9',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f3',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#002721',
    fontFamily: 'serif',
  },
  headerSub: {
    fontSize: 11,
    color: '#6f7975',
    marginTop: 2,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f3',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#191c1b',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 10,
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8e5',
    gap: 14,
  },
  numBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#00272110',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#002721',
  },
  latinName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#002721',
  },
  typeBadge: {
    backgroundColor: '#00272112',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  typeBadgeMadaniyah: {
    backgroundColor: '#fe932c20',
  },
  typeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#002721',
  },
  typeTextMadaniyah: {
    color: '#c27803',
  },
  meaningText: {
    fontSize: 11,
    color: '#6f7975',
    marginTop: 2,
  },
  arabicName: {
    fontSize: 20,
    color: '#002721',
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  readerModalContainer: {
    flex: 1,
    backgroundColor: '#f8faf9',
  },
  readerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f3',
  },
  closeBtn: {
    padding: 6,
  },
  readerSurahName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002721',
    fontFamily: 'serif',
  },
  readerSurahSub: {
    fontSize: 10.5,
    color: '#6f7975',
    marginTop: 1,
  },
  audioPlayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fe932c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPlayBtnActive: {
    backgroundColor: '#dc2626',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: '#6f7975',
  },
  readerScroll: {
    flex: 1,
  },
  readerContent: {
    padding: 16,
    paddingBottom: 60,
    gap: 14,
  },
  bismillahBox: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8e5',
  },
  bismillahArabic: {
    fontSize: 24,
    color: '#002721',
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 4,
  },
  bismillahLatin: {
    fontSize: 11,
    color: '#059669',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bismillahTrans: {
    fontSize: 11,
    color: '#6f7975',
    textAlign: 'center',
    marginTop: 2,
  },
  ayahCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8e5',
  },
  ayahCardPlaying: {
    borderColor: '#fe932c',
    backgroundColor: '#fffbeb',
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  ayahNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00272110',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahNumberText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#002721',
  },
  ayahActionBtn: {
    padding: 4,
  },
  ayahActionBtnActive: {},
  ayahArabic: {
    fontSize: 24,
    color: '#191c1b',
    textAlign: 'right',
    lineHeight: 42,
    fontFamily: 'serif',
    marginBottom: 12,
  },
  ayahLatin: {
    fontSize: 12.5,
    color: '#034138',
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: 6,
    lineHeight: 18,
  },
  ayahTrans: {
    fontSize: 12.5,
    color: '#374151',
    lineHeight: 19,
  },
  offlineControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f4',
  },
  offlineTextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
  },
  offlineTextLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065f46',
  },
  audioOfflineGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  audioOfflineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 12,
  },
  audioOfflineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
  },
  deleteAudioBtn: {
    backgroundColor: '#fee2e2',
    padding: 5,
    borderRadius: 10,
  },
  downloadAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 12,
  },
  downloadAudioBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  ayahDownloadBtn: {
    padding: 3,
  },
  // Last Read Banner Styles
  lastReadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  lastReadCardDark: {
    backgroundColor: '#064e3b30',
    borderColor: '#065f46',
  },
  lastReadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  lastReadIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastReadBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.8,
  },
  lastReadSurahName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#002721',
    marginTop: 1,
  },
  lastReadAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  lastReadActionText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#059669',
  },

  // Tab Switcher Styles
  quranTabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f3',
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
    marginTop: 2,
  },
  quranTabSwitcherDark: {
    backgroundColor: '#152232',
  },
  quranTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 9,
    gap: 6,
  },
  quranTabBtnActive: {
    backgroundColor: '#002721',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  quranTabBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#6f7975',
  },
  quranTabBtnTextActive: {
    color: '#ffffff',
  },

  // Bookmarks Tab Styles
  emptyBookmarksBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyBookmarksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#191c1b',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyBookmarksDesc: {
    fontSize: 12.5,
    color: '#6f7975',
    textAlign: 'center',
    lineHeight: 18,
  },
  bookmarkCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8e5',
  },
  bookmarkCardDark: {
    backgroundColor: '#131e2c',
    borderColor: '#223447',
  },
  bookmarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookmarkSurahTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#002721',
  },
  bookmarkArabic: {
    fontSize: 19,
    color: '#191c1b',
    textAlign: 'right',
    lineHeight: 34,
    fontFamily: 'serif',
    marginBottom: 8,
  },
  bookmarkIndo: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  openBookmarkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 7,
    borderRadius: 10,
  },
  openBookmarkBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Reader Ayah Extras (Last Read marker & Tafsir)
  ayahCardLastRead: {
    borderColor: '#059669',
    borderWidth: 1.5,
  },
  lastReadMarkerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lastReadMarkerText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  ayahTafsirBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f1f5f3',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  ayahTafsirBtnDark: {
    backgroundColor: '#1e293b',
  },
  ayahTafsirText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Tajweed Toolbar Pill
  tajweedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f3',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8e5',
  },
  tajweedPillActive: {
    backgroundColor: '#002721',
    borderColor: '#002721',
  },
  tajweedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  tajweedTextActive: {
    color: '#ffffff',
  },
  tajweedHelpBtn: {
    padding: 2,
  },

  // Tafsir Modal Styles
  tafsirModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  tafsirModalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxHeight: '82%',
  },
  tafsirModalCardDark: {
    backgroundColor: '#0d1620',
  },
  tafsirHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f3',
  },
  tafsirBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  tafsirBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  tafsirSurahTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002721',
  },
  tafsirCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f3',
  },
  tafsirScroll: {
    marginTop: 12,
  },
  tafsirAyatBox: {
    backgroundColor: '#f8faf9',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8e5',
  },
  tafsirAyatBoxDark: {
    backgroundColor: '#131e2c',
    borderColor: '#223447',
  },
  tafsirArabic: {
    fontSize: 20,
    color: '#002721',
    textAlign: 'right',
    lineHeight: 36,
    fontFamily: 'serif',
    marginBottom: 8,
  },
  tafsirIndo: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 19,
    fontStyle: 'italic',
  },
  tafsirBodyBox: {
    marginBottom: 20,
  },
  tafsirBodyTitle: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#002721',
    marginBottom: 8,
  },
  tafsirBodyText: {
    fontSize: 13,
    color: '#1f2937',
    lineHeight: 22,
    textAlign: 'justify',
  },
  tafsirBodyTextDark: {
    color: '#cbd5e1',
  },

  // Tajweed Guide Modal Styles
  tajweedModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tajweedModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  tajweedModalCardDark: {
    backgroundColor: '#0d1620',
  },
  tajweedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  tajweedModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002721',
  },
  tajweedModalSub: {
    fontSize: 11.5,
    color: '#6f7975',
    marginTop: 2,
  },
  tajweedList: {
    marginVertical: 4,
  },
  tajweedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f3',
  },
  tajweedItemDark: {
    borderBottomColor: '#1e293b',
  },
  tajweedColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 3,
  },
  tajweedItemName: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  tajweedItemRule: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  tajweedItemExample: {
    fontSize: 15,
    fontFamily: 'serif',
    color: '#002721',
  },
  tajweedCloseBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 14,
  },
  tajweedCloseBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tajweedPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  tajweedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  tajweedPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tajweedPillName: {
    fontSize: 11,
    fontWeight: '600',
  },
});
