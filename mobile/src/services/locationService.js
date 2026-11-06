import * as Location from 'expo-location';
import { RAW_CITIES } from '../data/citiesPrayerData';
import { calculateQibla } from '../utils/qiblaCalculator';
import { calculateOfflineKemenagSchedule } from './prayerService';

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Menghitung jarak bumi garis lurus (Great Circle Distance) antara dua titik koordinat
 * menggunakan Formula Haversine (hasil dalam Kilometer)
 */
export function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius rata-rata bumi dalam KM
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Mencari kota terdekat dari database kota Kemenag berdasarkan titik koordinat GPS
 */
export function findNearestKemenagCity(latitude, longitude) {
  if (!RAW_CITIES || RAW_CITIES.length === 0) return null;

  let nearest = RAW_CITIES[0];
  let minDistance = getHaversineDistanceKm(latitude, longitude, nearest.lat, nearest.lon);

  for (let i = 1; i < RAW_CITIES.length; i++) {
    const c = RAW_CITIES[i];
    const dist = getHaversineDistanceKm(latitude, longitude, c.lat, c.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = c;
    }
  }

  return {
    city: nearest,
    distanceKm: Math.round(minDistance),
  };
}

/**
 * Meminta izin akses lokasi foreground GPS
 */
export async function requestLocationPermission() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('Gagal meminta izin lokasi GPS:', error);
    return false;
  }
}

/**
 * Mengecek apakah izin lokasi sudah diberikan
 */
export async function checkLocationPermission() {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    return false;
  }
}

/**
 * Mengambil koordinat GPS nyata dari sensor perangkat dengan mekanisme timeout & fallback cepat
 */
export async function getCurrentGpsPosition() {
  const isGranted = await requestLocationPermission();
  if (!isGranted) {
    throw new Error('Izin lokasi GPS tidak diberikan oleh pengguna.');
  }

  // 1. Dapatkan posisi terakhir yang tersimpan untuk kecepatan respon
  const lastKnown = await Location.getLastKnownPositionAsync().catch(() => null);
  if (lastKnown && lastKnown.coords) {
    return {
      latitude: lastKnown.coords.latitude,
      longitude: lastKnown.coords.longitude,
      altitude: lastKnown.coords.altitude,
      accuracy: lastKnown.coords.accuracy,
    };
  }

  // 2. Dapatkan posisi real-time dengan batas timeout aman (4.5 detik)
  const positionPromise = Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT_GPS')), 4500)
  );

  let pos = null;
  try {
    pos = await Promise.race([positionPromise, timeoutPromise]);
  } catch (err) {
    pos = await Location.getLastKnownPositionAsync().catch(() => null);
  }

  if (!pos || !pos.coords) {
    throw new Error('Gagal mengunci sinyal GPS. Pastikan GPS/Lokasi perangkat telah aktif.');
  }

  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    altitude: pos.coords.altitude,
    accuracy: pos.coords.accuracy,
  };
}

/**
 * Deteksi lokasi pengguna dan buat objek Kota yang diperkaya secara otomatis
 */
export async function detectUserLocationAndCity(fallbackCity = null) {
  try {
    const coords = await getCurrentGpsPosition();
    const { latitude, longitude } = coords;

    // 1. Cari kota Kemenag terdekat
    const nearestMatch = findNearestKemenagCity(latitude, longitude);
    const baseCity = nearestMatch?.city || fallbackCity || RAW_CITIES[0];

    // 2. Lakukan reverse-geocoding untuk mendapatkan nama daerah yang ramah pengguna
    let locationDetail = baseCity.name;
    let detectedDistrict = null;
    let detectedCityName = baseCity.name;

    try {
      const geoPromise = Location.reverseGeocodeAsync({ latitude, longitude });
      const timeoutGeo = new Promise((resolve) => setTimeout(() => resolve([]), 3000));
      const addresses = await Promise.race([geoPromise, timeoutGeo]);

      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        detectedDistrict = addr.district || addr.subregion;
        const cityOrRegency = addr.city || addr.subregion || baseCity.name;
        detectedCityName = cityOrRegency.replace(/^(Kabupaten|Kota)\s+/i, '');

        if (detectedDistrict && detectedCityName) {
          locationDetail = `${detectedDistrict}, ${detectedCityName}`;
        } else if (detectedCityName) {
          locationDetail = detectedCityName;
        }
      }
    } catch (e) {
      // Reverse geocode optional, abaikan jika offline
    }

    // 3. Tentukan timezone berdasarkan longitude Indonesia (WIB=7, WITA=8, WIT=9)
    let timezone = baseCity.tz || 7;
    if (longitude >= 120 && longitude < 135) {
      timezone = 8; // WITA
    } else if (longitude >= 135) {
      timezone = 9; // WIT
    } else {
      timezone = 7; // WIB
    }

    // 4. Hitung sudut Kiblat presisi dari titik koordinat GPS riil pengguna
    const qibla = calculateQibla(latitude, longitude);

    // 5. Hitung hisab jadwal sholat Kemenag harian dari titik koordinat riil pengguna
    const now = new Date();
    const schedule = calculateOfflineKemenagSchedule(latitude, longitude, timezone, now);

    return {
      id: `gps_${baseCity.id}`,
      kemenagId: baseCity.kemenagId,
      name: detectedCityName || baseCity.name,
      province: baseCity.region,
      region: baseCity.region,
      locationDetail,
      lat: latitude,
      lon: longitude,
      latitude,
      longitude,
      timezone,
      qiblaAngle: qibla.azimuth,
      qiblaDirection: qibla.directionText,
      fromWest: qibla.fromWest,
      distanceKm: qibla.distanceKm,
      isGpsAuto: true,
      nearestKemenagCityName: baseCity.name,
      distanceToNearestCityKm: nearestMatch?.distanceKm || 0,
      timings: {
        imsak: schedule.imsak,
        subuh: schedule.subuh,
        terbit: schedule.terbit,
        dhuha: schedule.dhuha,
        dzuhur: schedule.dzuhur,
        ashar: schedule.ashar,
        maghrib: schedule.maghrib,
        isya: schedule.isya,
      },
    };
  } catch (error) {
    throw error;
  }
}
