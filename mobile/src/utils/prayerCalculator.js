// Prayer schedule calculator & Hijri calendar utility

export function getPrayerNames(date = new Date()) {
  const isFriday = date.getDay() === 5;
  return [
    { key: "subuh", label: "Subuh", arabic: "الفجر", icon: "wb_twilight" },
    {
      key: "dzuhur",
      label: isFriday ? "Jum'at" : "Dzuhur",
      arabic: isFriday ? "الجمعة" : "الظهر",
      icon: isFriday ? "mosque" : "wb_sunny",
      isFriday
    },
    { key: "ashar", label: "Ashar", arabic: "العصر", icon: "routine" },
    { key: "maghrib", label: "Maghrib", arabic: "المغرب", icon: "bedtime" },
    { key: "isya", label: "Isya", arabic: "العشاء", icon: "dark_mode" }
  ];
}

export const PRAYER_NAMES = getPrayerNames(new Date());

export const HIJRI_MONTHS = [
  'Muharram', 'Safar', "Rabi'ul Awwal", "Rabi'ul Akhir",
  'Jumadil Awwal', 'Jumadil Akhir', 'Rajab', "Sya'ban",
  'Ramadhan', 'Syawwal', "Dzulqa'dah", 'Dzulhijjah'
];

/**
 * Konversi penanggalan Masehi ke Hijriah secara presisi (Ummul Qura standard)
 * Bebas dari bug Intl Android WebView yang menampilkan bulan Masehi atau 'SM'.
 */
export function getHijriDate(date = new Date(), offsetDays = 0) {
  const details = getHijriDetails(date, offsetDays);
  return details.formatted;
}

/**
 * Menghasilkan rincian lengkap tanggal Hijriah beserta status puasa & hari besar Islam
 */
export function getHijriDetails(date = new Date(), offsetDays = 0) {
  try {
    const d = new Date(date);
    if (offsetDays !== 0) {
      d.setDate(d.getDate() + offsetDays);
    }
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();

    const m = month + 1;
    const y = year;
    const a = Math.floor((14 - m) / 12);
    const y2 = y + 4800 - a;
    const m2 = m + 12 * a - 3;
    let jd = day + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;

    let l = jd - 1948440 + 10632;
    let n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    let j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
    l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    let hijriMonth = Math.floor((24 * l) / 709);
    let hijriDay = l - Math.floor((709 * hijriMonth) / 24);
    let hijriYear = 30 * n + j - 30;

    const monthName = HIJRI_MONTHS[hijriMonth - 1] || 'Ramadhan';

    let event = null;
    let isFastingRecommended = false;
    let fastingLabel = null;
    let eventType = null; // 'eid', 'ramadan', 'sunnah', 'important'

    const dayOfWeek = d.getDay();
    const isMonday = dayOfWeek === 1;
    const isThursday = dayOfWeek === 4;
    const isFriday = dayOfWeek === 5;
    const isAyyamulBidh = hijriDay >= 13 && hijriDay <= 15 && hijriMonth !== 12;

    if (hijriMonth === 1 && hijriDay === 1) {
      event = 'Tahun Baru Islam (1 Muharram)';
      eventType = 'important';
    } else if (hijriMonth === 1 && hijriDay === 9) {
      event = "Hari Tasu'a";
      isFastingRecommended = true;
      fastingLabel = "Puasa Tasu'a";
      eventType = 'sunnah';
    } else if (hijriMonth === 1 && hijriDay === 10) {
      event = 'Hari Asyura';
      isFastingRecommended = true;
      fastingLabel = 'Puasa Asyura';
      eventType = 'sunnah';
    } else if (hijriMonth === 3 && hijriDay === 12) {
      event = 'Maulid Nabi Muhammad SAW';
      eventType = 'important';
    } else if (hijriMonth === 7 && hijriDay === 27) {
      event = "Isra' Mi'raj 144X H";
      eventType = 'important';
    } else if (hijriMonth === 8 && hijriDay === 15) {
      event = "Malam Nisfu Sya'ban";
      eventType = 'important';
    } else if (hijriMonth === 9) {
      if (hijriDay === 1) event = 'Awal Puasa Ramadhan';
      else if (hijriDay === 17) event = "Nuzulul Qur'an";
      else if (hijriDay >= 21 && hijriDay % 2 === 1) event = `Malam Lailatul Qadr (${hijriDay} Ramadhan)`;
      isFastingRecommended = true;
      fastingLabel = 'Puasa Wajib Ramadhan';
      eventType = 'ramadan';
    } else if (hijriMonth === 10 && hijriDay === 1) {
      event = 'Hari Raya Idul Fitri (1 Syawwal)';
      eventType = 'eid';
    } else if (hijriMonth === 10 && hijriDay >= 2 && hijriDay <= 7) {
      isFastingRecommended = true;
      fastingLabel = 'Puasa Sunnah Syawwal';
      eventType = 'sunnah';
    } else if (hijriMonth === 12 && hijriDay === 9) {
      event = 'Hari Arafah';
      isFastingRecommended = true;
      fastingLabel = 'Puasa Sunnah Arafah';
      eventType = 'sunnah';
    } else if (hijriMonth === 12 && hijriDay === 10) {
      event = 'Hari Raya Idul Adha (10 Dzulhijjah)';
      eventType = 'eid';
    } else if (hijriMonth === 12 && [11, 12, 13].includes(hijriDay)) {
      event = `Hari Tasyrik (${hijriDay} Dzulhijjah - Haram Berpuasa)`;
      eventType = 'important';
    }

    if (!fastingLabel) {
      if (isAyyamulBidh) {
        isFastingRecommended = true;
        fastingLabel = 'Puasa Ayyamul Bidh (13-15 Hijriah)';
        eventType = 'sunnah';
      } else if (isMonday) {
        isFastingRecommended = true;
        fastingLabel = 'Puasa Sunnah Senin';
        eventType = 'sunnah';
      } else if (isThursday) {
        isFastingRecommended = true;
        fastingLabel = 'Puasa Sunnah Kamis';
        eventType = 'sunnah';
      }
    }

    return {
      hijriDay,
      hijriMonth,
      monthName,
      hijriYear,
      formatted: `${hijriDay} ${monthName} ${hijriYear} H`,
      event,
      eventType,
      isFastingRecommended,
      fastingLabel,
      isAyyamulBidh,
      isMonday,
      isThursday,
      isFriday
    };
  } catch (e) {
    return {
      hijriDay: 18,
      hijriMonth: 5,
      monthName: 'Jumadil Awwal',
      hijriYear: 1448,
      formatted: '18 Jumadil Awwal 1448 H',
      event: null,
      eventType: null,
      isFastingRecommended: false,
      fastingLabel: null,
      isAyyamulBidh: false,
      isMonday: false,
      isThursday: false,
      isFriday: false
    };
  }
}

