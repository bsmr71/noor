@extends('layouts.admin')

@section('title', 'Manajemen Pengguna & Jamaah Ekosistem Noor')

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
            <span class="font-semibold text-primary">Manajemen Pengguna & Jamaah</span>
        </div>
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
            <div>
                <h1 class="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">Manajemen Pengguna & Jamaah</h1>
                <p class="font-body-md text-body-md text-on-surface-variant mt-1 max-w-3xl">
                    Kelola data akun jamaah aktif, hak akses administrator sistem, pembina ustadz/qori, verifikasi email, dan status sinkronisasi profil mobile & web.
                </p>
            </div>
            <div class="flex flex-wrap items-center gap-space-sm">
                <button class="h-10 px-space-md rounded-xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-container-high transition-all flex items-center gap-space-xs border border-surface-container-high cursor-pointer" type="button" onclick="exportUsersCSV()">
                    <span class="material-symbols-outlined text-[18px] text-primary">download</span>
                    <span>Ekspor Pengguna CSV</span>
                </button>
                <button class="h-10 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-all flex items-center gap-space-xs cursor-pointer" type="button" onclick="openAddUserModal()">
                    <span class="material-symbols-outlined text-[18px]">person_add</span>
                    <span>+ Tambah Pengguna Baru</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Alert Success / Error -->
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

    <!-- Top KPI Metric Cards (Realtime Database Stats) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl">
        <!-- Card 1: Total Pengguna -->
        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
            <div class="flex items-start justify-between">
                <div>
                    <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Total Akun Terdaftar</span>
                    <span class="font-headline-lg text-headline-lg text-primary tracking-tight block mt-1 font-bold">{{ number_format($users->count()) }}</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[20px]">groups</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <span class="font-label-sm text-label-sm text-tertiary-container font-semibold flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">verified</span> Database Terhubung
                </span>
                <span class="font-label-sm text-label-sm text-outline">Production DB</span>
            </div>
        </div>

        <!-- Card 2: Administrator -->
        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
            <div class="flex items-start justify-between">
                <div>
                    <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Administrator</span>
                    <span class="font-headline-lg text-headline-lg text-secondary tracking-tight block mt-1 font-bold">{{ number_format($users->where('role', 'admin')->count()) }}</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
                    <span class="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <span class="font-label-sm text-label-sm text-secondary font-semibold flex items-center">
                    Hak Akses Penuh
                </span>
                <span class="font-label-sm text-label-sm text-outline">Super Admin</span>
            </div>
        </div>

        <!-- Card 3: Jamaah Terdaftar -->
        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
            <div class="flex items-start justify-between">
                <div>
                    <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Jamaah Terdaftar</span>
                    <span class="font-headline-lg text-headline-lg text-primary tracking-tight block mt-1 font-bold">{{ number_format($users->where('role', 'jamaah')->count()) }}</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[20px]">person</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <span class="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">check_circle</span> Akun Terverifikasi
                </span>
                <span class="font-label-sm text-label-sm text-outline">Mobile & Web</span>
            </div>
        </div>

        <!-- Card 4: Ustadz & Qori -->
        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
            <div class="flex items-start justify-between">
                <div>
                    <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Ustadz & Qori</span>
                    <span class="font-headline-lg text-headline-lg text-primary tracking-tight block mt-1 font-bold">{{ number_format($users->where('role', 'ustadz')->count()) }}</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[20px]">school</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <span class="font-label-sm text-label-sm text-tertiary-container font-semibold">Pembina Komunitas</span>
                <span class="font-label-sm text-label-sm text-outline">Bersanad</span>
            </div>
        </div>
    </div>

    <!-- Filter & Table Card -->
    <div class="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container-high">
        <!-- Table Toolbar -->
        <form method="GET" action="{{ route('admin.users') }}" class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-md">
            <div class="flex flex-wrap items-center gap-space-sm flex-1 max-w-xl">
                <div class="relative w-full max-w-sm">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                    <input name="search" value="{{ request('search') }}" class="w-full h-10 pl-9 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-sm text-body-sm border border-surface-container-high focus:outline-primary" placeholder="Cari nama atau email pengguna..." type="text"/>
                </div>
                <button type="submit" class="h-10 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-label-md">Cari</button>
            </div>

            <!-- Role Filter Pills -->
            <div class="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl">
                <a href="{{ route('admin.users', ['role' => 'all']) }}" class="px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all {{ !request('role') || request('role') === 'all' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface' }}">
                    Semua
                </a>
                <a href="{{ route('admin.users', ['role' => 'admin']) }}" class="px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all {{ request('role') === 'admin' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface' }}">
                    Admin
                </a>
                <a href="{{ route('admin.users', ['role' => 'jamaah']) }}" class="px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all {{ request('role') === 'jamaah' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface' }}">
                    Jamaah
                </a>
                <a href="{{ route('admin.users', ['role' => 'ustadz']) }}" class="px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all {{ request('role') === 'ustadz' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface' }}">
                    Ustadz / Qori
                </a>
                <a href="{{ route('admin.users', ['role' => 'premium']) }}" class="px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all {{ request('role') === 'premium' ? 'bg-secondary-fixed text-secondary shadow-sm' : 'text-secondary hover:bg-secondary-fixed/50' }}">
                    ★ Noor+ Bebas Iklan
                </a>
            </div>
        </form>

        <!-- User Table -->
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b border-surface-container-high text-outline font-label-sm text-label-sm uppercase tracking-wider">
                        <th class="py-3 px-4">Pengguna</th>
                        <th class="py-3 px-4">Role Akses</th>
                        <th class="py-3 px-4">Status Iklan</th>
                        <th class="py-3 px-4">Bio / Status Ibadah</th>
                        <th class="py-3 px-4">Terdaftar</th>
                        <th class="py-3 px-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-surface-container-high/60">
                    @forelse($users as $user)
                    <tr class="hover:bg-surface-container-low/50 transition-colors">
                        <td class="py-3.5 px-4">
                            <div class="flex items-center gap-space-sm">
                                <img src="{{ $user->avatar ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' }}" class="w-10 h-10 rounded-full object-cover ring-2 ring-primary/10 shadow-sm" alt="{{ $user->name }}"/>
                                <div class="flex flex-col">
                                    <span class="font-label-lg text-label-lg font-bold text-primary">{{ $user->name }}</span>
                                    <span class="font-body-sm text-xs text-on-surface-variant font-mono">{{ $user->email }}</span>
                                </div>
                            </div>
                        </td>
                        <td class="py-3.5 px-4">
                            @if($user->role === 'admin')
                                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                                    <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    Super Admin
                                </span>
                            @elseif($user->role === 'ustadz')
                                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-800 border border-blue-400/30 text-xs font-bold">
                                    <span class="material-symbols-outlined text-[14px]">school</span>
                                    Ustadz / Qori
                                </span>
                            @else
                                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold">
                                    <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                    Jamaah Aktif
                                </span>
                            @endif
                        </td>
                        <td class="py-3.5 px-4">
                            @if($user->hasActivePremium())
                                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-800 border border-amber-400/40 text-xs font-bold">
                                    <span class="material-symbols-outlined text-[14px] text-amber-600">workspace_premium</span>
                                    {{ $user->getPremiumLabel() }}
                                </span>
                            @else
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-medium">
                                    Reguler (Ada Iklan)
                                </span>
                            @endif
                        </td>
                        <td class="py-3.5 px-4">
                            <p class="font-body-sm text-xs text-on-surface-variant max-w-xs truncate">{{ $user->bio ?? 'Belum ada bio' }}</p>
                        </td>
                        <td class="py-3.5 px-4">
                            <span class="font-label-sm text-xs text-on-surface-variant font-mono">{{ $user->created_at ? $user->created_at->format('d M Y') : '10 Feb 2025' }}</span>
                        </td>
                        <td class="py-3.5 px-4 text-right">
                            <div class="inline-flex items-center gap-1">
                                <!-- Quick Toggle Noor+ Bebas Iklan -->
                                @if($user->hasActivePremium())
                                <form action="{{ route('admin.premium.revoke', $user->id) }}" method="POST" class="inline" onsubmit="return confirm('Cabut status Bebas Iklan untuk {{ $user->name }}?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="px-2 py-1 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 text-[11px] font-bold cursor-pointer" title="Cabut Bebas Iklan">
                                        Cabut Noor+
                                    </button>
                                </form>
                                @else
                                <form action="{{ route('admin.premium.grant') }}" method="POST" class="inline">
                                    @csrf
                                    <input type="hidden" name="user_id" value="{{ $user->id }}"/>
                                    <input type="hidden" name="plan_key" value="admin_grant"/>
                                    <button type="submit" class="px-2 py-1 rounded-lg bg-surface-container-high hover:bg-secondary-fixed text-secondary text-[11px] font-bold cursor-pointer" title="Aktifkan Bebas Iklan Gratis">
                                        + Noor+
                                    </button>
                                </form>
                                @endif

                                <!-- Ubah Role Form -->
                                <form action="{{ route('admin.users.role', $user->id) }}" method="POST" class="inline">
                                    @csrf
                                    @method('PATCH')
                                    <select name="role" onchange="this.form.submit()" class="text-xs p-1 rounded-lg bg-surface-container-high border border-outline-variant text-primary font-semibold focus:outline-none cursor-pointer">
                                        <option value="jamaah" {{ $user->role === 'jamaah' ? 'selected' : '' }}>Jamaah</option>
                                        <option value="admin" {{ $user->role === 'admin' ? 'selected' : '' }}>Admin</option>
                                        <option value="ustadz" {{ $user->role === 'ustadz' ? 'selected' : '' }}>Ustadz</option>
                                    </select>
                                </form>

                                <!-- Hapus Button -->
                                @if($user->email !== 'admin@noor.app')
                                <form action="{{ route('admin.users.destroy', $user->id) }}" method="POST" class="inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus akun {{ $user->name }}?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="w-8 h-8 rounded-lg hover:bg-error-container text-outline hover:text-error flex items-center justify-center transition-colors" title="Hapus Pengguna">
                                        <span class="material-symbols-outlined text-[17px]">delete</span>
                                    </button>
                                </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="py-8 text-center text-on-surface-variant">
                            <span class="material-symbols-outlined text-4xl text-outline mb-2 block">person_off</span>
                            Tidak ditemukan pengguna yang sesuai dengan filter.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modal Tambah Pengguna Baru -->
