@extends('layouts.admin')

@section('title', 'Manajemen Zakat, Infaq & Wakaf Digital Noor')

@section('content')
<div class="flex flex-col w-full">
    @if(session('success'))
    <div class="mb-space-md p-4 rounded-xl bg-tertiary-fixed text-primary font-semibold flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-600">check_circle</span>
            <span>{{ session('success') }}</span>
        </div>
        <button type="button" onclick="this.parentElement.remove()" class="text-primary hover:opacity-75">
            <span class="material-symbols-outlined">close</span>
        </button>
    </div>
    @endif

    <!-- Breadcrumb & Top Page Actions -->
    <div class="flex flex-col gap-space-sm mb-space-lg">
        <div class="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <a class="hover:text-primary transition-colors flex items-center gap-1" href="{{ route('admin.dashboard') }}">
                <span class="material-symbols-outlined text-[15px]">home</span>
                <span>Beranda Admin</span>
            </a>
            <span class="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <span class="font-semibold text-primary">Zakat, Infaq & Wakaf Amanah</span>
        </div>
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
            <div>
                <h1 class="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">Manajemen Zakat, Infaq & Wakaf</h1>
                <p class="font-body-md text-body-md text-on-surface-variant mt-1 max-w-3xl">
                    Pantau aliran sedekah digital jamaah, audit transparansi penyaluran, integrasi mitra lembaga resmi (BWI & BAZNAS RI), serta kalkulator nishab otomatis.
                </p>
            </div>
            <div class="flex flex-wrap items-center gap-space-sm">
                <button class="h-10 px-space-md rounded-xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-container-high transition-all flex items-center gap-space-xs border border-surface-container-high cursor-pointer" type="button" onclick="exportZakatCSV()">
                    <span class="material-symbols-outlined text-[18px] text-primary">download</span>
                    <span>Ekspor Laporan Audit CSV</span>
                </button>
                <button class="h-10 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-all flex items-center gap-space-xs cursor-pointer" type="button" onclick="document.getElementById('modalNewCampaign').classList.remove('hidden')">
                    <span class="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>+ Buat Program Baru</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Top KPI Metric Cards (4 Cards Grid) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl">
        <!-- Card 1: Total Donasi Masuk -->
        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
            <div class="flex items-start justify-between">
                <div>
                    <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Total Dana Terhimpun</span>
                    <span class="font-headline-lg text-headline-lg text-primary tracking-tight block mt-1 font-bold">Rp {{ number_format($totalCollected, 0, ',', '.') }}</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
                    <span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <span class="font-label-sm text-label-sm text-secondary font-semibold flex items-center">
                    <span class="material-symbols-outlined text-[14px]">trending_up</span> Real-time Database
                </span>
                <span class="font-label-sm text-label-sm text-outline">Q1 2026</span>
            </div>
        </div>

        <!-- Card 2: Dana Tersalurkan -->
        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
            <div class="flex items-start justify-between">
                <div>
                    <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Total Tersalurkan</span>
                    <span class="font-headline-lg text-headline-lg text-tertiary-container tracking-tight block mt-1 font-bold">Rp {{ number_format($totalDisbursed, 0, ',', '.') }}</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                    <span class="material-symbols-outlined text-[20px]">volunteer_activism</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <span class="font-label-sm text-label-sm text-tertiary-container font-semibold">86.4% Rasio Distribusi</span>
                <span class="font-label-sm text-label-sm text-outline">8 Asnaf</span>
            </div>
        </div>

        <!-- Card 3: Total Transaksi -->
        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
            <div class="flex items-start justify-between">
                <div>
                    <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Transaksi Muzakki</span>
                    <span class="font-headline-lg text-headline-lg text-primary tracking-tight block mt-1 font-bold">{{ number_format($totalTransactions) }}</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[20px]">receipt_long</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <span class="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">bolt</span> Real-time QRIS & VA
                </span>
                <span class="font-label-sm text-label-sm text-outline">Database Siap</span>
            </div>
        </div>

        <!-- Card 4: Kepatuhan Syariah -->
        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
            <div class="flex items-start justify-between">
                <div>
                    <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Audit Syariah BWI & Baznas</span>
                    <span class="font-headline-lg text-headline-lg text-primary tracking-tight block mt-1 font-bold">WTP 100%</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[20px]">verified</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <span class="font-label-sm text-label-sm text-tertiary-container font-semibold">Dewan Pengawas Resmi</span>
                <span class="font-label-sm text-label-sm text-outline">Terdaftar</span>
            </div>
        </div>
    </div>

    <!-- Active Campaign Programs Grid -->
    <div class="mb-space-xl">
        <div class="flex items-center justify-between mb-space-md">
            <div>
                <h2 class="font-headline-md text-headline-md text-primary font-bold">Program Penyaluran & Kampanye Wakaf Aktif</h2>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Status capaian target dan partisipasi donatur pada program unggulan</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
            @foreach($campaigns as $camp)
            @php
                $percent = $camp->progress_percentage;
            @endphp
            <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container-high flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <span class="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[11px] font-bold">{{ $camp->category }}</span>
                        <span class="text-xs font-semibold text-outline">{{ $camp->days_left }} hari lagi</span>
                    </div>
                    <h3 class="font-label-lg text-base font-bold text-primary line-clamp-2 leading-snug">{{ $camp->title }}</h3>
                    <p class="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px] text-tertiary">handshake</span>
                        <span>Mitra: {{ $camp->partner }}</span>
                    </p>
                </div>

                <div class="mt-4 pt-3 border-t border-surface-container-high/60">
                    <div class="flex items-baseline justify-between text-xs mb-1">
                        <span class="font-bold text-primary">Rp {{ number_format($camp->collected_amount, 0, ',', '.') }}</span>
                        <span class="text-outline">dari Rp {{ number_format($camp->target_amount / 1000000, 0) }} Juta</span>
                    </div>
                    <!-- Progress Bar -->
                    <div class="w-full bg-surface-container h-2 rounded-full overflow-hidden mb-2">
                        <div class="bg-secondary-container h-full rounded-full transition-all" style="width: {{ $percent }}%"></div>
                    </div>
                    <div class="flex items-center justify-between text-[11px] text-on-surface-variant">
                        <span>{{ $percent }}% Terkumpul</span>
                        <span>{{ number_format($camp->donor_count) }} Donatur</span>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
    </div>

    <!-- Live Donation Transactions Ledger -->
    <div class="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container-high">
        <div class="flex items-center justify-between mb-space-md">
            <div>
                <h3 class="font-headline-md text-headline-md text-primary font-bold">Riwayat Transaksi Masuk Terkini</h3>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Aliran dana sedekah & zakat real-time dari aplikasi mobile & web</p>
            </div>
            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-tertiary-fixed text-primary font-label-sm text-xs font-semibold">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Gateway Live Active</span>
            </span>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b border-surface-container-high text-outline font-label-sm text-label-sm uppercase tracking-wider">
                        <th class="py-3 px-4">ID Transaksi</th>
                        <th class="py-3 px-4">Muzakki / Donatur</th>
                        <th class="py-3 px-4">Program Tujuan</th>
                        <th class="py-3 px-4">Kanal Pembayaran</th>
                        <th class="py-3 px-4">Waktu</th>
                        <th class="py-3 px-4 text-right">Nominal</th>
                        <th class="py-3 px-4 text-center">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-surface-container-high/60 font-body-sm text-sm">
                    @forelse($donations as $trx)
                    <tr class="hover:bg-surface-container-low/50 transition-colors">
                        <td class="py-3.5 px-4 font-mono font-bold text-xs text-primary">{{ $trx->transaction_code }}</td>
                        <td class="py-3.5 px-4">
                            <div class="font-semibold text-on-surface">{{ $trx->donor_name }}</div>
                            @if($trx->prayer_notes)
                            <div class="text-[11px] text-on-surface-variant italic truncate max-w-xs">"{{ $trx->prayer_notes }}"</div>
                            @endif
                        </td>
                        <td class="py-3.5 px-4 text-on-surface-variant text-xs font-medium">{{ $trx->campaign?->title ?: 'Sedekah Terbuka' }}</td>
                        <td class="py-3.5 px-4 font-mono text-xs uppercase text-on-surface-variant">
                            <span class="px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">{{ $trx->payment_method }}</span>
                        </td>
                        <td class="py-3.5 px-4 text-xs text-outline">{{ $trx->created_at->format('d M Y H:i') }}</td>
                        <td class="py-3.5 px-4 text-right font-mono font-bold text-primary">Rp {{ number_format($trx->amount, 0, ',', '.') }}</td>
                        <td class="py-3.5 px-4 text-center">
                            @if($trx->payment_status === 'completed')
                            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-primary text-xs font-bold">
                                <span class="material-symbols-outlined text-[13px] text-emerald-600">check_circle</span>
                                Berhasil
                            </span>
                            @else
                            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                                {{ ucfirst($trx->payment_status) }}
                            </span>
                            @endif
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="7" class="py-10 text-center text-on-surface-variant">
                            <span class="material-symbols-outlined text-4xl text-outline mb-1.5 block">receipt_long</span>
                            <span class="font-semibold block text-primary">Belum ada riwayat transaksi sedekah</span>
                            <span class="text-xs text-outline">Transaksi donasi baru melalui QRIS & Virtual Account di aplikasi Mobile / Web akan langsung tercatat otomatis di sini.</span>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        @if($donations->hasPages())
        <div class="mt-4 pt-3 border-t border-surface-container-high">
            {{ $donations->links() }}
        </div>
        @endif
    </div>
