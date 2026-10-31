import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { INDONESIAN_CITIES } from '../data/citiesPrayerData';
import KeyboardSafeModalWrapper from './KeyboardSafeModalWrapper';

export default function CityModal({ visible, onClose, selectedCity, onSelectCity }) {
  const [search, setSearch] = useState('');

  const filteredCities = useMemo(() => {
    if (!search.trim()) return INDONESIAN_CITIES;
    const q = search.toLowerCase();
    return INDONESIAN_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.province.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardSafeModalWrapper backdropColor="#00000060">
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.sheetTopBar}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="location-sharp" size={22} color={Colors.secondary} />
              <Text style={styles.sheetTitle}>Pilih Kota / Kabupaten</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#191c1b" />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#6f7975" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama kota atau provinsi..."
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* GPS Quick Action */}
          <TouchableOpacity
            style={styles.gpsBtn}
            onPress={() => {
              // Default to Jakarta Kemenag
              const jkt = INDONESIAN_CITIES[0];
              onSelectCity(jkt);
              onClose();
            }}
          >
            <MaterialCommunityIcons name="crosshairs-gps" size={18} color={Colors.primary} />
            <Text style={styles.gpsBtnText}>Gunakan Lokasi GPS Saat Ini</Text>
          </TouchableOpacity>

          {/* Cities List */}
          <FlatList
            data={filteredCities}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = selectedCity?.id === item.id;
              return (
                <TouchableOpacity
                  style={[styles.cityItem, isSelected && styles.cityItemSelected]}
                  onPress={() => {
                    onSelectCity(item);
                    onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cityName, isSelected && styles.cityNameSelected]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.citySub, isSelected && styles.citySubSelected]}>
                      {item.province} • Kiblat {item.qiblaAngle}° ({item.fromWest})
                    </Text>
                  </View>
                  {isSelected && (
                    <MaterialCommunityIcons name="check-circle" size={20} color={Colors.secondary} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </KeyboardSafeModalWrapper>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    flexShrink: 1,
    overflow: 'hidden',
    paddingBottom: 20,
  },
  sheetTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f3',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002721',
    fontFamily: 'serif',
  },
  closeBtn: {
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f3',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#191c1b',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00272110',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  gpsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#002721',
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#f8faf9',
    borderWidth: 1,
    borderColor: '#e2e8e5',
  },
  cityItemSelected: {
    backgroundColor: '#002721',
    borderColor: '#002721',
  },
  cityName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#002721',
  },
  cityNameSelected: {
    color: '#ffffff',
  },
  citySub: {
    fontSize: 11,
    color: '#6f7975',
    marginTop: 2,
  },
  citySubSelected: {
    color: '#ffffffaa',
  },
});

