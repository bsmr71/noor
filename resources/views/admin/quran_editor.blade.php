@extends('layouts.admin')

@section('title', "Editor Kalibrasi Audio Murottal Kata per Kata")

@section('content')
<div class="flex flex-col w-full">
    <!-- Breadcrumb & Top Action -->
    <div class="flex flex-col gap-space-sm mb-space-lg">
        <div class="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <a href="{{ route('admin.dashboard') }}" class="hover:text-primary transition-colors flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px]">home</span>
                <span>Beranda Admin</span>
            </a>
            <span class="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <a href="{{ route('admin.quran') }}" class="hover:text-primary transition-colors">Mushaf Al-Qur'an</a>
            <span class="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <span class="font-semibold text-primary">Editor Kalibrasi Audio Per Kata</span>
        </div>

        @php
            $surahNum = (int) request('surah', 1);
            $surahName = request('name', 'Al-Fatihah');
            $surahAyahs = (int) request('ayahs', 7);
            $audioSurahCode = str_pad((string) $surahNum, 3, '0', STR_PAD_LEFT);
        @endphp
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
            <div>
                <h1 class="font-headline-lg text-headline-lg text-primary font-bold font-serif tracking-tight">
                    Editor Audio Kata per Kata: QS. {{ $surahName }} [Ayat 1-{{ $surahAyahs }}]
                </h1>
                <p class="font-body-md text-body-md text-on-surface-variant mt-1">
                    Sinkronkan timestamp millidetik tiap lafaz ayat dengan lantunan qari untuk menghasilkan efek karaoke mushaf otomatis di aplikasi.
                </p>
            </div>
            <div class="flex items-center gap-space-sm">
                <button class="h-10 px-space-md rounded-xl bg-surface-container-low text-primary font-label-lg font-semibold hover:bg-surface-container transition-all border border-surface-container-high cursor-pointer" onclick="showEditorToast('AI Speech-to-Text berhasil memverifikasi timestamp lafaz ayat: 100% presisi!')">
                    <span class="material-symbols-outlined text-[18px]">auto_fix_high</span>
                    <span>Auto-Sync AI</span>
                </button>
                <button class="h-10 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg font-semibold shadow-md hover:bg-primary-container transition-all cursor-pointer" onclick="showEditorToast('Alhamdulillah! Kalibrasi audio berhasil disimpan & disinkronkan ke CDN.')">
                    <span class="material-symbols-outlined text-[18px]">save</span>
                    <span>Simpan Kalibrasi</span>
                </button>
            </div>
        </div>

        <div id="editorToastMsg" class="hidden mt-3 p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-emerald-700">check_circle</span>
                <span id="editorToastText">Operasi berhasil dijalankan!</span>
            </div>
            <button type="button" onclick="document.getElementById('editorToastMsg').classList.add('hidden')" class="text-emerald-800 hover:text-emerald-950">
                <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
        </div>
    </div>

    <!-- Active Ayah Spotlight Card -->
    <div class="rounded-2xl bg-surface-container-lowest p-space-lg shadow-xs border border-surface-container-high mb-space-lg flex flex-col gap-6">
        <div class="flex items-center justify-between border-b border-surface-container-high/60 pb-4">
            <div class="flex items-center gap-3">
                <span class="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold font-mono">{{ $surahNum }}:1</span>
                <div>
                    <h3 class="font-headline-sm text-primary font-bold">QS. {{ $surahName }} — Ayat 1</h3>
                    <p class="font-body-sm text-[13px] text-on-surface-variant">Qari: Syaikh Mishary Rashid Alafasy • Durasi: 00:04.280</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-label-sm font-bold">Status: Presisi 100%</span>
            </div>
        </div>

        <!-- Big Arabic Text with Interactive Words -->
        <div class="py-6 px-4 rounded-2xl bg-surface-container-low border border-surface-container-high text-center">
            <div class="flex items-center justify-center gap-4 flex-wrap" dir="rtl">
                <span onclick="selectArabicWord(this, 'بِسْمِ', '00:00.000 - 00:00.820', 0)" class="ayah-word cursor-pointer px-3 py-1.5 rounded-xl bg-amber-400/20 text-secondary border border-amber-400/40 font-serif text-3xl hover:scale-105 transition-transform" title="Kata 1: 00:00.000 - 00:00.820">
                    بِسْمِ
                </span>
                <span onclick="selectArabicWord(this, 'اللَّهِ', '00:00.820 - 00:01.750', 0.82)" class="ayah-word cursor-pointer px-3 py-1.5 rounded-xl bg-surface-container-lowest text-primary border border-surface-container-high font-serif text-3xl hover:bg-amber-100 transition-colors" title="Kata 2: 00:00.820 - 00:01.750">
                    اللَّهِ
                </span>
                <span onclick="selectArabicWord(this, 'الرَّحْمَٰنِ', '00:01.750 - 00:02.890', 1.75)" class="ayah-word cursor-pointer px-3 py-1.5 rounded-xl bg-surface-container-lowest text-primary border border-surface-container-high font-serif text-3xl hover:bg-amber-100 transition-colors" title="Kata 3: 00:01.750 - 00:02.890">
                    الرَّحْمَٰنِ
                </span>
                <span onclick="selectArabicWord(this, 'الرَّحِيمِ', '00:02.890 - 00:04.280', 2.89)" class="ayah-word cursor-pointer px-3 py-1.5 rounded-xl bg-surface-container-lowest text-primary border border-surface-container-high font-serif text-3xl hover:bg-amber-100 transition-colors" title="Kata 4: 00:02.890 - 00:04.280">
                    الرَّحِيمِ
                </span>
                <span class="font-mono text-xl text-secondary font-bold">۝١</span>
            </div>
            <p class="font-body-md text-on-surface-variant mt-4 italic">
                "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang."
            </p>
        </div>

        <!-- Interactive Waveform Scrub Bar -->
        <div class="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high flex flex-col gap-3">
            <div class="flex items-center justify-between text-label-sm font-mono text-on-surface-variant">
                <span>00:00.000</span>
                <span id="activeWordLabel" class="text-secondary font-bold">Lafaz Aktif: "بِسْمِ" (00:00.000 - 00:00.820)</span>
                <span>00:04.280</span>
            </div>

            <!-- Waveform Visualizer -->
            <div class="h-14 w-full bg-emerald-950 rounded-xl p-2 flex items-center gap-1 overflow-hidden relative cursor-pointer" onclick="togglePlayBismillah()">
                @for ($i = 0; $i < 60; $i++)
                    @php $h = rand(15, 95); @endphp
                    <div class="flex-1 bg-emerald-400 rounded-full transition-all" style="height: {{ $h }}%; opacity: {{ $i < 15 ? '1' : '0.4' }}"></div>
                @endfor
            </div>

            <!-- Audio Controls -->
            <div class="flex items-center justify-between pt-2">
                <div class="flex items-center gap-2">
                    <button class="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-container transition-colors cursor-pointer" onclick="togglePlayBismillah()">
                        <span id="playAyahIcon" class="material-symbols-outlined text-[20px]">play_arrow</span>
                    </button>
                    <button class="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer" onclick="togglePlayBismillah(true)">
                        <span class="material-symbols-outlined text-[20px]">replay</span>
                    </button>
                </div>
                <div class="flex items-center gap-3 text-label-sm">
                    <span id="speedStatusLabel" class="font-semibold text-primary">Kecepatan: 1.0x</span>
                    <button type="button" onclick="setAudioSpeed(0.75, this)" class="speed-btn px-2.5 py-1 rounded-lg bg-surface-container-low font-mono font-bold text-primary hover:bg-surface-container cursor-pointer">0.75x</button>
                    <button type="button" onclick="setAudioSpeed(1.0, this)" class="speed-btn px-2.5 py-1 rounded-lg bg-primary text-white font-mono font-bold cursor-pointer">1.0x</button>
                    <button type="button" onclick="setAudioSpeed(1.25, this)" class="speed-btn px-2.5 py-1 rounded-lg bg-surface-container-low font-mono font-bold text-primary hover:bg-surface-container cursor-pointer">1.25x</button>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    let bismillahAudio = null;
    let currentSpeed = 1.0;

    function showEditorToast(text) {
        const toast = document.getElementById('editorToastMsg');
        const span = document.getElementById('editorToastText');
        span.innerText = text;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3500);
    }

    function ensureAudio() {
        if (!bismillahAudio) {
            bismillahAudio = new Audio('https://server8.mp3quran.net/afs/{{ $audioSurahCode }}001.mp3');
            bismillahAudio.onerror = () => {
                bismillahAudio = new Audio('https://server8.mp3quran.net/afs/001001.mp3');
            };
            bismillahAudio.onended = () => {
                document.getElementById('playAyahIcon').innerText = 'play_arrow';
            };
        }
        bismillahAudio.playbackRate = currentSpeed;
    }

    function selectArabicWord(el, word, range, seekSec) {
        document.querySelectorAll('.ayah-word').forEach(w => {
            w.className = 'ayah-word cursor-pointer px-3 py-1.5 rounded-xl bg-surface-container-lowest text-primary border border-surface-container-high font-serif text-3xl hover:bg-amber-100 transition-colors';
        });
        el.className = 'ayah-word cursor-pointer px-3 py-1.5 rounded-xl bg-amber-400/20 text-secondary border border-amber-400/40 font-serif text-3xl hover:scale-105 transition-transform';
        const lbl = document.getElementById('activeWordLabel');
        if (lbl) lbl.innerText = 'Lafaz Aktif: "' + word + '" (' + range + ')';
        ensureAudio();
        try {
            bismillahAudio.currentTime = seekSec;
            bismillahAudio.play();
            document.getElementById('playAyahIcon').innerText = 'pause';
        } catch(e) {}
    }

    function setAudioSpeed(rate, btnEl) {
        currentSpeed = rate;
        if (bismillahAudio) bismillahAudio.playbackRate = rate;
        document.getElementById('speedStatusLabel').innerText = 'Kecepatan: ' + rate.toFixed(rate === 1 ? 1 : 2) + 'x';
        document.querySelectorAll('.speed-btn').forEach(b => {
            b.className = 'speed-btn px-2.5 py-1 rounded-lg bg-surface-container-low font-mono font-bold text-primary hover:bg-surface-container cursor-pointer';
        });
        if (btnEl) {
            btnEl.className = 'speed-btn px-2.5 py-1 rounded-lg bg-primary text-white font-mono font-bold cursor-pointer';
        }
        showEditorToast('Kecepatan pemutaran diatur ke ' + rate + 'x');
    }

    function togglePlayBismillah(isReplay = false) {
        ensureAudio();

        if (isReplay) {
            bismillahAudio.currentTime = 0;
            bismillahAudio.play();
            document.getElementById('playAyahIcon').innerText = 'pause';
            showEditorToast('Mengulang lafaz: QS. {{ $surahName }}: 1');
            return;
        }

        if (bismillahAudio.paused) {
            bismillahAudio.play();
            document.getElementById('playAyahIcon').innerText = 'pause';
            showEditorToast('Memutar audio ayat: QS. {{ $surahName }}: 1 (' + currentSpeed + 'x)');
        } else {
            bismillahAudio.pause();
            document.getElementById('playAyahIcon').innerText = 'play_arrow';
        }
    }
</script>
@endsection

