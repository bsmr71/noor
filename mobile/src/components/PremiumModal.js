import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { mobileApiClient } from '../services/apiClient';

const DEFAULT_PLANS = [
  {
    key: 'monthly',
    name: 'Noor+ Bulanan',
    price: 15000,
    duration_days: 30,
    badge: 'Fleksibel',
    subtitle: 'Bebas iklan sponsor di Beranda selama 30 hari penuh.',
  },
  {
    key: 'yearly',
    name: 'Noor+ Tahunan',
    price: 99000,
    duration_days: 365,
    badge: 'Hemat 45%',
    subtitle: 'Bebas iklan 1 tahun penuh (setara Rp 8.250 / bulan).',
  },
  {
    key: 'lifetime',
    name: 'Noor+ Selamanya',
    price: 199000,
    duration_days: null,
    badge: 'Paling Favorit',
    subtitle: 'Sekali bayar untuk selamanya tanpa biaya perpanjangan.',
  },
];

const PAYMENT_METHODS = [
  { id: 'QRIS', label: 'QRIS Syariah Instan', sub: 'GoPay, OVO, Dana, BSI Mobile, Livin', icon: 'qrcode-scan' },
  { id: 'BSI_VA', label: 'BSI Virtual Account', sub: 'Bank Syariah Indonesia Otomatis', icon: 'bank-outline' },
  { id: 'MUAMALAT_VA', label: 'Bank Muamalat VA', sub: 'Verifikasi Instan 24 Jam', icon: 'shield-check-outline' },
];

const formatRupiah = (num) =>
  'Rp ' + Number(num || 0).toLocaleString('id-ID');

