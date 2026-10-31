<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Masuk ke Noor Console — Islamic Super App Administrator</title>

    <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        rel="stylesheet" />
    <link href="https://fonts.googleapis.com" rel="preconnect" />
    <link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect" />
    <link
        href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet" />

    <script src="https://cdn.tailwindcss.com"></script>
    <script id="tailwind-config">
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: "#002721",
                        "primary-container": "#0f3e36",
                        secondary: "#904d00",
                        "secondary-container": "#fe932c",
                        "secondary-fixed": "#ffdcc3",
                        "tertiary-fixed": "#bbeddd",
                        "surface": "#f8faf9",
                        "surface-container": "#eceeed",
                        "surface-container-low": "#f2f4f3",
                        "surface-container-high": "#e6e9e8",
                        "surface-container-lowest": "#ffffff",
                        "on-surface": "#191c1c",
                        "on-surface-variant": "#404846",
                        outline: "#717976",
                        "outline-variant": "#c0c8c5",
                    },
                    fontFamily: {
                        sans: ["'Plus Jakarta Sans'", "sans-serif"],
                        serif: ["'Noto Serif'", "serif"],
                    }
                }
            }
        };
    </script>
</head>

<body
    class="bg-gradient-to-br from-[#002721] via-[#09352c] to-[#001814] min-h-screen flex items-center justify-center p-4 text-on-surface antialiased font-sans relative overflow-hidden">
    <!-- Background Islamic Geometric Ambient Glow -->
    <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none">
    </div>

    <div class="w-full max-w-md relative z-10">
        <!-- Top App Brand Card -->
        <div class="text-center mb-6">
            <div
                class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-[#fe932c] text-[#002721] shadow-2xl shadow-amber-500/20 mb-3 ring-4 ring-white/10">
                <span class="material-symbols-outlined text-[36px]">mosque</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">Noor Console</h1>
            <p class="text-xs sm:text-sm text-emerald-200/80 mt-1">Portal Administrasi Ekosistem Ibadah & Super App</p>
        </div>

        <!-- Main Login Card -->
        <div
            class="rounded-3xl bg-surface-container-lowest p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/20 backdrop-blur-md">
            <div class="mb-5 pb-4 border-b border-surface-container-high">
                <h2 class="text-lg font-bold text-primary font-serif">Masuk Administrator</h2>
                <p class="text-xs text-on-surface-variant mt-0.5">Gunakan kredensial resmi untuk mengelola aplikasi
                    Noor.</p>
            </div>

            <!-- Success Session Alert -->
            @if(session('success'))
                <div
                    class="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px] text-emerald-600 shrink-0">check_circle</span>
                    <span>{{ session('success') }}</span>
                </div>
            @endif

            <!-- Error Validation Alert -->
            @if($errors->any())
                <div
                    class="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <span class="material-symbols-outlined text-[18px] text-rose-600 shrink-0 mt-0.5">error</span>
                    <div>
                        @foreach($errors->all() as $error)
                            <p>{{ $error }}</p>
                        @endforeach
                    </div>
                </div>
            @endif

            <form action="{{ route('login.post') }}" method="POST" class="space-y-4">
                @csrf

                <!-- Email Input -->
                <div>
                    <label for="email" class="block text-xs font-bold text-primary mb-1">Alamat Email Admin</label>
                    <div class="relative flex items-center">
                        <span
                            class="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">mail</span>
                            placeholder="Masukkan email administrator"
                            class="w-full h-11 pl-10 pr-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium" />
                    </div>
                </div>

                <!-- Password Input -->
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <label for="password" class="block text-xs font-bold text-primary">Kata Sandi</label>
                    </div>
                    <div class="relative flex items-center">
                        <span
                            class="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">lock</span>
                            placeholder="••••••••"
                            class="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-low border border-surface-container-high text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium" />
                        <button type="button" onclick="togglePasswordVisibility()"
                            class="absolute right-3 text-outline hover:text-primary transition-colors cursor-pointer">
                            <span id="eyeIcon" class="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                    </div>
                </div>

                <!-- Remember Me & Info -->
                <div class="flex items-center justify-between text-xs pt-1">
                    <label class="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" name="remember" {{ old('remember') ? 'checked' : '' }}
                            class="w-4 h-4 rounded text-primary focus:ring-primary border-surface-container-high">
                        <span class="text-on-surface-variant font-medium">Ingat Saya di Perangkat Ini</span>
                    </label>
                </div>

                <!-- Submit Button -->
                <button type="submit"
                    class="w-full h-11 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2">
                    <span class="material-symbols-outlined text-[18px]">login</span>
                    <span>Masuk ke Console</span>
                </button>
            </form>
        </div>

        <p class="text-center text-[11px] text-emerald-200/50 mt-4">
            &copy; 2026 Noor Islamic Super App. Seluruh hak cipta dilindungi.
        </p>
    </div>

    <script>
        function togglePasswordVisibility() {
            const pwd = document.getElementById('password');
            const icon = document.getElementById('eyeIcon');
            if (pwd.type === 'password') {
                pwd.type = 'text';
                icon.innerText = 'visibility_off';
            } else {
                pwd.type = 'password';
                icon.innerText = 'visibility';
            }
        }
    </script>
</body>

</html>