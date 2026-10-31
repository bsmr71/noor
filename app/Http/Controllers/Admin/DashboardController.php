<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Donation;
use App\Models\Campaign;

class DashboardController extends Controller
{
    public function index()
    {
        // Real database stats
        $totalUsers = User::count();
        $totalDonationAmount = Donation::sum('amount');
        $totalDonationCount = Donation::count();
        $recentDonations = Donation::with('campaign')->latest()->limit(4)->get();
        $activeCampaignsCount = Campaign::where('status', 'active')->count();

        // Time in WIB (UTC+7)
        $now = now()->setTimezone('Asia/Jakarta');
        $currentTimeWib = $now->format('H:i') . ' WIB';
        $currentHour = (int) $now->format('H');
        $currentMinute = (int) $now->format('i');
        $nowMins = $currentHour * 60 + $currentMinute;

        // Prayer thresholds (minutes from midnight)
        // Subuh: 04:09 (249)
        // Dzuhur: 11:40 (700)
        // Ashar: 14:54 (894)
        // Maghrib: 17:49 (1069)
        // Isya: 19:00 (1140)
        if ($nowMins < 249) {
            $activePrayer = 'Isya (Malam)';
            $nextPrayer = 'Subuh';
            $diffMins = 249 - $nowMins;
        } elseif ($nowMins < 700) {
            $activePrayer = 'Subuh';
            $nextPrayer = ($now->dayOfWeek == 5) ? "Jum'at" : 'Dzuhur';
            $diffMins = 700 - $nowMins;
        } elseif ($nowMins < 894) {
            $activePrayer = ($now->dayOfWeek == 5) ? "Jum'at" : 'Dzuhur';
            $nextPrayer = 'Ashar';
            $diffMins = 894 - $nowMins;
        } elseif ($nowMins < 1069) {
            $activePrayer = 'Ashar';
            $nextPrayer = 'Maghrib';
            $diffMins = 1069 - $nowMins;
        } elseif ($nowMins < 1140) {
            $activePrayer = 'Maghrib';
            $nextPrayer = 'Isya';
            $diffMins = 1140 - $nowMins;
        } else {
            $activePrayer = 'Isya';
            $nextPrayer = 'Subuh (Esok)';
            $diffMins = (1440 - $nowMins) + 249;
        }

        $countdownText = sprintf('%02dj %02dm lagi', floor($diffMins / 60), $diffMins % 60);

        return view('admin.dashboard', compact(
            'totalUsers',
            'totalDonationAmount',
            'totalDonationCount',
            'recentDonations',
            'activeCampaignsCount',
            'currentTimeWib',
            'activePrayer',
            'nextPrayer',
            'countdownText'
        ));
    }
}
