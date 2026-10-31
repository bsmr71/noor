// Data Kota-Kota Indonesia, Koordinat Resmi, Arah Kiblat Kemenag, dan Jadwal Sholat
import { calculateQibla } from '../utils/qiblaCalculator';
import { calculateOfflineKemenagSchedule } from '../services/prayerService';

const RAW_CITIES = [
  { id: 'jakarta', kemenagId: '1301', name: 'Jakarta', region: 'DKI Jakarta', lat: -6.2088, lon: 106.8456, tz: 7 },
  { id: 'bogor', kemenagId: '1222', name: 'Bogor', region: 'Jawa Barat', lat: -6.5971, lon: 106.8060, tz: 7 },
  { id: 'depok', kemenagId: '1225', name: 'Depok', region: 'Jawa Barat', lat: -6.4025, lon: 106.7942, tz: 7 },
  { id: 'tangerang', kemenagId: '1107', name: 'Tangerang', region: 'Banten', lat: -6.1783, lon: 106.6319, tz: 7 },
  { id: 'tangsel', kemenagId: '1108', name: 'Tangerang Selatan', region: 'Banten', lat: -6.2952, lon: 106.7088, tz: 7 },
  { id: 'bekasi', kemenagId: '1221', name: 'Bekasi', region: 'Jawa Barat', lat: -6.2383, lon: 106.9756, tz: 7 },
  { id: 'bandung', kemenagId: '1219', name: 'Bandung', region: 'Jawa Barat', lat: -6.9175, lon: 107.6191, tz: 7 },
  { id: 'cirebon', kemenagId: '1224', name: 'Cirebon', region: 'Jawa Barat', lat: -6.7320, lon: 108.5523, tz: 7 },
  { id: 'serang', kemenagId: '1106', name: 'Serang', region: 'Banten', lat: -6.1104, lon: 106.1640, tz: 7 },
  { id: 'semarang', kemenagId: '1433', name: 'Semarang', region: 'Jawa Tengah', lat: -6.9667, lon: 110.4167, tz: 7 },
  { id: 'surakarta', kemenagId: '1434', name: 'Surakarta (Solo)', region: 'Jawa Tengah', lat: -7.5755, lon: 110.8243, tz: 7 },
  { id: 'yogyakarta', kemenagId: '1505', name: 'Yogyakarta', region: 'D.I. Yogyakarta', lat: -7.7956, lon: 110.3695, tz: 7 },
  { id: 'surabaya', kemenagId: '1638', name: 'Surabaya', region: 'Jawa Timur', lat: -7.2575, lon: 112.7521, tz: 7 },
  { id: 'malang', kemenagId: '1634', name: 'Malang', region: 'Jawa Timur', lat: -7.9666, lon: 112.6326, tz: 7 },
  { id: 'banda_aceh', kemenagId: '0119', name: 'Banda Aceh', region: 'Aceh', lat: 5.5483, lon: 95.3238, tz: 7 },
  { id: 'medan', kemenagId: '0228', name: 'Medan', region: 'Sumatera Utara', lat: 3.5952, lon: 98.6722, tz: 7 },
  { id: 'padang', kemenagId: '0314', name: 'Padang', region: 'Sumatera Barat', lat: -0.9471, lon: 100.4172, tz: 7 },
  { id: 'pekanbaru', kemenagId: '0412', name: 'Pekanbaru', region: 'Riau', lat: 0.5071, lon: 101.4478, tz: 7 },
  { id: 'batam', kemenagId: '0506', name: 'Batam', region: 'Kepulauan Riau', lat: 1.1301, lon: 104.0529, tz: 7 },
  { id: 'jambi', kemenagId: '0610', name: 'Jambi', region: 'Jambi', lat: -1.6101, lon: 103.6131, tz: 7 },
  { id: 'palembang', kemenagId: '0816', name: 'Palembang', region: 'Sumatera Selatan', lat: -2.9761, lon: 104.7754, tz: 7 },
  { id: 'bengkulu', kemenagId: '0710', name: 'Bengkulu', region: 'Bengkulu', lat: -3.7928, lon: 102.2608, tz: 7 },
  { id: 'bandar_lampung', kemenagId: '1014', name: 'Bandar Lampung', region: 'Lampung', lat: -5.4292, lon: 105.2625, tz: 7 },
  { id: 'denpasar', kemenagId: '1709', name: 'Denpasar', region: 'Bali', lat: -8.6705, lon: 115.2126, tz: 8 },
  { id: 'mataram', kemenagId: '1810', name: 'Mataram', region: 'Nusa Tenggara Barat', lat: -8.5769, lon: 116.1009, tz: 8 },
  { id: 'kupang', kemenagId: '1922', name: 'Kupang', region: 'Nusa Tenggara Timur', lat: -10.1772, lon: 123.6070, tz: 8 },
  { id: 'pontianak', kemenagId: '2013', name: 'Pontianak', region: 'Kalimantan Barat', lat: -0.0263, lon: 109.3425, tz: 7 },
  { id: 'banjarmasin', kemenagId: '2113', name: 'Banjarmasin', region: 'Kalimantan Selatan', lat: -3.3167, lon: 114.5901, tz: 8 },
  { id: 'balikpapan', kemenagId: '2308', name: 'Balikpapan', region: 'Kalimantan Timur', lat: -1.2379, lon: 116.8529, tz: 8 },
  { id: 'samarinda', kemenagId: '2310', name: 'Samarinda', region: 'Kalimantan Timur', lat: -0.5017, lon: 117.1537, tz: 8 },
  { id: 'makassar', kemenagId: '2622', name: 'Makassar', region: 'Sulawesi Selatan', lat: -5.1477, lon: 119.4327, tz: 8 },
  { id: 'manado', kemenagId: '2914', name: 'Manado', region: 'Sulawesi Utara', lat: 1.4748, lon: 124.8421, tz: 8 },
  { id: 'ambon', kemenagId: '3110', name: 'Ambon', region: 'Maluku', lat: -3.6554, lon: 128.1908, tz: 9 },
  { id: 'jayapura', kemenagId: '3329', name: 'Jayapura', region: 'Papua', lat: -2.5337, lon: 140.7181, tz: 9 }
];

