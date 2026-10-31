@extends('layouts.admin')

@section('title', 'Manajemen Katalog Produk & Layanan Syariah')

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
            <span class="text-on-surface-variant">Ekosistem Niaga Syariah</span>
            <span class="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <span class="font-semibold text-primary">Katalog Produk & Layanan</span>
        </div>

        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
            <div>
                <h1 class="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">Katalog Produk, Buku & Paket Umrah</h1>
                <p class="font-body-md text-body-md text-on-surface-variant mt-1 max-w-3xl">
                    Kelola katalog resmi produk halal, mushaf Al-Qur'an, perlengkapan ibadah, herbal sunnah, qurban, dan paket Umrah PPIU yang tampil langsung pada tab Katalog aplikasi Mobile.
                </p>
            </div>
            <div class="flex flex-wrap items-center gap-space-sm">
                <button type="button" onclick="openCatalogModal()" class="h-10 px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-all flex items-center gap-space-xs cursor-pointer">
                    <span class="material-symbols-outlined text-[18px] text-secondary-container">add_shopping_cart</span>
                    <span>+ Tambah Item Katalog</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Flash Alerts -->
    @if(session('success'))
    <div class="mb-space-md p-space-sm rounded-xl bg-tertiary-fixed text-primary font-label-md text-label-md flex items-center gap-space-xs shadow-sm">
        <span class="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
        <span>{{ session('success') }}</span>
    </div>
    @endif
    @if($errors->any())
    <div class="mb-space-md p-space-sm rounded-xl bg-error-container text-on-error-container font-label-md text-label-md flex items-center gap-space-xs shadow-sm">
        <span class="material-symbols-outlined text-[20px] text-error">error</span>
        <span>{{ $errors->first() }}</span>
    </div>
    @endif

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl">
        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div class="flex items-start justify-between">
                <div>
                    <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Item Katalog Aktif</span>
                    <span class="font-headline-lg text-headline-lg text-primary font-bold block mt-1">{{ number_format($stats['active_items']) }}</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[20px]">storefront</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <span class="font-label-sm text-label-sm text-primary font-semibold">Live di Mobile App</span>
                <span class="font-label-sm text-label-sm text-outline">5 Kategori</span>
            </div>
        </div>

        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div class="flex items-start justify-between">
                <div>
                    <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Total Pesanan Jamaah</span>
                    <span class="font-headline-lg text-headline-lg text-primary font-bold block mt-1">{{ number_format($stats['total_orders']) }}</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
                    <span class="material-symbols-outlined text-[20px]">shopping_bag</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <span class="font-label-sm text-label-sm text-secondary font-semibold">{{ number_format($stats['pending_orders']) }} Menunggu Konfirmasi</span>
                <span class="font-label-sm text-label-sm text-outline">Order Masuk</span>
            </div>
        </div>

        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div class="flex items-start justify-between">
                <div>
                    <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Nilai Estimasi Pesanan</span>
                    <span class="font-headline-lg text-headline-lg text-emerald-700 font-bold block mt-1">Rp {{ number_format($stats['total_gmv'], 0, ',', '.') }}</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[20px]">monitoring</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <span class="font-label-sm text-label-sm text-emerald-700 font-semibold">Akumulasi Pemesanan</span>
                <span class="font-label-sm text-label-sm text-outline">Non-Batal</span>
            </div>
        </div>

        <div class="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div class="flex items-start justify-between">
                <div>
                    <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Mode Pembayaran</span>
                    <span class="font-headline-sm text-headline-sm text-primary font-bold block mt-2">Booking & Konfirmasi</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[20px]">verified</span>
                </div>
            </div>
            <div class="flex items-center justify-between mt-space-md pt-space-xs">
                <span class="font-label-sm text-label-sm text-primary font-semibold">Siap Sambung Gateway</span>
                <span class="font-label-sm text-label-sm text-outline">Tahap 1</span>
            </div>
        </div>
    </div>

    <!-- Filter & Catalog Items Card -->
    <div class="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container-high mb-space-xl">
        <form method="GET" action="{{ route('admin.catalog') }}" class="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md mb-space-md">
            <div class="flex items-center gap-2 flex-1 max-w-md">
                <div class="relative flex-1">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                    <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari nama produk, paket umrah, mitra..." class="w-full h-10 pl-9 pr-4 rounded-xl bg-surface-container-low border border-surface-container-high text-sm focus:outline-primary"/>
                </div>
                <button type="submit" class="h-10 px-4 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer">Cari</button>
            </div>

            <div class="flex flex-wrap items-center gap-1 bg-surface-container-low p-1 rounded-xl">
                <a href="{{ route('admin.catalog', ['category' => 'all']) }}" class="px-3 py-1.5 rounded-lg text-xs font-semibold {{ !request('category') || request('category') === 'all' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant' }}">Semua</a>
                @foreach($categories as $key => $label)
                <a href="{{ route('admin.catalog', ['category' => $key]) }}" class="px-3 py-1.5 rounded-lg text-xs font-semibold {{ request('category') === $key ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant' }}">{{ $label }}</a>
                @endforeach
            </div>
        </form>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b border-surface-container-high text-outline font-label-sm text-label-sm uppercase tracking-wider">
                        <th class="py-3 px-3">Produk / Layanan</th>
                        <th class="py-3 px-3">Kategori</th>
                        <th class="py-3 px-3">Harga</th>
                        <th class="py-3 px-3">Stok & Terjual</th>
                        <th class="py-3 px-3">Status</th>
                        <th class="py-3 px-3 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-surface-container-high/60 text-sm">
                    @forelse($items as $item)
                    <tr class="hover:bg-surface-container-low/50">
                        <td class="py-3.5 px-3">
                            <div class="flex items-center gap-3">
                                <img src="{{ $item->image_url }}" alt="{{ $item->title }}" class="w-12 h-12 rounded-xl object-cover border border-surface-container-high shrink-0"/>
                                <div class="min-w-0">
                                    <div class="flex items-center gap-1.5">
                                        <span class="font-bold text-primary truncate max-w-xs">{{ $item->title }}</span>
                                        @if($item->is_featured)
                                            <span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">Unggulan</span>
                                        @endif
                                    </div>
                                    <div class="text-xs text-on-surface-variant truncate max-w-xs">{{ $item->partner_name }}</div>
                                </div>
                            </div>
                        </td>
                        <td class="py-3.5 px-3">
                            <span class="px-2.5 py-1 rounded-full bg-surface-container-high text-primary text-xs font-semibold">{{ $item->category_label }}</span>
                        </td>
                        <td class="py-3.5 px-3">
                            @if($item->original_price && $item->original_price > $item->price)
                                <div class="text-[11px] text-outline line-through">Rp {{ number_format($item->original_price, 0, ',', '.') }}</div>
                            @endif
                            <div class="font-bold text-secondary">Rp {{ number_format($item->price, 0, ',', '.') }}</div>
                        </td>
                        <td class="py-3.5 px-3 text-xs">
                            <div class="font-bold text-primary">Stok: {{ $item->stock }}</div>
                            <div class="text-on-surface-variant">{{ $item->sold_count }} dipesan</div>
                        </td>
                        <td class="py-3.5 px-3">
                            @if($item->is_active)
                                <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">Tayang</span>
                            @else
                                <span class="px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">Disembunyikan</span>
                            @endif
                        </td>
                        <td class="py-3.5 px-3 text-right">
                            <div class="inline-flex items-center gap-1">
                                <button
                                    type="button"
                                    onclick='openEditCatalogModal(@json($item))'
                                    class="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-primary hover:text-white text-primary text-xs font-bold transition-colors cursor-pointer"
                                >
                                    Edit
                                </button>

                                <form action="{{ route('admin.catalog.toggle', $item->id) }}" method="POST" class="inline">
                                    @csrf
                                    @method('PATCH')
                                    <button type="submit" class="px-2.5 py-1 rounded-lg bg-secondary-fixed text-secondary text-xs font-bold cursor-pointer">
                                        {{ $item->is_active ? 'Arsipkan' : 'Tayangkan' }}
                                    </button>
                                </form>

                                <form action="{{ route('admin.catalog.destroy', $item->id) }}" method="POST" class="inline" onsubmit="return confirm('Hapus item katalog {{ addslashes($item->title) }}?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="w-8 h-8 rounded-lg hover:bg-error-container text-outline hover:text-error flex items-center justify-center cursor-pointer">
                                        <span class="material-symbols-outlined text-[17px]">delete</span>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="py-8 text-center text-on-surface-variant">Tidak ada item katalog yang sesuai dengan pencarian.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <!-- Incoming Catalog Orders Section -->
    <div class="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container-high">
        <div class="mb-space-md">
            <h2 class="font-headline-sm text-headline-sm text-primary font-bold">Daftar Pesanan & Booking Jamaah Masuk</h2>
            <p class="font-body-sm text-xs text-on-surface-variant">Pesanan yang dikirim jamaah dari tab Katalog Mobile App muncul otomatis di sini untuk ditindaklanjuti.</p>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b border-surface-container-high text-outline font-label-sm text-label-sm uppercase tracking-wider">
                        <th class="py-3 px-3">Kode Order</th>
                        <th class="py-3 px-3">Pemesan & Kontak</th>
                        <th class="py-3 px-3">Item & Jumlah</th>
                        <th class="py-3 px-3">Total</th>
                        <th class="py-3 px-3">Alamat / Catatan</th>
                        <th class="py-3 px-3 text-right">Status Pesanan</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-surface-container-high/60 text-xs">
                    @forelse($orders as $order)
                    <tr class="hover:bg-surface-container-low/50">
                        <td class="py-3 px-3 font-mono font-bold text-primary">
                            {{ $order->order_code }}
                            <div class="text-[10px] text-outline font-sans mt-0.5">{{ $order->created_at?->format('d M Y H:i') }}</div>
                        </td>
                        <td class="py-3 px-3">
                            <div class="font-bold text-primary">{{ $order->buyer_name }}</div>
                            <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $order->buyer_phone) }}" target="_blank" class="text-emerald-700 font-semibold hover:underline">{{ $order->buyer_phone }}</a>
                        </td>
                        <td class="py-3 px-3">
                            <div class="font-bold text-primary">{{ $order->item->title ?? 'Produk Terhapus' }}</div>
                            <div class="text-on-surface-variant">{{ $order->quantity }}x @ Rp {{ number_format($order->unit_price, 0, ',', '.') }}</div>
                        </td>
                        <td class="py-3 px-3 font-bold text-secondary">
                            Rp {{ number_format($order->total_amount, 0, ',', '.') }}
                        </td>
                        <td class="py-3 px-3 max-w-xs">
                            <div class="text-on-surface truncate" title="{{ $order->shipping_address }}">{{ $order->shipping_address }}</div>
                            @if($order->notes)
                                <div class="text-outline italic truncate">Catatan: {{ $order->notes }}</div>
                            @endif
                        </td>
                        <td class="py-3 px-3 text-right">
                            <form action="{{ route('admin.catalog.orders.status', $order->id) }}" method="POST" class="inline">
                                @csrf
                                @method('PATCH')
                                <select name="status" onchange="this.form.submit()" class="p-1.5 rounded-lg bg-surface-container-high border border-outline-variant text-primary font-bold text-xs cursor-pointer">
                                    <option value="menunggu_konfirmasi" {{ $order->status === 'menunggu_konfirmasi' ? 'selected' : '' }}>Menunggu Konfirmasi</option>
                                    <option value="diproses" {{ $order->status === 'diproses' ? 'selected' : '' }}>Diproses</option>
                                    <option value="dikirim" {{ $order->status === 'dikirim' ? 'selected' : '' }}>Dikirim</option>
                                    <option value="selesai" {{ $order->status === 'selesai' ? 'selected' : '' }}>Selesai</option>
                                    <option value="dibatalkan" {{ $order->status === 'dibatalkan' ? 'selected' : '' }}>Dibatalkan</option>
                                </select>
                            </form>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="py-8 text-center text-on-surface-variant">Belum ada pesanan katalog masuk dari aplikasi Mobile.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modal Tambah / Edit Item Katalog -->
