import React from 'react';
import { Text } from 'react-native';

/**
 * Panduan & Aturan Warna Tajwid Standar Kemenag RI & Internasional:
 * - RED (#ef4444): Mad Wajib Muttashil, Mad Jaiz Munfashil, Mad Lazim (Tanda maddah ~ \u0653 & \u06E4, panjang 4-6 Harakat)
 * - GREEN (#10b981): Ghunnah Musyaddadah (Nun/Mim bertasydid نّ / مّ, dengung 2 Harakat)
 * - AMBER (#f59e0b): Qalqalah (Huruf Baju Di Toko: ب ج د ط ق bersukun \u0652)
 * - BLUE (#3b82f6): Iqlab (Tanda mim kecil \u06E2 pada nun mati / tanwin)
 * - PURPLE (#a855f7): Idgham & Ikhfa (Tanwin \u064B \u064C \u064D & Nun sukun \u0646\u0652)
 *
 * PENTING:
 * Dalam tipografi kaligrafi Arab (HarfBuzz text-shaping), pemotongan huruf di dalam
 * satu kata menjadi beberapa komponen <Text> yang berbeda akan MEMUTUS ligatur sambungan
 * (huruf menjadi renggang/terpisah, misal 'الْكِتٰبَ' menjadi 'الْكِ  تٰ  بَ' dan 'لَا' terbelah).
 *
 * Oleh karena itu, hukum tajwid diterapkan per-lafadz / per-kata (word-level) secara utuh,
 * sehingga teks mushaf tetap 100% TERSAMBUNG INDAH dan IDENTIK dengan mushaf asli!
 */

export const TAJWEED_COLORS = {
  mad: '#ef4444',      // Merah - Mad Wajib/Jaiz/Lazim (Panjang 4-6 Harakat)
  ghunnah: '#10b981',  // Hijau - Ghunnah Musyaddadah (Dengung 2 Harakat)
  qalqalah: '#f59e0b', // Oranye/Amber - Qalqalah (Memantul: ب ج د ط ق)
  iqlab: '#3b82f6',    // Biru - Iqlab (Tukar ke Mim)
  idgham: '#a855f7',   // Ungu - Idgham & Ikhfa (Melebur & Samar)
};

export const TAJWEED_LEGEND = [
  {
    name: 'Mad (Wajib / Jaiz / Lazim)',
    rule: 'Panjang 4-6 Harakat (Tanda Maddah ~ di atas huruf)',
    color: '#ef4444',
    example: 'السَّمَآءِ / لَآ / الضَّاۤلِّيْنَ',
  },
  {
    name: 'Ghunnah Musyaddadah',
    rule: 'Dengung 2 Harakat (Nun atau Mim Bertasydid)',
    color: '#10b981',
    example: 'إِنَّ / مِمَّا / النَّاسِ',
  },
  {
    name: 'Qalqalah',
    rule: 'Memantul saat sukun (ق, ط, ب, ج, د)',
    color: '#f59e0b',
    example: 'يَجْعَلْ / خَلَقْنَا / أَحَدٌ',
  },
  {
    name: 'Iqlab',
    rule: 'Mengubah Nun Mati / Tanwin jadi Mim (ۢ)',
    color: '#3b82f6',
    example: 'مِنۢ بَعْدِ / أَنۢبِئْهُم',
  },
  {
    name: 'Idgham & Ikhfa',
    rule: 'Melebur atau samar pada tanwin & nun mati',
    color: '#a855f7',
    example: 'مُصَدِّقًا لِّمَا / مَّن يَقُولُ / وَاَنْزَلَ',
  },
];

/**
 * Deteksi hukum tajwid utama pada sebuah kata (lafadz)
 */
