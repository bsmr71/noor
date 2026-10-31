import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import {
  getCalendarMonthGrid,
  getHijriDetails,
  getIslamicEventsForMonth,
  getIndonesianDayDate,
  HIJRI_MONTHS,
} from '../utils/prayerCalculator';
import { calculateOfflineKemenagSchedule } from '../services/prayerService';

const { width } = Dimensions.get('window');

const GREGORIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const WEEKDAYS = [
  { short: 'Min', name: 'Minggu' },
  { short: 'Sen', name: 'Senin', isSunnah: true },
  { short: 'Sel', name: 'Selasa' },
  { short: 'Rab', name: 'Rabu' },
  { short: 'Kam', name: 'Kamis', isSunnah: true },
  { short: 'Jum', name: "Jum'at", isFriday: true },
  { short: 'Sab', name: 'Sabtu' },
];

export default function CalendarModal({ visible, onClose, currentCity }) {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hijriOffset, setHijriOffset] = useState(0); // -1, 0, +1 hari hisab
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'agenda'

  const currentYear = viewDate.getFullYear();
  const currentMonthIndex = viewDate.getMonth();

  // Matriks Grid Kalender
  const calendarGrid = useMemo(() => {
    return getCalendarMonthGrid(currentYear, currentMonthIndex, hijriOffset);
  }, [currentYear, currentMonthIndex, hijriOffset]);

  // Agenda Ibadah & Hari Besar Bulan Ini
  const monthlyEvents = useMemo(() => {
    return getIslamicEventsForMonth(currentYear, currentMonthIndex, hijriOffset);
  }, [currentYear, currentMonthIndex, hijriOffset]);

  // Info Tanggal yang Dipilih
  const selectedHijri = useMemo(() => {
    return getHijriDetails(selectedDate, hijriOffset);
  }, [selectedDate, hijriOffset]);

  const selectedDayInfo = useMemo(() => {
    return getIndonesianDayDate(selectedDate);
  }, [selectedDate]);

  // Jadwal Sholat untuk Tanggal yang Dipilih
  const selectedPrayerTimes = useMemo(() => {
    return calculateOfflineKemenagSchedule(
      currentCity?.latitude || -6.2088,
      currentCity?.longitude || 106.8456,
      currentCity?.timezone || 7,
      selectedDate
    );
  }, [currentCity, selectedDate]);

  // Navigasi Bulan
  const handlePrevMonth = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    setViewDate(new Date(currentYear, currentMonthIndex - 1, 1));
  };

  const handleNextMonth = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    setViewDate(new Date(currentYear, currentMonthIndex + 1, 1));
  };

  const handleJumpToday = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    const now = new Date();
    setViewDate(now);
    setSelectedDate(now);
  };

  const handleSelectDay = (cell) => {
    try { Haptics.selectionAsync(); } catch (e) {}
    setSelectedDate(cell.date);
    if (!cell.isCurrentMonth) {
      setViewDate(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
    }
  };

  // Header Hijriah untuk bulan aktif (dari tanggal 15 bulan tersebut)
  const midMonthHijri = useMemo(() => {
    return getHijriDetails(new Date(currentYear, currentMonthIndex, 15), hijriOffset);
  }, [currentYear, currentMonthIndex, hijriOffset]);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Header Atas */}
          <View style={styles.sheetTopBar}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialCommunityIcons name="calendar-month" size={22} color={Colors.secondary} />
                <Text style={styles.sheetTitle}>Kalender Hijriah & Ibadah</Text>
              </View>
              <Text style={styles.sheetSub}>
                Penanggalan Ummul Qura & Hisab Astronomi Kemenag RI
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#191c1b" />
            </TouchableOpacity>
          </View>

          {/* Tab Switcher: Kalender Grid vs Agenda Bulanan */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'grid' && styles.tabBtnActive]}
              onPress={() => setActiveTab('grid')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="calendar-view-day"
                size={16}
                color={activeTab === 'grid' ? '#ffffff' : Colors.primary}
              />
              <Text style={[styles.tabBtnText, activeTab === 'grid' && styles.tabBtnTextActive]}>
                Matriks Kalender
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'agenda' && styles.tabBtnActive]}
              onPress={() => setActiveTab('agenda')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="format-list-checks"
                size={16}
                color={activeTab === 'agenda' ? '#ffffff' : Colors.primary}
              />
              <Text style={[styles.tabBtnText, activeTab === 'agenda' && styles.tabBtnTextActive]}>
                Agenda Puasa ({monthlyEvents.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Navigasi Bulan Masehi & Hijriah */}
            <View style={styles.monthNavContainer}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.navArrowBtn} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={20} color={Colors.primary} />
              </TouchableOpacity>

              <View style={styles.monthTitleBox}>
                <Text style={styles.monthMasehiText}>
                  {GREGORIAN_MONTHS[currentMonthIndex]} {currentYear}
                </Text>
                <Text style={styles.monthHijriText}>
                  {midMonthHijri.monthName} {midMonthHijri.hijriYear} H
                </Text>
              </View>

              <TouchableOpacity onPress={handleNextMonth} style={styles.navArrowBtn} activeOpacity={0.7}>
                <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleJumpToday} style={styles.todayPillBtn} activeOpacity={0.7}>
                <MaterialCommunityIcons name="calendar-today" size={14} color={Colors.secondary} />
                <Text style={styles.todayPillText}>Hari Ini</Text>
              </TouchableOpacity>
            </View>

            {/* Kalibrasi Hisab Rukyat (+/- 1 Hari) */}
            <View style={styles.calibrationRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialCommunityIcons name="tune-vertical" size={14} color="#6f7975" />
                <Text style={styles.calibrationLabel}>Kalibrasi Hilal:</Text>
              </View>
              <View style={styles.offsetGroup}>
                {[-1, 0, 1].map((offset) => (
                  <TouchableOpacity
                    key={offset}
                    style={[
                      styles.offsetBtn,
                      hijriOffset === offset && styles.offsetBtnActive,
                    ]}
                    onPress={() => {
                      try { Haptics.selectionAsync(); } catch (e) {}
                      setHijriOffset(offset);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.offsetBtnText,
                        hijriOffset === offset && styles.offsetBtnTextActive,
                      ]}
                    >
                      {offset === 0 ? 'Standar (0)' : offset > 0 ? `+${offset} hr` : `${offset} hr`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {activeTab === 'grid' ? (
              <>
                {/* Header 7 Hari */}
                <View style={styles.weekdaysRow}>
                  {WEEKDAYS.map((w, idx) => (
                    <View key={idx} style={styles.weekdayCell}>
                      <Text
                        style={[
                          styles.weekdayText,
                          w.isFriday && styles.weekdayFridayText,
                          w.isSunnah && styles.weekdaySunnahText,
                        ]}
                      >
                        {w.short}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Grid Tanggal */}
                <View style={styles.calendarGrid}>
                  {calendarGrid.map((cell) => {
                    const isSelected =
                      selectedDate.getFullYear() === cell.date.getFullYear() &&
                      selectedDate.getMonth() === cell.date.getMonth() &&
                      selectedDate.getDate() === cell.date.getDate();

                    const isFasting = cell.hijri.isFastingRecommended;
                    const isAyyamulBidh = cell.hijri.isAyyamulBidh;
                    const hasEvent = !!cell.hijri.event;

                    return (
                      <TouchableOpacity
                        key={cell.key}
                        style={[
                          styles.gridCell,
                          !cell.isCurrentMonth && styles.gridCellOtherMonth,
                          cell.isToday && styles.gridCellToday,
                          isSelected && styles.gridCellSelected,
                        ]}
                        onPress={() => handleSelectDay(cell)}
                        activeOpacity={0.7}
                      >
                        {/* Angka Masehi */}
                        <Text
                          style={[
                            styles.masehiNum,
                            !cell.isCurrentMonth && styles.masehiNumOther,
                            cell.isToday && styles.masehiNumToday,
                            isSelected && styles.masehiNumSelected,
                          ]}
                        >
                          {cell.dayNumber}
                        </Text>

                        {/* Angka Hijriah */}
                        <Text
                          style={[
                            styles.hijriNum,
                            !cell.isCurrentMonth && styles.hijriNumOther,
                            isSelected && styles.hijriNumSelected,
                            isAyyamulBidh && !isSelected && styles.hijriNumAyyam,
                          ]}
                        >
                          {cell.hijri.hijriDay}
                        </Text>

                        {/* Dots Indikator Puasa & Hari Besar */}
                        <View style={styles.dotContainer}>
                          {hasEvent && (
                            <View style={[styles.dot, styles.dotEvent, isSelected && styles.dotSelected]} />
                          )}
                          {isAyyamulBidh && (
                            <View style={[styles.dot, styles.dotAyyam, isSelected && styles.dotSelected]} />
                          )}
                          {!isAyyamulBidh && isFasting && (
                            <View style={[styles.dot, styles.dotFasting, isSelected && styles.dotSelected]} />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Legend / Keterangan Warna */}
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.dot, styles.dotFasting]} />
                    <Text style={styles.legendText}>Puasa Senin-Kamis</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.dot, styles.dotAyyam]} />
                    <Text style={styles.legendText}>Ayyamul Bidh (13-15)</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.dot, styles.dotEvent]} />
                    <Text style={styles.legendText}>Hari Besar Islam</Text>
                  </View>
                </View>

                {/* Card Rincian Tanggal yang Dipilih */}
                <View style={styles.selectedDetailCard}>
                  <View style={styles.detailHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailDayName}>
                        {selectedDayInfo.dayName}, {selectedDate.getDate()} {GREGORIAN_MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                      </Text>
                      <Text style={styles.detailHijriFull}>
                        {selectedHijri.formatted}
                      </Text>
                    </View>

                    <View style={styles.cityBadge}>
                      <Ionicons name="location-sharp" size={12} color={Colors.secondary} />
                      <Text style={styles.cityBadgeText}>{currentCity?.name || 'Jakarta'}</Text>
                    </View>
                  </View>

                  {/* Status Keutamaan / Puasa */}
                  {(selectedHijri.event || selectedHijri.fastingLabel || selectedDayInfo.isFriday) && (
                    <View style={styles.eventBanner}>
                      <MaterialCommunityIcons
                        name={
                          selectedHijri.event
                            ? 'star-crescent'
                            : selectedHijri.fastingLabel
                            ? 'food-off'
                            : 'mosque'
                        }
                        size={16}
                        color={Colors.secondary}
                      />
                      <Text style={styles.eventBannerText}>
                        {selectedHijri.event || selectedHijri.fastingLabel || "Jum'at Berkah (Hari Terbaik Untuk Bersholawat & Tilawah Surah Al-Kahf)"}
                      </Text>
                    </View>
                  )}

                  {/* Strip Jadwal Sholat Tanggal Terpilih */}
                  <View style={styles.prayerStripContainer}>
                    <Text style={styles.prayerStripTitle}>Jadwal Sholat Hisab Kemenag RI</Text>
                    <View style={styles.prayerGrid}>
                      {[
                        { name: 'Imsak', time: selectedPrayerTimes.imsak, icon: 'weather-sunset' },
                        { name: 'Subuh', time: selectedPrayerTimes.subuh, icon: 'weather-sunset-up' },
                        { name: 'Terbit', time: selectedPrayerTimes.terbit, icon: 'white-balance-sunny' },
                        { name: selectedDayInfo.isFriday ? "Jum'at" : 'Dzuhur', time: selectedPrayerTimes.dzuhur, icon: 'weather-sunny' },
                        { name: 'Ashar', time: selectedPrayerTimes.ashar, icon: 'weather-partly-cloudy' },
                        { name: 'Maghrib', time: selectedPrayerTimes.maghrib, icon: 'weather-sunset-down' },
                        { name: 'Isya', time: selectedPrayerTimes.isya, icon: 'weather-night' },
                      ].map((item, idx) => (
                        <View key={idx} style={styles.prayerItem}>
                          <MaterialCommunityIcons name={item.icon} size={15} color={Colors.primary} />
                          <Text style={styles.prayerItemName}>{item.name}</Text>
                          <Text style={styles.prayerItemTime}>{item.time}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </>
            ) : (
              /* Tab Agenda: Daftar Puasa & Hari Besar Bulan Ini */
              <View style={styles.agendaContainer}>
                <Text style={styles.agendaHeading}>
                  Agenda Ibadah & Puasa Sunnah ({GREGORIAN_MONTHS[currentMonthIndex]} {currentYear})
                </Text>

                {monthlyEvents.length === 0 ? (
                  <View style={styles.emptyAgenda}>
                    <MaterialCommunityIcons name="calendar-blank" size={36} color="#c0c8c5" />
                    <Text style={styles.emptyAgendaText}>Tidak ada jadwal puasa khusus pada bulan ini.</Text>
                  </View>
                ) : (
                  monthlyEvents.map((ev, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.agendaCard}
                      onPress={() => {
                        setSelectedDate(ev.date);
                        setActiveTab('grid');
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.agendaDateBox}>
                        <Text style={styles.agendaDayNum}>{ev.dayNumber}</Text>
                        <Text style={styles.agendaDayName}>{ev.dayName}</Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.agendaHijri}>{ev.hijriFormatted}</Text>
                        <Text style={styles.agendaTitle}>
                          {ev.event || ev.fastingLabel}
                        </Text>
                      </View>

                      <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                    </TouchableOpacity>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '92%',
    paddingBottom: 24,
  },
  sheetTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eceeed',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  sheetSub: {
    fontSize: 11,
    color: '#6f7975',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f2f4f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSwitcher: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#f2f4f3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  tabBtnTextActive: {
    color: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  monthNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8faf9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#eceeed',
  },
  navArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eceeed',
  },
  monthTitleBox: {
    alignItems: 'center',
  },
  monthMasehiText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  monthHijriText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
    marginTop: 1,
  },
  todayPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffe9d6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  todayPillText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  calibrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  calibrationLabel: {
    fontSize: 11,
    color: '#6f7975',
    fontWeight: '500',
  },
  offsetGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  offsetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f2f4f3',
  },
  offsetBtnActive: {
    backgroundColor: Colors.secondary,
  },
  offsetBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#404846',
  },
  offsetBtnTextActive: {
    color: '#ffffff',
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginTop: 14,
    marginBottom: 6,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#717976',
  },
  weekdayFridayText: {
    color: '#006d5c',
  },
  weekdaySunnahText: {
    color: '#904d00',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: `${100 / 7}%`,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginVertical: 2,
    paddingVertical: 2,
  },
  gridCellOtherMonth: {
    opacity: 0.35,
  },
  gridCellToday: {
    borderWidth: 1.5,
    borderColor: '#006d5c',
    backgroundColor: 'rgba(0, 109, 92, 0.05)',
  },
  gridCellSelected: {
    backgroundColor: Colors.primary,
  },
  masehiNum: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#191c1b',
  },
  masehiNumOther: {
    color: '#9ca3af',
  },
  masehiNumToday: {
    color: '#006d5c',
  },
  masehiNumSelected: {
    color: '#ffffff',
  },
  hijriNum: {
    fontSize: 10,
    fontWeight: '600',
    color: '#717976',
    marginTop: 1,
  },
  hijriNumOther: {
    color: '#c0c8c5',
  },
  hijriNumSelected: {
    color: '#fed8b1',
  },
  hijriNumAyyam: {
    color: Colors.secondary,
    fontWeight: 'bold',
  },
  dotContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
    height: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotFasting: {
    backgroundColor: '#10b981', // green
  },
  dotAyyam: {
    backgroundColor: '#fe932c', // amber
  },
  dotEvent: {
    backgroundColor: '#8b5cf6', // purple
  },
  dotSelected: {
    backgroundColor: '#ffffff',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f2f4f3',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#6f7975',
    fontWeight: '500',
  },
  selectedDetailCard: {
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: '#f8faf9',
    padding: 14,
    borderWidth: 1,
    borderColor: '#eceeed',
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailDayName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  detailHijriFull: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
    marginTop: 2,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eceeed',
  },
  cityBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
  },
  eventBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffe9d6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
  },
  eventBannerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.secondary,
    flex: 1,
  },
  prayerStripContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eceeed',
  },
  prayerStripTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  prayerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: '#eceeed',
  },
  prayerItem: {
    alignItems: 'center',
    flex: 1,
  },
  prayerItemName: {
    fontSize: 9,
    color: '#6f7975',
    fontWeight: '600',
    marginTop: 2,
  },
  prayerItemTime: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 1,
  },
  agendaContainer: {
    paddingTop: 8,
  },
  agendaHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  emptyAgenda: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyAgendaText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  agendaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8faf9',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eceeed',
  },
  agendaDateBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eceeed',
  },
  agendaDayNum: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  agendaDayName: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.secondary,
  },
  agendaHijri: {
    fontSize: 11,
    color: '#6f7975',
    fontWeight: '500',
  },
  agendaTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 2,
  },
});