// Inisialisasi daftar kota dengan perhitungan Qibla dan Hisab Kemenag
export const CITIES = RAW_CITIES.map((c) => {
  const qibla = calculateQibla(c.lat, c.lon);
  const now = new Date();
  const schedule = calculateOfflineKemenagSchedule(c.lat, c.lon, c.tz, now);

  return {
    id: c.id,
    kemenagId: c.kemenagId,
    name: c.name,
    province: c.region,
    region: c.region,
    lat: c.lat,
    lon: c.lon,
    latitude: c.lat,
    longitude: c.lon,
    timezone: c.tz,
    qiblaAngle: qibla.azimuth,
    qiblaDirection: qibla.directionText,
    fromWest: qibla.fromWest,
    distanceKm: qibla.distanceKm,
    timings: {
      imsak: schedule.imsak,
      subuh: schedule.subuh,
      terbit: schedule.terbit,
      dhuha: schedule.dhuha,
      dzuhur: schedule.dzuhur,
      ashar: schedule.ashar,
      maghrib: schedule.maghrib,
      isya: schedule.isya
    }
  };
});

export const INDONESIAN_CITIES = CITIES;

export const NEARBY_MOSQUES = [
  {
    name: "Masjid Istiqlal",
    address: "Jl. Taman Wijaya Kusuma, Pasar Baru, Jakarta Pusat",
    distance: "1.2 km",
    rating: "4.9",
    reviews: "32.410",
    features: ["Parkir Luas", "AC Nyaman", "Akses Kursi Roda", "Tempat Wudhu Modern"],
    qiblaBearing: "295.2°"
  },
  {
    name: "Masjid Cut Meutia",
    address: "Jl. Taman Cut Mutiah No.1, Menteng, Jakarta Pusat",
    distance: "2.1 km",
    rating: "4.8",
    reviews: "8.750",
    features: ["Cagar Budaya", "Kajian Rutin", "Taman Asri"],
    qiblaBearing: "295.2°"
  },
  {
    name: "Masjid Agung Sunda Kelapa",
    address: "Jl. Taman Sunda Kelapa No.16, Menteng, Jakarta Pusat",
    distance: "2.8 km",
    rating: "4.8",
    reviews: "11.200",
    features: ["Perpustakaan", "Pusat Dakwah", "Sentra Kuliner Halal"],
    qiblaBearing: "295.2°"
  },
  {
    name: "Masjid Al-Azhar Kebayoran",
    address: "Jl. Sisingamangaraja, Selong, Kebayoran Baru, Jakarta Selatan",
    distance: "5.4 km",
    rating: "4.9",
    reviews: "15.930",
    features: ["Halaman Luas", "Layanan Zakat", "Klinik Sehat"],
    qiblaBearing: "295.2°"
  }
];
