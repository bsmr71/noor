@extends('layouts.admin')

@section('title', 'Manajemen Kampanye Iklan & Banner Sponsor')

@section('content')
<div class="flex flex-col w-full">
    <!-- Breadcrumb & Top Page Actions -->
    <div class="flex flex-col gap-space-sm mb-space-lg">
        <div class="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <a class="hover:text-primary transition-colors flex items-center gap-1" href="{{ route('admin.dashboard') }}">
                <span class="material-symbols-outlined text-[15px]">home</span>
                <span>Beranda Admin</span>
            </a>
            <span class="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <span class="text-on-surface-variant">Monetisasi & Kemitraan</span>
            <span class="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <span class="font-semibold text-primary">Manajemen Iklan & Banner Carousel</span>
        </div>
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
            <div>
                <h1 class="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">Manajemen Kampanye Iklan & Banner Sponsor</h1>
                <p class="font-body-md text-body-md text-on-surface-variant mt-1 max-w-3xl">
                    Kelola penempatan banner carousel mobile, rotasi slide sponsor syariah, jadwal tayang, penargetan jamaah, dan analisis konversi CTR real-time dengan menjaga kekhusyukan ritual ibadah.
                </p>
            </div>
            <div class="flex flex-wrap items-center gap-space-sm">
                <button class="h-10 px-space-md rounded-xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-container-high transition-all flex items-center gap-space-xs border border-surface-container-high cursor-pointer" type="button" onclick="openSyariahModal()">
                    <span class="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
                    <span>Panduan Etika Syariah</span>
                </button>
                <button class="h-10 px-space-md rounded-xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-container-high transition-all flex items-center gap-space-xs border border-surface-container-high cursor-pointer" type="button" onclick="exportBannersCSV()">
                    <span class="material-symbols-outlined text-[18px] text-primary">download</span>
                    <span>Ekspor Laporan CSV</span>
                </button>
                <button class="h-10 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-all flex items-center gap-space-xs cursor-pointer" type="button" onclick="openAddCampaignModal()">
                    <span class="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>+ Pasang Kampanye Baru</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Top KPI Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl">
        <!-- Card 1: Total Impresi -->
        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div class="flex items-start justify-between">
                <div class="flex flex-col">
                    <span class="font-label-sm text-label-sm uppercase tracking-wider text-outline">Impresi Banner Aktif</span>
                    <div class="flex items-baseline gap-space-xs mt-1">
                        <span class="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">0</span>
                        <span class="font-label-sm text-label-sm text-on-surface-variant">views</span>
                    </div>
                </div>
                <div class="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[20px]">visibility</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <div class="flex items-center gap-1 text-primary font-label-md text-label-md">
                    <span class="material-symbols-outlined text-[16px]">verified</span>
                    <span class="font-semibold">Siap Rilis</span>
                    <span class="text-on-surface-variant font-normal">Produksi</span>
                </div>
                <span class="font-label-sm text-label-sm text-outline">Basis Nol Transaksi</span>
            </div>
            <div class="w-full bg-surface-container h-1 rounded-full mt-2 overflow-hidden">
                <div class="bg-primary h-full rounded-full" style="width: 0%"></div>
            </div>
        </div>

        <!-- Card 2: CTR -->
        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div class="flex items-start justify-between">
                <div class="flex flex-col">
                    <span class="font-label-sm text-label-sm uppercase tracking-wider text-outline">Rata-rata CTR Jamaah</span>
                    <div class="flex items-baseline gap-space-xs mt-1">
                        <span class="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">0.00%</span>
                        <span class="font-label-sm text-label-sm text-on-surface-variant">konversi</span>
                    </div>
                </div>
                <div class="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
                    <span class="material-symbols-outlined text-[20px]">touch_app</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <div class="flex items-center gap-1 text-secondary font-label-md text-label-md">
                    <span class="material-symbols-outlined text-[16px]">ads_click</span>
                    <span class="font-semibold">0 klik</span>
                    <span class="text-on-surface-variant font-normal">masuk</span>
                </div>
                <span class="font-label-sm text-label-sm text-outline">Tracking Aktif</span>
            </div>
            <div class="w-full bg-surface-container h-1 rounded-full mt-2 overflow-hidden">
                <div class="bg-secondary-container h-full rounded-full" style="width: 0%"></div>
            </div>
        </div>

        <!-- Card 3: Pendapatan & Wakaf Share -->
        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div class="flex items-start justify-between">
                <div class="flex flex-col">
                    <span class="font-label-sm text-label-sm uppercase tracking-wider text-outline">Revenue & Wakaf Share</span>
                    <div class="flex items-baseline gap-space-xs mt-1">
                        <span class="font-headline-md text-headline-md text-primary tracking-tight font-bold">Rp 0</span>
                    </div>
                </div>
                <div class="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <div class="flex items-center gap-1 text-primary font-label-md text-label-md">
                    <span class="material-symbols-outlined text-[16px]">favorite</span>
                    <span class="font-semibold">15% Wakaf</span>
                    <span class="text-on-surface-variant font-normal">(Rp 0)</span>
                </div>
                <span class="font-label-sm text-label-sm text-outline">Saldo Awal Rilis</span>
            </div>
            <div class="w-full bg-surface-container h-1 rounded-full mt-2 overflow-hidden">
                <div class="bg-primary-container h-full rounded-full" style="width: 0%"></div>
            </div>
        </div>

        <!-- Card 4: Slot Terisi & Etika Ritmis -->
        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div class="flex items-start justify-between">
                <div class="flex flex-col">
                    <span class="font-label-sm text-label-sm uppercase tracking-wider text-outline">Kapasitas Slot Carousel</span>
                    <div class="flex items-baseline gap-space-xs mt-1">
                        <span class="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">4 <span class="text-headline-sm text-outline font-normal">/ 5 Slot</span></span>
                    </div>
                </div>
                <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[20px]">view_carousel</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <div class="flex items-center gap-1 text-primary font-label-md text-label-md">
                    <span class="w-2 h-2 rounded-full bg-secondary-container"></span>
                    <span class="font-semibold">Beban Sehat (80%)</span>
                </div>
                <span class="font-label-sm text-label-sm text-secondary font-medium">Batas Aman Khusyuk</span>
            </div>
            <div class="w-full bg-surface-container h-1 rounded-full mt-2 overflow-hidden">
                <div class="bg-secondary h-full rounded-full" style="width: 80%"></div>
            </div>
        </div>
    </div>

    <!-- Main Workspace: Left Management Table & Right Live Simulator -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        <!-- Left Column (8 cols): Filters & Interactive Table -->
        <div class="xl:col-span-8 flex flex-col gap-space-md">
            <!-- Filter Controls Bar -->
            <div class="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col md:flex-row gap-space-md items-stretch md:items-center justify-between">
                <div class="flex flex-wrap items-center gap-space-sm flex-1">
                    <div class="relative min-w-[240px] flex-1 max-w-sm">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                        <input class="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none" placeholder="Cari mitra, brand, izin Kemenag..." type="text"/>
                    </div>
                    <div class="relative">
                        <select class="h-10 px-3 pr-8 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md focus:outline-none appearance-none cursor-pointer">
                            <option value="all">Semua Status (Aktif & Terjadwal)</option>
                            <option value="active">Sedang Tayang (Live)</option>
                            <option value="scheduled">Terjadwal Mendatang</option>
                        </select>
                        <span class="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[16px]">expand_more</span>
                    </div>
                </div>
                <div class="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                    <span>Urutkan:</span>
                    <span class="font-semibold text-primary">Prioritas Tayang</span>
                </div>
            </div>

            <!-- Campaign Table Card -->
            <div class="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col">
                <div class="p-space-md flex items-center justify-between bg-surface-container-low/50">
                    <div class="flex items-center gap-space-sm">
                        <span class="font-headline-sm text-headline-sm text-primary font-bold">Susunan Rotasi Slide Carousel</span>
                        <span class="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-semibold">Live Production</span>
                    </div>
                    <p class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                        <span class="material-symbols-outlined text-[16px] text-outline">drag_indicator</span>
                        Tarik handle titik untuk mengatur ulang urutan
                    </p>
                </div>

                <div class="overflow-x-auto w-full">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                                <th class="py-3 px-4 w-12 text-center">Urutan</th>
                                <th class="py-3 px-4 w-44">Pratinjau Banner</th>
                                <th class="py-3 px-4">Detail Kampanye & Mitra</th>
                                <th class="py-3 px-4">Masa Tayang</th>
                                <th class="py-3 px-4">Performa</th>
                                <th class="py-3 px-4 text-center">Status</th>
                                <th class="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-surface-container-low text-on-surface font-body-sm text-body-sm">
                            @forelse($banners as $idx => $banner)
                            <tr class="hover:bg-surface-container-low transition-colors group">
                                <td class="py-4 px-4 text-center">
                                    <div class="flex items-center justify-center gap-1">
                                        <span class="material-symbols-outlined text-outline group-hover:text-primary cursor-grab text-[18px]">drag_indicator</span>
                                        <span class="w-6 h-6 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center font-bold">{{ $idx + 1 }}</span>
                                    </div>
                                </td>
                                <td class="py-4 px-4">
                                    <div class="relative w-36 h-20 rounded-lg overflow-hidden bg-surface-container shadow-sm">
                                        <img class="w-full h-full object-cover" src="{{ $banner['image'] ?? '' }}" alt="{{ $banner['title'] ?? 'Banner' }}"/>
                                        <div class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-surface/90 text-primary font-label-sm text-[10px] font-semibold">16:9 • HD</div>
                                    </div>
                                </td>
                                <td class="py-4 px-4">
                                    <div class="flex flex-col">
                                        <span class="font-headline-sm text-[15px] text-primary font-bold leading-snug">{{ $banner['title'] ?? 'Kampanye Syiar' }}</span>
                                        <span class="font-label-md text-label-md text-on-surface mt-0.5">{{ $banner['partner'] ?? ($banner['sponsor'] ?? 'Mitra Resmi Noor') }}</span>
                                        <div class="flex items-center gap-1.5 mt-1">
                                            <span class="px-2 py-0.5 rounded-full bg-tertiary-fixed text-primary font-label-sm text-[10px] font-semibold flex items-center gap-0.5">
                                                <span class="material-symbols-outlined text-[12px]">verified</span>
                                                {{ $banner['license'] ?? ($banner['badge'] ?? 'Terverifikasi Syariah') }}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td class="py-4 px-4">
                                    <div class="flex flex-col">
                                        <span class="font-label-md text-label-md text-on-surface font-semibold">{{ $banner['period'] ?? 'Aktif Berjalan' }}</span>
                                        <span class="font-label-sm text-label-sm text-secondary font-medium">{{ $banner['badge'] ?? 'Prioritas Utama' }}</span>
                                    </div>
                                </td>
                                <td class="py-4 px-4">
                                    <div class="flex flex-col gap-0.5 font-label-sm text-[12px]">
                                        <span>Harga/Info: <strong>{{ $banner['price'] ?? 'Syiar' }}</strong></span>
                                        <span class="text-on-surface-variant">CTA: {{ $banner['cta'] ?? 'Lihat Detail' }}</span>
                                    </div>
                                </td>
                                <td class="py-4 px-4 text-center">
                                    @if(($banner['status'] ?? 'active') === 'scheduled')
                                        <span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px]">Terjadwal</span>
                                    @else
                                        <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px]">Tayang</span>
                                    @endif
                                </td>
                                <td class="py-4 px-4 text-right">
                                    <div class="flex items-center justify-end gap-1.5">
                                        <button type="button" class="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary cursor-pointer" onclick="openEditCampaignModal({{ $idx }})" title="Edit Slide">
                                            <span class="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                        @if(count($banners) > 1)
                                        <button type="button" class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer" onclick="deleteCampaignSlide({{ $idx }})" title="Hapus Slide">
                                            <span class="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="7" class="py-8 text-center text-on-surface-variant">Belum ada slide kampanye aktif. Klik "Pasang Kampanye Baru" untuk menambahkan.</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Right Column (4 cols): Live Carousel Simulator -->
        <div class="xl:col-span-4 flex flex-col gap-space-md">
            <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col border border-surface-container-high">
                <div class="flex items-center justify-between mb-space-sm">
                    <div class="flex items-center gap-space-xs">
                        <span class="material-symbols-outlined text-primary text-[20px]">phone_android</span>
                        <h2 class="font-headline-sm text-headline-sm text-primary font-bold">Pratinjau Mobile Live</h2>
                    </div>
                    <div class="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-primary font-label-sm text-[11px] font-semibold">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Real-time Preview</span>
                    </div>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                    Simulasi visual tampilan carousel pada layar beranda aplikasi Noor versi Android & iOS.
                </p>

                <!-- Mockup Phone Shell -->
                <div class="mx-auto w-full max-w-[310px] rounded-[32px] bg-primary p-2.5 shadow-xl relative overflow-hidden">
                    <div class="w-full rounded-[24px] bg-surface overflow-hidden flex flex-col relative text-on-surface min-h-[440px]">
                        <div class="h-6 px-4 pt-1.5 flex items-center justify-between text-[10px] font-semibold text-on-surface-variant">
                            <span>14:54</span>
                            <div class="flex items-center gap-1">
                                <span class="material-symbols-outlined text-[12px]">wifi</span>
                                <span class="material-symbols-outlined text-[12px]">battery_full</span>
                            </div>
                        </div>

                        <!-- App Header -->
                        <div class="px-4 py-2 flex items-center justify-between">
                            <div class="flex items-center gap-1.5">
                                <div class="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-on-primary">
                                    <span class="material-symbols-outlined text-[15px]">mosque</span>
                                </div>
                                <span class="font-headline-sm text-[13px] text-primary font-bold">Noor Mobile</span>
                            </div>
                        </div>

                        <!-- Simulated Banner Item -->
                        <div class="p-3">
                            <div class="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-md">
                                <img id="simulated-banner-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMnj95EzLYjx-SPWjYmZ5PR_8eTxm7D2JqvL3oNvzabNi9-lkZvwNYVdb-qtX6kdAA36hqwdRDxhw0F00a3uLArlQxfrRhOTVumBuRz-3VcIcw4mg-WXQE80uhMl5HJyz1ELA_Lv8AEDQjHIz3QOTLV_cSciDJgJpTOD3ukifmWCGZM5PtWecKP4s6jmYpBgXv00hy_JrLq7TVCx3rD_O96c9jLLB6w7ewUhcGr2Q" class="w-full h-full object-cover" alt="Banner"/>
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2.5 flex flex-col justify-end text-white">
                                    <span class="text-[9px] font-bold text-amber-300">SPONSOR RESMI</span>
                                    <h4 id="simulated-banner-title" class="text-[12px] font-bold leading-tight mt-0.5">Umrah Syahdu Akhir Ramadhan</h4>
                                </div>
                            </div>

                            <!-- Buttons to switch slide in preview -->
                            <div class="flex items-center justify-center gap-2 mt-3">
                                <button onclick="changeSimSlide(1)" class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-primary text-white">1</button>
                                <button onclick="changeSimSlide(2)" class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-surface-container text-primary">2</button>
                                <button onclick="changeSimSlide(3)" class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-surface-container text-primary">3</button>
                                <button onclick="changeSimSlide(4)" class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-surface-container text-primary">4</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal 1: Panduan Etika Syariah -->
