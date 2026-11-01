import React from 'react';
import { Text } from 'react-native';

/**
 * Panduan & Aturan Warna Tajwid Standar Kemenag RI & Internasional:
 * - RED (#ef4444): Mad Wajib / Mad Jaiz / Mad Thabi'i (Tanda maddah ~ \u0653 & Alif Khanjar \u0670)
 * - GREEN (#10b981): Ghunnah (Nun/Mim bertasydid نّ / مّ & Ikhfa)
 * - AMBER (#f59e0b): Qalqalah (Huruf Baju Di Toko: ب ج د ط ق bersukun \u0652)
 * - BLUE (#3b82f6): Iqlab (Tanda mim kecil \u06e2)
 * - PURPLE (#a855f7): Idgham (Tasydid idgham)
 */

export const TAJWEED_COLORS = {
  mad: '#ef4444',      // Merah - Mad (Panjang 2-6 Harakat)
  ghunnah: '#10b981',  // Hijau - Ghunnah / Dengung (2 Harakat)
  qalqalah: '#f59e0b', // Oranye/Amber - Qalqalah (Memantul: ب ج د ط ق)
  iqlab: '#3b82f6',    // Biru - Iqlab (Tukar ke Mim)
  idgham: '#a855f7',   // Ungu - Idgham (Melebur)
};

export const TAJWEED_LEGEND = [
  {
    name: 'Mad (Wajib/Jaiz/Thabi\'i)',
    rule: 'Panjang 2-6 Harakat (Tanda Maddah ~ & Alif Tegak)',
    color: '#ef4444',
    example: 'السَّمَآءِ / الرَّحْمَٰنِ',
  },
  {
    name: 'Ghunnah & Ikhfa',
    rule: 'Dengung 2 Harakat (Nun/Mim Bertasydid & Ikhfa)',
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
    rule: 'Mengubah Nun Mati / Tanwin jadi Mim (م)',
    color: '#3b82f6',
    example: 'مِنۢ بَعْدِ',
  },
  {
    name: 'Idgham',
    rule: 'Melebur ke huruf berikutnya',
    color: '#a855f7',
    example: 'مَّن يَقُولُ / مِن رَّبِّهِمْ',
  },
];

/**
 * Render teks Arab dengan pewarnaan tajwid interaktif.
 * Mengelompokkan karakter biasa agar ligatur kaligrafi Arab tetap tersambung rapi.
 */
export function renderTajweedArabic(arabicText, baseStyle = {}, isTajweedActive = true) {
  if (!arabicText) return null;
  if (!isTajweedActive) {
    return <Text style={baseStyle}>{arabicText}</Text>;
  }

  const words = arabicText.split(' ');
  const renderedWords = [];

  words.forEach((word, wIdx) => {
    let cursor = 0;
    const segments = [];
    let plainBuffer = '';

    const flushPlain = () => {
      if (plainBuffer.length > 0) {
        segments.push({ text: plainBuffer, color: null });
        plainBuffer = '';
      }
    };

    while (cursor < word.length) {
      // 1. Cek Mad (Maddah ~ \u0653 atau Alif Khanjar \u0670)
      if (word[cursor] === '\u0653' || word[cursor] === '\u0670') {
        flushPlain();
        segments.push({
          text: word[cursor],
          color: TAJWEED_COLORS.mad,
        });
        cursor += 1;
        continue;
      }

      if (cursor + 1 < word.length && (word[cursor + 1] === '\u0653' || word[cursor + 1] === '\u0670')) {
        flushPlain();
        segments.push({
          text: word.substr(cursor, 2),
          color: TAJWEED_COLORS.mad,
        });
        cursor += 2;
        continue;
      }

      // 2. Cek Iqlab (Tanda Mim kecil \u06E2)
      if (word[cursor] === '\u06E2' || (cursor + 1 < word.length && word[cursor + 1] === '\u06E2')) {
        flushPlain();
        const charLen = word[cursor] === '\u06E2' ? 1 : 2;
        segments.push({
          text: word.substr(cursor, charLen),
          color: TAJWEED_COLORS.iqlab,
        });
        cursor += charLen;
        continue;
      }

      // 3. Cek Ghunnah (Nun/Mim Tasydid: نّ atau مّ)
      if (
        (word[cursor] === '\u0646' || word[cursor] === '\u0645') &&
        cursor + 1 < word.length &&
        word[cursor + 1] === '\u0651'
      ) {
        flushPlain();
        let len = 2;
        if (cursor + 2 < word.length && /[\u064B-\u0652]/.test(word[cursor + 2])) {
          len = 3;
        }
        segments.push({
          text: word.substr(cursor, len),
          color: TAJWEED_COLORS.ghunnah,
        });
        cursor += len;
        continue;
      }

      // 4. Cek Qalqalah (ق ط ب ج د sukun \u0652)
      if (
        /[\u0642\u0637\u0628\u062c\u062f]/.test(word[cursor]) &&
        cursor + 1 < word.length &&
        word[cursor + 1] === '\u0652'
      ) {
        flushPlain();
        segments.push({
          text: word.substr(cursor, 2),
          color: TAJWEED_COLORS.qalqalah,
        });
        cursor += 2;
        continue;
      }

      // Karakter biasa - kumpulkan di buffer agar ligatur tidak terputus
      plainBuffer += word[cursor];
      cursor++;
    }

    flushPlain();
    renderedWords.push(segments);
  });

  return (
    <Text style={baseStyle}>
      {renderedWords.map((segments, wIndex) => (
        <React.Fragment key={`w_${wIndex}`}>
          {segments.map((seg, sIndex) => (
            <Text
              key={`s_${wIndex}_${sIndex}`}
              style={seg.color ? { color: seg.color, fontWeight: 'bold' } : null}
            >
              {seg.text}
            </Text>
          ))}
          {wIndex < renderedWords.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </Text>
  );
}
