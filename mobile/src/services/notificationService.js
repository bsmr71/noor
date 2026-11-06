import { NativeModules, Platform, PermissionsAndroid } from 'react-native';

const { PrayerNotification } = NativeModules;

let lastNotificationHash = '';
let lastNotificationTime = 0;

/**
 * Meminta izin notifikasi Android 13+ (POST_NOTIFICATIONS)
 */
export async function requestNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Izin Notifikasi Adzan & Sholat Noor',
          message:
            'Noor membutuhkan izin notifikasi agar dapat menampilkan hitung mundur waktu sholat di status bar dan mengingatkan saat adzan berkumandang.',
          buttonPositive: 'Izinkan',
          buttonNegative: 'Nanti Saja',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Gagal meminta izin notifikasi:', err);
      return false;
    }
  }
  return true;
}

/**
 * Menampilkan / memperbarui notifikasi hitung mundur adzan di status bar
 */
export function updatePrayerCountdownNotification(
  prayerStatus,
  cityName = 'Jakarta',
  isEnabled = true,
  timings = null,
  force = false
) {
  if (!PrayerNotification) return;

  if (!isEnabled) {
    PrayerNotification.cancelCountdown();
    lastNotificationHash = '';
    return;
  }

  if (!prayerStatus) return;

  try {
    const hours = Number(prayerStatus.hoursLeft) || 0;
    const mins = Number(prayerStatus.minsLeft) || 0;
    const secs = Number(prayerStatus.secsLeft) || 0;
    const totalSeconds = hours * 3600 + mins * 60 + secs;
    const totalMinutes = hours * 60 + mins;

    const nextPrayer = prayerStatus.nextPrayer || 'Sholat';
    const nextTime = prayerStatus.nextPrayerTime ? ` (${prayerStatus.nextPrayerTime} WIB)` : '';

    let title = '';
    let message = '';

    if (totalSeconds <= 0) {
      const currentPrayer = prayerStatus.currentPrayer || nextPrayer;
      const curTime = prayerStatus.currentPrayerTime ? ` (${prayerStatus.currentPrayerTime} WIB)` : '';
      title = `Waktu Sholat ${currentPrayer} Telah Tiba!`;
      message = `Saatnya menunaikan sholat ${currentPrayer}${curTime} untuk wilayah ${cityName}.`;
    } else if (totalMinutes < 60) {
      title = `Menuju Adzan ${nextPrayer}${nextTime}`;
      message = `± ${totalMinutes} menit lagi menuju Adzan ${nextPrayer} • Wilayah ${cityName}`;
    } else {
      title = `Menuju Adzan ${nextPrayer}${nextTime}`;
      message = `± ${hours} jam ${mins} menit lagi menuju Adzan ${nextPrayer} • Wilayah ${cityName}`;
    }

    // Mencegah flickering notifikasi berulang-ulang: hanya update jika menit berubah atau dipaksa
    const currentHash = `${cityName}-${nextPrayer}-${totalMinutes}-${prayerStatus.nextPrayerKey}`;
    const nowMs = Date.now();
    if (!force && currentHash === lastNotificationHash && (nowMs - lastNotificationTime < 45000)) {
      return;
    }
    lastNotificationHash = currentHash;
    lastNotificationTime = nowMs;

    const targetTimestampMillis = nowMs + (totalSeconds * 1000);
    const progressPercent = Math.min(100, Math.max(0, Number(prayerStatus.progressPercent) || 0));

    const timingsMap = {
      subuh: timings?.subuh || '04:08',
      dzuhur: timings?.dzuhur || '11:38',
      ashar: timings?.ashar || '14:54',
      maghrib: timings?.maghrib || '17:48',
      isya: timings?.isya || '18:59',
      nextKey: prayerStatus.nextPrayerKey || 'ashar',
    };

    PrayerNotification.showCountdown(
      title,
      message,
      true,
      targetTimestampMillis,
      progressPercent,
      nextPrayer,
      prayerStatus.nextPrayerTime || '',
      cityName,
      timingsMap
    );
  } catch (err) {
    console.warn('Gagal memperbarui notifikasi status bar:', err);
  }
}

/**
 * Memunculkan alert notifikasi pop-up saat adzan tiba
 */
export function triggerAdzanNotification(prayerName, cityName, prayerTime) {
  if (!PrayerNotification) return;
  try {
    PrayerNotification.showAdzanAlert(prayerName, cityName, prayerTime);
  } catch (err) {
    console.warn('Gagal menampilkan notifikasi adzan:', err);
  }
}

/**
 * Menghapus notifikasi status bar
 */
export function cancelPrayerCountdownNotification() {
  if (PrayerNotification) {
    try {
      PrayerNotification.cancelCountdown();
      lastNotificationHash = '';
    } catch (err) {
      console.warn('Gagal membatalkan notifikasi:', err);
    }
  }
}