</div>

<!-- Modal Tambah Program Donasi Baru -->
<div id="modalNewCampaign" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
    <div class="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-lg p-6 border border-surface-container-high">
        <div class="flex items-center justify-between pb-3 border-b border-surface-container">
            <h3 class="font-headline-md text-lg font-bold text-primary">+ Tambah Program Donasi / Wakaf</h3>
            <button type="button" onclick="document.getElementById('modalNewCampaign').classList.add('hidden')" class="text-outline hover:text-primary">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
        <form action="{{ route('admin.zakat.campaign.store') }}" method="POST" class="mt-4 flex flex-col gap-4">
            @csrf
            <div>
                <label class="block text-xs font-bold text-outline uppercase mb-1">Judul Program / Kampanye *</label>
                <input type="text" name="title" required placeholder="Contoh: Wakaf Pembangunan Mushalla Pelosok" class="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary">
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-outline uppercase mb-1">Kategori *</label>
                    <select name="category" required class="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary">
                        <option value="Wakaf Mushaf">Wakaf Mushaf</option>
                        <option value="Sedekah Harian">Sedekah Harian</option>
                        <option value="Zakat Fardhu">Zakat Fardhu</option>
                        <option value="Santunan">Santunan</option>
                        <option value="Wakaf Fisik">Wakaf Fisik</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold text-outline uppercase mb-1">Mitra Lembaga *</label>
                    <input type="text" name="partner" required placeholder="BAZNAS / BWI / Dompet Dhuafa" class="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-outline uppercase mb-1">Target Dana (Rp) *</label>
                    <input type="number" name="target_amount" required min="100000" placeholder="100000000" class="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary">
                </div>
                <div>
                    <label class="block text-xs font-bold text-outline uppercase mb-1">Durasi Hari</label>
                    <input type="number" name="days_left" value="30" min="1" class="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary">
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold text-outline uppercase mb-1">Deskripsi Program</label>
                <textarea name="description" rows="2" placeholder="Uraian singkat penyaluran amanah..." class="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary"></textarea>
            </div>
            <div class="flex items-center justify-end gap-2 pt-3 border-t border-surface-container">
                <button type="button" onclick="document.getElementById('modalNewCampaign').classList.add('hidden')" class="h-10 px-4 rounded-xl bg-surface-container text-on-surface font-semibold text-sm">Batal</button>
                <button type="submit" class="h-10 px-5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow hover:bg-primary-container">Terbitkan Program</button>
            </div>
        </form>
    </div>
</div>

<script>
    function exportZakatCSV() {
        const rows = [
            ["ID", "Program Amanah", "Kategori", "Mitra Lembaga", "Terkumpul", "Target", "Donatur", "Status"],
            @foreach($campaigns as $c)
            ["{{ $c->id }}", "{{ addslashes($c->title) }}", "{{ $c->category }}", "{{ addslashes($c->partner) }}", "Rp {{ number_format($c->collected_amount, 0, ',', '.') }}", "Rp {{ number_format($c->target_amount, 0, ',', '.') }}", "{{ $c->donor_count }}", "{{ ucfirst($c->status) }}"],
            @endforeach
        ];

        let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Laporan_Audit_Zakat_Noor_{{ now()->format('Ymd_His') }}.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
</script>
@endsection
