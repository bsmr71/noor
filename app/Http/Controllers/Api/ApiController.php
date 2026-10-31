<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\AppSetting;

class ApiController extends Controller
{
    // ==========================================
    // 1. AUTHENTICATION (LOGIN, REGISTER, USER)
    // ==========================================

    public function login(Request $request)
    {
        $raw = json_decode($request->getContent(), true);
        $data = is_array($raw) ? array_merge($request->all(), $raw) : $request->all();

        $validator = Validator::make($data, [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Email dan kata sandi wajib diisi.',
                'errors'  => $validator->errors()
            ], 422);
        }

        $email = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Email atau kata sandi tidak sesuai. Silakan periksa kembali.'
            ], 401);
        }

        $token = $user->createToken('noor-auth-token')->plainTextToken;

        return response()->json([
            'status'  => 'success',
            'message' => 'Berhasil masuk ke akun Noor.',
            'token'   => $token,
            'user'    => $user->toMobileProfileArray(7, 1),
        ]);
    }

    public function register(Request $request)
    {
        $raw = json_decode($request->getContent(), true);
        $data = is_array($raw) ? array_merge($request->all(), $raw) : $request->all();

        $validator = Validator::make($data, [
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|max:150|unique:users,email',
            'password' => 'required|string|min:6',
        ], [
            'email.unique'  => 'Alamat email ini sudah terdaftar. Silakan masuk.',
            'password.min'  => 'Kata sandi minimal 6 karakter demi keamanan akun Anda.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors()
            ], 422);
        }

        $role = in_array(strtolower($data['role'] ?? ''), ['admin', 'ustadz', 'jamaah']) ? strtolower($data['role']) : 'jamaah';
        $bio = $role === 'admin'
            ? 'Super Administrator Noor Islamic Ecosystem Console.'
            : ($role === 'ustadz'
                ? 'Pembimbing Syiar & Qori Resmi Ekosistem Noor.'
                : 'Senantiasa berikhtiar istiqomah dalam ibadah harian.');

        $user = User::create([
            'name'     => $data['name'] ?? 'Hamba Allah',
            'email'    => strtolower(trim($data['email'] ?? '')),
            'password' => Hash::make($data['password'] ?? ''),
            'avatar'   => $role === 'admin'
                ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                : ($role === 'ustadz'
                    ? 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&q=80'
                    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'),
            'bio'      => $bio,
            'role'     => $role,
        ]);

        $token = $user->createToken('noor-auth-token')->plainTextToken;

        return response()->json([
            'status'  => 'success',
            'message' => 'Registrasi berhasil! Selamat datang di ekosistem Noor.',
            'token'   => $token,
            'user'    => $user->toMobileProfileArray(1, 0),
        ], 201);
    }

    public function user(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'status' => 'success',
            'user'   => $user->toMobileProfileArray(7, 1),
        ]);
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Berhasil keluar akun.'
        ]);
    }

    // ==========================================
    // 2. SETTINGS & APP CONFIGURATION
    // ==========================================

    public function getSettings()
    {
        return response()->json([
            'status' => 'success',
            'data'   => [
                'spiritual_prompt'       => AppSetting::get('spiritual_prompt', '✨ Perbanyak sholawat & tilawah Surah Al-Kahf di hari mulia ini.'),
                'announcement_bar'       => AppSetting::get('announcement_bar', 'Kemenag RI: Kalibrasi waktu hisab astronomi aktif.'),
                'kemenag_sync_status'    => AppSetting::get('kemenag_sync_status', 'Aktif & Kalibrasi Presisi (Bimas Islam RI)'),
                'prayer_offset_minutes'  => (int) AppSetting::get('prayer_offset_minutes', 2),
                'default_city'           => AppSetting::get('default_city', 'Jakarta'),
                'hisab_authority'        => AppSetting::get('hisab_authority', 'Kemenag RI (Bimas Islam) — Resmi'),
                'subuh_angle'            => AppSetting::get('subuh_angle', '-20.0°'),
                'isya_angle'             => AppSetting::get('isya_angle', '-18.0°'),
            ]
        ]);
    }

    public function updateSettings(Request $request)
    {
        $raw = json_decode($request->getContent(), true);
        $data = is_array($raw) ? array_merge($request->all(), $raw) : $request->all();

        // 1. Support { key: '...', value: '...' } format
        if (!empty($data['key']) && array_key_exists('value', $data)) {
            AppSetting::set($data['key'], $data['value']);
        }

        // 2. Support direct object key-value pairs (only update provided keys)
        $allowedKeys = [
            'spiritual_prompt',
            'announcement_bar',
            'kemenag_sync_status',
            'default_city',
            'hisab_authority',
            'subuh_angle',
            'isya_angle',
        ];
        foreach ($allowedKeys as $k) {
            if (array_key_exists($k, $data)) {
                AppSetting::set($k, $data[$k]);
            }
        }
        if (array_key_exists('prayer_offset_minutes', $data)) {
            AppSetting::set('prayer_offset_minutes', (int) $data['prayer_offset_minutes']);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Pengaturan aplikasi berhasil disimpan & disinkronkan ke mobile dan web.',
            'data'    => [
                'spiritual_prompt'       => AppSetting::get('spiritual_prompt'),
                'announcement_bar'       => AppSetting::get('announcement_bar'),
                'kemenag_sync_status'    => AppSetting::get('kemenag_sync_status'),
                'prayer_offset_minutes'  => (int) AppSetting::get('prayer_offset_minutes', 2),
                'default_city'           => AppSetting::get('default_city'),
                'hisab_authority'        => AppSetting::get('hisab_authority'),
                'subuh_angle'            => AppSetting::get('subuh_angle'),
                'isya_angle'             => AppSetting::get('isya_angle'),
            ]
        ]);
    }

    // ==========================================
    // 3. PRAYER TIMES & KEMENAG SCHEDULE
    // ==========================================

    public function prayerTimes(Request $request)
    {
        $city = $request->input('city', AppSetting::get('default_city', 'Jakarta'));

        $timings = [
            'Jakarta'  => ['subuh' => '04:08', 'dzuhur' => '11:38', 'ashar' => '14:53', 'maghrib' => '17:48', 'isya' => '18:59'],
            'Bogor'    => ['subuh' => '04:09', 'dzuhur' => '11:40', 'ashar' => '14:54', 'maghrib' => '17:49', 'isya' => '19:00'],
            'Bandung'  => ['subuh' => '04:06', 'dzuhur' => '11:37', 'ashar' => '14:52', 'maghrib' => '17:47', 'isya' => '18:58'],
            'Surabaya' => ['subuh' => '03:45', 'dzuhur' => '11:16', 'ashar' => '14:31', 'maghrib' => '17:28', 'isya' => '18:38'],
            'Semarang' => ['subuh' => '03:56', 'dzuhur' => '11:27', 'ashar' => '14:43', 'maghrib' => '17:39', 'isya' => '18:49'],
            'Medan'    => ['subuh' => '04:54', 'dzuhur' => '12:15', 'ashar' => '15:33', 'maghrib' => '18:18', 'isya' => '19:28'],
            'Makassar' => ['subuh' => '04:26', 'dzuhur' => '11:51', 'ashar' => '15:08', 'maghrib' => '18:03', 'isya' => '19:13'],
        ];

        $selectedTimings = $timings[$city] ?? $timings['Jakarta'];
        $isFriday = date('N') == 5;

        return response()->json([
            'status'             => 'success',
            'city'               => $city,
            'source'             => 'Kemenag RI (Bimas Islam API)',
            'hijriDate'          => '18 Jumadil Awwal 1448 H',
            'isFriday'           => $isFriday,
            'timings'            => $selectedTimings,
            'spiritualPrompt'    => AppSetting::get('spiritual_prompt'),
            'kemenagSyncStatus'  => AppSetting::get('kemenag_sync_status'),
            'labels' => [
                'subuh'   => 'Subuh',
                'dzuhur'  => $isFriday ? "Jum'at" : 'Dzuhur',
                'ashar'   => 'Ashar',
                'maghrib' => 'Maghrib',
                'isya'    => 'Isya'
            ]
        ]);
    }

    // ==========================================
    // 4. BANNERS (KEMITRAAN & SYIAR BERKAH)
    // ==========================================

    public function banners(Request $request)
    {
        $user = $request->user('sanctum') ?: $request->user();
        if ($user && $user->hasActivePremium()) {
            return response()->json([
                'status'  => 'success',
                'ad_free' => true,
                'data'    => [],
            ]);
        }

        $banners = AppSetting::get('banners', []);

        return response()->json([
            'status'  => 'success',
            'ad_free' => false,
            'data'    => $banners,
        ]);
    }

    public function updateBanners(Request $request)
    {
        $raw = json_decode($request->getContent(), true);
        $data = is_array($raw) ? array_merge($request->all(), $raw) : $request->all();

        if (array_key_exists('banners', $data) && is_array($data['banners'])) {
            AppSetting::set('banners', $data['banners']);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Daftar banner Kemitraan & Syiar Berkah berhasil diperbarui.',
            'data'    => AppSetting::get('banners', [])
        ]);
    }
}
