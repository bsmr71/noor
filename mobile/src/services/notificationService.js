import { NativeModules, Platform, PermissionsAndroid } from 'react-native';

const { PrayerNotification } = NativeModules;

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
export function updatePrayerCountdownNotification(prayerStatus, cityName = 'Jakarta', isEnabled = true) {
  if (!PrayerNotification) return;

  if (!isEnabled) {
    PrayerNotification.cancelCountdown();
    return;
  }

  if (!prayerStatus) return;

  try {
    const hours = Number(prayerStatus.hoursLeft) || 0;
    const mins = Number(prayerStatus.minsLeft) || 0;
    const totalMinutes = hours * 60 + mins;

    const nextPrayer = prayerStatus.nextPrayer || 'Sholat';
    const nextTime = prayerStatus.nextPrayerTime ? ` (${prayerStatus.nextPrayerTime} WIB)` : '';

    let title = '';
    let message = '';

    if (totalMinutes <= 0) {
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

    PrayerNotification.showCountdown(title, message, true);
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
    } catch (e) {}
  }
}

