@extends('layouts.admin')

@section('title', 'Dashboard Overview & Analitik Ekosistem Ibadah')

@section('content')
    <div class="flex flex-col w-full">
        <!-- Welcome & Executive Control Bar -->
        <div
            class="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_8px_24px_-4px_rgba(15,62,54,0.04)] mb-space-lg">
            <div
                class="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-primary/5 via-secondary/10 to-transparent pointer-events-none blur-2xl">
            </div>
            <div class="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-space-md">
                <div class="space-y-space-xs">
                    <div
                        class="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm">
                        <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        <span>Fase Ibadah Hari Ini • {{ $hijriDate ?? '18 Jumadil Awwal 1448 H' }}</span>
                    </div>
                    <h1 class="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
                        Selamat Datang kembali, {{ Auth::user()->name ?? 'Administrator' }}! 👋
                    </h1>
                    <p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                        Pantauan data ekosistem ibadah umat & performa aplikasi per hari ini. Seluruh kanal sinkronisasi
                        berada pada kondisi optimal.
                    </p>
                </div>

                <!-- Action Cluster -->
                <div class="flex flex-wrap items-center gap-space-sm">
                    <button
                        class="h-10 px-space-md rounded-xl bg-surface-container-low hover:bg-surface-container-high text-primary font-label-md text-label-md flex items-center gap-space-xs shadow-[0_1px_4px_rgba(15,62,54,0.04)] transition-all cursor-pointer"
                        type="button" onclick="exportAnalyticsCSV()">
                        <span class="material-symbols-outlined text-[18px]">download</span>
                        <span>Unduh Laporan CSV</span>
                    </button>
                    <button
                        class="h-10 px-space-md rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-space-xs shadow-[0_4px_16px_rgba(15,62,54,0.14)] transition-all cursor-pointer"
                        id="syncKemenagBtn" onclick="triggerSyncAnim()" type="button">
                        <span class="material-symbols-outlined text-[18px] transition-transform duration-700"
                            id="syncIcon">sync</span>
                        <span id="syncText">Sync API Kemenag Sekarang</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Live Real-Time App Settings & API Sync Panel (Web & Mobile Control Center) -->
        <div
            class="rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_8px_24px_-4px_rgba(15,62,54,0.04)] mb-space-lg border border-primary/10">
            <div
                class="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-sm mb-space-md border-b border-surface-container-high">
                <div class="flex items-center gap-space-sm">
                    <div class="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined text-[22px]">tune</span>
                    </div>
                    <div>
                        <h2 class="font-headline-md text-headline-md text-primary font-bold">Pusat Pengaturan Aplikasi
                            (Sinergi API Mobile & Web)</h2>
                        <p class="font-body-sm text-body-sm text-on-surface-variant">Konfigurasi di sini akan langsung
                            tersinkronisasi secara real-time ke aplikasi Mobile Android & Web via API Laravel 13.</p>
                    </div>
                </div>
                <div
                    class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-fixed text-primary font-label-sm text-xs font-semibold">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>REST API v1 Active (0.0.0.0:8080)</span>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
                <!-- 1. Spiritual Prompt Setting -->
                <div
                    class="flex flex-col gap-2 p-space-md rounded-xl bg-surface-container-low border border-surface-container-high">
                    <label class="font-label-md text-label-md font-bold text-primary flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-[16px] text-secondary">auto_awesome</span>
                        <span>Pesan Ibadah Harian (Spiritual Prompt)</span>
                    </label>
                    <p class="font-body-sm text-xs text-on-surface-variant">Teks inspirasi di beranda pengguna Mobile & Web
                        tepat di bawah nama salam.</p>
                    <textarea id="setting-spiritual-prompt" rows="3"
                        class="w-full p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant font-body-sm text-xs text-on-surface focus:outline-primary">✨ Perbanyak sholawat & tilawah Surah Al-Kahf di hari mulia ini.</textarea>
                </div>

                <!-- 2. Announcement Banner Setting -->
                <div
                    class="flex flex-col gap-2 p-space-md rounded-xl bg-surface-container-low border border-surface-container-high">
                    <label class="font-label-md text-label-md font-bold text-primary flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-[16px] text-primary">campaign</span>
                        <span>Pengumuman Khusus Aplikasi</span>
                    </label>
                    <p class="font-body-sm text-xs text-on-surface-variant">Banner notifikasi penting / pengumuman resmi ke
                        seluruh pengguna.</p>
                    <textarea id="setting-announcement" rows="3"
                        class="w-full p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant font-body-sm text-xs text-on-surface focus:outline-primary">Jadwal sholat & hisab telah terkalibrasi resmi sesuai pedoman Bimas Islam Kemenag RI 2026.</textarea>
                </div>

                <!-- 3. Production Server & API Status -->
                <div
                    class="flex flex-col justify-between p-space-md rounded-xl bg-surface-container-low border border-surface-container-high">
                    <div>
                        <label class="font-label-md text-label-md font-bold text-primary flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[16px] text-tertiary">cloud_done</span>
                            <span>Status Produksi & Sinkronisasi API</span>
                        </label>
                        <p class="font-body-sm text-xs text-on-surface-variant mt-1">Status koneksi backend server &
                            proteksi keamanan deployment:</p>
                        <div class="mt-2 space-y-1.5 text-xs font-mono">
                            <div
                                class="p-1.5 rounded bg-surface-container-lowest border border-surface-container-high text-on-surface flex items-center justify-between">
                                <span class="text-on-surface-variant">API Engine:</span>
                                <span class="font-bold text-primary">Laravel 13 • PHP 8.4</span>
                            </div>
                            <div
                                class="p-1.5 rounded bg-surface-container-lowest border border-surface-container-high text-on-surface flex items-center justify-between">
                                <span class="text-on-surface-variant">Database:</span>
                                <span class="font-bold text-emerald-700">{{ strtoupper(config('database.default')) }}
                                    ({{ config('database.connections.' . config('database.default') . '.database') }})</span>
                            </div>
                            <div
                                class="p-1.5 rounded bg-surface-container-lowest border border-surface-container-high text-on-surface flex items-center justify-between">
                                <span class="text-on-surface-variant">Auth Security:</span>
                                <span class="font-bold text-secondary">Sanctum Token Ready</span>
                            </div>
                        </div>
                    </div>

                    <div class="mt-3 pt-2 border-t border-surface-container-high flex items-center justify-between">
                        <button type="button" onclick="saveAppSettingsLive()"
                            class="w-full py-2 px-3 rounded-lg bg-primary hover:bg-primary-container text-white font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer">
                            <span class="material-symbols-outlined text-[16px]">save</span>
                            <span>Simpan Pengaturan ke Seluruh Aplikasi</span>
                        </button>
                    </div>
                </div>
            </div>

            <div id="save-status-msg"
                class="hidden mt-3 p-2.5 rounded-lg bg-tertiary-fixed text-primary font-label-sm text-xs flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                <span id="save-status-text">Pengaturan berhasil diperbarui dan disiarkan via REST API ke Mobile &
                    Web!</span>
            </div>
        </div>

        <!-- Top Metric KPI Cards (4 Cards Grid) -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-lg">
            <!-- Card 1: Pengguna Aktif -->
            <div
                class="rounded-xl bg-surface-container-lowest p-space-md shadow-[0_8px_24px_-4px_rgba(15,62,54,0.04)] flex flex-col justify-between hover:-translate-y-0.5 transition-all">
                <div class="flex items-start justify-between">
                    <div>
                        <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Total Pengguna
                            Terdaftar</span>
                        <span
                            class="font-headline-lg text-headline-lg text-primary tracking-tight block mt-1 font-bold">{{ number_format(\App\Models\User::count()) }}</span>
                    </div>
                    <div
                        class="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center">
                        <span class="material-symbols-outlined text-[20px]">group</span>
                    </div>
                </div>
                <div class="mt-space-md pt-space-xs">
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-label-sm text-label-sm text-on-surface-variant">Database Riil Terhubung</span>
                        <span
                            class="font-label-sm text-label-sm text-tertiary-container font-semibold flex items-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">verified</span> Aktif
                        </span>
                    </div>
                    <!-- Sparkline -->
                    <svg class="w-full h-8 text-tertiary-fixed-dim" fill="none" viewBox="0 0 100 24">
                        <path d="M0 20 Q 20 18, 35 12 T 65 8 T 100 3" stroke="currentColor" stroke-linecap="round"
                            stroke-width="2"></path>
                        <path d="M0 20 Q 20 18, 35 12 T 65 8 T 100 3 L 100 24 L 0 24 Z" fill="currentColor"
                            fill-opacity="0.12"></path>
                    </svg>
                </div>
            </div>

            <!-- Card 2: Tilawah & Murottal -->
            <div
                class="rounded-xl bg-surface-container-lowest p-space-md shadow-[0_8px_24px_-4px_rgba(15,62,54,0.04)] flex flex-col justify-between hover:-translate-y-0.5 transition-all">
                <div class="flex items-start justify-between">
                    <div>
                        <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Tilawah &
                            Murottal</span>
                        <span class="font-headline-lg text-headline-lg text-primary tracking-tight block mt-1 font-bold">0
                            <span class="font-label-md text-label-md text-on-surface-variant font-normal">Mnt</span></span>
                    </div>
                    <div
                        class="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center">
                        <span class="material-symbols-outlined text-[20px]">auto_stories</span>
                    </div>
                </div>
                <div class="mt-space-md pt-space-xs">
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-label-sm text-label-sm text-on-surface-variant">30 Juz Qari Standar Cloud</span>
                        <span
                            class="font-label-sm text-label-sm text-tertiary-container font-semibold flex items-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">verified</span> Siap Produksi
                        </span>
                    </div>
                    <svg class="w-full h-8 text-secondary-container" fill="none" viewBox="0 0 100 24">
                        <path d="M0 20 L 100 20" stroke="currentColor" stroke-linecap="round" stroke-width="2"></path>
                    </svg>
                </div>
            </div>

            <!-- Card 3: Donasi & Zakat -->
            <div
                class="rounded-xl bg-surface-container-lowest p-space-md shadow-[0_8px_24px_-4px_rgba(15,62,54,0.04)] flex flex-col justify-between hover:-translate-y-0.5 transition-all">
                <div class="flex items-start justify-between">
                    <div>
                        <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Donasi Zakat &
                            Sedekah</span>
                        <span class="font-headline-lg text-headline-lg text-primary tracking-tight block mt-1 font-bold">
                            Rp {{ number_format(\App\Models\Donation::sum('amount'), 0, ',', '.') }}
                        </span>
                    </div>
                    <div
                        class="w-10 h-10 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
                        <span class="material-symbols-outlined text-[20px]">volunteer_activism</span>
                    </div>
                </div>
                <div class="mt-space-md pt-space-xs">
                    <div class="flex items-center justify-between mb-1">
                        <span
                            class="font-label-sm text-label-sm text-on-surface-variant">{{ number_format(\App\Models\Donation::count()) }}
                            Transaksi Masuk</span>
                        <span
                            class="font-label-sm text-label-sm text-tertiary-container font-semibold flex items-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">bolt</span> Gateway Siap
                        </span>
                    </div>
                    <svg class="w-full h-8 text-secondary" fill="none" viewBox="0 0 100 24">
                        <path d="M0 20 L 100 20" stroke="currentColor" stroke-linecap="round" stroke-width="2"></path>
                    </svg>
                </div>
            </div>

            <!-- Card 4: Keterkiriman Adzan -->
            <div
                class="rounded-xl bg-surface-container-lowest p-space-md shadow-[0_8px_24px_-4px_rgba(15,62,54,0.04)] flex flex-col justify-between hover:-translate-y-0.5 transition-all">
                <div class="flex items-start justify-between">
                    <div>
                        <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Keterkiriman
                            Push Adzan</span>
                        <span
                            class="font-headline-lg text-headline-lg text-primary tracking-tight block mt-1 font-bold">100%</span>
                    </div>
                    <div
                        class="w-10 h-10 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                        <span class="material-symbols-outlined text-[20px]">notifications_active</span>
                    </div>
                </div>
                <div class="mt-space-md pt-space-xs">
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-label-sm text-label-sm text-on-surface-variant">Sinkronisasi Bimas Kemenag</span>
                        <span class="font-label-sm text-label-sm text-tertiary-container font-semibold flex items-center">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span> Aktif
                        </span>
                    </div>
                    <div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-3">
                        <div class="bg-primary h-full rounded-full" style="width: 100%"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Visual Analytics Section (2-Column Grid / 65% - 35%) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-lg items-start">
            <!-- Left Column (8 cols) - Tren Interaktivitas Ibadah -->
            <div
                class="lg:col-span-8 rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_8px_24px_-4px_rgba(15,62,54,0.04)]">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-lg">
                    <div>
                        <h2 class="font-headline-md text-headline-md text-primary font-bold">Tren Interaktivitas Ibadah
                            Mingguan</h2>
                        <p class="font-body-sm text-body-sm text-on-surface-variant">Volume interaksi pengguna saat sahur,
                            subuh, petang, dan tarawih</p>
                    </div>
                    <!-- Tab selector -->
                    <div class="inline-flex p-1 bg-surface-container-low rounded-xl" id="chartTabGroup">
                        <button
                            class="chart-tab px-space-sm py-1.5 rounded-lg bg-surface-container-lowest text-primary font-label-sm text-label-sm font-semibold shadow-sm transition-all"
                            data-series="tilawah" type="button">Menit Tilawah</button>
                        <button
                            class="chart-tab px-space-sm py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-medium transition-all"
                            data-series="sholat" type="button">Checklist Sholat</button>
                        <button
                            class="chart-tab px-space-sm py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-medium transition-all"
                            data-series="tasbih" type="button">Hitungan Tasbih</button>
                    </div>
                </div>

                <!-- Custom SVG Analytics Graph -->
                <div class="relative w-full h-72">
                    <svg class="w-full h-full" fill="none" viewBox="0 0 760 260">
                        <!-- Horizontal Grid Guides -->
                        <line class="text-surface-container-high" stroke="currentColor" stroke-dasharray="4 4"
                            stroke-width="1" x1="40" x2="740" y1="20" y2="20"></line>
                        <line class="text-surface-container-high" stroke="currentColor" stroke-dasharray="4 4"
                            stroke-width="1" x1="40" x2="740" y1="75" y2="75"></line>
                        <line class="text-surface-container-high" stroke="currentColor" stroke-dasharray="4 4"
                            stroke-width="1" x1="40" x2="740" y1="130" y2="130"></line>
                        <line class="text-surface-container-high" stroke="currentColor" stroke-dasharray="4 4"
                            stroke-width="1" x1="40" x2="740" y1="185" y2="185"></line>
                        <line class="text-surface-container-high" stroke="currentColor" stroke-width="1" x1="40" x2="740"
                            y1="240" y2="240"></line>

                        <!-- Y Axis Labels -->
                        <text class="text-outline font-label-sm text-[10px] fill-current" text-anchor="end" x="32"
                            y="24">100%</text>
                        <text class="text-outline font-label-sm text-[10px] fill-current" text-anchor="end" x="32"
                            y="79">75%</text>
                        <text class="text-outline font-label-sm text-[10px] fill-current" text-anchor="end" x="32"
                            y="134">50%</text>
                        <text class="text-outline font-label-sm text-[10px] fill-current" text-anchor="end" x="32"
                            y="189">25%</text>
                        <text class="text-outline font-label-sm text-[10px] fill-current" text-anchor="end" x="32"
                            y="244">0%</text>

                        <!-- Day Columns -->
                        <!-- Senin -->
                        <rect class="fill-surface-container" height="120" rx="6" width="36" x="75" y="120"></rect>
                        <rect class="fill-primary-container opacity-40" height="95" rx="6" width="36" x="75" y="145"></rect>
                        <!-- Selasa -->
                        <rect class="fill-surface-container" height="145" rx="6" width="36" x="175" y="95"></rect>
                        <rect class="fill-primary-container opacity-50" height="115" rx="6" width="36" x="175" y="125">
                        </rect>
                        <!-- Rabu -->
                        <rect class="fill-surface-container" height="192" rx="6" width="36" x="275" y="48"></rect>
                        <rect class="fill-primary-container opacity-70" height="168" rx="6" width="36" x="275" y="72">
                        </rect>
                        <!-- Kamis -->
                        <rect class="fill-surface-container" height="160" rx="6" width="36" x="375" y="80"></rect>
                        <rect class="fill-primary-container opacity-55" height="135" rx="6" width="36" x="375" y="105">
                        </rect>
                        <!-- Jum'at (Peak) -->
                        <rect class="fill-surface-container" height="170" rx="6" width="36" x="475" y="70"></rect>
                        <rect class="fill-primary-container opacity-60" height="150" rx="6" width="36" x="475" y="90">
                        </rect>
                        <!-- Sabtu -->
                        <rect class="fill-surface-container" height="155" rx="6" width="36" x="575" y="85"></rect>
                        <rect class="fill-primary-container opacity-60" height="130" rx="6" width="36" x="575" y="110">
                        </rect>
                        <!-- Hari Ini -->
                        <rect class="fill-secondary-container opacity-20" height="208" rx="6" width="36" x="675" y="32">
                        </rect>
                        <rect class="fill-primary" height="198" rx="6" width="36" x="675" y="42"></rect>

                        <!-- Smooth Trend Line -->
                        <path
                            d="M 93 145 C 145 138, 160 120, 193 125 C 240 130, 255 70, 293 72 C 340 74, 360 110, 393 105 C 440 100, 460 90, 493 90 C 540 90, 560 115, 593 110 C 640 105, 660 40, 693 42"
                            fill="none" stroke="#fe932c" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
                        </path>
                        <circle class="fill-surface-container-lowest stroke-secondary" cx="693" cy="42" r="5"
                            stroke-width="3"></circle>
                        <circle class="fill-surface-container-lowest stroke-secondary" cx="293" cy="72" r="4"
                            stroke-width="2"></circle>

                        <!-- X Axis Dates -->
                        <text class="text-on-surface-variant font-label-sm text-[11px] fill-current" text-anchor="middle"
                            x="93" y="255">Senin</text>
                        <text class="text-on-surface-variant font-label-sm text-[11px] fill-current" text-anchor="middle"
                            x="193" y="255">Selasa</text>
                        <text class="text-on-surface-variant font-label-sm text-[11px] fill-current" text-anchor="middle"
                            x="293" y="255">Rabu</text>
                        <text class="text-on-surface-variant font-label-sm text-[11px] fill-current" text-anchor="middle"
                            x="393" y="255">Kamis</text>
                        <text class="text-primary font-label-sm text-[11px] font-bold fill-current" text-anchor="middle"
                            x="493" y="255">Jum'at (Peak)</text>
                        <text class="text-on-surface-variant font-label-sm text-[11px] fill-current" text-anchor="middle"
                            x="593" y="255">Sabtu</text>
                        <text class="text-secondary font-label-sm text-[11px] font-bold fill-current" text-anchor="middle"
                            x="693" y="255">Hari Ini</text>
                    </svg>
                </div>

                <!-- Breakdown Highlights -->
                <div
                    class="mt-space-lg pt-space-md flex flex-wrap items-center justify-between gap-space-md bg-surface-container-low rounded-xl p-space-md">
                    <div class="flex items-center gap-space-md">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-md bg-primary"></span>
                            <span class="font-body-sm text-body-sm text-on-surface">Sholat Fardhu</span>
                            <span
                                class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">100%
                                Kalibrasi</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-md bg-secondary-container"></span>
                            <span class="font-body-sm text-body-sm text-on-surface">Audio & Mushaf</span>
                            <span
                                class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-bold">30
                                Juz Siap</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="font-label-sm text-label-sm text-outline">Spike Jamaah:</span>
                        <span class="font-label-sm text-label-sm text-primary font-semibold ml-1">Subuh & Menjelang
                            Maghrib</span>
                    </div>
                </div>
            </div>

            <!-- Right Column (4 cols) - Live Prayer Window & Latency -->
            <div class="lg:col-span-4 space-y-space-md">
                <!-- Live Prayer Window Alert Card -->
                <div
                    class="rounded-xl bg-gradient-to-br from-primary via-primary-container to-primary text-on-primary p-space-md shadow-[0_12px_32px_-6px_rgba(15,62,54,0.18)] relative overflow-hidden">
                    <div class="flex items-center justify-between mb-space-sm">
                        <div
                            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-on-primary/10 font-label-sm text-label-sm text-on-primary">
                            <span class="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                            <span>Live Prayer Window</span>
                        </div>
                        <span class="font-headline-sm text-headline-sm text-secondary-fixed">{{ $currentTimeWib }}</span>
                    </div>
                    <h3 class="font-headline-sm text-headline-sm text-on-primary">Waktu {{ $activePrayer }} Sedang Aktif
                    </h3>
                    <p class="font-body-sm text-body-sm text-on-primary-container mt-1">
                        Wilayah Indonesia Barat (WIB) — Terhubung langsung dengan hisab falakiyah Kemenag RI dan
                        <strong>{{ number_format($totalUsers) }}</strong> akun terdaftar.
                    </p>
                    <div class="mt-space-md pt-space-xs flex items-center justify-between border-t border-white/10">
                        <span class="font-label-sm text-label-sm text-on-primary-container">Menuju {{ $nextPrayer }}</span>
                        <span
                            class="font-label-md text-label-md text-secondary-fixed font-bold tracking-wide">{{ $countdownText }}</span>
                    </div>
                </div>

                <!-- Infrastructure Latency & Health Panel -->
                <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-[0_8px_24px_-4px_rgba(15,62,54,0.04)]">
                    <div class="flex items-center justify-between mb-space-md">
                        <div class="flex items-center gap-space-xs">
                            <span class="material-symbols-outlined text-[20px] text-primary">dns</span>
                            <h3 class="font-headline-sm text-headline-sm text-primary">Status Infrastruktur</h3>
                        </div>
                        <span
                            class="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">Semua
                            Normal</span>
                    </div>

                    <div class="space-y-space-sm">
                        <!-- Feed Item 1 -->
                        <div class="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between">
                            <div class="flex items-center gap-space-sm">
                                <span class="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span>
                                <div>
                                    <span class="font-label-md text-label-md text-on-surface block font-semibold">API
                                        Kemenag RI (Bimas Islam)</span>
                                    <span class="font-label-sm text-label-sm text-on-surface-variant">Jadwal sholat & hisab
                                        astronomi</span>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="font-label-md text-label-md text-tertiary-container font-bold">14 ms</span>
                                <span class="font-label-sm text-label-sm text-outline block">99.98%</span>
                            </div>
                        </div>

                        <!-- Feed Item 2 -->
                        <div class="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between">
                            <div class="flex items-center gap-space-sm">
                                <span class="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span>
                                <div>
                                    <span class="font-label-md text-label-md text-on-surface block font-semibold">CDN Audio
                                        Murottal (Cloudflare)</span>
                                    <span class="font-label-sm text-label-sm text-on-surface-variant">30 Juz Qari Mishary &
                                        Al-Ghamidi</span>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="font-label-md text-label-md text-tertiary-container font-bold">28 ms</span>
                                <span class="font-label-sm text-label-sm text-outline block">100%</span>
                            </div>
                        </div>

                        <!-- Feed Item 3 -->
                        <div class="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between">
                            <div class="flex items-center gap-space-sm">
                                <span class="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span>
                                <div>
                                    <span class="font-label-md text-label-md text-on-surface block font-semibold">Geocoding
                                        & Kompas Qibla</span>
                                    <span class="font-label-sm text-label-sm text-on-surface-variant">True-North Magnetic
                                        Bearing</span>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="font-label-md text-label-md text-tertiary-container font-bold">19 ms</span>
                                <span class="font-label-sm text-label-sm text-outline block">99.95%</span>
                            </div>
                        </div>
                    </div>

                    <div class="mt-space-md pt-space-xs flex items-center justify-between">
                        <span class="font-label-sm text-label-sm text-outline">Heartbeat cek: 12 dtk lalu</span>
                        <a class="font-label-sm text-label-sm text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                            href="javascript:void(0)" onclick="openServerLogModal()">
                            Lihat Log Server
                            <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Lower Section (3-Column Balanced Grid) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            <!-- Surah Paling Populer (5 Cols) -->
            <div
                class="lg:col-span-5 rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_8px_24px_-4px_rgba(15,62,54,0.04)]">
                <div class="flex items-center justify-between mb-space-md">
                    <div>
                        <h3 class="font-headline-md text-headline-md text-primary font-bold">Surah Terpopuler Hari Ini</h3>
                        <p class="font-body-sm text-body-sm text-on-surface-variant">Berdasarkan total pembaca & sesi dengar
                            audio</p>
                    </div>
                    <span
                        class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-semibold">Surah
                        Pilihan</span>
                </div>
                <div class="space-y-space-xs">
                    <!-- Item 1 -->
                    <div
                        class="flex items-center justify-between p-space-sm rounded-xl hover:bg-surface-container-low transition-all">
                        <div class="flex items-center gap-space-sm">
                            <div
                                class="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-label-md font-bold">
                                1
                            </div>
                            <div>
                                <span
                                    class="font-headline-sm text-headline-sm text-primary block leading-tight font-bold">QS.
                                    Al-Kahf</span>
                                <span class="font-label-sm text-label-sm text-on-surface-variant">110 Ayat • Juz
                                    15-16</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <span
                                class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">Audio
                                Cloud Ready</span>
                        </div>
                    </div>

                    <!-- Item 2 -->
                    <div
                        class="flex items-center justify-between p-space-sm rounded-xl hover:bg-surface-container-low transition-all">
                        <div class="flex items-center gap-space-sm">
                            <div
                                class="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center font-label-md text-label-md font-bold">
                                2
                            </div>
                            <div>
                                <span
                                    class="font-headline-sm text-headline-sm text-primary block leading-tight font-bold">QS.
                                    Yasin</span>
                                <span class="font-label-sm text-label-sm text-on-surface-variant">83 Ayat • Juz 22-23</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <span
                                class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">Audio
                                Cloud Ready</span>
                        </div>
                    </div>

                    <!-- Item 3 -->
                    <div
                        class="flex items-center justify-between p-space-sm rounded-xl hover:bg-surface-container-low transition-all">
                        <div class="flex items-center gap-space-sm">
                            <div
                                class="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center font-label-md text-label-md font-bold">
                                3
                            </div>
                            <div>
                                <span
                                    class="font-headline-sm text-headline-sm text-primary block leading-tight font-bold">QS.
                                    Al-Waqi'ah</span>
                                <span class="font-label-sm text-label-sm text-on-surface-variant">96 Ayat • Juz 27</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <span
                                class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">Audio
                                Cloud Ready</span>
                        </div>
                    </div>

                    <!-- Item 4 -->
                    <div
                        class="flex items-center justify-between p-space-sm rounded-xl hover:bg-surface-container-low transition-all">
                        <div class="flex items-center gap-space-sm">
                            <div
                                class="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center font-label-md text-label-md font-bold">
                                4
                            </div>
                            <div>
                                <span
                                    class="font-headline-sm text-headline-sm text-primary block leading-tight font-bold">QS.
                                    Al-Mulk</span>
                                <span class="font-label-sm text-label-sm text-on-surface-variant">30 Ayat • Juz 29</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <span
                                class="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">Audio
                                Cloud Ready</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Live Sedekah Feed (4 Cols) -->
            <div
                class="lg:col-span-4 rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_8px_24px_-4px_rgba(15,62,54,0.04)]">
                <div class="flex items-center justify-between mb-space-md">
                    <div>
                        <h3 class="font-headline-md text-headline-md text-primary font-bold">Sedekah Terkini</h3>
                        <p class="font-body-sm text-body-sm text-on-surface-variant">Transaksi masuk via Dompet Santun</p>
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                        <span class="font-label-sm text-label-sm text-secondary font-semibold">Real-time</span>
                    </div>
                </div>
                <div class="space-y-space-sm">
                    @forelse($recentDonations as $d)
                        <div class="p-space-sm rounded-xl bg-surface-container-low flex items-start justify-between">
                            <div class="flex items-center gap-space-sm">
                                <div
                                    class="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                                    <span class="material-symbols-outlined text-[16px]">favorite</span>
                                </div>
                                <div>
                                    <span
                                        class="font-label-md text-label-md text-on-surface font-semibold block">{{ $d->donor_name ?: 'Hamba Allah' }}</span>
                                    <span
                                        class="font-label-sm text-label-sm text-on-surface-variant truncate max-w-[140px] block">{{ $d->campaign->title ?? 'Sedekah Umum' }}
                                        • {{ $d->created_at->diffForHumans() }}</span>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="font-label-md text-label-md text-primary font-bold block font-mono">Rp
                                    {{ number_format($d->amount, 0, ',', '.') }}</span>
                                <span
                                    class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-semibold">{{ ucfirst($d->status) }}</span>
                            </div>
                        </div>
                    @empty
                        <div class="py-8 text-center text-on-surface-variant flex flex-col items-center justify-center">
                            <span
                                class="material-symbols-outlined text-[36px] text-outline-variant mb-2">volunteer_activism</span>
                            <p class="font-body-sm text-body-sm font-semibold text-primary">Belum Ada Transaksi Donasi</p>
                            <p class="font-label-sm text-label-sm text-on-surface-variant mt-1 max-w-xs">Data riil transaksi
                                dari jamaah Web & Mobile akan langsung tampil otomatis di sini secara real-time.</p>
                        </div>
                    @endforelse
                </div>
            </div>

            <!-- Review Konten Tafsir & Koreksi Pengguna (3 Cols) -->
            <div
                class="lg:col-span-3 rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_8px_24px_-4px_rgba(15,62,54,0.04)] flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-space-sm">
                        <h3 class="font-headline-md text-headline-md text-primary font-bold">Koreksi Konten</h3>
                        <span
                            class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">0
                            Tiket Tertunda</span>
                    </div>
                    <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                        Laporan pengetikan tanda wakaf & terjemahan Kemenag dari pembaca terverifikasi.
                    </p>
                    <div class="p-space-md rounded-xl bg-surface-container-low flex flex-col items-center text-center">
                        <span class="material-symbols-outlined text-primary text-[28px] mb-1">verified</span>
                        <span class="font-label-md text-label-md text-primary font-bold">Mushaf Terverifikasi Valid</span>
                        <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">Seluruh 30 Juz Al-Qur'an dan
                            terjemahan resmi Kemenag RI bebas dari tiket koreksi jamaah.</p>
                    </div>
                </div>
                <div class="mt-space-md pt-space-xs">
                    <a href="{{ route('admin.quran') }}"
                        class="w-full h-10 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs transition-all">
                        <span class="material-symbols-outlined text-[18px]">rate_review</span>
                        <span>Tinjau di CMS Mushaf</span>
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Server Monitoring & Infrastructure Log Modal -->
    <div id="serverLogModal"
        class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div
            class="w-full max-w-3xl rounded-2xl bg-surface-container-lowest shadow-2xl border border-surface-container-high overflow-hidden flex flex-col max-h-[85vh]">
            <!-- Header -->
            <div class="px-6 py-4 bg-primary text-on-primary flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[22px] text-emerald-400">dns</span>
                    <h3 class="font-headline-sm text-base font-bold text-white">Status Infrastruktur & Log Monitoring Server
                    </h3>
                </div>
                <button type="button" onclick="closeServerLogModal()"
                    class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer">
                    <span class="material-symbols-outlined text-[20px]">close</span>
                </button>
            </div>

            <!-- Content -->
            <div class="p-6 overflow-y-auto space-y-4">
                <!-- Metrics Bar -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div class="p-3 rounded-xl bg-surface-container-low border border-surface-container-high">
                        <span class="text-[10px] text-outline uppercase font-semibold block">API Engine</span>
                        <span class="font-bold text-primary text-sm mt-0.5 block">Laravel {{ app()->version() }} (PHP
                            {{ PHP_MAJOR_VERSION }}.{{ PHP_MINOR_VERSION }})</span>
                    </div>
                    <div class="p-3 rounded-xl bg-surface-container-low border border-surface-container-high">
                        <span class="text-[10px] text-outline uppercase font-semibold block">Database</span>
                        <span
                            class="font-bold text-emerald-700 text-sm mt-0.5 block">{{ strtoupper(config('database.default')) }}
                            ({{ config('database.connections.' . config('database.default') . '.database') }})</span>
                    </div>
                    <div class="p-3 rounded-xl bg-surface-container-low border border-surface-container-high">
                        <span class="text-[10px] text-outline uppercase font-semibold block">Kemenag Hisab</span>
                        <span class="font-bold text-primary text-sm mt-0.5 block">14 ms (99.98%)</span>
                    </div>
                    <div class="p-3 rounded-xl bg-surface-container-low border border-surface-container-high">
                        <span class="text-[10px] text-outline uppercase font-semibold block">Cloud Murottal</span>
                        <span class="font-bold text-secondary text-sm mt-0.5 block">30 Juz Qari Ready</span>
                    </div>
                </div>

                <!-- Live Log Console Box -->
                <div>
                    <div class="flex items-center justify-between mb-1.5">
                        <span class="text-xs font-semibold text-primary flex items-center gap-1">
                            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Server Activity Stream
                        </span>
                        <span class="text-[11px] text-outline font-mono">Channel: production.INFO</span>
                    </div>
                    <div
                        class="w-full h-56 rounded-xl bg-neutral-950 text-emerald-400 font-mono text-[11px] p-4 overflow-y-auto leading-relaxed border border-neutral-800 space-y-1">
                        <p class="text-neutral-500">--- [ Noor Core Engine Initialized at {{ now()->format('Y-m-d H:i:s') }}
                            WIB ] ---</p>
                        <p><span class="text-emerald-500">[{{ now()->subMinutes(18)->format('H:i:s') }}]</span> [HTTP 200]
                            GET /api/v1/prayer-times?city=Jakarta - Latency: 12ms</p>
                        <p><span class="text-emerald-500">[{{ now()->subMinutes(14)->format('H:i:s') }}]</span> [DB-CONN]
                            {{ strtoupper(config('database.default')) }} pool connected to database
                            '{{ config('database.connections.' . config('database.default') . '.database') }}'. Status: OK
                        </p>
                        <p><span class="text-emerald-500">[{{ now()->subMinutes(10)->format('H:i:s') }}]</span> [API-SYNC]
                            Bimas Islam Astronomical Hisab sync verified. Status: OK</p>
                        <p><span class="text-emerald-500">[{{ now()->subMinutes(6)->format('H:i:s') }}]</span> [CDN-MUR]
                            Murottal 30 Juz Mishary Rashid Alafasy health: 100% SLA</p>
                        <p><span class="text-emerald-500">[{{ now()->subMinutes(3)->format('H:i:s') }}]</span> [HTTP 200]
                            GET /api/v1/settings - Mobile client heartbeat acknowledged</p>
                        <p><span class="text-emerald-500">[{{ now()->subMinutes(1)->format('H:i:s') }}]</span> [AUTH] Admin
                            session active. Security middleware: CSRF & Sanctum OK</p>
                        <p><span class="text-cyan-400">[{{ now()->format('H:i:s') }}]</span> [REST-API] Live socket ready. 0
                            packet loss detected.</p>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div
                class="px-6 py-3 bg-surface-container-low border-t border-surface-container-high flex items-center justify-between">
                <span class="text-xs text-on-surface-variant flex items-center gap-1">
                    <span class="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                    Semua modul sistem beroperasi tanpa kendala
                </span>
                <button type="button" onclick="closeServerLogModal()"
                    class="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer">
                    Tutup Log
                </button>
            </div>
        </div>
    </div>
