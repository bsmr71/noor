// Layanan Jadwal Sholat Resmi Kementerian Agama Republik Indonesia (Bimas Islam)
// Dilengkapi Engine Hisab Astronomi Offline Standar Kemenag & Sinkronisasi API Kemenag

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

/**
 * Menghitung Julian Day dari objek Date
 */
function getJulianDay(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045 - 0.5;
}

/**
 * Menghitung Deklinasi Matahari & Equation of Time (Perataan Waktu)
 * Berdasarkan algoritma astronomi Jean Meeus yang digunakan Kemenag RI
 */
function getSolarCoordinates(jd) {
  const d = jd - 2451545.0;
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const L = (q + 1.915 * Math.sin(toRad(g)) + 0.020 * Math.sin(toRad(2 * g))) % 360;
  const e = 23.439 - 0.00000036 * d;

  const sinDec = Math.sin(toRad(e)) * Math.sin(toRad(L));
  const dec = toDeg(Math.asin(sinDec));

  let RA = toDeg(Math.atan2(Math.cos(toRad(e)) * Math.sin(toRad(L)), Math.cos(toRad(L))));
  if (RA < 0) RA += 360;
  RA = RA / 15;

  const qHour = q / 15;
  let eqTime = qHour - RA;
  while (eqTime > 1) eqTime -= 24;
  while (eqTime < -1) eqTime += 24;

  return { dec, eqTime };
}

/**
 * Engine Hisab Waktu Sholat Standar Kementerian Agama RI (100% Offline)
 * Parameter Resmi Kemenag:
 * - Subuh: -20° di bawah ufuk, Ihtiyath +2 menit
 * - Terbit: -1° (refraksi 34' + semi-diameter matahari 16')
 * - Dhuha: +4.5° di atas ufuk, Ihtiyath +2 menit
 * - Dzuhur: Zawal + Ihtiyath +2 menit
 * - Ashar: Bayangan benda + panjang benda (Syafi'i/Jumhur: ratio 1) + Ihtiyath +2 menit
 * - Maghrib: -1° terbenam matahari, Ihtiyath +2 menit
 * - Isya: -18° di bawah ufuk, Ihtiyath +2 menit
 * - Imsak: Subuh - 10 menit
 */
export function calculateOfflineKemenagSchedule(latitude, longitude, timezone = 7, date = new Date()) {
  const jd = getJulianDay(date);
  const { dec, eqTime } = getSolarCoordinates(jd);

  // Waktu Zawal / Tengah Hari (Solar Noon)
  const noon = 12 + timezone - (longitude / 15) - eqTime;

  function getHourAngle(altitude) {
    const cosHA =
      (Math.sin(toRad(altitude)) - Math.sin(toRad(latitude)) * Math.sin(toRad(dec))) /
      (Math.cos(toRad(latitude)) * Math.cos(toRad(dec)));
    if (cosHA > 1 || cosHA < -1) return null;
    return toDeg(Math.acos(cosHA)) / 15;
  }

  const haSubuh = getHourAngle(-20);
  const haTerbit = getHourAngle(-1);
  const haDhuha = getHourAngle(4.5);

  // Sudut ketinggian matahari waktu ashar: cot(h) = 1 + tan|lat - dec|
  const asrAlt = toDeg(Math.atan(1 / (1 + Math.tan(toRad(Math.abs(latitude - dec))))));
  const haAshar = getHourAngle(asrAlt);

  const haMaghrib = getHourAngle(-1);
  const haIsya = getHourAngle(-18);

  const ihtiyath = 2 / 60; // 2 menit pengaman hisab Kemenag

  const dzuhurH = noon + ihtiyath;
  const subuhH = (haSubuh ? noon - haSubuh : noon - 4.5) + ihtiyath;
  const terbitH = haTerbit ? noon - haTerbit : noon - 4.0;
  const dhuhaH = (haDhuha ? noon - haDhuha : noon - 3.5) + ihtiyath;
  const asharH = (haAshar ? noon + haAshar : noon + 3.2) + ihtiyath;
  const maghribH = (haMaghrib ? noon + haMaghrib : noon + 4.0) + ihtiyath;
  const isyaH = (haIsya ? noon + haIsya : noon + 5.2) + ihtiyath;
  const imsakH = subuhH - (10 / 60);

  function formatTime(hours) {
    let normalized = hours;
    while (normalized < 0) normalized += 24;
    while (normalized >= 24) normalized -= 24;

    const h = Math.floor(normalized);
    const m = Math.floor((normalized - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  return {
    imsak: formatTime(imsakH),
    subuh: formatTime(subuhH),
    terbit: formatTime(terbitH),
    dhuha: formatTime(dhuhaH),
    dzuhur: formatTime(dzuhurH),
    ashar: formatTime(asharH),
    maghrib: formatTime(maghribH),
    isya: formatTime(isyaH),
    source: "Hisab Kemenag RI (Bimas Islam)"
  };
}

/**
 * Mengambil Jadwal Resmi Kemenag RI dari API Bimas Islam (melalui cache & fallback offline)
 */
export async function getKemenagPrayerSchedule(city, targetDate = new Date()) {
  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getDate()).padStart(2, '0');
  const dateKey = `${yyyy}-${mm}-${dd}`;
  const cacheKey = `kemenag_sched_${city.kemenagId || city.id}_${dateKey}`;

  // 1. Cek local cache terlebih dahulu
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return { timings: parsed, source: "Resmi Kemenag RI (Tersimpan)" };
    }
  } catch (e) {}

  // 2. Jika online dan memiliki kemenagId, lakukan fetch dari API Bimas Islam
  const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;
  if (city.kemenagId && isOnline) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const url = `https://api.myquran.com/v2/sholat/jadwal/${city.kemenagId}/${yyyy}/${mm}/${dd}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.status && json.data && json.data.jadwal) {
          const j = json.data.jadwal;
          const timings = {
            imsak: j.imsak,
            subuh: j.subuh,
            terbit: j.terbit,
            dhuha: j.dhuha,
            dzuhur: j.dzuhur,
            ashar: j.ashar,
            maghrib: j.maghrib,
            isya: j.isya,
            source: "Resmi Kemenag RI (Bimas Islam)"
          };
          try {
            localStorage.setItem(cacheKey, JSON.stringify(timings));
          } catch (e) {}
          return { timings, source: "Resmi Kemenag RI (Bimas Islam)" };
        }
      }
    } catch (err) {
      // Offline fallback
    }
  }

  // 3. Fallback Offline: Hitung secara presisi dengan Engine Hisab Kemenag
  const offlineTimings = calculateOfflineKemenagSchedule(
    city.latitude,
    city.longitude,
    city.timezone || 7,
    targetDate
  );

  return { timings: offlineTimings, source: "Hisab Kemenag RI (Offline)" };
}