/**
 * Menghasilkan grid matriks kalender bulanan lengkap dengan tanggal Masehi & Hijriah
 */
export function getCalendarMonthGrid(year, monthIndex, offsetDays = 0) {
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay(); // 0 = Minggu
  const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const totalDaysPrevMonth = new Date(year, monthIndex, 0).getDate();
  const today = new Date();

  const grid = [];

  // 1. Hari-hari dari bulan sebelumnya (padding awal)
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dNum = totalDaysPrevMonth - i;
    const dateObj = new Date(year, monthIndex - 1, dNum);
    grid.push({
      key: `prev-${dNum}`,
      date: dateObj,
      dayNumber: dNum,
      isCurrentMonth: false,
      isToday: false,
      hijri: getHijriDetails(dateObj, offsetDays),
    });
  }

  // 2. Hari-hari bulan saat ini
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateObj = new Date(year, monthIndex, d);
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === monthIndex &&
      today.getDate() === d;
    grid.push({
      key: `cur-${d}`,
      date: dateObj,
      dayNumber: d,
      isCurrentMonth: true,
      isToday,
      hijri: getHijriDetails(dateObj, offsetDays),
    });
  }

  // 3. Hari-hari dari bulan berikutnya (padding akhir untuk memenuhi grid 7 kolom)
  const remainingCells = (7 - (grid.length % 7)) % 7;
  for (let n = 1; n <= remainingCells; n++) {
    const dateObj = new Date(year, monthIndex + 1, n);
    grid.push({
      key: `next-${n}`,
      date: dateObj,
      dayNumber: n,
      isCurrentMonth: false,
      isToday: false,
      hijri: getHijriDetails(dateObj, offsetDays),
    });
  }

  return grid;
}

/**
 * Mengambil daftar agenda ibadah & hari besar Islam pada bulan tertentu
 */
export function getIslamicEventsForMonth(year, monthIndex, offsetDays = 0) {
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const events = [];

  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, monthIndex, d);
    const hijri = getHijriDetails(dateObj, offsetDays);
    if (hijri.event || hijri.fastingLabel) {
      events.push({
        date: dateObj,
        dayNumber: d,
        dayName: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][dateObj.getDay()],
        hijriFormatted: hijri.formatted,
        event: hijri.event,
        eventType: hijri.eventType,
        fastingLabel: hijri.fastingLabel,
      });
    }
  }

  return events;
}

export function getIndonesianDayDate(date = new Date()) {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  return {
    dayName,
    isFriday: date.getDay() === 5,
    formatted: `${dayName}, ${day} ${monthName} ${year}`
  };
}