export function detectWordTajweed(rawWord) {
  if (!rawWord) return null;

  // Bersihkan tanda waqf akhir ayat agar tidak mengganggu pencocokan regex
  const word = rawWord.replace(/[\u06D6-\u06DC]/g, '');

  // 1. Cek Mad (Maddah ~ \u0653 atau \u06E4)
  if (/[\u0653\u06E4]/.test(word)) {
    return { type: 'mad', name: 'Mad Wajib / Jaiz', color: TAJWEED_COLORS.mad };
  }

  // 2. Cek Iqlab (Tanda Mim kecil \u06E2)
  if (/\u06E2/.test(word)) {
    return { type: 'iqlab', name: 'Iqlab', color: TAJWEED_COLORS.iqlab };
  }

  // 3. Cek Ghunnah (Nun/Mim Tasydid: نّ atau مّ)
  if (/[\u0646\u0645]\u0651/.test(word)) {
    return { type: 'ghunnah', name: 'Ghunnah', color: TAJWEED_COLORS.ghunnah };
  }

  // 4. Cek Qalqalah (ق ط ب ج د bersukun \u0652)
  if (/[\u0642\u0637\u0628\u062c\u062f]\u0652/.test(word)) {
    return { type: 'qalqalah', name: 'Qalqalah', color: TAJWEED_COLORS.qalqalah };
  }

  // 5. Cek Idgham & Ikhfa:
  // Tanwin (ً ٍ ٌ)
  if (/[\u064B\u064C\u064D]/.test(word)) {
    return { type: 'idgham', name: 'Idgham / Ikhfa', color: TAJWEED_COLORS.idgham };
  }
  // Nun sukun (نْ atau nun tanpa harakat sebelum huruf ikhfa)
  if (
    /\u0646\u0652/.test(word) ||
    (/\u0646(?=[\u062A\u062B\u062C\u062F\u0630\u0632\u0633\u0634\u0635\u0636\u0637\u0638\u0641\u0642\u0643])/.test(word) &&
      !/\u0646[\u064E\u064F\u0650]/.test(word))
  ) {
    return { type: 'idgham', name: 'Idgham / Ikhfa', color: TAJWEED_COLORS.idgham };
  }

  return null;
}

/**
 * Mengambil ringkasan aturan tajwid yang terdapat pada suatu ayat
 * untuk ditampilkan sebagai badge/pill edukatif di bawah ayat
 */
export function getAyahTajweedRules(arabicText) {
  if (!arabicText) return [];
  const words = arabicText.split(' ').filter(Boolean);
  const ruleMap = new Map();

  words.forEach((word) => {
    const rule = detectWordTajweed(word);
    if (rule) {
      const cleanWord = word.replace(/[\u06D6-\u06DC]/g, '').trim();
      if (!ruleMap.has(rule.type)) {
        ruleMap.set(rule.type, {
          type: rule.type,
          name: rule.name,
          color: rule.color,
          words: [cleanWord],
        });
      } else {
        const item = ruleMap.get(rule.type);
        if (!item.words.includes(cleanWord)) {
          item.words.push(cleanWord);
        }
      }
    }
  });

  return Array.from(ruleMap.values());
}

/**
 * Render teks Arab dengan pewarnaan tajwid interaktif.
 * Merender per kata utuh tanpa memotong ligatur kaligrafi di dalam huruf.
 */
export function renderTajweedArabic(arabicText, baseStyle = {}, isTajweedActive = true) {
  if (!arabicText) return null;
  if (!isTajweedActive) {
    return <Text style={baseStyle}>{arabicText}</Text>;
  }

  const words = arabicText.split(' ');

  return (
    <Text style={baseStyle}>
      {words.map((word, wIdx) => {
        const rule = detectWordTajweed(word);
        const hasSpace = wIdx < words.length - 1;

        if (rule?.color) {
          return (
            <Text key={`tw_${wIdx}`} style={{ color: rule.color }}>
              {word}{hasSpace ? ' ' : ''}
            </Text>
          );
        }

        return (
          <React.Fragment key={`tw_${wIdx}`}>
            {word}{hasSpace ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </Text>
  );
}
