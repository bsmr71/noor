import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Magnetometer } from 'expo-sensors';
import { Colors } from '../theme/colors';
import { getHijriDate, getIndonesianDayDate } from '../utils/prayerCalculator';
import { getKemenagPrayerSchedule } from '../services/prayerService';

const { width } = Dimensions.get('window');

export default function QiblaScreen({ currentCity, onOpenCityModal, onOpenCalendarModal }) {
  const [dayTab, setDayTab] = useState('hari-ini');
  const [dayTimings, setDayTimings] = useState(currentCity?.timings);
  const [daySource, setDaySource] = useState('Resmi Kemenag RI (Bimas Islam)');
  const [heading, setHeading] = useState(0);
  const [isSensorActive, setIsSensorActive] = useState(false);

  const targetDate = useMemo(() => {
    const d = new Date();
    if (dayTab === 'kemarin') d.setDate(d.getDate() - 1);
    if (dayTab === 'besok') d.setDate(d.getDate() + 1);
    return d;
  }, [dayTab]);

  const targetHijri = useMemo(() => getHijriDate(targetDate), [targetDate]);
  const targetDayInfo = useMemo(() => getIndonesianDayDate(targetDate), [targetDate]);
  const isFriday = targetDate.getDay() === 5;
  const qiblaAngle = currentCity?.qiblaAngle || 295.2;

  // Listen to device magnetometer sensor
  useEffect(() => {
    let subscription = null;
    Magnetometer.isAvailableAsync().then((available) => {
      if (available) {
        setIsSensorActive(true);
        Magnetometer.setUpdateInterval(100);
        subscription = Magnetometer.addListener((data) => {
          let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
          let compassAngle = (angle + 360) % 360;
          setHeading(Math.round(compassAngle));
        });
      }
    });

    return () => {
      subscription && subscription.remove();
    };
  }, []);

  // Fetch or calculate schedule
  useEffect(() => {
    let isMounted = true;
    if (dayTab === 'hari-ini' && currentCity?.timings) {
      setDayTimings(currentCity.timings);
    } else {
      getKemenagPrayerSchedule(currentCity, targetDate).then(({ timings, source }) => {
        if (isMounted && timings) {
          setDayTimings(timings);
          setDaySource(source);
        }
      });
    }
    return () => { isMounted = false; };
  }, [dayTab, currentCity, targetDate]);

  const diffAngle = Math.abs(((heading - qiblaAngle + 540) % 360) - 180);
  const isAligned = diffAngle <= 4.0;

  useEffect(() => {
    if (isAligned) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
    }
  }, [isAligned]);

  const timings = dayTimings || currentCity?.timings || {};

  const prayerRows = [
    { key: 'imsak', name: 'Imsak', time: timings.imsak || '03:59', sub: 'Batas Santap Sahur', icon: 'moon-waning-crescent' },
    { key: 'subuh', name: 'Subuh', time: timings.subuh || '04:09', sub: 'Sholat Subuh & Qobliyah', icon: 'weather-sunset-up' },
    { key: 'terbit', name: 'Terbit', time: timings.terbit || '05:24', sub: 'Akhir Waktu Subuh (Syuruq)', icon: 'weather-sunset' },
    { key: 'dhuha', name: 'Dhuha', time: timings.dhuha || '05:51', sub: 'Awal Sholat Sunnah Dhuha', icon: 'weather-sunny' },
    {
      key: 'dzuhur',
      name: isFriday ? "Jum'at" : "Dzuhur",
      time: timings.dzuhur || '11:40',
      sub: isFriday ? "Sholat Jum'at Berjamaah & Khutbah" : "Matahari Tergelincir (Zawal)",
      icon: isFriday ? 'mosque' : 'weather-sunny-alert',
      highlight: true,
    },
    { key: 'ashar', name: 'Ashar', time: timings.ashar || '14:54', sub: 'Waktu Bayangan Matahari', icon: 'weather-partly-cloudy' },
    { key: 'maghrib', name: 'Maghrib', time: timings.maghrib || '17:49', sub: 'Terbenam Matahari & Buka Puasa', icon: 'weather-sunset-down' },
    { key: 'isya', name: 'Isya & Tarawih', time: timings.isya || '19:00', sub: 'Hilang Syafaq Merah', icon: 'weather-night' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {/* Top Location Bar */}
      <View style={styles.locationCard}>
        <View style={styles.locIcon}>
          <Ionicons name="location-sharp" size={20} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.locCity}>{currentCity?.name || 'Jakarta'}</Text>
            <View style={styles.provinceBadge}>
              <Text style={styles.provinceText}>{currentCity?.province || 'DKI Jakarta'}</Text>
            </View>
          </View>
          <Text style={styles.locCoords}>
            {Math.abs(currentCity?.lat || 6.2088).toFixed(4)}° {currentCity?.lat < 0 ? 'LS' : 'LU'},{' '}
            {Math.abs(currentCity?.lng || 106.8456).toFixed(4)}° {currentCity?.lng < 0 ? 'BB' : 'BT'}
          </Text>
        </View>
        <TouchableOpacity style={styles.changeCityBtn} onPress={onOpenCityModal}>
          <Text style={styles.changeCityText}>Ubah</Text>
        </TouchableOpacity>
      </View>

      {/* Compass Dial Card */}
      <View style={styles.compassCard}>
        <View style={styles.compassOuter}>
          {/* Compass Rose Ring */}
          <View style={[styles.compassDial, { transform: [{ rotate: `-${heading}deg` }] }]}>
            {/* North marker */}
            <Text style={styles.cardinalN}>U</Text>
            <Text style={styles.cardinalE}>T</Text>
            <Text style={styles.cardinalS}>S</Text>
            <Text style={styles.cardinalB}>B</Text>

            {/* Ka'bah pointer vector */}
            <View style={[styles.needleLine, { transform: [{ rotate: `${qiblaAngle}deg` }] }]}>
              <View style={styles.kabahNeedleBadge}>
                <MaterialCommunityIcons name="mosque" size={16} color="#ffffff" />
              </View>
            </View>
          </View>

          {/* Center Hub */}
          <View style={styles.centerHub}>
            <MaterialCommunityIcons name="navigation" size={22} color={Colors.secondary} />
            <Text style={styles.bearingText}>{qiblaAngle}°</Text>
            <Text style={styles.bearingSub}>{currentCity?.fromWest || '25.2° U-B'}</Text>
            <Text style={styles.distanceText}>7.920 km Ka'bah</Text>
          </View>
        </View>

        {/* Action alignment badge */}
        <View style={[styles.actionBanner, isAligned && styles.actionBannerAligned]}>
          <MaterialCommunityIcons
            name={isAligned ? 'check-circle' : 'navigation'}
            size={16}
            color="#ffffff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.actionBannerText}>
            {isAligned ? 'Tepat Menghadap Kiblat!' : `Arahkan ponsel ke ${qiblaAngle}° (${currentCity?.fromWest || 'Barat Laut'})`}
          </Text>
        </View>
        <Text style={styles.kemenagNote}>
          Hisab Arah Kiblat Resmi Kemenag RI (BHR) • Presisi 0.1°
        </Text>
      </View>

      {/* Jadwal Sholat Section */}
      <View style={styles.timetableSection}>
        {/* Header & Segmented Day Control */}
        <View style={styles.dayControlRow}>
          <TouchableOpacity
            onPress={onOpenCalendarModal}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.timetableTitle}>Jadwal Sholat</Text>
              <MaterialCommunityIcons name="calendar-month" size={15} color={Colors.secondary} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Text style={styles.timetableHijri}>{targetHijri} • {targetDayInfo.dayName}</Text>
              <MaterialCommunityIcons name="chevron-right" size={12} color={Colors.secondary} />
            </View>
          </TouchableOpacity>

          {/* Segmented Control */}
          <View style={styles.segmentedBox}>
            {['kemarin', 'hari-ini', 'besok'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.segBtn, dayTab === t && styles.segBtnActive]}
                onPress={() => setDayTab(t)}
                activeOpacity={0.8}
              >
                <Text style={[styles.segBtnText, dayTab === t && styles.segBtnTextActive]}>
                  {t === 'hari-ini' ? 'Hari Ini' : t === 'kemarin' ? 'Kemarin' : 'Besok'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Source & Timezone Badge */}
        <View style={styles.sourceBadgeRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialCommunityIcons name="shield-check" size={14} color={Colors.secondary} />
            <Text style={styles.sourceText}>{daySource}</Text>
          </View>
          <Text style={styles.tzText}>
            WIB (UTC+{currentCity?.timezone || 7})
          </Text>
        </View>

        {/* Prayer Rows */}
        <View style={styles.prayerList}>
          {prayerRows.map((p) => (
            <View
              key={p.key}
              style={[
                styles.prayerCardRow,
                p.highlight && styles.prayerCardHighlight,
              ]}
            >
              <View style={[styles.pIconBox, p.highlight && styles.pIconBoxHighlight]}>
                <MaterialCommunityIcons
                  name={p.icon}
                  size={20}
                  color={p.highlight ? '#ffffff' : Colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.pName, p.highlight && styles.pNameHighlight]}>{p.name}</Text>
                <Text style={styles.pSub}>{p.sub}</Text>
              </View>
              <Text style={[styles.pTime, p.highlight && styles.pTimeHighlight]}>{p.time}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faf9',
  },
  content: {
    paddingBottom: 100,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8e5',
    gap: 12,
    marginBottom: 12,
  },
  locIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#00272112',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locCity: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#002721',
  },
  provinceBadge: {
    backgroundColor: '#fe932c20',
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 8,
  },
  provinceText: {
    fontSize: 10,
    color: '#c27803',
    fontWeight: '700',
  },
  locCoords: {
    fontSize: 11,
    color: '#6f7975',
    marginTop: 2,
  },
  changeCityBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f1f5f3',
  },
  changeCityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#002721',
  },
  compassCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8e5',
    marginBottom: 16,
  },
  compassOuter: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassDial: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: '#f1f5f3',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardinalN: { position: 'absolute', top: 6, fontSize: 13, fontWeight: 'bold', color: '#ba1a1a' },
  cardinalE: { position: 'absolute', right: 10, fontSize: 13, fontWeight: 'bold', color: '#6f7975' },
  cardinalS: { position: 'absolute', bottom: 6, fontSize: 13, fontWeight: 'bold', color: '#6f7975' },
  cardinalB: { position: 'absolute', left: 10, fontSize: 13, fontWeight: 'bold', color: '#6f7975' },
  needleLine: {
    position: 'absolute',
    width: 2,
    height: 210,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  kabahNeedleBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fe932c',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  centerHub: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8e5',
  },
  bearingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#002721',
  },
  bearingSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fe932c',
  },
  distanceText: {
    fontSize: 9,
    color: '#6f7975',
    marginTop: 2,
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002721',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 14,
  },
  actionBannerAligned: {
    backgroundColor: '#006c4c',
  },
  actionBannerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  kemenagNote: {
    fontSize: 10,
    color: '#6f7975',
    marginTop: 8,
  },
  timetableSection: {
    gap: 10,
  },
  dayControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timetableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002721',
    fontFamily: 'serif',
  },
  timetableHijri: {
    fontSize: 11,
    color: '#6f7975',
    marginTop: 2,
  },
  segmentedBox: {
    flexDirection: 'row',
    backgroundColor: '#e2e8e5',
    padding: 3,
    borderRadius: 20,
  },
  segBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  segBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6f7975',
  },
  segBtnTextActive: {
    color: '#002721',
    fontWeight: 'bold',
  },
  sourceBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f5f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#002721',
  },
  tzText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fe932c',
  },
  prayerList: {
    gap: 8,
  },
  prayerCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8e5',
    gap: 12,
  },
  prayerCardHighlight: {
    backgroundColor: '#002721',
    borderColor: '#002721',
  },
  pIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#00272110',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pIconBoxHighlight: {
    backgroundColor: '#fe932c',
  },
  pName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#002721',
  },
  pNameHighlight: {
    color: '#ffffff',
  },
  pSub: {
    fontSize: 10,
    color: '#6f7975',
    marginTop: 1,
  },
  pTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002721',
    fontFamily: 'serif',
  },
  pTimeHighlight: {
    color: '#fe932c',
  },
});

