import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { stopCurrentAudio, playAudioUrl } from '../utils/audioPlayerService';
import { getMuadzinAudioSource } from '../services/offlineStorageService';

export default function AdzanModal({
  visible,
  onClose,
  prayerName = 'Dzuhur',
  prayerTime = '11:40',
  cityName = 'Jakarta',
  selectedMuadzin = null,
  audioSource = null,
  isTest = false,
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showDoa, setShowDoa] = useState(true);

  // Animated Waveform & Ripple Values
  const wave1 = useRef(new Animated.Value(10)).current;
  const wave2 = useRef(new Animated.Value(24)).current;
  const wave3 = useRef(new Animated.Value(14)).current;
  const wave4 = useRef(new Animated.Value(32)).current;
  const wave5 = useRef(new Animated.Value(18)).current;
  const wave6 = useRef(new Animated.Value(26)).current;
  const wave7 = useRef(new Animated.Value(12)).current;

  const rippleScale = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0.7)).current;

  const muadzinName = selectedMuadzin?.name || 'Syaikh Ali Ahmed Mulla';
  const muadzinTitle = selectedMuadzin?.title || 'Muadzin Masjidil Haram Makkah';
  const muadzinAvatar =
    selectedMuadzin?.avatar ||
    'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=200&q=80';

  useEffect(() => {
    if (visible) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!isPlaying) {
      Animated.parallel([
        Animated.timing(wave1, { toValue: 6, duration: 250, useNativeDriver: false }),
        Animated.timing(wave2, { toValue: 6, duration: 250, useNativeDriver: false }),
        Animated.timing(wave3, { toValue: 6, duration: 250, useNativeDriver: false }),
        Animated.timing(wave4, { toValue: 6, duration: 250, useNativeDriver: false }),
        Animated.timing(wave5, { toValue: 6, duration: 250, useNativeDriver: false }),
        Animated.timing(wave6, { toValue: 6, duration: 250, useNativeDriver: false }),
        Animated.timing(wave7, { toValue: 6, duration: 250, useNativeDriver: false }),
      ]).start();
      return;
    }

    const createLoop = (anim, min, max, dur) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: max, duration: dur, useNativeDriver: false }),
          Animated.timing(anim, { toValue: min, duration: dur, useNativeDriver: false }),
        ])
      );
    };

    const l1 = createLoop(wave1, 8, 28, 480);
    const l2 = createLoop(wave2, 10, 38, 380);
    const l3 = createLoop(wave3, 8, 24, 540);
    const l4 = createLoop(wave4, 12, 44, 420);
    const l5 = createLoop(wave5, 10, 34, 460);
    const l6 = createLoop(wave6, 10, 40, 400);
    const l7 = createLoop(wave7, 8, 26, 520);

    const rippleLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(rippleScale, { toValue: 1.5, duration: 1500, useNativeDriver: true }),
          Animated.timing(rippleScale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(rippleOpacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
          Animated.timing(rippleOpacity, { toValue: 0.7, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );

    l1.start();
    l2.start();
    l3.start();
    l4.start();
    l5.start();
    l6.start();
    l7.start();
    rippleLoop.start();

    return () => {
      l1.stop();
      l2.stop();
      l3.stop();
      l4.stop();
      l5.stop();
      l6.stop();
      l7.stop();
      rippleLoop.stop();
    };
  }, [isPlaying]);

  const handleStopAudio = () => {
    stopCurrentAudio();
    setIsPlaying(false);
  };

  const handleReplayAudio = async () => {
    const src = audioSource || (await getMuadzinAudioSource(selectedMuadzin));
    playAudioUrl(src);
    setIsPlaying(true);
  };

  const handleClose = () => {
    stopCurrentAudio();
    setIsPlaying(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogCard}>
          {/* Header Block */}
          <View style={styles.headerBlock}>
            <View style={styles.topBarRow}>
              <View style={styles.statusBadge}>
                <View style={styles.pulsingDot} />
                <Text style={styles.statusBadgeText}>
                  {isTest ? 'UJI COBA SUARA ADZAN' : 'ADZAN BERKUMANDANG'}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.iconContainer}>
              <Animated.View
                style={[
                  styles.rippleRing,
                  {
                    transform: [{ scale: rippleScale }],
                    opacity: rippleOpacity,
                  },
                ]}
              />
              <View style={styles.iconRing}>
                <MaterialCommunityIcons name="volume-high" size={32} color="#fe932c" />
              </View>
            </View>

            <Text style={styles.prayerTitle}>Waktu Sholat {prayerName}</Text>
            <Text style={styles.prayerTimeSub}>
              Pukul {prayerTime} WIB • Wilayah {cityName} & Sekitarnya
            </Text>

            {/* Live Audio Equalizer Waveform */}
            <View style={styles.equalizerContainer}>
              <Animated.View style={[styles.eqBar, { height: wave1 }]} />
              <Animated.View style={[styles.eqBar, { height: wave2 }]} />
              <Animated.View style={[styles.eqBar, { height: wave3 }]} />
              <Animated.View style={[styles.eqBar, styles.eqBarCenter, { height: wave4 }]} />
              <Animated.View style={[styles.eqBar, { height: wave5 }]} />
              <Animated.View style={[styles.eqBar, { height: wave6 }]} />
              <Animated.View style={[styles.eqBar, { height: wave7 }]} />
            </View>

            {/* Muadzin Info */}
            <View style={styles.muadzinPill}>
              <Image source={{ uri: muadzinAvatar }} style={styles.muadzinThumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.muadzinName} numberOfLines={1}>
                  {muadzinName}
                </Text>
                <Text style={styles.muadzinTitle} numberOfLines={1}>
                  {muadzinTitle}
                </Text>
              </View>
              <TouchableOpacity
                onPress={isPlaying ? handleStopAudio : handleReplayAudio}
                style={[styles.audioCtrlBtn, isPlaying ? styles.audioCtrlBtnStop : styles.audioCtrlBtnPlay]}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={isPlaying ? 'pause' : 'play'}
                  size={18}
                  color="#ffffff"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Body: Doa Setelah Adzan */}
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.doaSection}>
              <View style={styles.doaHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="book-open-page-variant-outline" size={17} color={Colors.primary} />
                  <Text style={styles.doaHeaderTitle}>Doa Setelah Adzan</Text>
                </View>
                <TouchableOpacity onPress={() => setShowDoa(!showDoa)}>
                  <Text style={styles.toggleDoaText}>{showDoa ? 'Sembunyikan' : 'Tampilkan'}</Text>
                </TouchableOpacity>
              </View>

              {showDoa && (
                <View style={styles.doaContentBox}>
                  <Text style={styles.doaArabic}>
                    اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ
                  </Text>
                  <Text style={styles.doaLatin}>
                    Allāhumma rabba hażihid-da‘watit-tāmmah, waṣ-ṣalātil-qā’imah, āti Muḥammadanil-wasīlata wal-faḍīlah, wab‘aṡhu maqāmam maḥmūdanil-lażī wa‘adtah.
                  </Text>
                  <Text style={styles.doaTrans}>
                    "Ya Allah, Tuhan pemilik panggilan yang sempurna ini dan sholat yang senantiasa didirikan, berilah Nabi Muhammad wasilah dan keutamaan, serta tempatkanlah beliau pada kedudukan terpuji yang telah Engkau janjikan." (HR. Bukhari)
                  </Text>
                </View>
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.actionRow}>
              {isPlaying ? (
                <TouchableOpacity
                  style={[styles.mainBtn, styles.stopBtn]}
                  onPress={handleStopAudio}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name="volume-mute" size={18} color="#ffffff" />
                  <Text style={styles.mainBtnText}>Hentikan Suara Adzan</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.mainBtn, styles.playBtn]}
                  onPress={handleReplayAudio}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name="volume-high" size={18} color="#002721" />
                  <Text style={[styles.mainBtnText, { color: '#002721' }]}>Kumandangkan Lagi</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.closeActionBtn}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.closeActionText}>Tutup Dialog</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 20, 16, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  headerBlock: {
    backgroundColor: '#002721',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    alignItems: 'center',
  },
  topBarRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(254, 147, 44, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(254, 147, 44, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fe932c',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fe932c',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  rippleRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(254, 147, 44, 0.28)',
    borderWidth: 1.5,
    borderColor: 'rgba(254, 147, 44, 0.6)',
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(254, 147, 44, 0.16)',
    borderWidth: 2,
    borderColor: 'rgba(254, 147, 44, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  equalizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 48,
    marginTop: 8,
    marginBottom: -4,
  },
  eqBar: {
    width: 4,
    backgroundColor: '#34d399',
    borderRadius: 3,
  },
  eqBarCenter: {
    backgroundColor: '#fe932c',
    width: 5,
  },
  prayerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'serif',
  },
  prayerTimeSub: {
    fontSize: 12,
    color: '#bbeddd',
    marginTop: 4,
    textAlign: 'center',
  },
  muadzinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  muadzinThumb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#fe932c',
  },
  muadzinName: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  muadzinTitle: {
    fontSize: 10.5,
    color: '#a7f3d0',
  },
  audioCtrlBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioCtrlBtnStop: {
    backgroundColor: '#dc2626',
  },
  audioCtrlBtnPlay: {
    backgroundColor: '#059669',
  },
  bodyScroll: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 20,
  },
  doaSection: {
    backgroundColor: '#f8faf9',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8e5',
    padding: 14,
    marginBottom: 16,
  },
  doaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doaHeaderTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  toggleDoaText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  doaContentBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  doaArabic: {
    fontSize: 17,
    color: '#002721',
    lineHeight: 28,
    textAlign: 'right',
    fontFamily: 'serif',
  },
  doaLatin: {
    fontSize: 11.5,
    color: '#047857',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  doaTrans: {
    fontSize: 11,
    color: '#4b5563',
    lineHeight: 16,
  },
  actionRow: {
    gap: 10,
    paddingBottom: 16,
  },
  mainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  stopBtn: {
    backgroundColor: '#dc2626',
  },
  playBtn: {
    backgroundColor: '#fe932c',
  },
  mainBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeActionBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  closeActionText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#6b7280',
  },
});

