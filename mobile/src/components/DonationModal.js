import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { mobileApiClient } from '../services/apiClient';
import KeyboardSafeModalWrapper from './KeyboardSafeModalWrapper';
import KeyboardAwareScrollView from './KeyboardAwareScrollView';

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

const PAYMENT_METHODS = [
  {
    id: 'qris',
    name: 'QRIS Real-Time',
    sub: 'BSI, BCA, Mandiri, GoPay, OVO, Dana',
    icon: 'qrcode-scan',
    badge: 'Instan',
  },
  {
    id: 'bsi_va',
    name: 'BSI Virtual Account',
    sub: 'Bank Syariah Indonesia (BSI Mobile / ATM)',
    icon: 'bank',
    badge: 'Syariah',
  },
  {
    id: 'bca_va',
    name: 'BCA Virtual Account',
    sub: 'BCA Mobile, myBCA, KlikBCA & ATM',
    icon: 'credit-card-outline',
    badge: 'Otomatis',
  },
  {
    id: 'mandiri_va',
    name: 'Mandiri Virtual Account',
    sub: 'Livin by Mandiri & ATM Mandiri',
    icon: 'wallet-outline',
    badge: 'Otomatis',
  },
];

export default function DonationModal({
  visible,
  onClose,
  initialCampaign = null,
  initialAmount = null,
  initialTab = 'donate',
  userProfile = null,
}) {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [amount, setAmount] = useState(50000);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [prayerNotes, setPrayerNotes] = useState('');

  const [step, setStep] = useState('input'); // 'input' | 'payment' | 'success' | 'history'
  const [isLoading, setIsLoading] = useState(false);
  const [createdDonation, setCreatedDonation] = useState(null);
  const [vaNumber, setVaNumber] = useState(null);
  const [myDonations, setMyDonations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadHistory = () => {
    setLoadingHistory(true);
    mobileApiClient
      .getMyDonations(userProfile?.email || '', userProfile?.token || null)
      .then((res) => {
        setMyDonations(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(() => setMyDonations([]))
      .finally(() => setLoadingHistory(false));
  };

  useEffect(() => {
    if (visible) {
      mobileApiClient
        .getCampaigns()
        .then((res) => {
          if (res?.data && res.data.length > 0) {
            setCampaigns(res.data);
          }
        })
        .catch(() => {});

      if (initialAmount) {
        setAmount(initialAmount);
      }
      if (initialCampaign?.id) {
        setSelectedCampaignId(initialCampaign.id);
      }
      if (userProfile?.isLoggedIn && userProfile.name && userProfile.name !== 'Hamba Allah') {
        setDonorName(userProfile.name);
        setDonorEmail(userProfile.email || '');
      }
      if (initialTab === 'history') {
        setStep('history');
        loadHistory();
      } else {
        setStep('input');
      }
    }
  }, [visible, initialCampaign, initialAmount, initialTab, userProfile]);

  const formatRupiah = (num) => {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  };

  const handleSelectPreset = (amt) => {
    setAmount(amt);
    setCustomAmount('');
  };

  const handleCustomChange = (val) => {
    const raw = val.replace(/\D/g, '');
    const num = Number(raw) || 0;
    setCustomAmount(raw);
    setAmount(num);
  };

  const handleSubmit = async () => {
    if (amount < 10000) {
      Alert.alert('Perhatian', 'Minimal donasi amanah adalah Rp 10.000');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        campaign_id: selectedCampaignId || (campaigns[0]?.id ?? null),
        amount: Number(amount),
        donor_name: isAnonymous ? 'Hamba Allah' : (donorName.trim() || 'Hamba Allah'),
        donor_email: donorEmail.trim() || null,
        payment_method: paymentMethod,
        is_anonymous: isAnonymous,
        prayer_notes: prayerNotes.trim() || null,
      };

      const res = await mobileApiClient.createDonation(payload, userProfile?.token || null);
      if (res?.status === 'success') {
        setCreatedDonation(res.data.donation);
        setVaNumber(res.data.va_number);
        setStep('payment');
      } else {
        throw new Error(res?.message || 'Gagal memproses donasi.');
      }
    } catch (err) {
      Alert.alert('Gagal', err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPaid = () => {
    setStep('success');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardSafeModalWrapper backdropColor="rgba(0, 0, 0, 0.6)">
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBadge}>
                <MaterialCommunityIcons name="heart-pulse" size={22} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  {step === 'input' && 'Tunaikan Sedekah & Zakat'}
                  {step === 'payment' && 'Selesaikan Penyaluran'}
                  {step === 'success' && 'Alhamdulillah, E-Kwitansi'}
                  {step === 'history' && 'Riwayat Donasi Saya'}
                </Text>
                <Text style={styles.headerSub}>Amanah • Transparan • BWI & BAZNAS RI</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {(step === 'input' || step === 'history') && (
            <View style={{ flexDirection: 'row', backgroundColor: '#f1f5f3', marginHorizontal: 20, marginTop: 12, padding: 4, borderRadius: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center', backgroundColor: step === 'input' ? Colors.primary : 'transparent' }}
                onPress={() => setStep('input')}
              >
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: step === 'input' ? '#ffffff' : '#6b7280' }}>
                  Salurkan Donasi
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center', backgroundColor: step === 'history' ? Colors.primary : 'transparent' }}
                onPress={() => {
                  setStep('history');
                  loadHistory();
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: step === 'history' ? '#ffffff' : '#6b7280' }}>
                  Riwayat Saya
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <KeyboardAwareScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: 28 }}
            showsVerticalScrollIndicator={false}
          >
            {/* STEP 1: INPUT */}
            {step === 'input' && (
              <View style={styles.stepContainer}>
                {/* Campaign Selection */}
                <Text style={styles.sectionLabel}>PILIH PROGRAM PENYALURAN</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.campaignList}>
                  {campaigns.map((camp) => {
                    const isSelected =
                      selectedCampaignId === camp.id || (!selectedCampaignId && camp.id === campaigns[0]?.id);
                    return (
                      <TouchableOpacity
                        key={camp.id}
                        style={[styles.campaignCard, isSelected && styles.campaignCardActive]}
                        onPress={() => setSelectedCampaignId(camp.id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.campBadgeRow}>
                          <Text style={styles.campBadge}>{camp.category}</Text>
                          <Text style={styles.campPartner}>{camp.partner}</Text>
                        </View>
                        <Text style={styles.campTitle} numberOfLines={2}>
                          {camp.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Amount Presets */}
                <Text style={styles.sectionLabel}>PILIH NOMINAL (RP)</Text>
                <View style={styles.presetGrid}>
                  {PRESET_AMOUNTS.map((amt) => {
                    const isSelected = amount === amt && !customAmount;
                    return (
                      <TouchableOpacity
                        key={amt}
                        style={[styles.presetBtn, isSelected && styles.presetBtnActive]}
                        onPress={() => handleSelectPreset(amt)}
                      >
                        <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                          {formatRupiah(amt)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Custom Amount */}
                <View style={styles.customAmountBox}>
                  <Text style={styles.currencyPrefix}>Rp</Text>
                  <TextInput
                    style={styles.customInput}
                    placeholder="Nominal lainnya (Min. 10.000)"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    value={customAmount}
                    onChangeText={handleCustomChange}
                  />
                </View>

                {/* Donor Details Card */}
                <View style={styles.donorCard}>
                  <View style={styles.donorHeader}>
                    <Text style={styles.donorTitle}>Identitas Donatur / Muzakki</Text>
                    <TouchableOpacity
                      style={styles.anonToggle}
                      onPress={() => setIsAnonymous(!isAnonymous)}
                    >
                      <MaterialCommunityIcons
                        name={isAnonymous ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={18}
                        color={Colors.primary}
                      />
                      <Text style={styles.anonText}>Hamba Allah</Text>
                    </TouchableOpacity>
                  </View>

                  {!isAnonymous && (
                    <TextInput
                      style={styles.inputField}
                      placeholder="Nama Lengkap Anda"
                      placeholderTextColor="#9ca3af"
                      value={donorName}
                      onChangeText={setDonorName}
                    />
                  )}

                  <TextInput
                    style={styles.inputField}
                    placeholder="Tuliskan niat / doa tulus Anda (Opsional)..."
                    placeholderTextColor="#9ca3af"
                    value={prayerNotes}
                    onChangeText={setPrayerNotes}
                  />
                </View>

                {/* Payment Method */}
                <Text style={styles.sectionLabel}>METODE PEMBAYARAN SYARIAH</Text>
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <TouchableOpacity
                      key={method.id}
                      style={[styles.methodCard, isSelected && styles.methodCardActive]}
                      onPress={() => setPaymentMethod(method.id)}
                    >
                      <View style={styles.methodLeft}>
                        <View style={[styles.methodIcon, isSelected && styles.methodIconActive]}>
                          <MaterialCommunityIcons
                            name={method.icon}
                            size={20}
                            color={isSelected ? '#ffffff' : Colors.primary}
                          />
                        </View>
                        <View style={styles.methodInfo}>
                          <View style={styles.methodTitleRow}>
                            <Text style={styles.methodName}>{method.name}</Text>
                            <Text style={styles.methodBadge}>{method.badge}</Text>
                          </View>
                          <Text style={styles.methodSub}>{method.sub}</Text>
                        </View>
                      </View>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitBtn, (isLoading || amount < 10000) && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={isLoading || amount < 10000}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Text style={styles.submitBtnText}>Lanjutkan Penyaluran ({formatRupiah(amount)})</Text>
                      <MaterialCommunityIcons name="arrow-right" size={18} color="#ffffff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2: PAYMENT SCREEN */}
            {step === 'payment' && createdDonation && (
              <View style={styles.stepContainer}>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>TOTAL YANG HARUS DISALURKAN</Text>
                  <Text style={styles.summaryAmount}>{formatRupiah(createdDonation.amount)}</Text>
                  <Text style={styles.freeAdminText}>✨ Bebas Biaya Admin • 100% Tersalurkan</Text>
                </View>

                {createdDonation.payment_method === 'qris' ? (
                  <View style={styles.qrisBox}>
                    <Text style={styles.qrisTitle}>PINDAI QRIS STANDAR BANK INDONESIA</Text>
                    <Image
                      source={{
                        uri: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          '00020101021226670014ID.GO.KEMENAG.NOOR011893600998' +
                            createdDonation.id +
                            '520458125303360540' +
                            createdDonation.amount +
                            '5802ID5914NOOR AMANAH BWI6007JAKARTA6304'
                        )}`,
                      }}
                      style={styles.qrImage}
                    />
                    <Text style={styles.qrisSub}>
                      Mendukung semua m-Banking syariah & e-Wallet (BSI, BCA, GoPay, OVO, Dana).
                    </Text>
                  </View>
                ) : (
                  <View style={styles.vaBox}>
                    <Text style={styles.vaLabel}>
                      Nomor Virtual Account {createdDonation.payment_method.replace('_va', '').toUpperCase()}
                    </Text>
                    <View style={styles.vaRow}>
                      <Text style={styles.vaNumber}>{vaNumber || '992018829102931'}</Text>
                      <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={() => Alert.alert('Berhasil', 'Nomor Virtual Account telah disalin!')}
                      >
                        <Text style={styles.copyBtnText}>Salin</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmPaid}>
                  <MaterialCommunityIcons name="check-circle" size={18} color="#ffffff" />
                  <Text style={styles.confirmBtnText}>Saya Sudah Transfer / Scan QRIS</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backBtn} onPress={() => setStep('input')}>
                  <Text style={styles.backBtnText}>Ubah Nominal atau Metode</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 3: SUCCESS / E-RECEIPT */}
            {step === 'success' && createdDonation && (
              <View style={styles.stepContainer}>
                <View style={styles.successCard}>
                  <View style={styles.successIconCircle}>
                    <MaterialCommunityIcons name="check-bold" size={26} color="#059669" />
                  </View>
                  <Text style={styles.successTitle}>Infaq & Sedekah Berhasil Disalurkan!</Text>
                  <Text style={styles.successSub}>
                    Semoga menjadi amal jariyah yang terus mengalir dan pembersih harta Anda sekeluarga.
                  </Text>

                  {/* Doa Muzakki */}
                  <View style={styles.doaBox}>
                    <Text style={styles.doaLabel}>DOA MUSTAJAB PENERIMA ZAKAT:</Text>
                    <Text style={styles.doaArabic}>
                      "Ajārakallāhu fīmā a'thayta, wa bāraka fīmā abqayta, wa ja'alahu laka thahūrā."
                    </Text>
                    <Text style={styles.doaTranslation}>
                      Artinya: Semoga Allah memberikan ganjaran pahala atas apa yang telah engkau berikan, memberkahi apa yang masih engkau miliki, dan menjadikannya pembersih bagimu.
                    </Text>
                  </View>

                  {/* Receipt Details */}
                  <View style={styles.receiptDetails}>
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptKey}>No. Transaksi</Text>
                      <Text style={styles.receiptValMono}>{createdDonation.transaction_code}</Text>
                    </View>
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptKey}>Program</Text>
                      <Text style={styles.receiptVal}>{createdDonation.campaign?.title || 'Sedekah Terbuka'}</Text>
                    </View>
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptKey}>Donatur</Text>
                      <Text style={styles.receiptVal}>{createdDonation.donor_name}</Text>
                    </View>
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptKey}>Metode</Text>
                      <Text style={styles.receiptValMono}>{createdDonation.payment_method.toUpperCase()}</Text>
                    </View>
                    <View style={[styles.receiptRow, styles.receiptTotalRow]}>
                      <Text style={styles.receiptTotalKey}>Total Donasi</Text>
                      <Text style={styles.receiptTotalVal}>{formatRupiah(createdDonation.amount)}</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.finishBtn} onPress={onClose}>
                  <Text style={styles.finishBtnText}>Selesai & Tutup</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 4: RIWAYAT DONASI SAYA */}
            {step === 'history' && (
              <View style={styles.stepContainer}>
                {loadingHistory ? (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <ActivityIndicator color={Colors.primary} />
                    <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>Memuat riwayat donasi...</Text>
                  </View>
                ) : myDonations.length === 0 ? (
                  <View style={{ padding: 24, borderRadius: 18, backgroundColor: '#f8faf9', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' }}>
                    <MaterialCommunityIcons name="hand-heart-outline" size={34} color="#9ca3af" />
                    <Text style={{ fontSize: 13.5, fontWeight: 'bold', color: Colors.primary, marginTop: 8 }}>
                      Belum Ada Riwayat Transaksi
                    </Text>
                    <Text style={{ fontSize: 11.5, color: '#6b7280', textAlign: 'center', marginTop: 4 }}>
                      Setiap infaq, zakat, dan wakaf yang Anda tunaikan akan tercatat resmi di sini.
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: 10 }}>
                    {myDonations.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={{ padding: 14, borderRadius: 16, backgroundColor: '#f8faf9', borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                        onPress={() => {
                          setCreatedDonation(item);
                          setStep('success');
                        }}
                      >
                        <View style={{ flex: 1, paddingRight: 10 }}>
                          <Text style={{ fontSize: 10, fontFamily: 'monospace', color: '#6b7280', fontWeight: 'bold' }}>
                            {item.transaction_code}
                          </Text>
                          <Text style={{ fontSize: 13, fontWeight: 'bold', color: Colors.primary, marginVertical: 2 }} numberOfLines={1}>
                            {item.campaign?.title || 'Infaq & Sedekah Umum'}
                          </Text>
                          <Text style={{ fontSize: 11, color: '#059669', fontWeight: '600' }}>
                            ✓ Terverifikasi • {String(item.payment_method || '').toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: 13.5, fontWeight: 'bold', color: '#b45309' }}>
                            {formatRupiah(item.amount)}
                          </Text>
                          <Text style={{ fontSize: 10.5, color: Colors.primary, textDecorationLine: 'underline', marginTop: 2 }}>
                            Kwitansi
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </KeyboardAwareScrollView>
        </View>
      </KeyboardSafeModalWrapper>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    flexShrink: 1,
    overflow: 'hidden',
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f3',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerSub: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingVertical: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 10,
  },
  campaignList: {
    marginBottom: 6,
  },
  campaignCard: {
    width: 220,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#f8faf9',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 10,
  },
  campaignCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#f0fdf4',
  },
  campBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  campBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  campPartner: {
    fontSize: 10,
    color: '#6b7280',
  },
  campTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 16,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetBtn: {
    width: '31%',
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f8faf9',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f2937',
  },
  presetTextActive: {
    color: '#ffffff',
  },
  customAmountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#f8faf9',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9ca3af',
    marginRight: 8,
  },
  customInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  donorCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#f8faf9',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  donorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  donorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b5563',
  },
  anonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  anonText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  inputField: {
    height: 40,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#1f2937',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#f8faf9',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  methodCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#f0fdf4',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconActive: {
    backgroundColor: Colors.primary,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  methodName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  methodBadge: {
    fontSize: 9,
    fontWeight: '600',
    color: '#D97706',
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  methodSub: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  submitBtn: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  summaryBox: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fef3c7',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: 0.5,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 4,
  },
  freeAdminText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    marginTop: 4,
  },
  qrisBox: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f8faf9',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    marginBottom: 16,
  },
  qrisTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
  },
  qrImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  qrisSub: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 10,
  },
  vaBox: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f8faf9',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  vaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4b5563',
    marginBottom: 8,
  },
  vaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  vaNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1,
  },
  copyBtn: {
    backgroundColor: 'rgba(15, 56, 44, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  confirmBtn: {
    height: 48,
    backgroundColor: '#059669',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  backBtn: {
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  successCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#f8faf9',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 11,
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 4,
  },
  doaBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#0F382C',
    width: '100%',
  },
  doaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FCD34D',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  doaArabic: {
    fontSize: 12,
    color: '#ffffff',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  doaTranslation: {
    fontSize: 10,
    color: '#A7F3D0',
    marginTop: 4,
    lineHeight: 14,
  },
  receiptDetails: {
    width: '100%',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptKey: {
    fontSize: 11,
    color: '#6b7280',
  },
  receiptVal: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  receiptValMono: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  receiptTotalRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  receiptTotalKey: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  receiptTotalVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
  },
  finishBtn: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});

