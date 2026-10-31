<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\PremiumController as ApiPremiumController;
use App\Models\AppSetting;
use App\Models\PremiumSubscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PremiumController extends Controller
{
    public function index()
    {
        $plans = ApiPremiumController::getConfiguredPlans();
        $wakafPercent = (int) AppSetting::get('premium_wakaf_percent', 20);

        $activeMembers = User::where('is_premium', true)
            ->where(function ($q) {
                $q->whereNull('premium_expires_at')
                  ->orWhere('premium_expires_at', '>', now());
            })
            ->orderByDesc('updated_at')
            ->get();

        $subscriptions = PremiumSubscription::with('user')->latest()->take(50)->get();
        $totalRevenue = (int) PremiumSubscription::where('status', 'paid')->sum('amount');
        $wakafAllocation = (int) round($totalRevenue * ($wakafPercent / 100));
        $allUsers = User::orderBy('name')->get();

        return view('admin.premium', compact(
            'plans',
            'wakafPercent',
            'activeMembers',
            'subscriptions',
            'totalRevenue',
            'wakafAllocation',
            'allUsers'
        ));
    }

    public function updatePlans(Request $request)
    {
        $validated = $request->validate([
            'monthly_price'  => 'required|integer|min:1000',
            'yearly_price'   => 'required|integer|min:1000',
            'lifetime_price' => 'required|integer|min:1000',
            'wakaf_percent'  => 'required|integer|min:0|max:100',
        ]);

        $plans = ApiPremiumController::getConfiguredPlans();
        $plans['monthly']['price'] = (int) $validated['monthly_price'];
        $plans['yearly']['price'] = (int) $validated['yearly_price'];
        $plans['lifetime']['price'] = (int) $validated['lifetime_price'];

        AppSetting::set('premium_plans', $plans);
        AppSetting::set('premium_wakaf_percent', (int) $validated['wakaf_percent']);

        return redirect()
            ->route('admin.premium')
            ->with('success', 'Skema harga paket Noor+ Bebas Iklan berhasil diperbarui & tersinkronisasi ke Mobile App!');
    }

    public function grantUser(Request $request)
    {
        $validated = $request->validate([
            'user_id'  => 'required|exists:users,id',
            'plan_key' => 'required|in:monthly,yearly,lifetime,admin_grant',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $plans = ApiPremiumController::getConfiguredPlans();
        $planKey = $validated['plan_key'];

        if ($planKey === 'admin_grant') {
            $planName = 'Noor+ Kehormatan (Bebas Iklan)';
            $amount = 0;
            $expiresAt = null;
        } else {
            $plan = $plans[$planKey];
            $planName = $plan['name'];
            $amount = (int) $plan['price'];
            $expiresAt = $planKey === 'lifetime'
                ? null
                : now()->addDays((int) ($plan['duration_days'] ?? 30));
        }

        PremiumSubscription::create([
            'invoice_code'   => 'NOORADM-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5)),
            'user_id'        => $user->id,
            'plan_key'       => $planKey,
            'plan_name'      => $planName,
            'amount'         => $amount,
            'payment_method' => 'ADMIN_MANUAL',
            'status'         => 'paid',
            'starts_at'      => now(),
            'expires_at'     => $expiresAt,
        ]);

        $user->is_premium = true;
        $user->premium_plan = $planKey;
        $user->premium_expires_at = $expiresAt;
        $user->save();

        return redirect()
            ->back()
            ->with('success', "Status Bebas Iklan ({$planName}) berhasil diaktifkan untuk {$user->name}!");
    }

    public function revokeUser($id)
    {
        $user = User::findOrFail($id);
        $user->is_premium = false;
        $user->premium_plan = null;
        $user->premium_expires_at = null;
        $user->save();

        return redirect()
            ->back()
            ->with('success', "Status Noor+ Bebas Iklan untuk {$user->name} telah dicabut (iklan kembali tampil).");
    }
}

