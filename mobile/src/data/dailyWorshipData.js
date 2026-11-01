/**
 * Daily Worship Data (Target Ibadah Adaptif & Ayat Pilihan Hari Ini)
 * Menyesuaikan target ibadah dan ayat inspirasi berdasarkan waktu sholat/jam hari ini.
 */

// -------------------------------------------------------------
// 1. KOLEKSI AYAT PILIHAN HARI INI (TIME-ADAPTIVE & RANDOMIZABLE)
// -------------------------------------------------------------
export const DAILY_VERSES = [
  {
    id: 'baqarah-152',
    timeSlot: 'all',
    surahName: 'QS. Al-Baqarah: 152',
    surahNumber: 2,
    ayahNumber: 152,
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    latin: 'Fadzkuruuniii adzkurkum washkuruu lii wa laa takfuruun.',
    translation:
      'Maka ingatlah kepada-Ku, niscaya Aku akan ingat kepadamu. Bersyukurlah kepada-Ku, dan janganlah kamu mengingkari (nikmat)-Ku.',
    audioUrl: 'https://server8.mp3quran.net/afs/002152.mp3',
    theme: 'Dzikir & Syukur',
  },
  {
    id: 'duha-3-5',
    timeSlot: 'morning',
    surahName: 'QS. Ad-Duha: 4-5',
    surahNumber: 93,
    ayahNumber: 4,
    arabic: 'وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ ۝ وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',
    latin: 'Wa lal-aakhiratu khairul laka minal-uulaa. Wa lasaufa yu’tiika rabbuka fatardhaa.',
    translation:
      'Dan sungguh, akhirat itu lebih baik bagimu daripada permulaan (dunia). Dan sungguh, kelak Tuhanmu pasti memberikan karunia-Nya kepadamu, sehingga engkau menjadi puas.',
    audioUrl: 'https://server8.mp3quran.net/afs/093004.mp3',
    theme: 'Harapan & Karunia Pagi',
  },
  {
    id: 'insyirah-5-6',
    timeSlot: 'noon',
    surahName: 'QS. Al-Insyirah: 5-6',
    surahNumber: 94,
    ayahNumber: 5,
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    latin: 'Fa inna ma’al-‘usri yusraa. Inna ma’al-‘usri yusraa.',
    translation:
      'Maka sesungguhnya bersama kesulitan ada kemudahan, sesungguhnya bersama kesulitan ada kemudahan.',
    audioUrl: 'https://server8.mp3quran.net/afs/094005.mp3',
    theme: 'Optimisme & Kemudahan',
  },
  {
    id: 'ibrahim-7',
    timeSlot: 'afternoon',
    surahName: 'QS. Ibrahim: 7',
    surahNumber: 14,
    ayahNumber: 7,
    arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ',
    latin: 'La-in syakartum la-aziidannakum wa la-in kafartum inna ‘adzaabii lasyadiid.',
    translation:
      'Sesungguhnya jika kamu bersyukur, niscaya Aku akan menambah (nikmat) kepadamu, tetapi jika kamu mengingkari (nikmat-Ku), sesungguhnya azab-Ku sangat pedih.',
    audioUrl: 'https://server8.mp3quran.net/afs/014007.mp3',
    theme: 'Janji Berkah Bersyukur',
  },
  {
    id: 'mulk-1-2',
    timeSlot: 'night',
    surahName: 'QS. Al-Mulk: 1-2',
    surahNumber: 67,
    ayahNumber: 1,
    arabic: 'تَبٰرَكَ الَّذِيْ بِيَدِهِ الْمُلْكُۖ وَهُوَ عَلٰى كُلِّ شَيْءٍ قَدِيْرٌ',
    latin: 'Tabaarakal ladzii biyadihil mulku wa huwa ‘alaa kulli syai-in qadiir.',
    translation:
      'Mahasuci Allah yang di tangan-Nyalah segala kerajaan, dan Dia Mahakuasa atas segala sesuatu.',
    audioUrl: 'https://server8.mp3quran.net/afs/067001.mp3',
    theme: 'Pelindung Malam & Keagungan',
  },
  {
    id: 'isra-79',
    timeSlot: 'dawn',
    surahName: 'QS. Al-Isra: 79',
    surahNumber: 17,
    ayahNumber: 79,
    arabic: 'وَمِنَ الَّيْلِ فَتَهَجَّدْ بِهٖ نَافِلَةً لَّكَۖ عَسٰٓى اَنْ يَّبْعَثَكَ رَبُّكَ مَقَامًا مَّحْمُوْدًا',
    latin: 'Wa minal laili fatahajjad bihii naafilatal laka ‘asaaa any yab’atsaka rabbuka maqaamam mahmuudaa.',
    translation:
      'Dan pada sebagian malam, lakukanlah sholat tahajjud (sebagai suatu ibadah) tambahan bagimu; mudah-mudahan Tuhanmu mengangkatmu ke tempat yang terpuji.',
    audioUrl: 'https://server8.mp3quran.net/afs/017079.mp3',
    theme: 'Kemuliaan Tahajjud Sepertiga Malam',
  },
  {
    id: 'baqarah-286',
    timeSlot: 'night',
    surahName: 'QS. Al-Baqarah: 286',
    surahNumber: 2,
    ayahNumber: 286,
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    latin: 'Laa yukallifullaahu nafsan illaa wus’ahaa.',
    translation:
      'Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.',
    audioUrl: 'https://server8.mp3quran.net/afs/002286.mp3',
    theme: 'Ketenangan Jiwa',
  },
  {
    id: 'aliimran-139',
    timeSlot: 'noon',
    surahName: 'QS. Ali ‘Imran: 139',
    surahNumber: 3,
    ayahNumber: 139,
    arabic: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ',
    latin: 'Wa laa tahinuu wa laa tahzanuu wa antumul-a’launa in kuntum mu’miniin.',
    translation:
      'Dan janganlah kamu (merasa) lemah, dan janganlah (pula) bersedih hati, sebab kamu paling tinggi (derajatnya), jika kamu orang yang beriman.',
    audioUrl: 'https://server8.mp3quran.net/afs/003139.mp3',
    theme: 'Keteguhan Hati',
  },
  {
    id: 'zumar-53',
    timeSlot: 'afternoon',
    surahName: 'QS. Az-Zumar: 53',
    surahNumber: 39,
    ayahNumber: 53,
    arabic: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
    latin: 'Qul yaa ‘ibaadiyal-ladziina asrafuu ‘alaa anfusihim laa taqnathuu mir rahmatillaah.',
    translation:
      'Katakanlah: "Wahai hamba-hamba-Ku yang melampaui batas terhadap diri mereka sendiri! Janganlah kamu berputus asa dari rahmat Allah."',
    audioUrl: 'https://server8.mp3quran.net/afs/039053.mp3',
    theme: 'Rahmat & Harapan Ampunan',
  },
  {
    id: 'furqan-64',
    timeSlot: 'dawn',
    surahName: 'QS. Al-Furqan: 64',
    surahNumber: 25,
    ayahNumber: 64,
    arabic: 'وَالَّذِينَ يَبِيتُونَ لِرَبِّهِمْ سُجَّدًا وَقِيَامًا',
    latin: 'Walladziina yabiituuna lirabbihim sujjadaw wa qiyaamaa.',
    translation:
      'Dan orang-orang yang menghabiskan waktu malam untuk beribadah kepada Tuhan mereka dengan bersujud dan berdiri.',
    audioUrl: 'https://server8.mp3quran.net/afs/025064.mp3',
    theme: 'Hamba Ar-Rahman di Malam Hari',
  },
];