<div id="addUserModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-surface-container-high">
        <div class="bg-primary p-space-md text-white flex items-center justify-between">
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[22px]">person_add</span>
                <h3 class="font-headline-sm text-lg font-bold">Tambah Pengguna / Jamaah Baru</h3>
            </div>
            <button onclick="closeAddUserModal()" type="button" class="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80">
                <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
        </div>

        <form action="{{ route('admin.users.store') }}" method="POST" class="p-space-lg space-y-4">
            @csrf
            <div>
                <label class="block font-label-md text-xs font-bold text-primary mb-1">Nama Lengkap</label>
                <input type="text" name="name" required placeholder="Contoh: Muhammad Ihsan" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant font-body-sm text-sm text-on-surface focus:outline-primary"/>
            </div>

            <div>
                <label class="block font-label-md text-xs font-bold text-primary mb-1">Alamat Email</label>
                <input type="email" name="email" required placeholder="ihsan@noor.app" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant font-body-sm text-sm text-on-surface focus:outline-primary"/>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block font-label-md text-xs font-bold text-primary mb-1">Password</label>
                    <input type="password" name="password" required minlength="6" placeholder="Minimal 6 karakter" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant font-body-sm text-sm text-on-surface focus:outline-primary"/>
                </div>
                <div>
                    <label class="block font-label-md text-xs font-bold text-primary mb-1">Role Akun</label>
                    <select name="role" required class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant font-body-sm text-sm text-on-surface focus:outline-primary cursor-pointer">
                        <option value="jamaah">Jamaah Aktif</option>
                        <option value="admin">Administrator</option>
                        <option value="ustadz">Ustadz / Qori</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block font-label-md text-xs font-bold text-primary mb-1">Catatan / Bio</label>
                <textarea name="bio" rows="2" placeholder="Catatan aktivitas atau status jamaah..." class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant font-body-sm text-sm text-on-surface focus:outline-primary"></textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-high">
                <button type="button" onclick="closeAddUserModal()" class="px-4 py-2 rounded-xl bg-surface-container-high text-primary font-label-md text-sm font-semibold hover:bg-surface-container-highest transition-colors">Batal</button>
                <button type="submit" class="px-5 py-2 rounded-xl bg-primary text-white font-label-md text-sm font-semibold hover:bg-primary-container transition-all shadow-md">Simpan Pengguna</button>
            </div>
        </form>
    </div>
</div>

<script>
    function openAddUserModal() {
        document.getElementById('addUserModal').classList.remove('hidden');
    }
    function closeAddUserModal() {
        document.getElementById('addUserModal').classList.add('hidden');
    }

    function exportUsersCSV() {
        const rows = [
            ["ID", "Nama", "Email", "Role", "Kota", "Status", "Tanggal Daftar"],
            @foreach($users as $u)
            ["{{ $u->id }}", "{{ addslashes($u->name) }}", "{{ $u->email }}", "{{ ucfirst($u->role) }}", "{{ $u->city ?? 'Jakarta' }}", "Aktif", "{{ $u->created_at ? $u->created_at->format('Y-m-d') : '' }}"],
            @endforeach
        ];

        let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Daftar_Pengguna_Noor_{{ now()->format('Ymd_His') }}.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
</script>
@endsection

