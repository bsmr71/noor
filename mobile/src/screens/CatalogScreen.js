import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { mobileApiClient } from '../services/apiClient';
import KeyboardSafeModalWrapper from '../components/KeyboardSafeModalWrapper';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';

const { width } = Dimensions.get('window');
const GRID_CARD_WIDTH = (width - 44) / 2;

const CATEGORIES = [
  { key: 'all', label: 'Semua', icon: 'view-grid-outline' },
  { key: 'umrah', label: 'Umrah & Haji', icon: 'mosque' },
  { key: 'buku', label: 'Buku & Mushaf', icon: 'book-open-page-variant-outline' },
  { key: 'perlengkapan', label: 'Alat Ibadah', icon: 'rug' },
  { key: 'herbal', label: 'Herbal Sunnah', icon: 'leaf' },
  { key: 'qurban', label: 'Qurban', icon: 'sheep' },
];

const FALLBACK_ITEMS = [
  {
    id: 1,
    title: 'Paket Umrah Syahdu 9 Hari (Direct Madinah)',
    category: 'umrah',
    partner_name: 'Al-Haramain Syiar Tour • PPIU Kemenag RI',
    badge: 'Early Bird -2,6 Jt',
    original_price: 34500000,
    price: 31900000,
    stock: 24,
    sold_count: 41,
    rating: 5.0,
    image_url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=900&q=80',
    description:
      'Perjalanan ibadah Umrah khusyuk 9 hari dengan penerbangan langsung Saudia Airlines tanpa transit, hotel bintang 5 pelataran Masjidil Haram & Masjid Nabawi.',
    highlights: [
      'Pesawat Saudia Airlines Direct Jakarta – Madinah',
      'Hotel Makkah & Madinah Bintang 5 (±100m Pelataran)',
      'Bimbingan Manasik & Muthawif Bersanad Resmi',
    ],
    whatsapp_contact: '6281290001445',
    is_featured: true,
  },
  {
    id: 2,
    title: "Mushaf Al-Qur'an Rasm Utsmani Tajwid Warna A5",
    category: 'buku',
    partner_name: 'Lajnah Pentashihan & Penerbit Syiar Sahabat',
    badge: 'Tashih Kemenag',
    original_price: 145000,
    price: 98000,
    stock: 120,
    sold_count: 215,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=80',
    description:
      "Mushaf Al-Qur'an standar Madinah Rasm Utsmani dengan panduan tajwid warna, terjemahan resmi Kemenag RI terbaru, dan kertas QPP teduh di mata.",
    highlights: [
      'Surat Tanda Tashih Resmi LPMQ Kemenag RI',
      'Kertas Quranic Paper Premium (QPP)',
      'Kode Tajwid Warna & Waqaf Ibtida',
    ],
    whatsapp_contact: '6281290001445',
    is_featured: true,
  },
  {
    id: 3,
    title: 'Sajadah Raudhah Velvet Tebal Memory Foam',
    category: 'perlengkapan',
    partner_name: 'Galeri Tenun Haramain Nusantara',
    badge: 'Terlaris',
    original_price: 249000,
    price: 179000,
    stock: 85,
    sold_count: 164,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=900&q=80',
    description:
      'Sajadah premium terinspirasi karpet hijau Raudhah Masjid Nabawi dengan lapisan memory foam setebal 15mm yang menjaga kenyamanan lutut saat sujud.',
    highlights: [
      'Ketebalan 15mm Empuk Ramah Lutut',
      'Permukaan Beludru Halus Anti-Selip',
      'Bonus Tasbih Kayu Kokka & Pouch Travel',
    ],
    whatsapp_contact: '6281290001445',
    is_featured: true,
  },
  {
    id: 4,
    title: 'Kurma Ajwa Aliyah Madinah Asli (500gr VIP)',
    category: 'herbal',
    partner_name: 'Kebun Sunnah Al-Madinah Import',
    badge: 'Panen Baru',
    original_price: 195000,
    price: 155000,
    stock: 95,
    sold_count: 230,
    rating: 5.0,
    image_url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=900&q=80',
    description:
      'Kurma Ajwa kualitas VIP dari dataran tinggi Aliyah, Madinah Al-Munawwarah. Tekstur lembut, daging tebal, manis alami untuk sunnah 7 butir pagi hari.',
    highlights: [
      '100% Asli Kebun Aliyah Madinah',
      'Ukuran Jumbo Grade A, Lembut & Segar',
      'Kemasan Jar Kedap Udara Food-Grade',
    ],
    whatsapp_contact: '6281290001445',
    is_featured: true,
  },
];

const formatRupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const STATUS_META = {
  menunggu_konfirmasi: { label: 'Menunggu Konfirmasi', bg: '#fef3c7', text: '#92400e' },
  diproses: { label: 'Sedang Diproses', bg: '#dbeafe', text: '#1e40af' },
  dikirim: { label: 'Dalam Pengiriman', bg: '#e0f2fe', text: '#0369a1' },
  selesai: { label: 'Selesai Diterima', bg: '#dcfce7', text: '#166534' },
  dibatalkan: { label: 'Dibatalkan', bg: '#fee2e2', text: '#991b1b' },
};

export default function CatalogScreen({ userProfile, initialCategory = 'all' }) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState(FALLBACK_ITEMS);
  const [loading, setLoading] = useState(false);

  // Detail & Order Sheet State
  const [selectedItem, setSelectedItem] = useState(null);
  const [sheetStep, setSheetStep] = useState('detail'); // 'detail' | 'form' | 'receipt'
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState(userProfile?.name || '');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // My Orders Modal State
  const [isOrdersModalVisible, setIsOrdersModalVisible] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (userProfile?.name) {
      setBuyerName(userProfile.name);
    }
  }, [userProfile?.name]);

  const fetchCatalog = async (cat = selectedCategory, q = searchQuery) => {
    setLoading(true);
    try {
      const res = await mobileApiClient.getCatalog(cat, q);
      if (Array.isArray(res?.data)) {
        setItems(res.data);
      }
    } catch (e) {
      // Keep local fallback filtered if offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog(selectedCategory, searchQuery);
  }, [selectedCategory]);

  const fetchMyOrders = async () => {
    if (!userProfile?.token) return;
    setLoadingOrders(true);
    try {
      const res = await mobileApiClient.getMyCatalogOrders(userProfile.token);
      if (Array.isArray(res?.data)) {
        setMyOrders(res.data);
      }
    } catch (e) {
      // silent
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [userProfile?.token]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        (item.title || '').toLowerCase().includes(q) ||
        (item.partner_name || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  const handleOpenItem = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    setNotes('');
    setSheetStep('detail');
  };

  const handleSubmitOrder = async () => {
    if (!buyerName.trim() || !buyerPhone.trim() || !shippingAddress.trim()) {
      Alert.alert(
        'Data Belum Lengkap',
        'Mohon isi Nama Penerima, Nomor WhatsApp aktif, dan Alamat Lengkap terlebih dahulu.'
      );
      return;
    }

    setSubmittingOrder(true);
    try {
      const res = await mobileApiClient.createCatalogOrder(
        {
          catalog_item_id: selectedItem.id,
          buyer_name: buyerName.trim(),
          buyer_phone: buyerPhone.trim(),
          shipping_address: shippingAddress.trim(),
          notes: notes.trim(),
          quantity,
        },
        userProfile?.token
      );

      if (res?.status === 'success') {
        setCreatedOrder(res.data);
        setSheetStep('receipt');
        fetchCatalog(selectedCategory, searchQuery);
        fetchMyOrders();
      }
    } catch (err) {
      Alert.alert('Gagal Mengirim Pesanan', err?.message || 'Silakan periksa koneksi Anda.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleWhatsAppConsult = (item, order = null) => {
    const phone = (item?.whatsapp_contact || '6281290001445').replace(/[^0-9]/g, '');
    const text = order
      ? `Assalamu'alaikum Admin Noor Syariah, saya ingin konfirmasi pesanan:\nKode Order: *${order.order_code}*\nProduk: *${item.title}*\nJumlah: ${order.quantity}\nTotal: ${formatRupiah(order.total_amount)}\nAtas Nama: ${order.buyer_name}`
      : `Assalamu'alaikum Admin Noor Syariah, saya tertarik berkonsultasi mengenai *${item?.title}* di Katalog Noor.`;
    Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`).catch(() => {});
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerBadgeRow}>
            <MaterialCommunityIcons name="shield-check" size={14} color="#fe932c" />
            <Text style={styles.headerBadgeText}>KURASI HALAL & MITRA RESMI</Text>
          </View>
          <Text style={styles.headerTitle}>Katalog Syariah Noor</Text>
        </View>

        <TouchableOpacity
          style={styles.myOrdersBtn}
          activeOpacity={0.85}
          onPress={() => {
            fetchMyOrders();
            setIsOrdersModalVisible(true);
          }}
        >
          <MaterialCommunityIcons name="shopping-outline" size={17} color={Colors.primary} />
          <Text style={styles.myOrdersBtnText}>Pesanan</Text>
          {myOrders.length > 0 && (
            <View style={styles.orderCountPill}>
              <Text style={styles.orderCountText}>{myOrders.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#64748b" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => fetchCatalog(selectedCategory, searchQuery)}
          placeholder="Cari mushaf, sajadah, kurma ajwa, paket umrah..."
          placeholderTextColor="#94a3b8"
          style={styles.searchInput}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              fetchCatalog(selectedCategory, '');
            }}
          >
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Strip */}
      <View style={{ marginBottom: 8 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.catChip, active && styles.catChipActive]}
                onPress={() => setSelectedCategory(cat.key)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={cat.icon}
                  size={15}
                  color={active ? '#ffffff' : Colors.primary}
                />
                <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Catalog Grid */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Syariah Assurance Banner */}
        <View style={styles.assuranceCard}>
          <View style={styles.assuranceIcon}>
            <MaterialCommunityIcons name="store-check-outline" size={22} color="#fe932c" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.assuranceTitle}>Belanja & Booking Ibadah Amanah</Text>
            <Text style={styles.assuranceSub}>
              Seluruh buku, mushaf Kemenag, perlengkapan sholat, hingga travel Umrah PPIU telah melewati verifikasi dewan syariah Noor.
            </Text>
          </View>
        </View>

        {loading && (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: 12 }} />
        )}

        {filteredItems.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="package-variant" size={42} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Produk Tidak Ditemukan</Text>
            <Text style={styles.emptySub}>
              Coba pilih kategori lain atau ketik kata kunci pencarian berbeda.
            </Text>
          </View>
        ) : (
          <View style={styles.gridWrap}>
            {filteredItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.productCard}
                activeOpacity={0.88}
                onPress={() => handleOpenItem(item)}
              >
                <View style={styles.productImgBox}>
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.productImg}
                    resizeMode="cover"
                  />
                  {!!item.badge && (
                    <View style={styles.productBadge}>
                      <Text style={styles.productBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.productBody}>
                  <View style={styles.productMetaRow}>
                    <Text style={styles.productRating}>★ {Number(item.rating || 4.9).toFixed(1)}</Text>
                    <Text style={styles.productSold}>{item.sold_count || 0} dipesan</Text>
                  </View>

                  <Text style={styles.productTitle} numberOfLines={2}>
                    {item.title}
                  </Text>

                  <Text style={styles.productPartner} numberOfLines={1}>
                    {item.partner_name}
                  </Text>

                  <View style={styles.priceBlock}>
                    {item.original_price && item.original_price > item.price ? (
                      <Text style={styles.oldPrice}>{formatRupiah(item.original_price)}</Text>
                    ) : (
                      <View style={{ height: 13 }} />
                    )}
                    <Text style={styles.currentPrice}>{formatRupiah(item.price)}</Text>
                  </View>

                  <View style={styles.cardBtn}>
                    <Text style={styles.cardBtnText}>
                      {item.category === 'umrah' ? 'Lihat Paket' : 'Pesan'}
                    </Text>
                    <MaterialCommunityIcons name="arrow-right" size={13} color="#ffffff" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Product Detail & Booking Bottom Sheet Modal */}
      <Modal
        visible={!!selectedItem}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedItem(null)}
      >
        <KeyboardSafeModalWrapper backdropColor="rgba(0, 22, 18, 0.6)">
          <View style={styles.modalSheet}>
            {selectedItem && (
              <>
                <View style={styles.sheetTopBar}>
                  <Text style={styles.sheetTopTitle} numberOfLines={1}>
                    {sheetStep === 'detail'
                      ? 'Detail Katalog Syariah'
                      : sheetStep === 'form'
                        ? 'Formulir Pemesanan / Booking'
                        : 'Bukti Pemesanan Tercatat'}
                  </Text>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setSelectedItem(null)}
                  >
                    <Ionicons name="close" size={20} color="#1e293b" />
                  </TouchableOpacity>
                </View>

                <KeyboardAwareScrollView
                  contentContainerStyle={styles.sheetBody}
                  showsVerticalScrollIndicator={false}
                >
                  {sheetStep === 'detail' && (
                    <>
                      <Image
                        source={{ uri: selectedItem.image_url }}
                        style={styles.detailHeroImg}
                        resizeMode="cover"
                      />

                      <View style={styles.detailPartnerBadge}>
                        <MaterialCommunityIcons
                          name="check-decagram"
                          size={15}
                          color={Colors.primary}
                        />
                        <Text style={styles.detailPartnerText}>
                          {selectedItem.partner_name}
                        </Text>
                      </View>

                      <Text style={styles.detailTitle}>{selectedItem.title}</Text>

                      <View style={styles.detailPriceRow}>
                        <View>
                          {selectedItem.original_price > selectedItem.price && (
                            <Text style={styles.detailOldPrice}>
                              {formatRupiah(selectedItem.original_price)}
                            </Text>
                          )}
                          <Text style={styles.detailPrice}>
                            {formatRupiah(selectedItem.price)}
                          </Text>
                        </View>
                        <View style={styles.stockPill}>
                          <Text style={styles.stockPillText}>
                            Tersedia: {selectedItem.stock} kuota/unit
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.detailDesc}>{selectedItem.description}</Text>

                      {Array.isArray(selectedItem.highlights) &&
                        selectedItem.highlights.length > 0 && (
                          <View style={styles.highlightsBox}>
                            <Text style={styles.highlightsTitle}>
                              Keunggulan & Spesifikasi:
                            </Text>
                            {selectedItem.highlights.map((pt, i) => (
                              <View key={i} style={styles.highlightRow}>
                                <MaterialCommunityIcons
                                  name="check-circle"
                                  size={16}
                                  color="#059669"
                                />
                                <Text style={styles.highlightText}>{pt}</Text>
                              </View>
                            ))}
                          </View>
                        )}

                      {/* Quantity Selector */}
                      <View style={styles.qtyRow}>
                        <Text style={styles.qtyLabel}>Jumlah Pesanan / Jamaah</Text>
                        <View style={styles.qtyControls}>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                          >
                            <MaterialCommunityIcons name="minus" size={16} color={Colors.primary} />
                          </TouchableOpacity>
                          <Text style={styles.qtyValue}>{quantity}</Text>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() =>
                              setQuantity((q) => Math.min(selectedItem.stock || 50, q + 1))
                            }
                          >
                            <MaterialCommunityIcons name="plus" size={16} color={Colors.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.detailActionRow}>
                        <TouchableOpacity
                          style={styles.waBtn}
                          onPress={() => handleWhatsAppConsult(selectedItem)}
                        >
                          <MaterialCommunityIcons name="whatsapp" size={18} color="#047857" />
                          <Text style={styles.waBtnText}>Tanya CS</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.orderNowBtn}
                          onPress={() => setSheetStep('form')}
                        >
                          <Text style={styles.orderNowBtnText}>
                            Pesan Sekarang • {formatRupiah(selectedItem.price * quantity)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  {sheetStep === 'form' && (
                    <View style={{ gap: 12 }}>
                      <View style={styles.orderSummaryMini}>
                        <Text style={styles.orderSummaryMiniTitle}>{selectedItem.title}</Text>
                        <Text style={styles.orderSummaryMiniSub}>
                          {quantity}x • Total Estimasi:{' '}
                          <Text style={{ fontWeight: 'bold', color: Colors.secondary }}>
                            {formatRupiah(selectedItem.price * quantity)}
                          </Text>
                        </Text>
                      </View>

                      <View>
                        <Text style={styles.inputLabel}>Nama Lengkap Pemesan / Jamaah</Text>
                        <TextInput
                          value={buyerName}
                          onChangeText={setBuyerName}
                          placeholder="Contoh: Ahmad Fauzi"
                          style={styles.inputField}
                        />
                      </View>

                      <View>
                        <Text style={styles.inputLabel}>Nomor WhatsApp Aktif</Text>
                        <TextInput
                          value={buyerPhone}
                          onChangeText={setBuyerPhone}
                          keyboardType="phone-pad"
                          placeholder="Contoh: 081234567890"
                          style={styles.inputField}
                        />
                      </View>

                      <View>
                        <Text style={styles.inputLabel}>
                          {selectedItem.category === 'umrah'
                            ? 'Kota Domisili & Rencana Keberangkatan'
                            : 'Alamat Lengkap Pengiriman'}
                        </Text>
                        <TextInput
                          value={shippingAddress}
                          onChangeText={setShippingAddress}
                          multiline
                          numberOfLines={3}
                          placeholder="Jl. Raya Pajajaran No. 12, Kota Bogor, Jawa Barat..."
                          style={[styles.inputField, { height: 78, textAlignVertical: 'top' }]}
                        />
                      </View>

                      <View>
                        <Text style={styles.inputLabel}>Catatan Tambahan (Opsional)</Text>
                        <TextInput
                          value={notes}
                          onChangeText={setNotes}
                          placeholder="Contoh: Bungkus kado / atas nama qurban..."
                          style={styles.inputField}
                        />
                      </View>

                      <View style={styles.infoBookingNote}>
                        <MaterialCommunityIcons
                          name="information-outline"
                          size={17}
                          color="#047857"
                        />
                        <Text style={styles.infoBookingNoteText}>
                          Pesanan Anda akan tercatat resmi di sistem Noor Console. Konfirmasi pengiriman & pembayaran dilakukan aman setelah pesanan diverifikasi admin mitra.
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.submitOrderBtn}
                        disabled={submittingOrder}
                        onPress={handleSubmitOrder}
                      >
                        {submittingOrder ? (
                          <ActivityIndicator color="#ffffff" />
                        ) : (
                          <>
                            <MaterialCommunityIcons
                              name="check-circle-outline"
                              size={18}
                              color="#ffffff"
                            />
                            <Text style={styles.submitOrderBtnText}>
                              Kirim Pesanan / Booking Sekarang
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{ paddingVertical: 8, alignItems: 'center' }}
                        onPress={() => setSheetStep('detail')}
                      >
                        <Text style={{ fontSize: 12.5, color: '#64748b', fontWeight: '600' }}>
                          Kembali ke Detail Produk
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {sheetStep === 'receipt' && createdOrder && (
                    <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                      <View style={styles.receiptCircle}>
                        <MaterialCommunityIcons
                          name="check-decagram"
                          size={42}
                          color="#059669"
                        />
                      </View>
                      <Text style={styles.receiptTitle}>Alhamdulillah, Pesanan Tercatat!</Text>
                      <Text style={styles.receiptSub}>
                        Data pemesanan Anda telah masuk ke Noor Console Admin. Simpan kode order di bawah ini atau konfirmasi cepat via WhatsApp.
                      </Text>

                      <View style={styles.receiptCard}>
                        <View style={styles.receiptRow}>
                          <Text style={styles.receiptKey}>Kode Order</Text>
                          <Text style={styles.receiptVal}>{createdOrder.order_code}</Text>
                        </View>
                        <View style={styles.receiptRow}>
                          <Text style={styles.receiptKey}>Jumlah</Text>
                          <Text style={styles.receiptVal}>{createdOrder.quantity} unit/seat</Text>
                        </View>
                        <View style={styles.receiptRow}>
                          <Text style={styles.receiptKey}>Total Estimasi</Text>
                          <Text style={[styles.receiptVal, { color: Colors.secondary }]}>
                            {formatRupiah(createdOrder.total_amount)}
                          </Text>
                        </View>
                        <View style={styles.receiptRow}>
                          <Text style={styles.receiptKey}>Status</Text>
                          <Text style={[styles.receiptVal, { color: '#b45309' }]}>
                            Menunggu Konfirmasi
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[styles.submitOrderBtn, { width: '100%', backgroundColor: '#047857' }]}
                        onPress={() => handleWhatsAppConsult(selectedItem, createdOrder)}
                      >
                        <MaterialCommunityIcons name="whatsapp" size={18} color="#ffffff" />
                        <Text style={styles.submitOrderBtnText}>
                          Konfirmasi Cepat via WhatsApp
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{ paddingVertical: 12 }}
                        onPress={() => setSelectedItem(null)}
                      >
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: Colors.primary }}>
                          Selesai & Kembali ke Katalog
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </KeyboardAwareScrollView>
              </>
            )}
          </View>
        </KeyboardSafeModalWrapper>
      </Modal>

      {/* Riwayat Pesanan Saya Modal */}
      <Modal
        visible={isOrdersModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOrdersModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetTopBar}>
              <Text style={styles.sheetTopTitle}>Riwayat Pesanan Katalog Saya</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsOrdersModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.sheetBody}>
              {loadingOrders ? (
                <ActivityIndicator color={Colors.primary} style={{ marginVertical: 24 }} />
              ) : myOrders.length === 0 ? (
                <View style={styles.emptyBox}>
                  <MaterialCommunityIcons name="shopping-outline" size={40} color="#94a3b8" />
                  <Text style={styles.emptyTitle}>Belum Ada Pesanan</Text>
                  <Text style={styles.emptySub}>
                    Pesanan mushaf, perlengkapan ibadah, atau booking Umrah Anda akan muncul di sini.
                  </Text>
                </View>
              ) : (
                myOrders.map((ord) => {
                  const st = STATUS_META[ord.status] || STATUS_META.menunggu_konfirmasi;
                  return (
                    <View key={ord.id} style={styles.orderHistoryCard}>
                      <View style={styles.orderHistoryTop}>
                        <Text style={styles.orderHistoryCode}>{ord.order_code}</Text>
                        <View style={[styles.orderStatusBadge, { backgroundColor: st.bg }]}>
                          <Text style={[styles.orderStatusText, { color: st.text }]}>
                            {st.label}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.orderHistoryTitle}>
                        {ord.item?.title || 'Item Katalog Noor'}
                      </Text>
                      <View style={styles.orderHistoryBottom}>
                        <Text style={styles.orderHistoryQty}>
                          {ord.quantity}x • {ord.buyer_name}
                        </Text>
                        <Text style={styles.orderHistoryTotal}>
                          {formatRupiah(ord.total_amount)}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
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
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.secondary,
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  myOrdersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  myOrdersBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  orderCountPill: {
    backgroundColor: '#fe932c',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  orderCountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 13,
    paddingHorizontal: 12,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0f172a',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dce3e0',
  },
  catChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  catChipTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  assuranceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  assuranceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(254, 147, 44, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assuranceTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  assuranceSub: {
    fontSize: 11,
    color: '#bbeddd',
    lineHeight: 15.5,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  productCard: {
    width: GRID_CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e6ebe9',
  },
  productImgBox: {
    width: '100%',
    height: 126,
    backgroundColor: '#e2e8f0',
    position: 'relative',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  productBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#fe932c',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 7,
  },
  productBadgeText: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  productBody: {
    padding: 10,
  },
  productMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productRating: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#d97706',
  },
  productSold: {
    fontSize: 10,
    color: '#64748b',
  },
  productTitle: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#0f172a',
    lineHeight: 17,
    height: 34,
  },
  productPartner: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 3,
  },
  priceBlock: {
    marginTop: 6,
    marginBottom: 8,
  },
  oldPrice: {
    fontSize: 10,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  cardBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 9,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cardBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 22, 18, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#f8faf9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    flexShrink: 1,
    overflow: 'hidden',
  },
  sheetTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sheetTopTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBody: {
    padding: 16,
    paddingBottom: 28,
  },
  detailHeroImg: {
    width: '100%',
    height: 190,
    borderRadius: 16,
    marginBottom: 12,
  },
  detailPartnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  detailPartnerText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.primary,
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f172a',
    lineHeight: 23,
  },
  detailPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  detailOldPrice: {
    fontSize: 12,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  detailPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  stockPill: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  stockPillText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#065f46',
  },
  detailDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 12,
  },
  highlightsBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
    marginBottom: 14,
  },
  highlightsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 2,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highlightText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 13,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  qtyLabel: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  detailActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  waBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 13,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#6ee7b7',
  },
  waBtnText: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#047857',
  },
  orderNowBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 13,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderNowBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  orderSummaryMini: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  orderSummaryMiniTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  orderSummaryMiniSub: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
  },
  inputField: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  infoBookingNote: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#ecfdf5',
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  infoBookingNoteText: {
    flex: 1,
    fontSize: 11,
    color: '#065f46',
    lineHeight: 16,
  },
  submitOrderBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 13,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  submitOrderBtnText: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  receiptCircle: {
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
    marginBottom: 4,
  },
  receiptSub: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
    marginBottom: 14,
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
  orderHistoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  orderHistoryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderHistoryCode: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  orderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  orderStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  orderHistoryTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 6,
  },
  orderHistoryBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderHistoryQty: {
    fontSize: 11.5,
    color: '#64748b',
  },
  orderHistoryTotal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
});

