<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Campaign;
use App\Models\Donation;

class DonationController extends Controller
{
    /**
     * Get list of active donation campaigns
     */
    public function campaigns()
    {
        $campaigns = Campaign::where('status', 'active')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $campaigns
        ]);
    }

    /**
     * Get campaign detail
     */
    public function campaignDetail($id)
    {
        $campaign = Campaign::with(['donations' => function ($q) {
            $q->where('payment_status', 'completed')
              ->latest()
              ->limit(10);
        }])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $campaign
        ]);
    }

    /**
     * Create a new donation
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'campaign_id' => 'nullable|exists:campaigns,id',
            'amount' => 'required|numeric|min:10000',
            'donor_name' => 'nullable|string|max:100',
            'donor_email' => 'nullable|email|max:150',
            'donor_phone' => 'nullable|string|max:20',
            'payment_method' => 'required|string|in:qris,bsi_va,mandiri_va,bca_va',
            'is_anonymous' => 'nullable|boolean',
            'prayer_notes' => 'nullable|string|max:500',
        ]);

        $isAnonymous = $validated['is_anonymous'] ?? false;
        $donorName = $isAnonymous ? 'Hamba Allah' : ($validated['donor_name'] ?: 'Hamba Allah');
        $transactionCode = 'NOOR-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        // Generate simulated VA Number or QRIS code
        $vaNumber = null;
        if ($validated['payment_method'] === 'bsi_va') {
            $vaNumber = '99201' . rand(10000000, 99999999);
        } elseif ($validated['payment_method'] === 'mandiri_va') {
            $vaNumber = '88012' . rand(10000000, 99999999);
        } elseif ($validated['payment_method'] === 'bca_va') {
            $vaNumber = '39105' . rand(10000000, 99999999);
        }

        $authUser = $request->user('sanctum') ?: $request->user();
        $userId = $authUser?->id;

        $donation = Donation::create([
            'transaction_code' => $transactionCode,
            'campaign_id' => $validated['campaign_id'] ?? null,
            'user_id' => $userId,
            'donor_name' => $donorName,
            'donor_email' => $validated['donor_email'] ?? $authUser?->email,
            'donor_phone' => $validated['donor_phone'] ?? null,
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'payment_status' => 'completed', // Immediately verified in digital flow
            'is_anonymous' => $isAnonymous,
            'prayer_notes' => $validated['prayer_notes'] ?? null,
            'paid_at' => now(),
        ]);

        // Update campaign progress if campaign_id is provided
        if (!empty($validated['campaign_id'])) {
            $campaign = Campaign::find($validated['campaign_id']);
            if ($campaign) {
                $campaign->increment('collected_amount', $validated['amount']);
                $campaign->increment('donor_count', 1);
            }
        }

        $donation->load('campaign');

        return response()->json([
            'status' => 'success',
            'message' => 'Alhamdulillah, donasi Anda telah berhasil tercatat dengan amanah.',
            'data' => [
                'donation' => $donation,
                'va_number' => $vaNumber,
                'qris_payload' => '00020101021226670014ID.GO.KEMENAG.NOOR011893600998' . $donation->id . '520458125303360540' . $donation->amount . '5802ID5914NOOR AMANAH BWI6007JAKARTA6304',
            ]
        ], 201);
    }

    /**
     * Check donation receipt by transaction code
     */
    public function show($code)
    {
        $donation = Donation::with('campaign')
            ->where('transaction_code', $code)
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $donation
        ]);
    }

    /**
     * List user's donations (if authenticated via Sanctum or email query)
     */
    public function userDonations(Request $request)
    {
        $authUser = $request->user('sanctum') ?: $request->user();
        $userId = $authUser?->id;
        $email = $authUser?->email ?: $request->query('email');

        if (!$userId && !$email) {
            return response()->json([
                'status' => 'success',
                'data' => []
            ]);
        }

        $donations = Donation::with('campaign')
            ->where(function ($q) use ($userId, $email) {
                if ($userId) {
                    $q->where('user_id', $userId);
                }
                if ($email) {
                    $q->orWhere('donor_email', strtolower(trim($email)));
                }
            })
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $donations
        ]);
    }
}

