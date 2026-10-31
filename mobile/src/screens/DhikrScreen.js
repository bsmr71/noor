import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { DHIKR_COLLECTIONS, DOA_CATEGORIES } from '../data/dhikrData';

export default function DhikrScreen() {
  const [activeTab, setActiveTab] = useState('tasbih'); // 'tasbih' | 'doa'
  const [selectedCollectionIdx, setSelectedCollectionIdx] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [isHapticEnabled, setIsHapticEnabled] = useState(true);
  const [expandedDoaCat, setExpandedDoaCat] = useState(DOA_CATEGORIES[0]?.id || 'sholat_lengkap');

  const collection = DHIKR_COLLECTIONS[selectedCollectionIdx] || DHIKR_COLLECTIONS[0];
  const currentItem = collection.items[currentStepIndex] || collection.items[0];
  const target = currentItem.target || 33;
  const progressPercent = Math.min(Math.round((count / target) * 100), 100);

  const handleSelectCollection = (idx) => {
    setSelectedCollectionIdx(idx);
    setCurrentStepIndex(0);
    setCount(0);
  };

  const handleTap = () => {
    const nextCount = count + 1;
    if (isHapticEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }

    if (nextCount >= target) {
      if (isHapticEnabled) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {}
      }
      setCount(target);
      if (currentStepIndex < collection.items.length - 1) {
        setTimeout(() => {
          setCurrentStepIndex((prev) => prev + 1);
          setCount(0);
        }, 450);
      }
    } else {
      setCount(nextCount);
    }
  };

  const handleReset = () => {
    setCount(0);
    if (isHapticEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setCount(0);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < collection.items.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setCount(0);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dzikir, Tasbih & Doa Harian</Text>
        <Text style={styles.headerSub}>
          Wirid Ba'da Sholat, Al-Ma'tsurat Pagi & Petang Sesuai Sunnah
        </Text>
      </View>

      {/* Main Segmented Switcher: Tasbih Digital vs Kumpulan Doa */}
      <View style={styles.mainSwitch}>
        <TouchableOpacity
          style={[styles.switchBtn, activeTab === 'tasbih' && styles.switchBtnActive]}
          onPress={() => setActiveTab('tasbih')}
        >
          <MaterialCommunityIcons
            name="all-inclusive"
            size={16}
            color={activeTab === 'tasbih' ? '#ffffff' : Colors.primary}
          />
          <Text style={[styles.switchText, activeTab === 'tasbih' && styles.switchTextActive]}>
            Tasbih Terpandu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchBtn, activeTab === 'doa' && styles.switchBtnActive]}
          onPress={() => setActiveTab('doa')}
        >
          <MaterialCommunityIcons
            name="hands-pray"
            size={16}
            color={activeTab === 'doa' ? '#ffffff' : Colors.primary}
          />
          <Text style={[styles.switchText, activeTab === 'doa' && styles.switchTextActive]}>
            Katalog Wirid & Doa
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'tasbih' ? (
        <>
          {/* Horizontal Sequence Picker (Lengkap, Ringkas, Pagi, Petang) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 14 }}
          >
            {DHIKR_COLLECTIONS.map((col, idx) => {
              const active = idx === selectedCollectionIdx;
              return (
                <TouchableOpacity
                  key={col.id}
                  style={[styles.seqChip, active && styles.seqChipActive]}
                  onPress={() => handleSelectCollection(idx)}
                >
                  <Text style={[styles.seqChipText, active && styles.seqChipTextActive]}>
                    {col.shortTitle || col.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Dhikr Card */}
          <View style={styles.card}>
            <View style={styles.cardTopBar}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {currentStepIndex + 1}/{collection.items.length} • {currentItem.category}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={handlePrevStep} disabled={currentStepIndex === 0}>
                  <Ionicons
                    name="chevron-back"
                    size={22}
                    color={currentStepIndex === 0 ? '#d1d5db' : Colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNextStep}
                  disabled={currentStepIndex === collection.items.length - 1}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color={
                      currentStepIndex === collection.items.length - 1 ? '#d1d5db' : Colors.primary
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.arabicText}>{currentItem.arabic}</Text>
            <Text style={styles.latinText}>{currentItem.latin}</Text>
            <Text style={styles.transText}>"{currentItem.translation}"</Text>

            {currentItem.source && (
              <View style={styles.sourcePill}>
                <MaterialCommunityIcons name="shield-check" size={12} color="#c27803" />
                <Text style={styles.sourcePillText}>{currentItem.source}</Text>
              </View>
            )}
          </View>

          {/* Big Counter Button */}
          <View style={styles.counterSection}>
            <TouchableOpacity
              style={styles.counterCircleOuter}
              activeOpacity={0.85}
              onPress={handleTap}
            >
              <View style={styles.counterCircleInner}>
                <Text style={styles.counterStepLabel}>
                  LANGKAH {currentStepIndex + 1}/{collection.items.length}
                </Text>
                <Text style={styles.counterNumber}>{count}</Text>
                <View style={styles.tapPrompt}>
                  <MaterialCommunityIcons name="gesture-tap" size={14} color="#6f7975" />
                  <Text style={styles.tapPromptText}>Ketuk di Sini</Text>
                </View>
                <Text style={styles.counterProgressText}>
                  Target: {target}x ({progressPercent}%)
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[styles.controlPill, isHapticEnabled && styles.controlPillActive]}
                onPress={() => setIsHapticEnabled(!isHapticEnabled)}
              >
                <MaterialCommunityIcons
                  name={isHapticEnabled ? 'vibrate' : 'vibrate-off'}
                  size={18}
                  color={isHapticEnabled ? '#ffffff' : '#6f7975'}
                />
                <Text
                  style={[styles.controlPillText, isHapticEnabled && styles.controlPillTextActive]}
                >
                  {isHapticEnabled ? 'Vibrasi: Aktif' : 'Vibrasi: Mati'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlPill} onPress={handleReset}>
                <MaterialCommunityIcons name="restart" size={18} color={Colors.primary} />
                <Text style={[styles.controlPillText, { color: Colors.primary }]}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        /* Kumpulan Doa & Wirid Lengkap View */
        <View style={{ gap: 12 }}>
          {DOA_CATEGORIES.map((cat) => {
            const isOpen = expandedDoaCat === cat.id;
            return (
              <View key={cat.id} style={styles.doaCatCard}>
                <TouchableOpacity
                  style={styles.doaCatHeader}
                  onPress={() => setExpandedDoaCat(isOpen ? null : cat.id)}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.doaCatTitle}>{cat.title}</Text>
                      <View style={styles.doaTagBadge}>
                        <Text style={styles.doaTagText}>{cat.tag}</Text>
                      </View>
                    </View>
                    <Text style={styles.doaCatSub}>{cat.subtitle}</Text>
                  </View>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={Colors.primary}
                  />
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.doaItemsList}>
                    {cat.items.map((doa, i) => (
                      <View key={i} style={styles.doaItemBox}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text style={styles.doaItemTitle}>{doa.title}</Text>
                          <Text style={styles.doaRepeatBadge}>Dibaca {doa.repeat}</Text>
                        </View>
                        <Text style={styles.doaArabic}>{doa.arabic}</Text>
                        <Text style={styles.doaLatin}>{doa.latin}</Text>
                        <Text style={styles.doaMeaning}>"{doa.translation}"</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faf9' },
  content: { padding: 16, paddingBottom: 100 },
  header: { marginBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#002721', fontFamily: 'serif' },
  headerSub: { fontSize: 11.5, color: '#6f7975', marginTop: 2 },
  mainSwitch: { flexDirection: 'row', backgroundColor: '#e9efec', borderRadius: 14, padding: 4, marginBottom: 14 },
  switchBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 10 },
  switchBtnActive: { backgroundColor: '#002721' },
  switchText: { fontSize: 12, fontWeight: '700', color: '#002721' },
  switchTextActive: { color: '#ffffff' },
  seqChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d1d5db' },
  seqChipActive: { backgroundColor: '#fe932c', borderColor: '#fe932c' },
  seqChipText: { fontSize: 11.5, fontWeight: '700', color: '#002721' },
  seqChipTextActive: { color: '#002721' },
  card: { backgroundColor: '#ffffff', borderRadius: 22, padding: 20, borderWidth: 1, borderColor: '#e2e8e5', alignItems: 'center', marginBottom: 20 },
  cardTopBar: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 16 },
  categoryBadge: { backgroundColor: '#00272112', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, maxWidth: '75%' },
  categoryText: { fontSize: 10.5, fontWeight: '700', color: '#002721' },
  arabicText: { fontSize: 24, color: '#191c1b', textAlign: 'center', lineHeight: 42, fontFamily: 'serif', marginBottom: 14 },
  latinText: { fontSize: 13, fontWeight: '700', color: '#d97706', textAlign: 'center', marginBottom: 8 },
  transText: { fontSize: 12, color: '#4b5563', textAlign: 'center', lineHeight: 18, marginBottom: 12 },
  sourcePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fe932c15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 4 },
  sourcePillText: { fontSize: 10, fontWeight: '700', color: '#c27803' },
  counterSection: { alignItems: 'center' },
  counterCircleOuter: { width: 215, height: 215, borderRadius: 110, borderWidth: 4, borderColor: '#fe932c', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', elevation: 6 },
  counterCircleInner: { alignItems: 'center' },
  counterStepLabel: { fontSize: 10, fontWeight: '800', color: '#6f7975', letterSpacing: 0.5 },
  counterNumber: { fontSize: 62, fontWeight: 'bold', color: '#002721', lineHeight: 72 },
  tapPrompt: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tapPromptText: { fontSize: 11, color: '#6f7975', fontWeight: '600' },
  counterProgressText: { fontSize: 10, color: '#d97706', fontWeight: '700', marginTop: 4 },
  controlsRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  controlPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8e5', gap: 6 },
  controlPillActive: { backgroundColor: '#002721', borderColor: '#002721' },
  controlPillText: { fontSize: 11, fontWeight: '700', color: '#6f7975' },
  controlPillTextActive: { color: '#ffffff' },
  doaCatCard: { backgroundColor: '#ffffff', borderRadius: 18, borderWidth: 1, borderColor: '#e2e8e5', overflow: 'hidden' },
  doaCatHeader: { padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff' },
  doaCatTitle: { fontSize: 14, fontWeight: 'bold', color: '#002721' },
  doaCatSub: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  doaTagBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  doaTagText: { fontSize: 9.5, fontWeight: 'bold', color: '#92400e' },
  doaItemsList: { borderTopWidth: 1, borderTopColor: '#f1f5f3', padding: 12, gap: 10, backgroundColor: '#f8faf9' },
  doaItemBox: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  doaItemTitle: { fontSize: 12.5, fontWeight: 'bold', color: '#002721', flex: 1 },
  doaRepeatBadge: { fontSize: 10, fontWeight: 'bold', color: '#b45309', backgroundColor: '#fffbeb', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  doaArabic: { fontSize: 20, color: '#111827', textAlign: 'right', lineHeight: 36, fontFamily: 'serif', marginVertical: 8 },
  doaLatin: { fontSize: 11.5, color: '#b45309', fontWeight: '600', marginBottom: 4 },
  doaMeaning: { fontSize: 11.5, color: '#4b5563', lineHeight: 17 },
});
