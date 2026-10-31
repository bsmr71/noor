import { Platform } from 'react-native';
import { buildMobileSecurityHeaders } from '../utils/mobileSecurity';

const PROD_API_URL = 'https://noor.bsmrlab.com/api/v1';

const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL
  ? process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '')
  : PROD_API_URL;

export const ADMIN_CONSOLE_URL = `${ENV_API_URL.replace(/\/api\/v1\/?$/, '')}/admin/dashboard`;

const API_HOSTS = Array.from(
  new Set([
    ENV_API_URL,
    PROD_API_URL,
    Platform.OS === 'android' ? 'http://10.0.2.2:8080/api/v1' : 'http://127.0.0.1:8080/api/v1',
    'http://muslimpro.test/api/v1',
  ])
);

const BOOTSTRAP_FALLBACK_SECRET = 'change_me_to_long_random_hmac_secret_in_production';
let activeSecretOverride = null;

async function sendSignedRequest(host, endpoint, method, options, secretOverride = null) {
  const securityHeaders = buildMobileSecurityHeaders(method, endpoint, secretOverride);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${host}${endpoint}`, {
      ...options,
      method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...securityHeaders,
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    return { res, data };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function fetchWithFallback(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  let lastError = null;

  for (const host of API_HOSTS) {
    try {
      let { res, data } = await sendSignedRequest(
        host,
        endpoint,
        method,
        options,
        activeSecretOverride
      );

      // Compatibility fallback if production .env still uses default .env.example secret
      if (res.status === 403 && data?.code === 'MOBILE_EXCLUSIVE_API') {
        const altSecret = activeSecretOverride ? null : BOOTSTRAP_FALLBACK_SECRET;
        const retry = await sendSignedRequest(host, endpoint, method, options, altSecret);
        if (retry.res.ok || retry.res.status !== 403) {
          activeSecretOverride = altSecret;
          res = retry.res;
          data = retry.data;
        }
      }

      if (!res.ok) {
        throw new Error(data?.message || `HTTP ${res.status}`);
      }
      return data;
    } catch (err) {
      // If server explicitly returned an auth/validation message (not network timeout), throw immediately
      if (err?.message && !err.message.includes('Aborted') && !err.message.includes('Network request failed') && !err.message.includes('fetch failed')) {
        throw err;
      }
      lastError = err;
    }
  }

  console.warn(`[API Client Mobile Fallback Exhausted on ${endpoint}]:`, lastError?.message);
  throw lastError || new Error('Tidak dapat terhubung ke server Noor.');
}

export const mobileApiClient = {
  async login(email, password) {
    return fetchWithFallback('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(name, email, password, role = 'jamaah') {
    return fetchWithFallback('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  async getCampaigns() {
    return fetchWithFallback('/campaigns');
  },

  async createDonation(data, token = null) {
    return fetchWithFallback('/donations', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(data),
    });
  },

  async getMyDonations(email = '', token = null) {
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    return fetchWithFallback(`/donations/my${query}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  async getDonationReceipt(code) {
    return fetchWithFallback(`/donations/${code}`);
  },

  async getBanners(token = null) {
    return fetchWithFallback('/banners', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  async getSettings() {
    return fetchWithFallback('/settings');
  },

  async getCurrentUser(token) {
    return fetchWithFallback('/auth/user', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getPremiumPlans() {
    return fetchWithFallback('/premium/plans');
  },

  async subscribePremium(planKey, paymentMethod, token) {
    return fetchWithFallback('/premium/subscribe', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({
        plan_key: planKey,
        payment_method: paymentMethod,
      }),
    });
  },

  async getMyPremiumStatus(token) {
    return fetchWithFallback('/premium/my', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getCatalog(category = 'all', search = '') {
    const params = [];
    if (category && category !== 'all') params.push(`category=${encodeURIComponent(category)}`);
    if (search && search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return fetchWithFallback(`/catalog${qs}`);
  },

  async createCatalogOrder(payload, token = null) {
    return fetchWithFallback('/catalog/orders', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(payload),
    });
  },

  async getMyCatalogOrders(token) {
    return fetchWithFallback('/catalog/orders/my', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