<div id="catalogModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-surface-container-high max-h-[92vh] flex flex-col">
        <div class="bg-primary p-space-md text-white flex items-center justify-between shrink-0">
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[22px] text-secondary-container">storefront</span>
                <h3 id="catalogModalTitle" class="font-headline-sm text-lg font-bold">Tambah Item Katalog Baru</h3>
            </div>
            <button type="button" onclick="closeCatalogModal()" class="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 cursor-pointer">
                <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
        </div>

        <form id="catalogForm" action="{{ route('admin.catalog.store') }}" method="POST" class="p-space-lg space-y-4 overflow-y-auto">
            @csrf
            <input type="hidden" name="_method" id="catalogFormMethod" value="POST"/>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-primary mb-1">Nama Produk / Paket Layanan</label>
                    <input type="text" name="title" id="cat_title" required placeholder="Contoh: Mushaf Tajwid Warna A5" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-sm"/>
                </div>
                <div>
                    <label class="block text-xs font-bold text-primary mb-1">Kategori Katalog</label>
                    <select name="category" id="cat_category" required class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-sm">
                        @foreach($categories as $key => $label)
                            <option value="{{ $key }}">{{ $label }}</option>
                        @endforeach
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-primary mb-1">Nama Mitra / Penerbit / Travel</label>
                    <input type="text" name="partner_name" id="cat_partner" required placeholder="Contoh: Galeri Haramain Nusantara" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-sm"/>
                </div>
                <div>
                    <label class="block text-xs font-bold text-primary mb-1">Label Badge Promo (Opsional)</label>
                    <input type="text" name="badge" id="cat_badge" placeholder="Contoh: Terlaris / Tashih Kemenag" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-sm"/>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <label class="block text-xs font-bold text-primary mb-1">Harga Normal / Coret (Opsional)</label>
                    <input type="number" name="original_price" id="cat_original_price" min="0" placeholder="145000" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-sm"/>
                </div>
                <div>
                    <label class="block text-xs font-bold text-primary mb-1">Harga Jual Resmi (Rp)</label>
                    <input type="number" name="price" id="cat_price" required min="1000" placeholder="98000" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-sm"/>
                </div>
                <div>
                    <label class="block text-xs font-bold text-primary mb-1">Stok / Kuota Seat</label>
                    <input type="number" name="stock" id="cat_stock" required min="0" value="50" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-sm"/>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-primary mb-1">URL Gambar Produk</label>
                    <input type="url" name="image_url" id="cat_image_url" required placeholder="https://images.unsplash.com/..." class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-sm"/>
                </div>
                <div>
                    <label class="block text-xs font-bold text-primary mb-1">No. WhatsApp CS Konsultasi</label>
                    <input type="text" name="whatsapp_contact" id="cat_wa" value="6281290001445" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-sm"/>
                </div>
            </div>

            <div>
                <label class="block text-xs font-bold text-primary mb-1">Deskripsi Lengkap</label>
                <textarea name="description" id="cat_description" rows="3" required placeholder="Jelaskan spesifikasi, keaslian, atau fasilitas paket..." class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-sm"></textarea>
            </div>

            <div>
                <label class="block text-xs font-bold text-primary mb-1">Poin Keunggulan Utama (1 baris = 1 poin)</label>
                <textarea name="highlights_text" id="cat_highlights" rows="3" placeholder="Tashih Resmi Kemenag RI&#10;Kertas QPP Teduh di Mata&#10;Bonus Pouch Eksklusif" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-sm"></textarea>
            </div>

            <label class="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_featured" id="cat_featured" value="1" class="w-4 h-4 accent-primary"/>
                <span class="text-xs font-bold text-primary">Tampilkan sebagai Produk Unggulan di Baris Atas Mobile</span>
            </label>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-surface-container-high">
                <button type="button" onclick="closeCatalogModal()" class="px-4 py-2 rounded-xl bg-surface-container-high text-primary text-sm font-semibold cursor-pointer">Batal</button>
                <button type="submit" class="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-container shadow-md cursor-pointer">Simpan ke Katalog</button>
            </div>
        </form>
    </div>
