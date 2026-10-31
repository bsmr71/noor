<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\PremiumSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PremiumController extends Controller
{
    public static function defaultPlans(): array
    {
        return [
            'monthly' => [
                'key'           => 'monthly',
                'name'          => 'Noor+ Bulanan',
                'price'         => 15000,
                'duration_days' => 30,
                'badge'         => 'Fleksibel',
                'subtitle'      => 'Bebas iklan sponsor di Beranda selama 30 hari penuh.',
            ],
            'yearly' => [
                'key'           => 'yearly',
                'name'          => 'Noor+ Tahunan',
                'price'         => 99000,
                'duration_days' => 365,
                'badge'         => 'Hemat 45%',
                'subtitle'      => 'Bebas iklan 1 tahun penuh (setara Rp 8.250 / bulan).',
            ],
            'lifetime' => [
                'key'           => 'lifetime',
                'name'          => 'Noor+ Selamanya',
                'price'         => 199000,
                'duration_days' => null,
                'badge'         => 'Paling Favorit',
                'subtitle'      => 'Sekali bayar untuk selamanya tanpa biaya perpanjangan.',
            ],
        ];
    }

    public static function getConfiguredPlans(): array
    {
        $saved = AppSetting::get('premium_plans', null);
        $defaults = self::defaultPlans();

        if (!is_array($saved)) {
            return $defaults;
        }

        foreach ($defaults as $key => $def) {
            if (isset($saved[$key]) && is_array($saved[$key])) {
                $defaults[$key] = array_merge($def, $saved[$key]);
                $defaults[$key]['price'] = (int) ($defaults[$key]['price'] ?? $def['price']);
            }
        }

        return $defaults;
    }

    public function plans()
    {
        $plans = self::getConfiguredPlans();

        return response()->json([
            'status'        => 'success',
            'wakaf_percent' => (int) AppSetting::get('premium_wakaf_percent', 20),
            'plans'         => array_values($plans),
        ]);
    }

    public function subscribe(Request $request)
    {
        $user = $request->user('sanctum') ?: $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Silakan masuk ke akun Noor terlebih dahulu.',
            ], 401);
        }

        $raw = json_decode($request->getContent(), true);
        $data = is_array($raw) ? array_merge($request->all(), $raw) : $request->all();

        $validator = Validator::make($data, [
            'plan_key'       => 'required|string|in:monthly,yearly,lifetime',
            'payment_method' => 'required|string|in:QRIS,BSI_VA,MUAMALAT_VA',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Pilihan paket atau metode pembayaran tidak valid.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $plans = self::getConfiguredPlans();
        $planKey = $data['plan_key'];
        $plan = $plans[$planKey];
        $startsAt = now();

        if ($planKey === 'lifetime' || ($user->hasActivePremium() && $user->premium_expires_at === null)) {
            $expiresAt = null;
            if ($planKey !== 'lifetime' && $user->premium_plan === 'lifetime') {
                $planKey = 'lifetime';
            }
        } else {
            $days = (int) ($plan['duration_days'] ?? 30);
            $baseDate = ($user->hasActivePremium() && $user->premium_expires_at && $user->premium_expires_at->isFuture())
                ? $user->premium_expires_at->copy()
                : now();
            $expiresAt = $baseDate->addDays($days);
        }

        $invoiceCode = 'NOORPLUS-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5));

        $subscription = PremiumSubscription::create([
            'invoice_code'   => $invoiceCode,
            'user_id'        => $user->id,
            'plan_key'       => $data['plan_key'],
            'plan_name'      => $plan['name'],
            'amount'         => (int) $plan['price'],
            'payment_method' => $data['payment_method'],
            'status'         => 'paid',
            'starts_at'      => $startsAt,
            'expires_at'     => $expiresAt,
        ]);

        $user->is_premium = true;
        $user->premium_plan = $planKey;
        $user->premium_expires_at = $expiresAt;
        $user->save();

        return response()->json([
            'status'       => 'success',
            'message'      => "Alhamdulillah! Paket {$plan['name']} aktif. Beranda Anda kini bebas iklan sponsor.",
            'subscription' => $subscription,
            'user'         => $user->toMobileProfileArray(),
        ], 201);
    }

    public function myStatus(Request $request)
    {
        $user = $request->user('sanctum') ?: $request->user();
        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthenticated',
            ], 401);
        }

        $subscriptions = $user->premiumSubscriptions()->take(20)->get();

        return response()->json([
            'status'        => 'success',
            'user'          => $user->toMobileProfileArray(),
            'subscriptions' => $subscriptions,
        ]);
    }
}

