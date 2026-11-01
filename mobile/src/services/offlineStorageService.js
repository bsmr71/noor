import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base offline storage directories in app's private sandbox
const BASE_DIR = `${FileSystem.documentDirectory}noor_offline/`;
const MUADZIN_DIR = `${BASE_DIR}muadzin/`;
const MUROTTAL_DIR = `${BASE_DIR}murottal/`;
const QURAN_DIR = `${BASE_DIR}quran/`;

// Bundled default adzan asset
export const BUNDLED_DEFAULT_ADZAN = require('../../assets/audio/adzan_default.mp3');

/**
 * Pastikan seluruh direktori penyimpanan offline sudah siap
 */
export async function initOfflineDirectories() {
  try {
    const dirs = [BASE_DIR, MUADZIN_DIR, MUROTTAL_DIR, QURAN_DIR];
    for (const d of dirs) {
      const info = await FileSystem.getInfoAsync(d);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(d, { intermediates: true });
      }
    }
  } catch (err) {
    console.warn('Gagal menginisialisasi direktori offline:', err);
  }
}

// -------------------------------------------------------------
// 1. MANAJEMEN OFFLINE AUDIO MUADZIN
// -------------------------------------------------------------

/**
 * Cek apakah muadzin tersedia secara offline
 */
export async function isMuadzinOffline(muadzinId) {
  // Default muadzin Syaikh Ali Ahmed Mulla langsung terunduh/bundled bawaan
  if (muadzinId === 'mulla') return true;

  try {
    const fileUri = `${MUADZIN_DIR}${muadzinId}.mp3`;
    const info = await FileSystem.getInfoAsync(fileUri);
    return info.exists;
  } catch (e) {
    return false;
  }
}

/**
 * Mendapatkan audio source yang tepat (Asset Bundled, Local File URI, atau Remote URL)
 */
export async function getMuadzinAudioSource(muadzin) {
  if (!muadzin) return BUNDLED_DEFAULT_ADZAN;
  if (muadzin.id === 'mulla') {
    return BUNDLED_DEFAULT_ADZAN;
  }

  const fileUri = `${MUADZIN_DIR}${muadzin.id}.mp3`;
  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) {
      return fileUri;
    }
  } catch (e) {}

  return muadzin.audioUrl;
}

/**
 * Unduh audio muadzin ke penyimpanan offline
 */
export async function downloadMuadzinAudio(muadzin, onProgress = null) {
  if (!muadzin || !muadzin.audioUrl) throw new Error('Data muadzin tidak valid');
  if (muadzin.id === 'mulla') return true; // Default selalu offline

  await initOfflineDirectories();
  const fileUri = `${MUADZIN_DIR}${muadzin.id}.mp3`;

  const downloadResumable = FileSystem.createDownloadResumable(
    muadzin.audioUrl,
    fileUri,
    {},
    (downloadProgress) => {
      if (onProgress && downloadProgress.totalBytesExpectedToWrite > 0) {
        const progress =
          downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        onProgress(Math.min(1, Math.max(0, progress)));
      }
    }
  );

  const result = await downloadResumable.downloadAsync();
  if (result && result.uri) {
    await AsyncStorage.setItem(`@noor_muadzin_offline_${muadzin.id}`, result.uri);
    return result.uri;
  }
  throw new Error('Gagal mengunduh audio muadzin');
}

/**
 * Hapus audio muadzin yang telah diunduh
 */
export async function deleteMuadzinAudio(muadzinId) {
  if (muadzinId === 'mulla') return; // Default tidak dapat dihapus
  try {
    const fileUri = `${MUADZIN_DIR}${muadzinId}.mp3`;
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
    await AsyncStorage.removeItem(`@noor_muadzin_offline_${muadzinId}`);
  } catch (e) {
    console.warn('Gagal menghapus audio muadzin:', e);
  }
}

// -------------------------------------------------------------
// 2. MANAJEMEN OFFLINE TEKS AL-QUR'AN
// -------------------------------------------------------------

/**
 * Simpan data surah ke cache offline (AsyncStorage & Local File)
 */
