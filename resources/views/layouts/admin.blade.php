<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <meta content="web_dashboard" name="shell-type" />
    <title>@yield('title', 'Noor Console') — Islamic Super App Admin</title>

    <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        rel="stylesheet" />
    <link href="https://fonts.googleapis.com" rel="preconnect" />
    <link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect" />
    <link
        href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet" />

    <style>
        @layer base {

            html,
            body {
                margin: 0;
                padding: 0;
            }

            body {
                overscroll-behavior: none;
            }

            main> :first-child {
                margin-top: 0 !important;
            }

            main> :last-child {
                margin-bottom: 0 !important;
            }
        }

        ::-webkit-scrollbar {
            display: none;
        }
    </style>

    <script src="https://cdn.tailwindcss.com"></script>
    <script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "on-error": "#ffffff",
                        "outline-variant": "#c0c8c5",
                        "on-error-container": "#93000a",
                        "secondary-fixed": "#ffdcc3",
                        "on-tertiary-fixed-variant": "#1f4f43",
                        "primary-container": "#0f3e36",
                        "surface-container-low": "#f2f4f3",
                        "on-secondary-fixed-variant": "#6e3900",
                        "error-container": "#ffdad6",
                        "surface-container-lowest": "#ffffff",
                        "secondary-fixed-dim": "#ffb77d",
                        "background": "#f8faf9",
                        "secondary": "#904d00",
                        "surface-container-high": "#e6e9e8",
                        "on-primary-container": "#7ca99e",
                        "surface-container-highest": "#e1e3e2",
                        "surface-bright": "#f8faf9",
                        "outline": "#717976",
                        "inverse-surface": "#2e3131",
                        "surface-variant": "#e1e3e2",
                        "on-primary-fixed": "#00201b",
                        "surface": "#f8faf9",
                        "tertiary-container": "#0b3f34",
                        "error": "#ba1a1a",
                        "inverse-on-surface": "#eff1f0",
                        "primary-fixed-dim": "#a2d0c4",
                        "on-surface": "#191c1c",
                        "primary-fixed": "#bdece0",
                        "on-surface-variant": "#404846",
                        "secondary-container": "#fe932c",
                        "on-tertiary": "#ffffff",
                        "tertiary-fixed": "#bbeddd",
                        "surface-container": "#eceeed",
                        "on-secondary-container": "#663500",
                        "tertiary": "#002820",
                        "tertiary-fixed-dim": "#9fd1c1",
                        "surface-dim": "#d8dada",
                        "on-background": "#191c1c",
                        "on-tertiary-fixed": "#002019",
                        "primary": "#002721",
                        "surface-tint": "#3b665d",
                        "on-primary": "#ffffff",
                        "on-secondary-fixed": "#2f1500",
                        "on-primary-fixed-variant": "#224e46",
                        "on-tertiary-container": "#7aaa9c",
                        "inverse-primary": "#a2d0c4",
                        "on-secondary": "#ffffff"
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "2xl": "1rem",
                        "full": "9999px"
                    },
                    spacing: {
                        "space-sm": "0.5rem",
                        "space-xl": "2.25rem",
                        "margin-tablet": "2rem",
                        "margin": "1.25rem",
                        "gutter-tablet": "1.5rem",
                        "gutter": "1rem",
                        "space-xs": "0.25rem",
                        "space-md": "1rem",
                        "space-lg": "1.5rem",
                        "space-2xl": "3.5rem"
                    },
                    fontFamily: {
                        "body-lg": ["Plus Jakarta Sans"],
                        "headline-md": ["Noto Serif"],
                        "display-lg-mobile": ["Noto Serif"],
                        "arabic-display": ["Noto Serif"],
                        "headline-sm": ["Noto Serif"],
                        "arabic-body": ["Noto Serif"],
                        "display-lg": ["Noto Serif"],
                        "label-sm": ["Plus Jakarta Sans"],
                        "headline-lg-mobile": ["Noto Serif"],
                        "label-md": ["Plus Jakarta Sans"],
                        "headline-lg": ["Noto Serif"],
                        "label-lg": ["Plus Jakarta Sans"],
                        "body-md": ["Plus Jakarta Sans"],
                        "body-sm": ["Plus Jakarta Sans"]
                    },
                    fontSize: {
                        "body-lg": ["17px", { "lineHeight": "26px", "fontWeight": "400" }],
                        "headline-md": ["22px", { "lineHeight": "30px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
                        "display-lg-mobile": ["34px", { "lineHeight": "42px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
                        "arabic-display": ["36px", { "lineHeight": "64px", "fontWeight": "400" }],
                        "headline-sm": ["18px", { "lineHeight": "26px", "fontWeight": "600" }],
                        "arabic-body": ["24px", { "lineHeight": "48px", "fontWeight": "400" }],
                        "display-lg": ["44px", { "lineHeight": "52px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
                        "label-sm": ["11px", { "lineHeight": "14px", "letterSpacing": "0.04em", "fontWeight": "600" }],
                        "headline-lg-mobile": ["26px", { "lineHeight": "34px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
                        "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.03em", "fontWeight": "600" }],
                        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.015em", "fontWeight": "600" }],
                        "label-lg": ["14px", { "lineHeight": "18px", "letterSpacing": "0.02em", "fontWeight": "600" }],
                        "body-md": ["15px", { "lineHeight": "22px", "fontWeight": "400" }],
                        "body-sm": ["13px", { "lineHeight": "18px", "fontWeight": "400" }]
                    }
                }
            }
        };
    </script>
</head>

<body class="bg-background font-body-md text-body-md text-on-surface antialiased">
    <!-- Aside Sidebar (Original Stitch Precision) -->
    <aside
        class="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest shadow-[0_1px_16px_rgba(15,62,54,0.04)] z-50 flex flex-col justify-between">
        <div class="flex flex-col">
            <div class="h-20 px-space-lg flex items-center justify-between">
                <a href="{{ route('admin.dashboard') }}" class="flex items-center gap-space-sm">
                    <div
                        class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-[0_4px_12px_rgba(15,62,54,0.18)]">
                        <span class="material-symbols-outlined text-[20px]">mosque</span>
                    </div>
                    <div>
                        <span class="font-headline-sm text-headline-sm text-primary tracking-tight block font-bold">Noor
                            Console</span>
                        <span class="font-label-sm text-label-sm text-on-surface-variant">Islamic Super App Admin</span>
                    </div>
                </a>
            </div>

            <div class="px-space-md py-space-sm">
                <div class="px-space-sm pb-space-xs">
                    <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider">Manajemen
                        Utama</span>
                </div>
                <nav class="flex flex-col gap-space-xs">
                    <a href="{{ route('admin.dashboard') }}"
                        class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl transition-all {{ request()->routeIs('admin.dashboard') ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_4px_16px_rgba(15,62,54,0.08)]' : 'text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high hover:text-on-surface' }}">
                        <span class="material-symbols-outlined text-[20px]">grid_view</span>
                        <span>Dashboard Overview</span>
                    </a>

                    <a href="{{ route('admin.quran') }}"
                        class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl transition-all {{ request()->routeIs('admin.quran') && !request()->routeIs('admin.quran.editor') ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_4px_16px_rgba(15,62,54,0.08)]' : 'text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high hover:text-on-surface' }}">
                        <span class="material-symbols-outlined text-[20px]">menu_book</span>
                        <span>Manajemen Konten Qur'an</span>
                    </a>

                    <a href="{{ route('admin.quran.editor') }}"
                        class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl transition-all {{ request()->routeIs('admin.quran.editor') ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_4px_16px_rgba(15,62,54,0.08)]' : 'text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high hover:text-on-surface' }}">
                        <span class="material-symbols-outlined text-[20px]">graphic_eq</span>
                        <span>Editor Kalibrasi Audio</span>
                    </a>

                    <a href="{{ route('admin.prayer.schedule') }}"
                        class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl transition-all {{ request()->routeIs('admin.prayer*') ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_4px_16px_rgba(15,62,54,0.08)]' : 'text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high hover:text-on-surface' }}">
                        <span class="material-symbols-outlined text-[20px]">schedule</span>
                        <span>Jadwal Sholat & Hisab</span>
                    </a>

                    <a href="{{ route('admin.banners') }}"
                        class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl transition-all {{ request()->routeIs('admin.banners*') ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_4px_16px_rgba(15,62,54,0.08)]' : 'text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high hover:text-on-surface' }}">
                        <span class="material-symbols-outlined text-[20px]">view_carousel</span>
                        <span>Manajemen Iklan Carousel</span>
                    </a>

                    <a href="{{ route('admin.catalog') }}"
                        class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl transition-all {{ request()->routeIs('admin.catalog*') ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_4px_16px_rgba(15,62,54,0.08)]' : 'text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high hover:text-on-surface' }}">
                        <span class="material-symbols-outlined text-[20px]">storefront</span>
                        <span>Katalog Produk & Umrah</span>
                    </a>

                    <a href="{{ route('admin.premium') }}"
                        class="flex items-center justify-between px-space-md py-space-sm rounded-xl transition-all {{ request()->routeIs('admin.premium*') ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_4px_16px_rgba(15,62,54,0.08)]' : 'text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high hover:text-on-surface' }}">
                        <div class="flex items-center gap-space-sm">
                            <span class="material-symbols-outlined text-[20px]">workspace_premium</span>
                            <span>Noor+ Bebas Iklan</span>
                        </div>
                        <span
                            class="px-1.5 py-0.5 rounded-md bg-secondary-fixed text-secondary text-[10px] font-bold">PRO</span>
                    </a>

                    <a href="{{ route('admin.zakat') }}"
                        class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl transition-all {{ request()->routeIs('admin.zakat*') ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_4px_16px_rgba(15,62,54,0.08)]' : 'text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high hover:text-on-surface' }}">
                        <span class="material-symbols-outlined text-[20px]">volunteer_activism</span>
                        <span>Zakat & Sedekah</span>
                    </a>

                    <a href="{{ route('admin.users') }}"
                        class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl transition-all {{ request()->routeIs('admin.users*') ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_4px_16px_rgba(15,62,54,0.08)]' : 'text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high hover:text-on-surface' }}">
                        <span class="material-symbols-outlined text-[20px]">group</span>
                        <span>Manajemen Pengguna</span>
                    </a>

                    <!-- Sidebar Logout Button -->
                    <form action="{{ route('logout') }}" method="POST"
                        class="mt-2 pt-2 border-t border-surface-container-high">
                        @csrf
                        <button type="submit"
                            class="w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-rose-700 hover:bg-rose-50 transition-colors font-label-lg text-label-lg font-semibold cursor-pointer">
                            <span class="material-symbols-outlined text-[20px] text-rose-600">logout</span>
                            <span>Keluar Sistem</span>
                        </button>
                    </form>
                </nav>
            </div>
        </div>

        <div class="p-space-md">
            <div class="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs">
                <div class="flex items-center gap-space-sm">
                    <span class="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                    <span class="font-label-sm text-label-sm text-on-surface font-semibold">Laravel 13 • PHP 8.4</span>
                </div>
                <span class="font-label-sm text-label-sm text-on-surface-variant">Server Production • Cloud
                    Jakarta</span>
            </div>
        </div>
    </aside>

    <!-- Pl-72 Content Area -->
    <div class="pl-72">
        <header
            class="fixed top-0 left-72 right-0 h-20 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,62,54,0.04)] z-40 flex items-center justify-between px-space-lg">
            <div class="flex items-center gap-space-lg flex-1 max-w-xl">
                <div class="relative w-full max-w-sm">
                    <span
                        class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                    <input
                        class="w-full h-10 pl-9 pr-4 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-sm text-body-sm shadow-[0_2px_8px_rgba(15,62,54,0.03)] focus:outline-none"
                        placeholder="Cari ayat, surat, donatur, atau user..." type="text"
                        onkeydown="if(event.key==='Enter'){ const v=this.value.trim(); if(!v) return; const lv=v.toLowerCase(); if(lv.includes('fatihah')||lv.includes('baqarah')||lv.includes('kahf')||lv.includes('yasin')||lv.includes('mulk')||lv.includes('surat')||lv.includes('surah')||lv.includes('ayat')){ window.location.href='{{ route('admin.quran') }}?q='+encodeURIComponent(v); } else if(lv.includes('zakat')||lv.includes('wakaf')||lv.includes('donasi')||lv.includes('donatur')){ window.location.href='{{ route('admin.zakat') }}'; } else { window.location.href='{{ route('admin.users') }}?search='+encodeURIComponent(v); } }" />
                </div>
            </div>

            <div class="flex items-center gap-space-md">
                <div
                    class="flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed shadow-[0_1px_4px_rgba(15,62,54,0.04)]">
                    <span class="material-symbols-outlined text-[16px] text-primary">sync_saved_locally</span>
                    <span class="font-label-sm text-label-sm font-semibold">API Kemenag Sinkron</span>
                </div>

                <!-- Notification Menu Dropdown -->
                <div class="relative">
                    <button id="adminNotificationBtn" aria-label="Notifikasi"
                        class="relative w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors shadow-[0_2px_8px_rgba(15,62,54,0.03)] cursor-pointer"
                        type="button" onclick="toggleAdminNotificationMenu()">
                        <span class="material-symbols-outlined text-[20px]">notifications</span>
                        <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                    </button>

                    <div id="adminNotificationMenu"
                        class="hidden absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-surface-container-lowest shadow-2xl border border-surface-container-high p-4 z-50 animate-in fade-in duration-200">
                        <div class="flex items-center justify-between pb-3 border-b border-surface-container-high mb-3">
                            <div class="flex items-center gap-1.5">
                                <span
                                    class="material-symbols-outlined text-primary text-[18px]">notifications_active</span>
                                <span class="font-headline-sm text-sm font-bold text-primary">Notifikasi Sistem</span>
                            </div>
                            <span
                                class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Semua
                                Normal</span>
                        </div>
                        <div class="space-y-2.5 max-h-80 overflow-y-auto">
                            <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low text-xs">
                                <span
                                    class="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">verified</span>
                                <div>
                                    <span class="font-semibold text-primary block">API Bimas Islam Terhubung</span>
                                    <span class="text-on-surface-variant text-[11px] block mt-0.5">Jadwal sholat & hisab
                                        astronomis aktif dan tersinkronisasi presisi.</span>
                                </div>
                            </div>
                            <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low text-xs">
                                <span
                                    class="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">cloud_done</span>
                                <div>
                                    <span class="font-semibold text-primary block">CDN Audio Murottal 30 Juz Siap</span>
                                    <span class="text-on-surface-variant text-[11px] block mt-0.5">Server audio Qari
                                        Mishary Rashid Alafasy siap melayani streaming mobile.</span>
                                </div>
                            </div>
                            <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low text-xs">
                                <span
                                    class="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">volunteer_activism</span>
                                <div>
                                    <span class="font-semibold text-primary block">Gateway Zakat & Wakaf Siap</span>
                                    <span class="text-on-surface-variant text-[11px] block mt-0.5">Database dompet
                                        santun siap mencatat transaksi donasi riil jamaah.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Admin Profile Dropdown with Logout -->
                <div class="relative">
                    <button id="adminProfileBtn" onclick="toggleAdminProfileMenu()" type="button"
                        class="flex items-center gap-space-sm pl-space-sm py-1.5 px-2 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer">
                        <div class="relative">
                            <div
                                class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs ring-2 ring-emerald-500/20">
                                <span class="material-symbols-outlined text-[18px]">person</span>
                            </div>
                            <span
                                class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                        </div>
                        <div class="flex flex-col text-left">
                            <span
                                class="font-label-md text-label-md text-on-surface font-semibold leading-tight flex items-center gap-1">
                                {{ Auth::user()->name ?? 'Administrator Noor' }}
                                <span class="material-symbols-outlined text-[14px] text-outline">expand_more</span>
                            </span>
                            <span class="font-label-sm text-label-sm text-secondary leading-tight">Super Admin</span>
                        </div>
                    </button>

                    <!-- Dropdown Menu -->
                    <div id="adminProfileMenu"
                        class="hidden absolute right-0 mt-2 w-64 rounded-2xl bg-surface-container-lowest shadow-2xl border border-surface-container-high p-3 z-50 animate-in fade-in duration-200">
                        <div
                            class="p-2.5 rounded-xl bg-surface-container-low mb-2 border border-surface-container-high">
                            <span
                                class="font-bold text-xs text-primary block truncate">{{ Auth::user()->name ?? 'Administrator Noor' }}</span>
                            <span class="text-[11px] text-on-surface-variant block truncate">{{ Auth::user()->email ??
                                'admin@noor.app' }}</span>
                            <span
                                class="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Role:
                                Super Admin</span>
                        </div>

                        <div class="space-y-1">
                            <a href="{{ route('admin.users') }}"
                                class="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-container-low text-xs font-semibold text-primary transition-colors">
                                <span class="material-symbols-outlined text-[18px]">group</span>
                                <span>Manajemen Pengguna</span>
                            </a>
                            <a href="{{ route('admin.prayer.schedule') }}"
                                class="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-container-low text-xs font-semibold text-primary transition-colors">
                                <span class="material-symbols-outlined text-[18px]">tune</span>
                                <span>Pengaturan Hisab & Kalibrasi</span>
                            </a>
                        </div>

                        <div class="mt-2 pt-2 border-t border-surface-container-high">
                            <form action="{{ route('logout') }}" method="POST">
                                @csrf
                                <button type="submit"
                                    class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer">
                                    <span class="material-symbols-outlined text-[18px] text-rose-600">logout</span>
                                    <span>Keluar dari Console (Logout)</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Quick Logout Button in Header -->
                <form action="{{ route('logout') }}" method="POST" class="inline">
                    @csrf
                    <button type="submit" title="Keluar / Logout dari Sistem"
                        class="w-10 h-10 rounded-xl bg-surface-container-lowest hover:bg-rose-50 text-outline hover:text-rose-600 flex items-center justify-center transition-colors shadow-sm cursor-pointer border border-surface-container-high">
                        <span class="material-symbols-outlined text-[20px]">logout</span>
                    </button>
                </form>
            </div>
        </header>

        <main class="w-full pt-20 px-space-lg pb-space-2xl bg-background">
            @yield('content')
        </main>
    </div>

    <script>
        function toggleAdminNotificationMenu() {
            const menu = document.getElementById('adminNotificationMenu');
            if (menu) {
                menu.classList.toggle('hidden');
            }
        }
        function toggleAdminProfileMenu() {
            const menu = document.getElementById('adminProfileMenu');
            if (menu) {
                menu.classList.toggle('hidden');
            }
        }
        document.addEventListener('click', function (e) {
            const notifBtn = document.getElementById('adminNotificationBtn');
            const notifMenu = document.getElementById('adminNotificationMenu');
            if (notifBtn && notifMenu && !notifBtn.contains(e.target) && !notifMenu.contains(e.target)) {
                notifMenu.classList.add('hidden');
            }

            const profileBtn = document.getElementById('adminProfileBtn');
            const profileMenu = document.getElementById('adminProfileMenu');
            if (profileBtn && profileMenu && !profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
                profileMenu.classList.add('hidden');
            }
        });
    </script>
    @stack('scripts')
</body>

</html>