<div id="syariahGuideModal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div class="w-full max-w-2xl rounded-2xl bg-surface-container-lowest shadow-2xl border border-surface-container-high overflow-hidden flex flex-col max-h-[85vh]">
        <div class="px-6 py-4 bg-primary text-on-primary flex items-center justify-between">
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[22px] text-amber-400">verified_user</span>
                <h3 class="font-headline-sm text-base font-bold text-white">Panduan & Kode Etik Iklan Syariah Noor</h3>
            </div>
            <button type="button" onclick="closeSyariahModal()" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer">
                <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
        </div>
        <div class="p-6 overflow-y-auto space-y-4 text-body-sm text-on-surface">
            <div class="p-3.5 rounded-xl bg-surface-container-low border-l-4 border-emerald-600">
                <h4 class="font-bold text-primary text-sm flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-emerald-600 text-[18px]">gavel</span>
                    1. Prinsip Kehalalan Mutlak (Zero-Riba & Halal)
                </h4>
                <p class="text-xs text-on-surface-variant mt-1 leading-relaxed">Seluruh produk, jasa, biro travel umrah, penerbit, dan program wakaf wajib tersertifikasi halal MUI / Kemenag RI, bebas dari unsur riba, maysir (judi), dan gharar.</p>
            </div>
            <div class="p-3.5 rounded-xl bg-surface-container-low border-l-4 border-amber-500">
                <h4 class="font-bold text-primary text-sm flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-amber-600 text-[18px]">person_check</span>
                    2. Etika Visual & Aurat Terjaga
                </h4>
                <p class="text-xs text-on-surface-variant mt-1 leading-relaxed">Materi visual banner wajib menampilkan busana sopan menutup aurat, tanpa eksploitasi visual yang bertentangan dengan adab islami.</p>
            </div>
            <div class="p-3.5 rounded-xl bg-surface-container-low border-l-4 border-primary">
                <h4 class="font-bold text-primary text-sm flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-primary text-[18px]">timer_pause</span>
                    3. Jeda Khusyuk Otomatis Saat Sholat
                </h4>
                <p class="text-xs text-on-surface-variant mt-1 leading-relaxed">Sistem secara otomatis menghentikan rotasi sponsor 10 menit sebelum adzan hingga 15 menit pasca adzan untuk menjaga kekhusyukan ibadah pengguna.</p>
            </div>
            <div class="p-3.5 rounded-xl bg-surface-container-low border-l-4 border-secondary">
                <h4 class="font-bold text-primary text-sm flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-secondary text-[18px]">volunteer_activism</span>
                    4. Komitmen Wakaf Produktif (15% Share)
                </h4>
                <p class="text-xs text-on-surface-variant mt-1 leading-relaxed">Setiap nilai kemitraan iklan dialokasikan minimal 15% untuk dana abadi wakaf Al-Qur'an dan pendidikan santri pelosok nusantara.</p>
            </div>
        </div>
        <div class="px-6 py-3 bg-surface-container-low border-t border-surface-container-high flex justify-end">
            <button type="button" onclick="closeSyariahModal()" class="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer">
                Saya Mengerti & Setuju
            </button>
        </div>
    </div>