export default function PremiumModal({
  visible,
  onClose,
  userProfile,
  onUpgradeSuccess,
}) {
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' | 'status'
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [wakafPercent, setWakafPercent] = useState(20);
  const [selectedPlanKey, setSelectedPlanKey] = useState('lifetime');
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [checkoutStep, setCheckoutStep] = useState('select'); // 'select' | 'pay' | 'receipt'
  const [loading, setLoading] = useState(false);
  const [latestInvoice, setLatestInvoice] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setCheckoutStep('select');
    if (userProfile?.is_premium) {
      setActiveTab('status');
    } else {
      setActiveTab('plans');
    }

    mobileApiClient
      .getPremiumPlans()
      .then((res) => {
        if (res?.plans?.length) setPlans(res.plans);
        if (typeof res?.wakaf_percent === 'number') setWakafPercent(res.wakaf_percent);
      })
      .catch(() => {});

    if (userProfile?.token) {
      loadHistory(userProfile.token);
    }
  }, [visible, userProfile?.token]);

  const loadHistory = async (token) => {
    setLoadingHistory(true);
    try {
      const res = await mobileApiClient.getMyPremiumStatus(token);
      if (Array.isArray(res?.subscriptions)) {
        setHistoryList(res.subscriptions);
      }
      if (res?.user && onUpgradeSuccess) {
        onUpgradeSuccess(res.user);
      }
    } catch (e) {
      // silent fallback
    } finally {
      setLoadingHistory(false);
    }
  };

  const selectedPlan =
    plans.find((p) => p.key === selectedPlanKey) || plans[plans.length - 1] || DEFAULT_PLANS[2];

  const handleConfirmPayment = async () => {
    if (!userProfile?.token) {
      Alert.alert(
        'Masuk Akun Diperlukan',
        'Silakan masuk dengan akun terdaftar terlebih dahulu agar status Bebas Iklan tersimpan permanen di akun Anda.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await mobileApiClient.subscribePremium(
        selectedPlan.key,
        paymentMethod,
        userProfile.token
      );
      if (res?.status === 'success') {
        setLatestInvoice(res.subscription);
        if (res.user && onUpgradeSuccess) {
          onUpgradeSuccess(res.user);
        }
        setCheckoutStep('receipt');
        loadHistory(userProfile.token);
      }
    } catch (err) {
      Alert.alert('Gagal Memproses', err?.message || 'Tidak dapat mengaktifkan paket saat ini.');
    } finally {
      setLoading(false);
    }
  };

  const formatExpiry = (iso) => {
    if (!iso) return 'Aktif Selamanya (Lifetime)';
    try {
      return 'Aktif s/d ' + new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Aktif';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Luxury Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View style={styles.crownCircle}>
                <MaterialCommunityIcons name="crown" size={22} color="#fe932c" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Noor+ Bebas Iklan</Text>
                <Text style={styles.headerSub}>Beranda lebih tenang & khusyuk tanpa banner sponsor</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Top Switcher Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'plans' && styles.tabItemActive]}
              onPress={() => {
                setActiveTab('plans');
                setCheckoutStep('select');
              }}
            >
              <MaterialCommunityIcons
                name="shield-star-outline"
                size={16}
                color={activeTab === 'plans' ? Colors.primary : '#6f7975'}
              />
              <Text style={[styles.tabText, activeTab === 'plans' && styles.tabTextActive]}>
                Paket Hapus Iklan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'status' && styles.tabItemActive]}
              onPress={() => setActiveTab('status')}
            >
              <MaterialCommunityIcons
                name="receipt-text-check-outline"
                size={16}
                color={activeTab === 'status' ? Colors.primary : '#6f7975'}
              />
              <Text style={[styles.tabText, activeTab === 'status' && styles.tabTextActive]}>
                Status & Invoice
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {activeTab === 'plans' && checkoutStep === 'select' && (
              <>
                {/* Ethical Syariah Commitment Box */}
                <View style={styles.ethicsNote}>
                  <MaterialCommunityIcons name="mosque" size={20} color={Colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ethicsNoteTitle}>Ibadah Pokok 100% Gratis Selamanya</Text>
                    <Text style={styles.ethicsNoteDesc}>
                      Al-Qur'an 30 Juz, Jadwal Sholat, Adzan, Kiblat & Dzikir tidak pernah dikunci. Paket Noor+ murni untuk menyembunyikan iklan sponsor komersial ({wakafPercent}% disalurkan ke Wakaf Mushaf).
                    </Text>
                  </View>
                </View>

                {/* Active Notice if already Premium */}
                {userProfile?.is_premium && (
                  <View style={styles.alreadyActiveBanner}>
                    <MaterialCommunityIcons name="check-decagram" size={20} color="#b45309" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alreadyActiveTitle}>
                        Status Anda: {userProfile.premium_label || 'Noor+ Bebas Iklan'}
                      </Text>
                      <Text style={styles.alreadyActiveSub}>
                        {formatExpiry(userProfile.premium_expires_at)}
                      </Text>
                    </View>
                  </View>
                )}

                <Text style={styles.sectionLabel}>PILIH PAKET BEBAS IKLAN</Text>

                {plans.map((plan) => {
                  const isSelected = selectedPlan.key === plan.key;
                  return (
                    <TouchableOpacity
                      key={plan.key}
                      style={[styles.planCard, isSelected && styles.planCardSelected]}
                      activeOpacity={0.85}
                      onPress={() => setSelectedPlanKey(plan.key)}
                    >
                      <View style={styles.planTopRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                            {isSelected && <View style={styles.radioInner} />}
                          </View>
                          <Text style={styles.planName}>{plan.name}</Text>
                        </View>
                        <View
                          style={[
                            styles.planBadge,
                            plan.key === 'lifetime' && { backgroundColor: '#fef3c7', borderColor: '#f59e0b' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.planBadgeText,
                              plan.key === 'lifetime' && { color: '#92400e' },
                            ]}
                          >
                            {plan.badge}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.planBottomRow}>
                        <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                        <Text style={styles.planPrice}>{formatRupiah(plan.price)}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                <Text style={[styles.sectionLabel, { marginTop: 14 }]}>METODE PEMBAYARAN SYARIAH</Text>
                {PAYMENT_METHODS.map((pm) => {
                  const active = paymentMethod === pm.id;
                  return (
                    <TouchableOpacity
                      key={pm.id}
                      style={[styles.pmRow, active && styles.pmRowActive]}
                      onPress={() => setPaymentMethod(pm.id)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons
                        name={pm.icon}
                        size={20}
                        color={active ? Colors.primary : '#6f7975'}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pmTitle}>{pm.label}</Text>
                        <Text style={styles.pmSub}>{pm.sub}</Text>
                      </View>
                      <MaterialCommunityIcons
                        name={active ? 'radiobox-marked' : 'radiobox-blank'}
                        size={20}
                        color={active ? Colors.primary : '#cbd5e1'}
                      />
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  style={styles.primaryCta}
                  activeOpacity={0.85}
                  onPress={() => setCheckoutStep('pay')}
                >
                  <MaterialCommunityIcons name="crown" size={18} color="#fe932c" />
                  <Text style={styles.primaryCtaText}>
                    Lanjut Hapus Iklan • {formatRupiah(selectedPlan.price)}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {activeTab === 'plans' && checkoutStep === 'pay' && (
              <View style={styles.payBox}>
                <View style={styles.paySummaryHeader}>
                  <Text style={styles.paySummaryLabel}>RINGKASAN PEMBAYARAN</Text>
                  <Text style={styles.paySummaryPlan}>{selectedPlan.name}</Text>
                  <Text style={styles.paySummaryAmount}>{formatRupiah(selectedPlan.price)}</Text>
                </View>

                {paymentMethod === 'QRIS' ? (
                  <View style={styles.qrisCard}>
                    <MaterialCommunityIcons name="qrcode" size={128} color={Colors.primary} />
                    <Text style={styles.qrisCaption}>NMID: ID102600998877 • YAYASAN NOOR SYIAR DIGITAL</Text>
                    <Text style={styles.qrisHint}>
                      Scan kode QRIS di atas menggunakan BSI Mobile, GoPay, OVO, DANA, atau m-Banking Anda.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.qrisCard}>
                    <MaterialCommunityIcons name="bank-transfer" size={50} color={Colors.primary} />
                    <Text style={styles.vaLabel}>Nomor Virtual Account ({paymentMethod.replace('_', ' ')})</Text>
                    <Text style={styles.vaNumber}>9008 7721 0049 2026</Text>
                    <Text style={styles.qrisHint}>
                      Transfer tepat sesuai nominal agar status Bebas Iklan langsung aktif otomatis.
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.primaryCta}
                  activeOpacity={0.85}
                  disabled={loading}
                  onPress={handleConfirmPayment}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="check-circle-outline" size={18} color="#ffffff" />
                      <Text style={styles.primaryCtaText}>Saya Sudah Membayar (Aktifkan)</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBackBtn}
                  onPress={() => setCheckoutStep('select')}
                  disabled={loading}
                >
                  <Text style={styles.secondaryBackText}>Ubah Pilihan Paket</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'plans' && checkoutStep === 'receipt' && (
              <View style={styles.receiptBox}>
                <View style={styles.receiptIconWrap}>
                  <MaterialCommunityIcons name="check-decagram" size={44} color="#059669" />
                </View>
                <Text style={styles.receiptTitle}>Alhamdulillah, Bebas Iklan Aktif!</Text>
                <Text style={styles.receiptDesc}>
                  Seluruh banner iklan komersial di halaman Beranda Anda kini telah disembunyikan. Jazakumullahu khairan atas dukungan syiar & wakaf Anda.
                </Text>

                <View style={styles.receiptMetaCard}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptKey}>No. Invoice</Text>
                    <Text style={styles.receiptVal}>{latestInvoice?.invoice_code || '-'}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptKey}>Paket</Text>
                    <Text style={styles.receiptVal}>{latestInvoice?.plan_name || selectedPlan.name}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptKey}>Nominal</Text>
                    <Text style={styles.receiptVal}>{formatRupiah(latestInvoice?.amount || selectedPlan.price)}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptKey}>Masa Berlaku</Text>
                    <Text style={styles.receiptVal}>{formatExpiry(latestInvoice?.expires_at)}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryCta} onPress={onClose}>
                  <Text style={styles.primaryCtaText}>Kembali ke Beranda Tanpa Iklan</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'status' && (
              <View style={{ gap: 12 }}>
                <View
                  style={[
                    styles.statusHeroCard,
                    userProfile?.is_premium ? styles.statusHeroActive : styles.statusHeroFree,
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <MaterialCommunityIcons
                      name={userProfile?.is_premium ? 'crown' : 'information-outline'}
                      size={28}
                      color={userProfile?.is_premium ? '#fe932c' : '#64748b'}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.statusHeroTitle,
                          !userProfile?.is_premium && { color: '#1e293b' },
                        ]}
                      >
                        {userProfile?.is_premium
                          ? userProfile.premium_label || 'Member Noor+ Aktif'
                          : 'Akun Reguler (Dengan Banner Sponsor)'}
                      </Text>
                      <Text
                        style={[
                          styles.statusHeroSub,
                          !userProfile?.is_premium && { color: '#64748b' },
                        ]}
                      >
                        {userProfile?.is_premium
                          ? `${formatExpiry(userProfile.premium_expires_at)} • Iklan Beranda Nonaktif`
                          : 'Aktifkan Noor+ kapan saja untuk menghilangkan iklan sponsor.'}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.sectionLabel}>RIWAYAT INVOICE NOOR+</Text>
                {loadingHistory ? (
                  <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
                ) : historyList.length === 0 ? (
                  <View style={styles.emptyHistory}>
                    <MaterialCommunityIcons name="receipt-outline" size={32} color="#94a3b8" />
                    <Text style={styles.emptyHistoryText}>Belum ada riwayat pembelian paket Noor+.</Text>
                  </View>
                ) : (
                  historyList.map((item) => (
                    <View key={item.id} style={styles.historyItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyPlan}>{item.plan_name}</Text>
                        <Text style={styles.historyCode}>
                          {item.invoice_code} • {item.payment_method}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.historyAmount}>
                          {item.amount > 0 ? formatRupiah(item.amount) : 'Komplimen'}
                        </Text>
                        <Text style={styles.historyStatus}>LUNAS</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 22, 18, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#f8faf9',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  crownCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(254, 147, 44, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(254, 147, 44, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSub: {
    fontSize: 11.5,
    color: '#bbeddd',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#eceeed',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  tabItemActive: {
    backgroundColor: '#ffffff',
    elevation: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6f7975',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  body: {
    padding: 16,
    paddingBottom: 28,
  },
  ethicsNote: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  ethicsNoteTitle: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 2,
  },
  ethicsNoteDesc: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 16,
  },
  alreadyActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  alreadyActiveTitle: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#92400e',
  },
  alreadyActiveSub: {
    fontSize: 11,
    color: '#b45309',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  planCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#f3faf7',
  },
  planTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.primary,
  },
  planName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  planBadge: {
    backgroundColor: '#e6f4f1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#a2d0c4',
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  planBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  planSubtitle: {
    flex: 1,
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  pmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 13,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pmRowActive: {
    borderColor: Colors.primary,
    backgroundColor: '#f8fcfb',
  },
  pmTitle: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  pmSub: {
    fontSize: 10.5,
    color: '#64748b',
  },
  primaryCta: {
    marginTop: 14,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
  },
  primaryCtaText: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  payBox: {
    gap: 12,
  },
  paySummaryHeader: {
    backgroundColor: '#0f3e36',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  paySummaryLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#a2d0c4',
    letterSpacing: 0.8,
  },
  paySummaryPlan: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 4,
  },
  paySummaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fe932c',
    marginTop: 2,
  },
  qrisCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  qrisCaption: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
  },
  qrisHint: {
    fontSize: 11.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
  vaLabel: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 8,
  },
  vaNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 1.2,
    marginVertical: 4,
  },
  secondaryBackBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryBackText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748b',
  },
  receiptBox: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  receiptIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  receiptTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 6,
  },
  receiptDesc: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  receiptMetaCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptKey: {
    fontSize: 12,
    color: '#64748b',
  },
  receiptVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statusHeroCard: {
    borderRadius: 16,
    padding: 16,
  },
  statusHeroActive: {
    backgroundColor: Colors.primary,
  },
  statusHeroFree: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusHeroTitle: {
    fontSize: 14.5,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statusHeroSub: {
    fontSize: 11.5,
    color: '#bbeddd',
    marginTop: 2,
  },
  emptyHistory: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyHistoryText: {
    fontSize: 12,
    color: '#64748b',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 13,
    padding: 13,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  historyPlan: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  historyCode: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  historyAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  historyStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 2,
  },
});