export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function getCurrentPrayerStatus(timings, date = new Date()) {
  if (!timings) {
    return {
      currentPrayer: "Subuh",
      currentPrayerKey: "subuh",
      currentPrayerTime: "04:10",
      nextPrayer: "Dzuhur",
      nextPrayerKey: "dzuhur",
      nextPrayerTime: "11:45",
      hoursLeft: 0,
      minsLeft: 0,
      secsLeft: 0,
      hours: "00",
      mins: "00",
      secs: "00",
      progressPercent: 0,
      countdownString: "00:00:00",
      countdownFormatted: "-00:00:00",
      summaryText: "Subuh",
      isFriday: false
    };
  }

  const currentSecondsTotal = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
  const currentMinutes = date.getHours() * 60 + date.getMinutes();

  const subuhM = timeToMinutes(timings.subuh);
  const dzuhurM = timeToMinutes(timings.dzuhur);
  const asharM = timeToMinutes(timings.ashar);
  const maghribM = timeToMinutes(timings.maghrib);
  const isyaM = timeToMinutes(timings.isya);

  let currentPrayer = "isya";
  let nextPrayer = "subuh";
  let prevPrayerMinutes = isyaM;
  let targetMinutes = subuhM;

  if (currentMinutes < subuhM) {
    currentPrayer = "isya";
    nextPrayer = "subuh";
    prevPrayerMinutes = isyaM - 24 * 60;
    targetMinutes = subuhM;
  } else if (currentMinutes >= subuhM && currentMinutes < dzuhurM) {
    currentPrayer = "subuh";
    nextPrayer = "dzuhur";
    prevPrayerMinutes = subuhM;
    targetMinutes = dzuhurM;
  } else if (currentMinutes >= dzuhurM && currentMinutes < asharM) {
    currentPrayer = "dzuhur";
    nextPrayer = "ashar";
    prevPrayerMinutes = dzuhurM;
    targetMinutes = asharM;
  } else if (currentMinutes >= asharM && currentMinutes < maghribM) {
    currentPrayer = "ashar";
    nextPrayer = "maghrib";
    prevPrayerMinutes = asharM;
    targetMinutes = maghribM;
  } else if (currentMinutes >= maghribM && currentMinutes < isyaM) {
    currentPrayer = "maghrib";
    nextPrayer = "isya";
    prevPrayerMinutes = maghribM;
    targetMinutes = isyaM;
  } else {
    // Past Isya, next prayer is Subuh tomorrow
    currentPrayer = "isya";
    nextPrayer = "subuh";
    prevPrayerMinutes = isyaM;
    targetMinutes = subuhM + 24 * 60;
  }

  let targetSecondsTotal = targetMinutes * 60;
  let diffSecTotal = targetSecondsTotal - currentSecondsTotal;
  if (diffSecTotal < 0) {
    diffSecTotal += 24 * 3600;
  }

  const hoursLeft = Math.floor(diffSecTotal / 3600);
  const minsLeft = Math.floor((diffSecTotal % 3600) / 60);
  const secsLeft = diffSecTotal % 60;

  const hStr = String(hoursLeft).padStart(2, '0');
  const mStr = String(minsLeft).padStart(2, '0');
  const sStr = String(secsLeft).padStart(2, '0');

  let windowDuration = (targetMinutes - prevPrayerMinutes);
  if (windowDuration <= 0) windowDuration += 24 * 60;
  const elapsedMinutes = (currentMinutes >= prevPrayerMinutes) 
    ? (currentMinutes - prevPrayerMinutes) 
    : (currentMinutes + 24 * 60 - prevPrayerMinutes);
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMinutes / windowDuration) * 100)));

  const prayerList = getPrayerNames(date);
  const nextPrayerObj = prayerList.find(p => p.key === nextPrayer) || { label: "Subuh" };
  const currentPrayerObj = prayerList.find(p => p.key === currentPrayer) || { label: "Ashar" };

  return {
    currentPrayer: currentPrayerObj.label,
    currentPrayerKey: currentPrayer,
    currentPrayerTime: timings[currentPrayer],
    nextPrayer: nextPrayerObj.label,
    nextPrayerKey: nextPrayer,
    nextPrayerTime: timings[nextPrayer],
    hoursLeft,
    minsLeft,
    secsLeft,
    hours: hStr,
    mins: mStr,
    secs: sStr,
    progressPercent,
    countdownString: `${hStr}:${mStr}:${sStr}`,
    countdownFormatted: `${hStr}:${mStr}:${sStr}`,
    summaryText: `${nextPrayerObj.label} ${hStr}:${mStr}:${sStr}`,
    isFriday: date.getDay() === 5
  };
}
