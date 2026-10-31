<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Campaign;
use App\Models\Donation;

class ZakatController extends Controller
{
    public function index()
    {
        $campaigns = Campaign::orderBy('id', 'asc')->get();
        $donations = Donation::with('campaign')->latest()->paginate(15);

        $totalCollected = Campaign::sum('collected_amount');
        $totalDisbursed = round($totalCollected * 0.864);
        $totalTransactions = Donation::count();

        return view('admin.zakat', compact(
            'campaigns',
            'donations',
            'totalCollected',
            'totalDisbursed',
            'totalTransactions'
        ));
    }

    public function storeCampaign(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'partner' => 'required|string|max:150',
            'target_amount' => 'required|numeric|min:100000',
            'badge' => 'nullable|string|max:50',
            'days_left' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url',
        ]);

        $slug = Str::slug($validated['title']) . '-' . rand(100, 999);

        Campaign::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'category' => $validated['category'],
            'partner' => $validated['partner'],
            'target_amount' => $validated['target_amount'],
            'collected_amount' => 0,
            'donor_count' => 0,
            'status' => 'active',
            'badge' => $validated['badge'] ?: 'Baru',
            'days_left' => $validated['days_left'] ?: 30,
            'description' => $validated['description'] ?? null,
            'image_url' => $validated['image_url'] ?: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        ]);

        return redirect()->route('admin.zakat')->with('success', 'Program donasi/wakaf baru berhasil diterbitkan.');
    }
}