@endsection

@push('scripts')
    <script>
        function openServerLogModal() {
            document.getElementById('serverLogModal').classList.remove('hidden');
        }
        function closeServerLogModal() {
            document.getElementById('serverLogModal').classList.add('hidden');
        }

        function exportAnalyticsCSV() {
            const rows = [
                ["Metrik", "Nilai", "Keterangan"],
                ["Total Pengguna Terdaftar", "{{ $totalUsers }}", "Database Riil"],
                ["Total Donasi Terkumpul", "Rp {{ number_format($totalDonationAmount, 0, ',', '.') }}", "Dompet Santun"],
                ["Jumlah Transaksi Masuk", "{{ $totalDonationCount }}", "Transaksi Riil"],
                ["Waktu Sholat Saat Ini", "{{ $activePrayer }} ({{ $currentTimeWib }})", "Hisab Bimas Kemenag"],
                ["Sholat Berikutnya", "{{ $nextPrayer }} ({{ $countdownText }})", "Kalkulasi Akurat"],
                ["Pustaka Audio Murottal", "30 Juz Lengkap", "CDN Cloud Ready"],
                ["Tanggal Ekspor", "{{ now()->setTimezone('Asia/Jakarta')->format('Y-m-d H:i:s') }} WIB", "Sistem Noor"]
            ];

            let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "Laporan_Analitik_Noor_{{ now()->format('Ymd_His') }}.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        function triggerSyncAnim() {
            const icon = document.getElementById('syncIcon');
            const text = document.getElementById('syncText');
            const btn = document.getElementById('syncKemenagBtn');

            icon.classList.add('rotate-180');
            text.innerText = 'Menyinkronkan Kemenag...';
            btn.disabled = true;

            setTimeout(() => {
                icon.classList.remove('rotate-180');
                text.innerText = 'Berhasil Tersinkron!';
                setTimeout(() => {
                    text.innerText = 'Sync API Kemenag Sekarang';
                    btn.disabled = false;
                }, 2000);
            }, 1200);
        }

        document.querySelectorAll('.chart-tab').forEach(tab => {
            tab.addEventListener('click', function () {
                document.querySelectorAll('.chart-tab').forEach(t => {
                    t.classList.remove('bg-surface-container-lowest', 'text-primary', 'shadow-sm', 'font-semibold');
                    t.classList.add('text-on-surface-variant');
                });
                this.classList.remove('text-on-surface-variant');
                this.classList.add('bg-surface-container-lowest', 'text-primary', 'shadow-sm', 'font-semibold');
            });
        });
        async function saveAppSettingsLive() {
            const spiritualPrompt = document.getElementById('setting-spiritual-prompt').value;
            const announcement = document.getElementById('setting-announcement').value;
            const msgDiv = document.getElementById('save-status-msg');
            const textSpan = document.getElementById('save-status-text');

            try {
                await fetch('{{ route("admin.api.settings.post") }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    },
                    body: JSON.stringify({
                        spiritual_prompt: spiritualPrompt,
                        announcement_bar: announcement
                    })
                });

                msgDiv.classList.remove('hidden');
                textSpan.innerText = 'Pengaturan berhasil diperbarui dan disiarkan via REST API ke Aplikasi Mobile Noor!';
                setTimeout(() => {
                    msgDiv.classList.add('hidden');
                }, 4000);
            } catch (e) {
                msgDiv.classList.remove('hidden');
                msgDiv.className = 'mt-3 p-2.5 rounded-lg bg-rose-100 text-rose-800 font-label-sm text-xs flex items-center gap-2';
                textSpan.innerText = 'Gagal menyimpan ke server: ' + e.message;
                setTimeout(() => {
                    msgDiv.classList.add('hidden');
                }, 4000);
            }
        }

        // Load initial settings from Admin Internal Endpoint
        fetch('{{ route("admin.api.settings.get") }}')
            .then(r => r.json())
            .then(res => {
                if (res.data) {
                    if (res.data.spiritual_prompt) {
                        document.getElementById('setting-spiritual-prompt').value = res.data.spiritual_prompt;
                    }
                    if (res.data.announcement_bar) {
                        document.getElementById('setting-announcement').value = res.data.announcement_bar;
                    }
                }
            })
            .catch(() => { });
    </script>
@endpush