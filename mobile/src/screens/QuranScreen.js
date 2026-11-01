import React, { useState, useMemo, useRef } from 'react';
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
} from '../services/offlineStorageService';

export default function QuranScreen({ selectedQori }) {
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
    Share.share({ message: shareText }).catch(() => {});
  };

  const handleCloseModal = () => {
    stopCurrentAudio();
    setIsPlayingAudio(false);
    setPlayingAyahNumber(null);
    setSelectedSurah(null);
    setSurahDetail(null);
  };

  return (
    <View style={styles.container}>
      {/* Header Search */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Al-Qur'an Al-Karim</Text>
        <Text style={styles.headerSub}>114 Surah • Terjemahan Kemenag RI & Audio Murottal</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#6f7975" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama Surah, arti, atau nomor (1-114)..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#6f7975" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Surah List */}
      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => String(item.number)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.surahItem}
            activeOpacity={0.8}
            onPress={() => handleOpenSurah(item)}
          >
            {/* Number badge */}
            <View style={styles.numBadge}>
              <Text style={styles.numText}>{item.number}</Text>
            </View>

            {/* Title & Info */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.latinName}>{item.latin}</Text>
                <View style={[styles.typeBadge, item.type === 'Madaniyah' && styles.typeBadgeMadaniyah]}>
                  <Text style={[styles.typeText, item.type === 'Madaniyah' && styles.typeTextMadaniyah]}>
                    {item.type}
                  </Text>
                </View>
              </View>
              <Text style={styles.meaningText}>
                {item.arti} • {item.ayahCount} Ayat
              </Text>
            </View>

            {/* Arabic calligraphy */}
            <Text style={styles.arabicName}>{item.arabic}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Surah Reader Modal */}
      <Modal visible={!!selectedSurah} animationType="slide" onRequestClose={handleCloseModal}>
        <View style={styles.readerModalContainer}>
          {/* Modal Top Bar */}
          <View style={styles.readerTopBar}>
            <TouchableOpacity onPress={handleCloseModal} style={styles.closeBtn}>
              <Ionicons name="arrow-back" size={24} color="#002721" />
            </TouchableOpacity>

            <View style={{ alignItems: 'center', flex: 1, paddingHorizontal: 8 }}>
              <Text style={styles.readerSurahName}>{selectedSurah?.latin}</Text>
              <Text style={styles.readerSurahSub}>
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

          {/* Offline Actions Bar */}
          <View style={styles.offlineControlBar}>
            <View style={styles.offlineTextPill}>
              <Ionicons name="checkmark-circle" size={13} color="#059669" />
              <Text style={styles.offlineTextLabel}>Teks Tersimpan Offline</Text>
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
                    <Ionicons name="cloud-download-outline" size={13} color="#ffffff" />
                    <Text style={styles.downloadAudioBtnText}>
                      Unduh Audio ({selectedQori?.name?.split(' ')?.[1] || 'Qori'})
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
                return (
                  <View key={ayah.nomorAyat} style={[styles.ayahCard, isThisAyahPlaying && styles.ayahCardPlaying]}>
                    {/* Ayah Number Header */}
                    <View style={styles.ayahHeader}>
                      <View style={styles.ayahNumberBadge}>
                        <Text style={styles.ayahNumberText}>{ayah.nomorAyat}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
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
                              color={downloadedAyat[ayah.nomorAyat] ? '#059669' : '#9ca3af'}
                            />
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handlePlayAyahAudio(ayah)}
                          style={[styles.ayahActionBtn, isThisAyahPlaying && styles.ayahActionBtnActive]}
                          activeOpacity={0.8}
                        >
                          <MaterialCommunityIcons
                            name={isThisAyahPlaying ? 'stop-circle' : 'play-circle-outline'}
                            size={20}
                            color={isThisAyahPlaying ? '#dc2626' : Colors.primary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleShareAyah(ayah)}
                          style={styles.ayahActionBtn}
                          activeOpacity={0.8}
                        >
                          <MaterialCommunityIcons name="share-variant-outline" size={18} color="#6f7975" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Arabic text */}
                    <Text style={styles.ayahArabic}>{ayah.teksArab}</Text>

                    {/* Latin Transliteration */}
                    {!!ayah.teksLatin && (
                      <Text style={styles.ayahLatin}>{ayah.teksLatin}</Text>
                    )}

                    {/* Indonesian Translation */}
                    <Text style={styles.ayahTrans}>{ayah.teksIndonesia}</Text>
                  </View>
                );
              })}
            </ScrollView>
          )}
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
});