</div>

<script>
    const storeUrl = "{{ route('admin.catalog.store') }}";
    const updateBaseUrl = "{{ url('/admin/catalog') }}";

    function openCatalogModal() {
        document.getElementById('catalogModalTitle').textContent = 'Tambah Item Katalog Baru';
        document.getElementById('catalogForm').action = storeUrl;
        document.getElementById('catalogFormMethod').value = 'POST';
        document.getElementById('catalogForm').reset();
        document.getElementById('cat_wa').value = '6281290001445';
        document.getElementById('cat_stock').value = '50';
        document.getElementById('catalogModal').classList.remove('hidden');
    }

    function openEditCatalogModal(item) {
        document.getElementById('catalogModalTitle').textContent = 'Edit Item Katalog';
        document.getElementById('catalogForm').action = updateBaseUrl + '/' + item.id;
        document.getElementById('catalogFormMethod').value = 'PUT';
        document.getElementById('cat_title').value = item.title || '';
        document.getElementById('cat_category').value = item.category || 'perlengkapan';
        document.getElementById('cat_partner').value = item.partner_name || '';
        document.getElementById('cat_badge').value = item.badge || '';
        document.getElementById('cat_original_price').value = item.original_price || '';
        document.getElementById('cat_price').value = item.price || '';
        document.getElementById('cat_stock').value = item.stock ?? 0;
        document.getElementById('cat_image_url').value = item.image_url || '';
        document.getElementById('cat_wa').value = item.whatsapp_contact || '6281290001445';
        document.getElementById('cat_description').value = item.description || '';
        document.getElementById('cat_highlights').value = Array.isArray(item.highlights) ? item.highlights.join('\n') : '';
        document.getElementById('cat_featured').checked = !!item.is_featured;
        document.getElementById('catalogModal').classList.remove('hidden');
    }

    function closeCatalogModal() {
        document.getElementById('catalogModal').classList.add('hidden');
    }
</script>
@endsection