</div>

<!-- Modal 2: Pasang / Edit Kampanye Sponsor -->
<div id="campaignModal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div class="w-full max-w-xl rounded-2xl bg-surface-container-lowest shadow-2xl border border-surface-container-high overflow-hidden flex flex-col max-h-[85vh]">
        <div class="px-6 py-4 bg-primary text-on-primary flex items-center justify-between">
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[22px] text-amber-400">campaign</span>
                <h3 id="campaignModalTitle" class="font-headline-sm text-base font-bold text-white">Pasang Kampanye Banner Baru</h3>
            </div>
            <button type="button" onclick="closeCampaignModal()" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer">
                <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
        </div>
        <form id="campaignForm" onsubmit="saveCampaignForm(event)" class="p-6 overflow-y-auto space-y-4">
            <div>
                <label class="block text-xs font-bold text-primary mb-1">Judul Kampanye Sponsor</label>
                <input id="form-campaign-title" type="text" required class="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary" placeholder="Contoh: Paket Umrah Syawal 1445 H"/>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-primary mb-1">Nama Mitra / Lembaga</label>
                    <input id="form-campaign-partner" type="text" required class="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary" placeholder="Contoh: PT Amanah Haramain"/>
                </div>
                <div>
                    <label class="block text-xs font-bold text-primary mb-1">Nomor Izin Kemenag / BWI</label>
                    <input id="form-campaign-license" type="text" required class="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary" placeholder="No. 892/2022"/>
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold text-primary mb-1">URL Gambar Banner (Rasio 16:9)</label>
                <input id="form-campaign-image" type="url" required class="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary" placeholder="https://..."/>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-primary mb-1">Badge Promosi</label>
                    <input id="form-campaign-badge" type="text" class="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary" placeholder="Early Bird Hemat 2.5 Juta"/>
                </div>
                <div>
                    <label class="block text-xs font-bold text-primary mb-1">Status Penayangan</label>
                    <select id="form-campaign-status" class="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:border-primary">
                        <option value="active">Tayang Langsung (Live)</option>
                        <option value="scheduled">Terjadwal</option>
                    </select>
                </div>
            </div>
            <div id="campaign-save-msg" class="hidden p-2.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Kampanye berhasil disimpan & siap disinkronkan ke mobile carousel!</span>
            </div>
            <div class="pt-2 flex items-center justify-end gap-2">
                <button type="button" onclick="closeCampaignModal()" class="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container-highest transition-colors cursor-pointer">
                    Batal
                </button>
                <button type="submit" class="px-5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer shadow-md">
                    Simpan Kampanye
                </button>
            </div>
        </form>
    </div>
