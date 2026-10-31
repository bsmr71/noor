// Kalkulator Arah Kiblat Berdasarkan Rumus Spherical Trigonometry Resmi Kemenag RI
// (Badan Hisab Rukyat Kementerian Agama Republik Indonesia)

// Koordinat Ka'bah di Masjidil Haram, Makkah Al-Mukarramah
export const KABAH_COORDINATES = {
  latitude: 21.422487, // 21° 25' 21.04" N
  longitude: 39.826206, // 39° 49' 34.08" E
  name: "Ka'bah, Masjidil Haram"
};

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

/**
 * Mendapatkan arah mata angin 16-point standar internasional
 */
function getCardinalDirection(deg) {
  const directions = [
    { code: "U", name: "Utara" },
    { code: "UTL", name: "Utara-Timur Laut" },
    { code: "TL", name: "Timur Laut" },
    { code: "TTL", name: "Timur-Timur Laut" },
    { code: "T", name: "Timur" },
    { code: "TTG", name: "Timur-Tenggara" },
    { code: "TG", name: "Tenggara" },
    { code: "STG", name: "Selatan-Tenggara" },
    { code: "S", name: "Selatan" },
    { code: "SBD", name: "Selatan-Barat Daya" },
    { code: "BD", name: "Barat Daya" },
    { code: "BBD", name: "Barat-Barat Daya" },
    { code: "B", name: "Barat" },
    { code: "BBL", name: "Barat-Barat Laut" },
    { code: "BL", name: "Barat Laut" },
    { code: "UBL", name: "Utara-Barat Laut" }
  ];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

/**
 * Menghitung Arah Kiblat (Azimuth) dari koordinat lokasi manapun di bumi
 * Rumus Standar Hisab Rukyat Kemenag RI:
 * tan(B) = sin(deltaLambda) / (cos(phi) * tan(phiK) - sin(phi) * cos(deltaLambda))
 * 
 * @param {number} latitude - Garis lintang pengamat (-90 s/d 90)
 * @param {number} longitude - Garis bujur pengamat (-180 s/d 180)
 * @returns {object} { azimuth, fromNorth, fromWest, distanceKm, directionText }
 */
export function calculateQibla(latitude, longitude) {
  const phiK = toRad(KABAH_COORDINATES.latitude);
  const phi = toRad(latitude);
  const deltaLambda = toRad(KABAH_COORDINATES.longitude - longitude);

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaLambda);

  // Azimuth searah jarum jam dari Utara Sejati (0° - 360°)
  let azimuth = toDeg(Math.atan2(y, x));
  if (azimuth < 0) azimuth += 360;

  // Jarak ke Ka'bah menggunakan formula Haversine lingkaran besar
  const R = 6371; // Radius rata-rata bumi (km)
  const dLat = phiK - phi;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(phi) * Math.cos(phiK) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  const cardinal = getCardinalDirection(azimuth);

  // Format Standar Kemenag untuk Indonesia (derajat dari Barat condong ke Utara / U-B)
  let fromWest = "";
  if (azimuth >= 270 && azimuth <= 360) {
    const uDeg = (azimuth - 270).toFixed(1);
    fromWest = `${uDeg}° U-B`;
  } else if (azimuth >= 180 && azimuth < 270) {
    const sDeg = (270 - azimuth).toFixed(1);
    fromWest = `${sDeg}° S-B`;
  } else {
    fromWest = `${cardinal.code}`;
  }

  return {
    azimuth: Number(azimuth.toFixed(1)),
    bearingString: `${azimuth.toFixed(1)}°`,
    fromWest,
    directionText: cardinal.name,
    cardinalCode: cardinal.code,
    distanceKm
  };
}
