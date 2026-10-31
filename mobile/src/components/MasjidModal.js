import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const DEFAULT_MOSQUES = [
  {
    name: 'Masjid Raya & Agung Pusat Kota',
    address: 'Pusat Kawasan Ibadah & Kajian Terpadu',
    distance: '0.8 km',
    rating: '4.9',
    features: ['Parkir Luas', 'AC Nyaman', 'Ramah Disabilitas', 'Wudhu Bersih'],
  },
  {
    name: 'Masjid Istiqlal / Al-Akbar Wilayah',
    address: 'Jl. Utama Protokol Daerah',
    distance: '1.6 km',
    rating: '4.9',
    features: ['Kajian Rutin', 'Perpustakaan Islam', 'Aula Luas'],
  },
  {
    name: 'Masjid Jami Al-Falah',
    address: 'Kompleks Pemukiman & Niaga Syariah',
    distance: '2.3 km',
    rating: '4.8',
    features: ["Tahsin Qur'an", 'Taman Asri', 'Buka 24 Jam'],
  },
  {
    name: 'Masjid Baiturrahman Syiar Umat',
    address: 'Kawasan Pendidikan & Pesantren Kota',
    distance: '3.1 km',
    rating: '4.8',
    features: ['Kajian Ba’da Maghrib', 'Air Minum Gratis'],
  },
];

export default function MasjidModal({ visible, onClose, currentCity }) {
  const cityName = currentCity?.name || 'Jakarta';
  const qiblaAngle = currentCity?.qibla || currentCity?.qiblaAngle || '295.2°';

  const openGoogleMaps = (mosqueName) => {
    const query = encodeURIComponent(`${mosqueName} ${cityName}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const searchNearbyLive = () => {
    const query = encodeURIComponent(`Masjid terdekat di ${cityName}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="mosque" size={22} color="#fe932c" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Cari Masjid Terdekat</Text>
                <Text style={styles.headerSub}>Sekitar Wilayah {cityName} • Kiblat {qiblaAngle}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.liveGpsBanner} onPress={searchNearbyLive} activeOpacity={0.85}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <MaterialCommunityIcons name="google-maps" size={24} color="#047857" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#065f46' }}>
                    Buka Radar GPS Google Maps Langsung
                  </Text>
                  <Text style={{ fontSize: 11, color: '#047857' }}>
                    Temukan seluruh masjid & mushalla terdekat dari titik koordinat Anda
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons name="open-in-new" size={18} color="#047857" />
            </TouchableOpacity>

            {DEFAULT_MOSQUES.map((m, idx) => (
              <View key={idx} style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.mosqueName}>{m.name} ({cityName})</Text>
                    <Text style={styles.mosqueAddr}>{m.address}</Text>
                  </View>
                  <View style={styles.distBadge}>
                    <Text style={styles.distText}>{m.distance}</Text>
                  </View>
                </View>

                <View style={styles.featureRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <MaterialCommunityIcons name="star" size={14} color="#f59e0b" />
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#92400e' }}>{m.rating}</Text>
                  </View>
                  {m.features.map((f, i) => (
                    <View key={i} style={styles.featureChip}>
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.cardFooter}>
                  <Text style={{ fontSize: 11, color: '#6b7280' }}>Arah Kiblat: {qiblaAngle}</Text>
                  <TouchableOpacity
                    style={styles.dirBtn}
                    onPress={() => openGoogleMaps(m.name)}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons name="directions" size={15} color="#ffffff" />
                    <Text style={styles.dirBtnText}>Petunjuk Arah</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%', overflow: 'hidden' },
  header: { backgroundColor: '#002721', paddingHorizontal: 18, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBox: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(254,147,44,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', fontFamily: 'serif' },
  headerSub: { color: '#a7f3d0', fontSize: 11, marginTop: 1 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16 },
  liveGpsBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 14 },
  card: { backgroundColor: '#f8faf9', borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  mosqueName: { fontSize: 14, fontWeight: 'bold', color: Colors.primary },
  mosqueAddr: { fontSize: 11.5, color: '#6b7280', marginTop: 2 },
  distBadge: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  distText: { fontSize: 11, fontWeight: 'bold', color: '#b45309' },
  featureRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginVertical: 10 },
  featureChip: { backgroundColor: '#ffffff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  featureText: { fontSize: 10, color: '#4b5563', fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  dirBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  dirBtnText: { fontSize: 11.5, fontWeight: 'bold', color: '#ffffff' },
});

