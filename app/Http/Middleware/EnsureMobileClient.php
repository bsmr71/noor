<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMobileClient
{
    /**
     * Block browsers, Web Apps, and unauthorized HTTP clients from accessing /api/*.
     * Only cryptographically signed requests from Noor Mobile Native (Android/iOS) pass.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!config('mobile_api.exclusive', true)) {
            return $next($request);
        }

        // 1. Block CORS Preflight & Browser-Exclusive Headers Immediately
        if ($request->isMethod('OPTIONS')) {
            return $this->deny('CORS browser preflight diblokir. API ini khusus aplikasi Mobile Native.');
        }

        $browserIndicators = [
            'Origin',
            'Sec-Fetch-Site',
            'Sec-Ch-Ua',
            'Sec-Ch-Ua-Platform',
            'Upgrade-Insecure-Requests',
        ];

        foreach ($browserIndicators as $headerName) {
            if ($request->headers->has($headerName)) {
                return $this->deny('Akses melalui Web Browser atau Web App tidak diizinkan.');
            }
        }

        $secFetchMode = strtolower((string) $request->header('Sec-Fetch-Mode', ''));
        $secFetchDest = strtolower((string) $request->header('Sec-Fetch-Dest', ''));
        if ($secFetchMode === 'navigate' || $secFetchDest === 'document') {
            return $this->deny('Endpoint API tidak dapat dibuka melalui tab browser.');
        }

        // Block direct browser HTML navigation (Accept: text/html)
        $accept = strtolower((string) $request->header('Accept', ''));
        if (str_contains($accept, 'text/html') || str_contains($accept, 'application/xhtml+xml')) {
            return $this->deny('Endpoint API tidak dapat dibuka langsung melalui alamat browser.');
        }

        // 2. Verify Exclusive Noor Mobile Identity Headers
        $clientType = (string) $request->header('X-Noor-Client', '');
        $platform   = strtolower((string) $request->header('X-Noor-Platform', ''));
        $appId      = (string) $request->header('X-Noor-App-Id', '');
        $expectedAppId = (string) config('mobile_api.app_id', 'com.noor.islamicapp');

        if (
            $clientType !== 'noor-mobile-native' ||
            !in_array($platform, ['android', 'ios'], true) ||
            !hash_equals($expectedAppId, $appId)
        ) {
            return $this->deny('Identitas aplikasi mobile tidak valid atau tidak terdaftar.');
        }

        // Extra check: Reject standard desktop/mobile browser User-Agents trying to spoof headers
        $ua = strtolower((string) $request->header('User-Agent', ''));
        if (
            str_contains($ua, 'mozilla/5.0') &&
            (str_contains($ua, 'chrome/') || str_contains($ua, 'firefox/') || str_contains($ua, 'edg/')) &&
            !str_contains($ua, 'okhttp') &&
            !str_contains($ua, 'expo') &&
            !str_contains($ua, 'noor-mobile')
        ) {
            return $this->deny('User-Agent browser terdeteksi dan ditolak.');
        }

        // 3. Verify Anti-Replay Timestamp, Nonce & HMAC-SHA256 Signature
        $timestamp = (string) $request->header('X-Noor-Timestamp', '');
        $nonce     = (string) $request->header('X-Noor-Nonce', '');
        $signature = strtolower((string) $request->header('X-Noor-Signature', ''));

        if ($timestamp === '' || !ctype_digit($timestamp) || strlen($nonce) < 8 || strlen($signature) !== 64) {
            return $this->deny('Signature keamanan mobile tidak lengkap.');
        }

        $maxDrift = (int) config('mobile_api.max_timestamp_drift', 300);
        if (abs(time() - (int) $timestamp) > $maxDrift) {
            return $this->deny('Sesi tanda tangan kedaluwarsa. Pastikan jam perangkat Anda akurat.');
        }

        $secret = (string) config('mobile_api.secret', '');
        $normalizedEndpoint = '/' . ltrim((string) preg_replace('#^.*?api/v1#', '', $request->path()), '/');
        $canonicalPayload = implode('|', [
            $appId,
            $platform,
            $timestamp,
            $nonce,
            strtoupper($request->method()),
            $normalizedEndpoint,
        ]);

        $expectedSignature = hash_hmac('sha256', $canonicalPayload, $secret);

        if (!hash_equals($expectedSignature, $signature)) {
            return $this->deny('Tanda tangan kriptografi (HMAC-SHA256) tidak valid.');
        }

        return $next($request);
    }

    private function deny(string $reason): Response
    {
        return response()->json([
            'status'  => 'error',
            'code'    => 'MOBILE_EXCLUSIVE_API',
            'message' => 'Akses Ditolak: API Noor bersifat eksklusif hanya untuk Aplikasi Mobile Resmi (Android/iOS).',
            'detail'  => $reason,
        ], 403, [
            'X-Robots-Tag'           => 'noindex, nofollow',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control'          => 'no-store, no-cache, must-revalidate',
        ]);
    }
}
