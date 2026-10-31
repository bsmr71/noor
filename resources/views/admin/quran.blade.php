@extends('layouts.admin')

@section('title', "Manajemen Konten Al-Qur'an & Doa")

@section('content')
<div class="flex flex-col w-full">
    <!-- Breadcrumb & Top Page Actions -->
    <div class="flex flex-col gap-space-sm mb-space-lg">
        <div class="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <a href="{{ route('admin.dashboard') }}" class="hover:text-primary transition-colors flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px]">home</span>
                <span>Beranda Admin</span>
            </a>
            <span class="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <span class="font-semibold text-primary">Manajemen Konten Qur'an & Doa</span>
        </div>

        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
            <div>
                <h1 class="font-headline-lg text-headline-lg text-primary font-bold font-serif tracking-tight">Katalog Mushaf Al-Qur'an & Murottal 30 Juz</h1>
                <p class="font-body-md text-body-md text-on-surface-variant mt-1 max-w-3xl">
                    Kelola 114 Surah, teks rasm Utsmani standar Kemenag RI, terjemahan resmi edisi revisi, serta sinkronisasi audio murottal kata per kata.
                </p>
            </div>
            <div class="flex flex-wrap items-center gap-space-sm">
                <a href="{{ route('admin.quran.editor') }}" class="h-10 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-all flex items-center gap-space-xs">
                    <span class="material-symbols-outlined text-[18px]">graphic_eq</span>
                    <span>Buka Editor Kalibrasi Audio</span>
                </a>
            </div>
        </div>
    </div>

    <!-- Surah Catalog List -->
    <div class="rounded-2xl bg-surface-container-lowest shadow-xs border border-surface-container-high overflow-hidden">
        <div class="p-space-md flex items-center justify-between bg-surface-container-low/60 border-b border-surface-container-high">
            <div class="flex items-center gap-space-sm">
                <span class="font-headline-sm text-headline-sm text-primary font-bold font-serif">114 Surah Al-Qur'an</span>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-bold">Terverifikasi Tashih Kemenag</span>
            </div>
            <div class="relative w-64">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]">search</span>
                <input id="surahSearchInput" value="{{ request('q') }}" oninput="filterSurahList(this.value)" type="text" placeholder="Cari nomor atau nama surah..." class="w-full h-9 pl-8 pr-3 rounded-lg bg-surface-container-lowest text-on-surface text-label-sm border border-surface-container-high focus:outline-none"/>
            </div>
        </div>

        <div id="surahListContainer" class="divide-y divide-surface-container-high/60">
            @php
                $surahs = [
                    ['number' => 1, 'name' => 'Al-Fatihah', 'arabic' => 'الفاتحة', 'meaning' => 'Pembukaan', 'ayahs' => 7, 'type' => 'Makkiyyah', 'audio' => 'Siap (100%)'],
                    ['number' => 2, 'name' => 'Al-Baqarah', 'arabic' => 'البقرة', 'meaning' => 'Sapi Betina', 'ayahs' => 286, 'type' => 'Madaniyyah', 'audio' => 'Siap (100%)'],
                    ['number' => 3, 'name' => "Ali 'Imran", 'arabic' => 'آل عمران', 'meaning' => "Keluarga 'Imran", 'ayahs' => 200, 'type' => 'Madaniyyah', 'audio' => 'Siap (100%)'],
                    ['number' => 18, 'name' => 'Al-Kahf', 'arabic' => 'الكهف', 'meaning' => 'Penghuni Gua', 'ayahs' => 110, 'type' => 'Makkiyyah', 'audio' => 'Siap (100%)'],
                    ['number' => 36, 'name' => 'Yasin', 'arabic' => 'يس', 'meaning' => 'Yasin', 'ayahs' => 83, 'type' => 'Makkiyyah', 'audio' => 'Siap (100%)'],
                    ['number' => 56, 'name' => "Al-Waqi'ah", 'arabic' => 'الواقعة', 'meaning' => 'Hari Kiamat', 'ayahs' => 96, 'type' => 'Makkiyyah', 'audio' => 'Siap (100%)'],
                    ['number' => 67, 'name' => 'Al-Mulk', 'arabic' => 'الملك', 'meaning' => 'Kerajaan', 'ayahs' => 30, 'type' => 'Makkiyyah', 'audio' => 'Siap (100%)'],
                    ['number' => 112, 'name' => 'Al-Ikhlas', 'arabic' => 'الإخلاص', 'meaning' => 'Memurnikan Keesaan Allah', 'ayahs' => 4, 'type' => 'Makkiyyah', 'audio' => 'Siap (100%)'],
                    ['number' => 113, 'name' => 'Al-Falaq', 'arabic' => 'الفلق', 'meaning' => 'Waktu Subuh', 'ayahs' => 5, 'type' => 'Makkiyyah', 'audio' => 'Siap (100%)'],
                    ['number' => 114, 'name' => 'An-Nas', 'arabic' => 'الناس', 'meaning' => 'Manusia', 'ayahs' => 6, 'type' => 'Makkiyyah', 'audio' => 'Siap (100%)']
                ];
            @endphp

            @foreach($surahs as $s)
            <div class="surah-item-row p-space-md flex items-center justify-between hover:bg-surface-container-low/40 transition-colors" data-search="{{ strtolower($s['number'] . ' ' . $s['name'] . ' ' . $s['meaning'] . ' ' . $s['type']) }}">
                <div class="flex items-center gap-space-md">
                    <div class="w-10 h-10 rounded-xl bg-surface-container-low border border-surface-container-high flex items-center justify-center font-bold text-primary font-mono">
                        {{ $s['number'] }}
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-headline-sm text-[16px] text-primary font-bold">{{ $s['name'] }}</span>
                            <span class="px-2 py-0.2 rounded text-[11px] font-semibold bg-surface-container text-on-surface-variant">{{ $s['type'] }}</span>
                        </div>
                        <span class="font-body-sm text-[13px] text-on-surface-variant">{{ $s['meaning'] }} • {{ $s['ayahs'] }} Ayat</span>
                    </div>
                </div>

                <div class="flex items-center gap-space-lg">
                    <span class="font-arabic-body text-2xl text-secondary font-serif" dir="rtl">{{ $s['arabic'] }}</span>
                    <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-label-sm text-[11px] font-bold border border-emerald-200">
                        {{ $s['audio'] }}
                    </span>
                    <a href="{{ route('admin.quran.editor') }}?surah={{ $s['number'] }}&name={{ urlencode($s['name']) }}&ayahs={{ $s['ayahs'] }}" class="px-3.5 py-1.5 rounded-xl bg-surface-container-low hover:bg-primary hover:text-white font-label-sm font-semibold text-primary transition-all border border-surface-container-high flex items-center gap-1">
                        <span class="material-symbols-outlined text-[16px]">tune</span>
                        <span>Kalibrasi</span>
                    </a>
                </div>
            </div>
            @endforeach
            <div id="surahEmptyNotice" class="hidden p-8 text-center text-on-surface-variant text-sm">
                Surah yang dicari tidak ditemukan dalam daftar katalog cepat.
            </div>
        </div>
    </div>
</div>
<script>
    function filterSurahList(query) {
        const q = (query || '').toLowerCase().trim();
        const rows = document.querySelectorAll('.surah-item-row');
        let visibleCount = 0;
        rows.forEach(r => {
            const hay = r.getAttribute('data-search') || '';
            if (!q || hay.includes(q)) {
                r.style.display = '';
                visibleCount++;
            } else {
                r.style.display = 'none';
            }
        });
        const emptyEl = document.getElementById('surahEmptyNotice');
        if (emptyEl) emptyEl.classList.toggle('hidden', visibleCount > 0);
    }
    document.addEventListener('DOMContentLoaded', () => {
        const inp = document.getElementById('surahSearchInput');
        if (inp && inp.value) filterSurahList(inp.value);
    });
</script>
@endsection

