import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { ALL_SURAHS } from '../data/surahList';
import { SAMPLE_SURAH_DETAILS } from '../data/sampleSurahData';
import { playAudioUrl, stopCurrentAudio } from '../utils/audioPlayerService';

export default function QuranScreen({ selectedQori }) {
  const [search, setSearch] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [surahDetail, setSurahDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Filter surahs
  const filteredSurahs = useMemo(() => {
    if (!search.trim()) return ALL_SURAHS;
    const q = search.toLowerCase();
    return ALL_SURAHS.filter(
      (s) =>
        s.latin.toLowerCase().includes(q) ||
        s.arti.toLowerCase().includes(q) ||
        String(s.number) === q
    );
  }, [search]);

  // Open Surah Reader
  const handleOpenSurah = async (surah) => {
    setSelectedSurah(surah);
    setIsLoadingDetail(true);

    // Stop any existing sound
    stopCurrentAudio();
    setIsPlayingAudio(false);

    try {
      // Check offline sample first (like Al-Kahf, Al-Fatihah, etc.)
      if (SAMPLE_SURAH_DETAILS[surah.number]) {
        setSurahDetail(SAMPLE_SURAH_DETAILS[surah.number]);
        setIsLoadingDetail(false);
        return;
      }

      // Try fetching from public Quran API
      const res = await fetch(`https://equran.nos.wjv-1.neo.id/api/v2/surat/${surah.number}`);
      if (res.ok) {
        const json = await res.json();
        setSurahDetail(json.data || json);
      } else {
        // Fallback mockup ayahs
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
      }
    } catch (e) {
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
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleToggleAudio = () => {
    if (!selectedSurah) return;

    if (isPlayingAudio) {
      stopCurrentAudio();
      setIsPlayingAudio(false);
      return;
    }

    const paddedNum = String(selectedSurah.number).padStart(3, '0');
    const audioUrl = `${selectedQori?.surahServer || 'https://server8.mp3quran.net/afs/'}${paddedNum}.mp3`;
    playAudioUrl(audioUrl);
    setIsPlayingAudio(true);
  };

  const handleCloseModal = () => {
    stopCurrentAudio();
    setIsPlayingAudio(false);
    setSelectedSurah(null);
  };

  return (
    <View style={styles.container}>
      {/* Header Search */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Al-Qur'an Al-Karim</Text>
        <Text style={styles.headerSub}>114 Surah • Terjemahan & Audio Murottal</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#6f7975" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari Surah, arti, atau nomor..."
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
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={styles.readerSurahName}>{selectedSurah?.latin}</Text>
              <Text style={styles.readerSurahSub}>
                {selectedSurah?.arti} • {selectedSurah?.ayahCount} Ayat
              </Text>
            </View>
            <TouchableOpacity onPress={handleToggleAudio} style={styles.audioPlayBtn}>
              <MaterialCommunityIcons
                name={isPlayingAudio ? 'pause' : 'play'}
                size={22}
                color="#ffffff"
              />
            </TouchableOpacity>
          </View>

          {/* Reader Content */}
          {isLoadingDetail ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Memuat mushaf ayat...</Text>
            </View>
          ) : (
            <ScrollView style={styles.readerScroll} contentContainerStyle={styles.readerContent}>
              {/* Bismillah Header */}
              {selectedSurah?.number !== 9 && (
                <View style={styles.bismillahBox}>
                  <Text style={styles.bismillahArabic}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
                  <Text style={styles.bismillahLatin}>Dengan nama Allah Yang Maha Pengasih, Maha Penyayang</Text>
                </View>
              )}

              {/* Ayah Cards */}
              {surahDetail?.ayat?.map((ayah) => (
                <View key={ayah.nomorAyat} style={styles.ayahCard}>
                  {/* Ayah Number Header */}
                  <View style={styles.ayahHeader}>
                    <View style={styles.ayahNumberBadge}>
                      <Text style={styles.ayahNumberText}>{ayah.nomorAyat}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <MaterialCommunityIcons name="bookmark-outline" size={18} color="#6f7975" />
                      <MaterialCommunityIcons name="share-variant-outline" size={18} color="#6f7975" />
                    </View>
                  </View>

                  {/* Arabic text */}
                  <Text style={styles.ayahArabic}>{ayah.teksArab}</Text>

                  {/* Latin Transliteration */}
                  <Text style={styles.ayahLatin}>{ayah.teksLatin}</Text>

                  {/* Indonesian Translation */}
                  <Text style={styles.ayahTrans}>{ayah.teksIndonesia}</Text>
                </View>
              ))}
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
    fontSize: 10,
    color: '#6f7975',
  },
  audioPlayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fe932c',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8e5',
  },
  bismillahArabic: {
    fontSize: 24,
    color: '#002721',
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 6,
  },
  bismillahLatin: {
    fontSize: 11,
    color: '#6f7975',
    textAlign: 'center',
  },
  ayahCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8e5',
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
  ayahArabic: {
    fontSize: 22,
    color: '#191c1b',
    textAlign: 'right',
    lineHeight: 38,
    fontFamily: 'serif',
    marginBottom: 12,
  },
  ayahLatin: {
    fontSize: 12,
    color: '#034138',
    fontWeight: '600',
    marginBottom: 6,
  },
  ayahTrans: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 18,
  },
});