</div>

<script>
    const slides = @json($banners);
    let editingSlideIndex = -1;

    function changeSimSlide(num) {
        const item = slides[num - 1];
        if (item) {
            document.getElementById('simulated-banner-img').src = item.image || '';
            document.getElementById('simulated-banner-title').innerText = item.title || '';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (slides && slides.length > 0) {
            changeSimSlide(1);
        }
    });

    function openSyariahModal() {
        document.getElementById('syariahGuideModal').classList.remove('hidden');
    }
    function closeSyariahModal() {
        document.getElementById('syariahGuideModal').classList.add('hidden');
    }

    function openAddCampaignModal() {
        editingSlideIndex = -1;
        document.getElementById('campaignModalTitle').innerText = 'Pasang Kampanye Banner Baru';
        document.getElementById('form-campaign-title').value = '';
        document.getElementById('form-campaign-partner').value = '';
        document.getElementById('form-campaign-license').value = '';
        document.getElementById('form-campaign-image').value = '';
        document.getElementById('form-campaign-badge').value = '';
        document.getElementById('form-campaign-status').value = 'active';
        document.getElementById('campaign-save-msg').classList.add('hidden');
        document.getElementById('campaignModal').classList.remove('hidden');
    }

    function openEditCampaignModal(index) {
        editingSlideIndex = index;
        const item = slides[index] || {};
        document.getElementById('campaignModalTitle').innerText = 'Edit Slide Kampanye #' + (index + 1);
        document.getElementById('form-campaign-title').value = item.title || '';
        document.getElementById('form-campaign-partner').value = item.partner || item.sponsor || '';
        document.getElementById('form-campaign-license').value = item.license || 'Terverifikasi Kemenag / BWI';
        document.getElementById('form-campaign-image').value = item.image || '';
        document.getElementById('form-campaign-badge').value = item.badge || '';
        document.getElementById('form-campaign-status').value = item.status || 'active';
        document.getElementById('campaign-save-msg').classList.add('hidden');
        document.getElementById('campaignModal').classList.remove('hidden');
    }

    function closeCampaignModal() {
        document.getElementById('campaignModal').classList.add('hidden');
    }

    function persistSlides(updatedSlides, onDone) {
        fetch('{{ route("admin.api.banners.post") }}', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            },
            body: JSON.stringify({ banners: updatedSlides })
        })
        .then(r => r.json())
        .then(() => { if (onDone) onDone(); })
        .catch(err => alert('Gagal menyimpan banner: ' + err.message));
    }

    function deleteCampaignSlide(index) {
        if (!confirm('Hapus slide kampanye ini dari rotasi carousel Web & Mobile?')) return;
        const updated = slides.filter((_, i) => i !== index);
        persistSlides(updated, () => window.location.reload());
    }

    function saveCampaignForm(e) {
        e.preventDefault();
        const title = document.getElementById('form-campaign-title').value.trim();
        const partner = document.getElementById('form-campaign-partner').value.trim();
        const license = document.getElementById('form-campaign-license').value.trim();
        const image = document.getElementById('form-campaign-image').value.trim();
        const badge = document.getElementById('form-campaign-badge').value.trim() || 'Mitra Syariah';
        const status = document.getElementById('form-campaign-status').value;

        const baseObj = editingSlideIndex >= 0 ? (slides[editingSlideIndex] || {}) : {};
        const newSlide = Object.assign({}, baseObj, {
            id: baseObj.id || Date.now(),
            tag: baseObj.tag || 'Kemitraan Syariah',
            badge: badge,
            sponsor: 'Disponsori • ' + partner + ' (' + license + ')',
            partner: partner,
            license: license,
            title: title,
            image: image,
            meta1: baseObj.meta1 || partner,
            meta2: baseObj.meta2 || license,
            price: baseObj.price || 'Program Resmi',
            cta: baseObj.cta || 'Lihat Detail',
            actionType: baseObj.actionType || 'donate',
            status: status
        });

        const updated = [...slides];
        if (editingSlideIndex >= 0) {
            updated[editingSlideIndex] = newSlide;
        } else {
            updated.push(newSlide);
        }

        const msg = document.getElementById('campaign-save-msg');
        msg.classList.remove('hidden');
        persistSlides(updated, () => {
            setTimeout(() => {
                closeCampaignModal();
                window.location.reload();
            }, 800);
        });
    }

    function exportBannersCSV() {
        const rows = [
            ["No", "Judul Kampanye", "Mitra / Sponsor", "Izin Regulasi", "Status", "Badge"],
            ...slides.map((s, idx) => [
                String(idx + 1),
                s.title || '-',
                s.partner || s.sponsor || '-',
                s.license || '-',
                (s.status || 'active') === 'active' ? 'Tayang (Live)' : 'Terjadwal',
                s.badge || '-'
            ])
        ];

        let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Laporan_Kampanye_Sponsor_Noor_{{ now()->format('Ymd_His') }}.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
</script>
@endsection
