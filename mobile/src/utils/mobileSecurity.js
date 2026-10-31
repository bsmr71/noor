import { Platform } from 'react-native';

export const MOBILE_APP_ID =
  process.env.EXPO_PUBLIC_APP_ID || 'com.noor.islamicapp';

const MOBILE_APP_SECRET =
  process.env.EXPO_PUBLIC_API_SECRET ||
  'noor_mobile_hmac_9f8e7d6c5b4a39281726354453627180_prod_v1';

// Standard FIPS 180-4 SHA-256 Round Constants
const K256 = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function utf8ToBytes(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0xd800 || code >= 0xe000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      i++;
      code = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    }
  }
  return bytes;
}

function rotr(n, x) {
  return (x >>> n) | (x << (32 - n));
}

export function sha256Bytes(msgBytes) {
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const bitLen = msgBytes.length * 8;
  const padded = msgBytes.slice();
  padded.push(0x80);
  while ((padded.length % 64) !== 56) {
    padded.push(0x00);
  }
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  padded.push(
    (hi >>> 24) & 0xff, (hi >>> 16) & 0xff, (hi >>> 8) & 0xff, hi & 0xff,
    (lo >>> 24) & 0xff, (lo >>> 16) & 0xff, (lo >>> 8) & 0xff, lo & 0xff
  );

  const w = new Array(64);
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) {
      const j = offset + i * 4;
      w[i] =
        ((padded[j] << 24) | (padded[j + 1] << 16) | (padded[j + 2] << 8) | padded[j + 3]) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = (rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3)) >>> 0;
      const s1 = (rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10)) >>> 0;
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = (rotr(6, e) ^ rotr(11, e) ^ rotr(25, e)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = (h + S1 + ch + K256[i] + w[i]) >>> 0;
      const S0 = (rotr(2, a) ^ rotr(13, a) ^ rotr(22, a)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const out = [];
  for (const word of [h0, h1, h2, h3, h4, h5, h6, h7]) {
    out.push((word >>> 24) & 0xff, (word >>> 16) & 0xff, (word >>> 8) & 0xff, word & 0xff);
  }
  return out;
}

export function hmacSha256Hex(keyStr, messageStr) {
  let keyBytes = utf8ToBytes(keyStr);
  if (keyBytes.length > 64) {
    keyBytes = sha256Bytes(keyBytes);
  }
  while (keyBytes.length < 64) {
    keyBytes.push(0x00);
  }

  const oKeyPad = new Array(64);
  const iKeyPad = new Array(64);
  for (let i = 0; i < 64; i++) {
    oKeyPad[i] = keyBytes[i] ^ 0x5c;
    iKeyPad[i] = keyBytes[i] ^ 0x36;
  }

  const innerHash = sha256Bytes(iKeyPad.concat(utf8ToBytes(messageStr)));
  const outerHash = sha256Bytes(oKeyPad.concat(innerHash));

  return outerHash.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateNonce() {
  const chars = 'abcdef0123456789';
  let out = '';
  for (let i = 0; i < 16; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/**
 * Generates signed Mobile-Exclusive headers verified by Laravel's EnsureMobileClient middleware.
 */
export function buildMobileSecurityHeaders(method = 'GET', endpoint = '/', secretOverride = null) {
  if (Platform.OS === 'web') {
    throw new Error('API ini dikunci eksklusif hanya untuk aplikasi Mobile Native (Android/iOS).');
  }

  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = generateNonce();
  const cleanEndpoint = '/' + String(endpoint.split('?')[0] || '').replace(/^\/+/, '');
  const upperMethod = String(method || 'GET').toUpperCase();

  const canonicalPayload = [
    MOBILE_APP_ID,
    platform,
    timestamp,
    nonce,
    upperMethod,
    cleanEndpoint,
  ].join('|');

  const secretToUse = secretOverride || MOBILE_APP_SECRET;
  const signature = hmacSha256Hex(secretToUse, canonicalPayload);

  return {
    'X-Noor-Client': 'noor-mobile-native',
    'X-Noor-Platform': platform,
    'X-Noor-App-Id': MOBILE_APP_ID,
    'X-Noor-Timestamp': timestamp,
    'X-Noor-Nonce': nonce,
    'X-Noor-Signature': signature,
  };
}