/**
 * Mengambil ayat berdasarkan waktu saat ini
 */
export function getVerseForCurrentTime() {
  const hour = new Date().getHours();
  let preferredSlot = 'morning';

  if (hour >= 0 && hour < 4) {
    preferredSlot = 'dawn';
  } else if (hour >= 4 && hour < 11) {
    preferredSlot = 'morning';
  } else if (hour >= 11 && hour < 15) {
    preferredSlot = 'noon';
  } else if (hour >= 15 && hour < 18) {
    preferredSlot = 'afternoon';
  } else {
    preferredSlot = 'night';
  }

  const matching = DAILY_VERSES.filter(
    (v) => v.timeSlot === preferredSlot || v.timeSlot === 'all'
  );
  if (matching.length > 0) {
    const randomIndex = Math.floor(Math.random() * matching.length);
    return matching[randomIndex];
  }

  return DAILY_VERSES[0];
}

/**
 * Mengambil ayat acak dari daftar yang tidak sama dengan ID sekarang
 */
export function getRandomVerse(currentVerseId = null) {
  const filtered = DAILY_VERSES.filter((v) => v.id !== currentVerseId);
  const pool = filtered.length > 0 ? filtered : DAILY_VERSES;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

// -------------------------------------------------------------
// 2. TARGET IBADAH HARIAN ADAPTIF SESUAI WAKTU (HABIT TRACKER)
// -------------------------------------------------------------

export function getHabitSessionInfo(isFriday = false) {
  const hour = new Date().getHours();

  if (hour >= 0 && hour < 4) {
    return {
      sessionKey: 'dawn',
      sessionName: 'Sesi Sepertiga Malam',
      sessionBadge: 'Qiyamul Lail',
      sessionIcon: 'weather-night',
      habits: [
        { id: 'tahajjud', title: 'Sholat Tahajjud', sub: 'Minimal 2 Rakaat Sunnah Malam', icon: 'weather-night' },
        { id: 'witir', title: 'Sholat Witir', sub: 'Ganjil Penutup Sholat Malam', icon: 'star-crescent' },
        { id: 'istighfar_sahar', title: 'Istighfar Waktu Sahar', sub: 'Memohon ampunan sebelum fajar', icon: 'heart-outline' },
        { id: 'persiapan_subuh', title: 'Persiapan Subuh', sub: 'Menyambut seruan adzan fajar', icon: 'clock-check-outline' },
      ],
    };
  }

  if (hour >= 4 && hour < 11) {
    return {
      sessionKey: 'morning',
      sessionName: 'Sesi Pagi',
      sessionBadge: 'Fajar & Dhuha',
      sessionIcon: 'weather-sunset-up',
      habits: [
        { id: 'subuh', title: 'Sholat Subuh', sub: 'Tepat Waktu Berjamaah', icon: 'weather-sunset-up' },
        { id: 'dzikir_pagi', title: 'Dzikir Pagi', sub: 'Al-Ma’tsurat & Doa Perlindungan', icon: 'hands-pray' },
        { id: 'dhuha', title: 'Sholat Dhuha', sub: '2 - 8 Rakaat Pembuka Rezeki', icon: 'white-balance-sunny' },
        { id: 'tilawah_pagi', title: 'Tilawah 1 Juz', sub: 'Awali hari dengan Kalamullah', icon: 'book-open-variant' },
      ],
    };
  }

  if (hour >= 11 && hour < 15) {
    return {
      sessionKey: 'noon',
      sessionName: 'Sesi Siang',
      sessionBadge: isFriday ? "Jum'at Berkah" : 'Siang Berkah',
      sessionIcon: 'white-balance-sunny',
      habits: [
        {
          id: 'dzuhur',
          title: isFriday ? "Sholat Jum'at" : 'Sholat Dzuhur',
          sub: isFriday ? 'Mendengarkan khutbah & berjamaah' : 'Tepat Waktu di Masjid',
          icon: 'mosque',
        },
        { id: 'rawatib_dzuhur', title: 'Sholat Rawatib', sub: 'Qobliyah & Ba’diyah Dzuhur', icon: 'check-decagram-outline' },
        { id: 'sedekah_siang', title: 'Sedekah Harian', sub: 'Infaq berkah melapangkan rizki', icon: 'hand-coin-outline' },
        { id: 'tadabbur_siang', title: 'Tadabbur Ayat', sub: 'Istirahat & membaca Al-Qur’an', icon: 'book-outline' },
      ],
    };
  }

  if (hour >= 15 && hour < 18) {
    return {
      sessionKey: 'afternoon',
      sessionName: 'Sesi Sore',
      sessionBadge: 'Petang Berkah',
      sessionIcon: 'weather-sunset',
      habits: [
        { id: 'ashar', title: 'Sholat Ashar', sub: 'Tepat Waktu di Awal Waktu', icon: 'weather-sunset' },
        { id: 'dzikir_petang', title: 'Dzikir Petang', sub: 'Benteng diri menyambut malam', icon: 'shield-moon-outline' },
        { id: 'shalawat_sore', title: 'Perbanyak Shalawat', sub: 'Shalawat atas Nabi Muhammad SAW', icon: 'heart-multiple-outline' },
        { id: 'doa_petang', title: 'Doa Petang Mustajab', sub: 'Menanti tibanya adzan Maghrib', icon: 'hands-pray' },
      ],
    };
  }

  // Malam (18:00 - 23:59)
  return {
    sessionKey: 'night',
    sessionName: 'Sesi Malam',
    sessionBadge: 'Malam Tenang',
    sessionIcon: 'moon-waning-crescent',
    habits: [
      { id: 'maghrib', title: 'Sholat Maghrib', sub: 'Tepat Waktu & Sholat Sunnah', icon: 'weather-sunset-down' },
      { id: 'isya', title: 'Sholat Isya & Ba’diyah', sub: 'Tepat Waktu Berjamaah', icon: 'moon-waning-crescent' },
      { id: 'surah_almulk', title: 'Surah Al-Mulk', sub: 'Pelindung sebelum tidur', icon: 'book-open-page-variant' },
      { id: 'muhasabah_tidur', title: 'Muhasabah & Doa Tidur', sub: 'Bersuci wudhu & doa sebelum tidur', icon: 'bed-outline' },
    ],
  };
}