export async function cacheSurahText(surahNumber, surahData) {
  if (!surahNumber || !surahData) return;
  try {
    await AsyncStorage.setItem(`@noor_surah_text_${surahNumber}`, JSON.stringify(surahData));
  } catch (e) {
    console.warn('Gagal menyimpan cache surah:', e);
  }
}

/**
 * Ambil data surah dari penyimpanan offline
 */
export async function getCachedSurahText(surahNumber) {
  try {
    const cached = await AsyncStorage.getItem(`@noor_surah_text_${surahNumber}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {}
  return null;
}

/**
 * Cek apakah teks surah sudah terunduh
 */
export async function isSurahTextDownloaded(surahNumber) {
  try {
    const cached = await AsyncStorage.getItem(`@noor_surah_text_${surahNumber}`);
    return !!cached;
  } catch (e) {
    return false;
  }
}

// -------------------------------------------------------------
// 3. MANAJEMEN OFFLINE AUDIO MUROTTAL (PER-SURAT & PER-AYAT)
// -------------------------------------------------------------

/**
 * Cek apakah audio satu surat penuh sudah diunduh
 */
export async function isSurahAudioOffline(surahNumber, qoriId = 'alafasy') {
  try {
    const fileUri = `${MUROTTAL_DIR}surah_${surahNumber}_${qoriId}.mp3`;
    const info = await FileSystem.getInfoAsync(fileUri);
    return info.exists;
  } catch (e) {
    return false;
  }
}

/**
 * Dapatkan URI audio surat (lokal jika ada, atau fallback URL online)
 */
export async function getSurahAudioSource(surahNumber, qoriId = 'alafasy', fallbackUrl = null) {
  const fileUri = `${MUROTTAL_DIR}surah_${surahNumber}_${qoriId}.mp3`;
  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) {
      return fileUri;
    }
  } catch (e) {}
  return fallbackUrl;
}

/**
 * Unduh audio satu surat penuh
 */
export async function downloadSurahAudio(surahNumber, qoriId = 'alafasy', remoteUrl, onProgress = null) {
  if (!remoteUrl) throw new Error('URL audio surat tidak ditemukan');
  await initOfflineDirectories();
  const fileUri = `${MUROTTAL_DIR}surah_${surahNumber}_${qoriId}.mp3`;

  try {
    const downloadResumable = FileSystem.createDownloadResumable(
      remoteUrl,
      fileUri,
      {},
      (downloadProgress) => {
        if (onProgress && downloadProgress.totalBytesExpectedToWrite > 0) {
          const progress =
            downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          onProgress(Math.min(1, Math.max(0, progress)));
        }
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (result && result.uri) {
      await AsyncStorage.setItem(`@noor_audio_surah_${surahNumber}_${qoriId}`, result.uri);
      return result.uri;
    }
  } catch (err) {
    console.warn(`Gagal download surah ${surahNumber} via resumable, mencoba direct downloadAsync:`, err);
    const directResult = await FileSystem.downloadAsync(remoteUrl, fileUri);
    if (directResult && directResult.uri) {
      await AsyncStorage.setItem(`@noor_audio_surah_${surahNumber}_${qoriId}`, directResult.uri);
      return directResult.uri;
    }
    throw err;
  }
  throw new Error('Gagal mengunduh audio surat');
}

/**
 * Hapus audio surat
 */
export async function deleteSurahAudio(surahNumber, qoriId = 'alafasy') {
  try {
    const fileUri = `${MUROTTAL_DIR}surah_${surahNumber}_${qoriId}.mp3`;
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
    await AsyncStorage.removeItem(`@noor_audio_surah_${surahNumber}_${qoriId}`);
  } catch (e) {}
}

/**
 * Cek apakah audio per-ayat sudah diunduh
 */
export async function isAyahAudioOffline(surahNumber, ayahNumber, qoriId = 'alafasy') {
  try {
    const fileUri = `${MUROTTAL_DIR}ayah_${surahNumber}_${ayahNumber}_${qoriId}.mp3`;
    const info = await FileSystem.getInfoAsync(fileUri);
    return info.exists;
  } catch (e) {
    return false;
  }
}

/**
 * Dapatkan URI audio ayat
 */
export async function getAyahAudioSource(surahNumber, ayahNumber, qoriId = 'alafasy', fallbackUrl = null) {
  const fileUri = `${MUROTTAL_DIR}ayah_${surahNumber}_${ayahNumber}_${qoriId}.mp3`;
  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) {
      return fileUri;
    }
  } catch (e) {}
  return fallbackUrl;
}

/**
 * Unduh audio per-ayat
 */
export async function downloadAyahAudio(surahNumber, ayahNumber, qoriId = 'alafasy', remoteUrl) {
  if (!remoteUrl) throw new Error('URL audio ayat tidak ditemukan');
  await initOfflineDirectories();
  const fileUri = `${MUROTTAL_DIR}ayah_${surahNumber}_${ayahNumber}_${qoriId}.mp3`;

  try {
    const downloadResumable = FileSystem.createDownloadResumable(remoteUrl, fileUri);
    const result = await downloadResumable.downloadAsync();
    if (result && result.uri) {
      await AsyncStorage.setItem(
        `@noor_audio_ayah_${surahNumber}_${ayahNumber}_${qoriId}`,
        result.uri
      );
      return result.uri;
    }
  } catch (err) {
    const directResult = await FileSystem.downloadAsync(remoteUrl, fileUri);
    if (directResult && directResult.uri) {
      await AsyncStorage.setItem(
        `@noor_audio_ayah_${surahNumber}_${ayahNumber}_${qoriId}`,
        directResult.uri
      );
      return directResult.uri;
    }
    throw err;
  }
  throw new Error('Gagal mengunduh audio ayat');
}

// -------------------------------------------------------------
// 4. CACHE TAFSIR RESMI KEMENAG RI
// -------------------------------------------------------------

export async function cacheSurahTafsir(surahNumber, tafsirData) {
  if (!surahNumber || !tafsirData) return;
  try {
    await AsyncStorage.setItem(`@noor_tafsir_${surahNumber}`, JSON.stringify(tafsirData));
  } catch (e) {}
}

export async function getCachedSurahTafsir(surahNumber) {
  try {
    const raw = await AsyncStorage.getItem(`@noor_tafsir_${surahNumber}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

// -------------------------------------------------------------
// 5. RIWAYAT TERAKHIR BACA & PENANDA AYAT (BOOKMARKS)
// -------------------------------------------------------------

export async function saveLastRead(surahNumber, surahLatin, ayahNumber, totalAyah = 7) {
  try {
    const data = {
      surahNumber: Number(surahNumber),
      surahLatin,
      ayahNumber: Number(ayahNumber),
      totalAyah: Number(totalAyah),
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem('@noor_last_read', JSON.stringify(data));
    return data;
  } catch (e) {
    return null;
  }
}

export async function getLastRead() {
  try {
    const raw = await AsyncStorage.getItem('@noor_last_read');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export async function getBookmarks() {
  try {
    const raw = await AsyncStorage.getItem('@noor_quran_bookmarks');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export async function toggleBookmark(bookmarkItem) {
  try {
    const bookmarks = await getBookmarks();
    const sNum = Number(bookmarkItem.surahNumber);
    const aNum = Number(bookmarkItem.ayahNumber);
    const id = `${sNum}:${aNum}`;
    const exists = bookmarks.some((b) => `${Number(b.surahNumber)}:${Number(b.ayahNumber)}` === id);

    let next;
    if (exists) {
      next = bookmarks.filter((b) => `${Number(b.surahNumber)}:${Number(b.ayahNumber)}` !== id);
    } else {
      next = [
        {
          id,
          surahNumber: sNum,
          surahLatin: bookmarkItem.surahLatin,
          ayahNumber: aNum,
          teksArab: bookmarkItem.teksArab,
          teksIndonesia: bookmarkItem.teksIndonesia,
          createdAt: Date.now(),
        },
        ...bookmarks,
      ];
    }
    await AsyncStorage.setItem('@noor_quran_bookmarks', JSON.stringify(next));
    return !exists;
  } catch (e) {
    return false;
  }
}


