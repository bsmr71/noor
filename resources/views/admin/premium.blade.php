@extends('layouts.admin')

@section('title', 'Noor+ Bebas Iklan — Manajemen Member & Paket')

@section('content')
<div class="flex flex-col w-full">
    <!-- Breadcrumb & Header -->
    <div class="flex flex-col gap-space-sm mb-space-lg">
        <div class="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <a class="hover:text-primary transition-colors flex items-center gap-1" href="{{ route('admin.dashboard') }}">
                <span class="material-symbols-outlined text-[15px]">home</span>
                <span>Beranda Admin</span>
            </a>
            <span class="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <span class="text-on-surface-variant">Monetisasi Syariah</span>
            <span class="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <span class="font-semibold text-primary">Noor+ Bebas Iklan</span>
        </div>

        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
            <div>
                <h1 class="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">Manajemen Noor+ (Bebas Iklan Mobile)</h1>
                <p class="font-body-md text-body-md text-on-surface-variant mt-1 max-w-3xl">
                    Seluruh fitur ibadah Noor tetap 100% gratis untuk umat. Paket Noor+ khusus menghilangkan banner sponsor komersial di Beranda Mobile App sekaligus menyisihkan sebagian pendapatan untuk Wakaf Al-Qur'an.
                </p>
            </div>
            <div class="flex flex-wrap items-center gap-space-sm">
                <button type="button" onclick="document.getElementById('grantPremiumModal').classList.remove('hidden')" class="h-10 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-all flex items-center gap-space-xs cursor-pointer">
                    <span class="material-symbols-outlined text-[18px] text-secondary-container">workspace_premium</span>
                    <span>+ Aktifkan Member Manual</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Alerts -->
    @if(session('success'))
    <div class="mb-space-md p-space-sm rounded-xl bg-tertiary-fixed text-primary font-label-md text-label-md flex items-center gap-space-xs shadow-sm">
        <span class="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
        <span>{{ session('success') }}</span>
    </div>
    @endif
    @if(session('error'))
    <div class="mb-space-md p-space-sm rounded-xl bg-error-container text-on-error-container font-label-md text-label-md flex items-center gap-space-xs shadow-sm">
        <span class="material-symbols-outlined text-[20px] text-error">error</span>
        <span>{{ session('error') }}</span>
    </div>
    @endif

    <!-- Top KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl">
        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between border border-surface-container-high">
            <div class="flex items-start justify-between">
                <div>
                    <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Member Bebas Iklan Aktif</span>
                    <span class="font-headline-lg text-headline-lg text-primary tracking-tight block mt-1 font-bold">{{ number_format($activeMembers->count()) }}</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
                    <span class="material-symbols-outlined text-[20px]">workspace_premium</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <span class="font-label-sm text-label-sm text-secondary font-semibold">Banner Otomatis Disembunyikan</span>
                <span class="font-label-sm text-label-sm text-outline">Mobile Sync</span>
            </div>
        </div>

        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between border border-surface-container-high">
            <div class="flex items-start justify-between">
                <div>
                    <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Total Pendapatan Noor+</span>
                    <span class="font-headline-lg text-headline-lg text-primary tracking-tight block mt-1 font-bold">Rp {{ number_format($totalRevenue, 0, ',', '.') }}</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[20px]">payments</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <span class="font-label-sm text-label-sm text-primary font-semibold">{{ number_format($subscriptions->count()) }} Invoice Tercatat</span>
                <span class="font-label-sm text-label-sm text-outline">QRIS / VA</span>
            </div>
        </div>

        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between border border-surface-container-high">
            <div class="flex items-start justify-between">
                <div>
                    <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Alokasi Wakaf Mushaf ({{ $wakafPercent }}%)</span>
                    <span class="font-headline-lg text-headline-lg text-emerald-700 tracking-tight block mt-1 font-bold">Rp {{ number_format($wakafAllocation, 0, ',', '.') }}</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[20px]">volunteer_activism</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <span class="font-label-sm text-label-sm text-emerald-700 font-semibold">Keberkahan Berlangganan</span>
                <span class="font-label-sm text-label-sm text-outline">Otomatis</span>
            </div>
        </div>

        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between border border-surface-container-high">
            <div class="flex items-start justify-between">
                <div>
                    <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Member Lifetime</span>
                    <span class="font-headline-lg text-headline-lg text-primary tracking-tight block mt-1 font-bold">{{ number_format($activeMembers->whereIn('premium_plan', ['lifetime', 'admin_grant'])->count()) }}</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[20px]">all_inclusive</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <span class="font-label-sm text-label-sm text-primary font-semibold">Bebas Iklan Selamanya</span>
                <span class="font-label-sm text-label-sm text-outline">Tanpa Expired</span>
            </div>
        </div>
    </div>

    <!-- Pricing Configurator Card -->
    <div class="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container-high mb-space-xl">
        <div class="flex items-center justify-between mb-space-md">
            <div>
                <h2 class="font-headline-sm text-headline-sm text-primary font-bold">Konfigurasi Harga Paket Hapus Iklan (Live Sync ke Mobile)</h2>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Perubahan nominal di bawah ini langsung tampil pada modal upgrade Noor+ di aplikasi Mobile Android & iOS.</p>
            </div>
            <span class="px-3 py-1 rounded-full bg-secondary-fixed text-secondary text-xs font-bold">HMAC Mobile Protected</span>
        </div>

        <form action="{{ route('admin.premium.plans.update') }}" method="POST" class="grid grid-cols-1 md:grid-cols-4 gap-space-md items-end">
            @csrf
            <div>
                <label class="block font-label-md text-xs font-bold text-primary mb-1">Paket Bulanan (30 Hari) — Rp</label>
                <input type="number" name="monthly_price" value="{{ $plans['monthly']['price'] }}" min="1000" step="500" required class="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant font-semibold text-primary focus:outline-primary"/>
            </div>

            <div>
                <label class="block font-label-md text-xs font-bold text-primary mb-1">Paket Tahunan (365 Hari) — Rp</label>
                <input type="number" name="yearly_price" value="{{ $plans['yearly']['price'] }}" min="1000" step="1000" required class="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant font-semibold text-primary focus:outline-primary"/>
            </div>

            <div>
                <label class="block font-label-md text-xs font-bold text-primary mb-1">Paket Selamanya (Lifetime) — Rp</label>
                <input type="number" name="lifetime_price" value="{{ $plans['lifetime']['price'] }}" min="1000" step="1000" required class="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant font-semibold text-primary focus:outline-primary"/>
            </div>

            <div class="flex gap-2">
                <div class="w-28">
                    <label class="block font-label-md text-xs font-bold text-primary mb-1">% Wakaf</label>
                    <input type="number" name="wakaf_percent" value="{{ $wakafPercent }}" min="0" max="100" required class="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant font-semibold text-primary focus:outline-primary"/>
                </div>
                <button type="submit" class="flex-1 h-11 px-4 rounded-xl bg-primary text-white font-label-md text-sm font-bold hover:bg-primary-container transition-all shadow-sm cursor-pointer">
                    Simpan Harga
                </button>
            </div>
        </form>
    </div>

    <!-- Active Members & Recent Invoices Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
        <!-- Active Members Table -->
        <div class="xl:col-span-5 rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container-high">
            <h2 class="font-headline-sm text-headline-sm text-primary font-bold mb-1">Daftar Member Bebas Iklan Aktif</h2>
            <p class="font-body-sm text-xs text-on-surface-variant mb-space-md">Jamaah di bawah ini tidak lagi melihat carousel iklan sponsor di Mobile App.</p>

            <div class="divide-y divide-surface-container-high/60">
                @forelse($activeMembers as $member)
                <div class="py-3 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <img src="{{ $member->avatar ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' }}" class="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400/40" alt="{{ $member->name }}"/>
                        <div class="min-w-0">
                            <div class="font-label-md text-sm font-bold text-primary truncate">{{ $member->name }}</div>
                            <div class="text-xs text-on-surface-variant truncate">{{ $member->email }}</div>
                            <div class="text-[11px] font-semibold text-secondary mt-0.5">
                                {{ $member->getPremiumLabel() }} •
                                {{ $member->premium_expires_at ? 's/d ' . $member->premium_expires_at->format('d M Y') : 'Aktif Selamanya' }}
                            </div>
                        </div>
                    </div>

                    <form action="{{ route('admin.premium.revoke', $member->id) }}" method="POST" onsubmit="return confirm('Cabut status Bebas Iklan untuk {{ $member->name }}?');">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="px-2.5 py-1.5 rounded-lg bg-error-container text-on-error-container text-xs font-bold hover:opacity-90 cursor-pointer">
                            Cabut
                        </button>
                    </form>
                </div>
                @empty
                <div class="py-8 text-center text-on-surface-variant text-sm">
                    <span class="material-symbols-outlined text-3xl text-outline block mb-1">workspace_premium</span>
                    Belum ada member Noor+ Bebas Iklan aktif.
                </div>
                @endforelse
            </div>
        </div>

        <!-- Subscription Invoices History -->
        <div class="xl:col-span-7 rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container-high">
            <h2 class="font-headline-sm text-headline-sm text-primary font-bold mb-1">Riwayat Transaksi & Aktivasi Noor+</h2>
            <p class="font-body-sm text-xs text-on-surface-variant mb-space-md">Log pembayaran paket bebas iklan dari aplikasi Mobile maupun aktivasi manual Admin.</p>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-surface-container-high text-outline font-label-sm text-label-sm uppercase tracking-wider">
                            <th class="py-2.5 px-3">Invoice</th>
                            <th class="py-2.5 px-3">Jamaah</th>
                            <th class="py-2.5 px-3">Paket</th>
                            <th class="py-2.5 px-3">Nominal</th>
                            <th class="py-2.5 px-3">Metode</th>
                            <th class="py-2.5 px-3">Masa Aktif</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-surface-container-high/60 text-xs">
                        @forelse($subscriptions as $sub)
                        <tr class="hover:bg-surface-container-low/50">
                            <td class="py-3 px-3 font-mono font-semibold text-primary">{{ $sub->invoice_code }}</td>
                            <td class="py-3 px-3">
                                <div class="font-bold text-primary">{{ $sub->user->name ?? 'Pengguna Terhapus' }}</div>
                                <div class="text-on-surface-variant">{{ $sub->user->email ?? '-' }}</div>
                            </td>
                            <td class="py-3 px-3 font-semibold text-secondary">{{ $sub->plan_name }}</td>
                            <td class="py-3 px-3 font-bold text-primary">
                                {{ $sub->amount > 0 ? 'Rp ' . number_format($sub->amount, 0, ',', '.') : 'Gratis (Admin)' }}
                            </td>
                            <td class="py-3 px-3">
                                <span class="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-semibold">{{ $sub->payment_method }}</span>
                            </td>
                            <td class="py-3 px-3 text-on-surface-variant">
                                {{ $sub->expires_at ? $sub->expires_at->format('d M Y') : 'Selamanya' }}
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="6" class="py-8 text-center text-on-surface-variant">
                                Belum ada transaksi langganan Noor+ tercatat.
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Modal Aktifkan Member Manual -->
<div id="grantPremiumModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-surface-container-high">
        <div class="bg-primary p-space-md text-white flex items-center justify-between">
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[22px] text-secondary-container">workspace_premium</span>
                <h3 class="font-headline-sm text-lg font-bold">Aktifkan Noor+ Bebas Iklan</h3>
            </div>
            <button type="button" onclick="document.getElementById('grantPremiumModal').classList.add('hidden')" class="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 cursor-pointer">
                <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
        </div>

        <form action="{{ route('admin.premium.grant') }}" method="POST" class="p-space-lg space-y-4">
            @csrf
            <div>
                <label class="block font-label-md text-xs font-bold text-primary mb-1">Pilih Akun Pengguna</label>
                <select name="user_id" required class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant font-body-sm text-sm text-on-surface focus:outline-primary">
                    @foreach($allUsers as $u)
                        <option value="{{ $u->id }}">{{ $u->name }} ({{ $u->email }}) {{ $u->hasActivePremium() ? '— [Sudah Noor+]' : '' }}</option>
                    @endforeach
                </select>
            </div>

            <div>
                <label class="block font-label-md text-xs font-bold text-primary mb-1">Pilih Paket Bebas Iklan</label>
                <select name="plan_key" required class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant font-body-sm text-sm text-on-surface focus:outline-primary">
                    <option value="admin_grant">Kehormatan / Komplimen Gratis (Selamanya - Rp 0)</option>
                    <option value="monthly">Paket Bulanan 30 Hari (Rp {{ number_format($plans['monthly']['price'], 0, ',', '.') }})</option>
                    <option value="yearly">Paket Tahunan 365 Hari (Rp {{ number_format($plans['yearly']['price'], 0, ',', '.') }})</option>
                    <option value="lifetime">Paket Lifetime Selamanya (Rp {{ number_format($plans['lifetime']['price'], 0, ',', '.') }})</option>
                </select>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-high">
                <button type="button" onclick="document.getElementById('grantPremiumModal').classList.add('hidden')" class="px-4 py-2 rounded-xl bg-surface-container-high text-primary font-label-md text-sm font-semibold cursor-pointer">Batal</button>
                <button type="submit" class="px-5 py-2 rounded-xl bg-primary text-white font-label-md text-sm font-semibold hover:bg-primary-container shadow-md cursor-pointer">Aktifkan Sekarang</button>
            </div>
        </form>
    </div>
</div>
@endsection

