import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import KeyboardSafeModalWrapper from './KeyboardSafeModalWrapper';
import KeyboardAwareScrollView from './KeyboardAwareScrollView';

const GOLD_PRICE_PER_GRAM = 1350000;
const NISAB_YEARLY = 85 * GOLD_PRICE_PER_GRAM; // Rp 114.750.000
const NISAB_MONTHLY = Math.round(NISAB_YEARLY / 12); // Rp 9.562.500
const FITRAH_PER_PERSON = 45000;

export default function ZakatModal({ visible, onClose, onProceedDonation }) {
  const [tab, setTab] = useState('penghasilan'); // 'penghasilan' | 'maal' | 'fitrah'
  const [monthlyIncome, setMonthlyIncome] = useState('12000000');
  const [monthlyBonus, setMonthlyBonus] = useState('0');
  const [savingsTotal, setSavingsTotal] = useState('150000000');
  const [debtTotal, setDebtTotal] = useState('0');
  const [familyCount, setFamilyCount] = useState(4);

  const formatRp = (num) => 'Rp ' + Math.max(0, Math.round(num || 0)).toLocaleString('id-ID');
  const cleanNum = (str) => Number(String(str || '').replace(/\D/g, '')) || 0;

  let totalAssets = 0;
  let isWajib = false;
  let zakatAmount = 0;

  if (tab === 'penghasilan') {
    totalAssets = cleanNum(monthlyIncome) + cleanNum(monthlyBonus);
    isWajib = totalAssets >= NISAB_MONTHLY;
    zakatAmount = isWajib ? Math.round(totalAssets * 0.025) : 0;
  } else if (tab === 'maal') {
    totalAssets = Math.max(0, cleanNum(savingsTotal) - cleanNum(debtTotal));
    isWajib = totalAssets >= NISAB_YEARLY;
    zakatAmount = isWajib ? Math.round(totalAssets * 0.025) : 0;
  } else {
    isWajib = true;
    zakatAmount = familyCount * FITRAH_PER_PERSON;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardSafeModalWrapper backdropColor="rgba(0,0,0,0.6)">
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="calculator-variant" size={22} color="#fe932c" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Kalkulator Zakat Syariah</Text>
                <Text style={styles.headerSub}>Standar Fatwa MUI No. 3/2003 & BAZNAS RI</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabRow}>
            {[
              { id: 'penghasilan', label: 'Penghasilan' },
              { id: 'maal', label: 'Zakat Maal' },
              { id: 'fitrah', label: 'Zakat Fitrah' },
            ].map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.tabBtn, tab === t.id && styles.tabBtnActive]}
                onPress={() => setTab(t.id)}
              >
                <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <KeyboardAwareScrollView
            style={styles.body}
            contentContainerStyle={{ paddingBottom: 28 }}
            showsVerticalScrollIndicator={false}
          >
            {tab === 'penghasilan' && (
              <View style={{ gap: 12 }}>
                <View style={styles.nisabBanner}>
                  <MaterialCommunityIcons name="information-outline" size={16} color="#92400e" />
                  <Text style={styles.nisabText}>
                    Nisab Zakat Penghasilan (setara 85gr emas/thn): {formatRp(NISAB_MONTHLY)} / bulan (Kadar 2,5%)
                  </Text>
                </View>

                <View>
                  <Text style={styles.label}>Penghasilan / Gaji Bulanan (Rp)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={monthlyIncome}
                    onChangeText={(v) => setMonthlyIncome(v.replace(/\D/g, ''))}
                    placeholder="Contoh: 12000000"
                  />
                </View>

                <View>
                  <Text style={styles.label}>Pendapatan Lain / Bonus Bulanan (Rp)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={monthlyBonus}
                    onChangeText={(v) => setMonthlyBonus(v.replace(/\D/g, ''))}
                    placeholder="0"
                  />
                </View>
              </View>
            )}

            {tab === 'maal' && (
              <View style={{ gap: 12 }}>
                <View style={styles.nisabBanner}>
                  <MaterialCommunityIcons name="information-outline" size={16} color="#92400e" />
                  <Text style={styles.nisabText}>
                    Nisab Zakat Maal (85 gram emas, haul 1 tahun): {formatRp(NISAB_YEARLY)} (Kadar 2,5%)
                  </Text>
                </View>

                <View>
                  <Text style={styles.label}>Total Tabungan, Deposito, Emas & Aset (Rp)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={savingsTotal}
                    onChangeText={(v) => setSavingsTotal(v.replace(/\D/g, ''))}
                    placeholder="Contoh: 150000000"
                  />
                </View>

                <View>
                  <Text style={styles.label}>Hutang Jatuh Tempo Tahun Ini (Rp)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={debtTotal}
                    onChangeText={(v) => setDebtTotal(v.replace(/\D/g, ''))}
                    placeholder="0"
                  />
                </View>
              </View>
            )}

            {tab === 'fitrah' && (
              <View style={{ gap: 14 }}>
                <View style={styles.nisabBanner}>
                  <MaterialCommunityIcons name="rice" size={16} color="#92400e" />
                  <Text style={styles.nisabText}>
                    Standar Zakat Fitrah BAZNAS Jabodetabek: 2,5 kg / 3,5 liter beras premium setara {formatRp(FITRAH_PER_PERSON)} per jiwa.
                  </Text>
                </View>

                <View style={styles.counterRow}>
                  <Text style={styles.label}>Jumlah Anggota Keluarga (Jiwa)</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => setFamilyCount(Math.max(1, familyCount - 1))}
                    >
                      <MaterialCommunityIcons name="minus" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primary }}>{familyCount}</Text>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => setFamilyCount(familyCount + 1)}
                    >
                      <MaterialCommunityIcons name="plus" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Result Card */}
            <View style={styles.resultCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 11, color: '#bbeddd', fontWeight: '700' }}>STATUS KEWAJIBAN ZAKAT</Text>
                <View style={{ backgroundColor: isWajib ? '#10b981' : '#f59e0b', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#ffffff' }}>
                    {isWajib ? 'WAJIB ZAKAT (MENCAPAI NISAB)' : 'BELUM MENCAPAI NISAB (DIANJURKAN INFAQ)'}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#fe932c', marginVertical: 4 }}>
                {formatRp(isWajib ? zakatAmount : 50000)}
              </Text>
              <Text style={{ fontSize: 11, color: '#d1fae5', lineHeight: 16 }}>
                {isWajib
                  ? 'Harta Anda telah memenuhi syarat nisab. Segera tunaikan agar harta bersih dan penuh keberkahan.'
                  : 'Belum mencapai nisab wajib zakat, namun Anda tetap dapat menunaikan Infaq & Sedekah terbaik.'}
              </Text>

              <TouchableOpacity
                style={styles.payBtn}
                onPress={() => {
                  onClose();
                  if (onProceedDonation) {
                    onProceedDonation(
                      { id: 3, title: 'Zakat Maal & Fitrah Pembersih Harta' },
                      isWajib ? Math.max(10000, zakatAmount) : 50000
                    );
                  }
                }}
              >
                <MaterialCommunityIcons name="hand-heart" size={18} color="#002721" />
                <Text style={styles.payBtnText}>
                  {isWajib ? 'Salurkan Zakat Sekarang' : 'Salurkan Sebagai Infaq'}
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
  sheet: { backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%', flexShrink: 1, overflow: 'hidden' },
  header: { backgroundColor: '#002721', paddingHorizontal: 18, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBox: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(254,147,44,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', fontFamily: 'serif' },
  headerSub: { color: '#a7f3d0', fontSize: 11, marginTop: 1 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  tabRow: { flexDirection: 'row', backgroundColor: '#f1f5f3', margin: 14, padding: 4, borderRadius: 14 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#002721' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  tabTextActive: { color: '#ffffff' },
  body: { paddingHorizontal: 16, paddingBottom: 24 },
  nisabBanner: { flexDirection: 'row', gap: 8, backgroundColor: '#fffbeb', borderColor: '#fde68a', borderWidth: 1, padding: 10, borderRadius: 12, alignItems: 'center' },
  nisabText: { flex: 1, fontSize: 11, color: '#92400e', lineHeight: 15 },
  label: { fontSize: 12, fontWeight: '700', color: '#002721', marginBottom: 6 },
  input: { backgroundColor: '#f8faf9', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 14, height: 44, fontSize: 14, fontWeight: 'bold', color: '#111827' },
  counterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8faf9', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  stepBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  resultCard: { backgroundColor: '#002721', borderRadius: 20, padding: 18, marginTop: 18, marginBottom: 28 },
  payBtn: { marginTop: 14, backgroundColor: '#fe932c', borderRadius: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  payBtnText: { fontSize: 13, fontWeight: 'bold', color: '#002721' },
});

