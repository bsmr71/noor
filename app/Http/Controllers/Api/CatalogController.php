<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CatalogItem;
use App\Models\CatalogOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CatalogController extends Controller
{
    public static function ensureDefaultCatalogSeeded(): void
    {
        if (CatalogItem::count() > 0) {
            return;
        }

        $defaults = [
            [
                'title'            => 'Paket Umrah Syahdu 9 Hari (Direct Madinah)',
                'slug'             => 'paket-umrah-syahdu-9-hari',
                'category'         => 'umrah',
                'partner_name'     => 'Al-Haramain Syiar Tour • PPIU Kemenag RI No. 892/2022',
                'badge'            => 'Early Bird -2,6 Jt',
                'original_price'   => 34500000,
                'price'            => 31900000,
                'stock'            => 24,
                'sold_count'       => 41,
                'rating'           => 5.0,
                'image_url'        => 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=900&q=80',
                'description'      => 'Perjalanan ibadah Umrah khusyuk 9 hari dengan penerbangan langsung Saudia Airlines tanpa transit, hotel bintang 5 pelataran Masjidil Haram & Masjid Nabawi, serta bimbingan Muthawif lulusan Timur Tengah sesuai Sunnah.',
                'highlights'       => [
                    'Pesawat Saudia Airlines Direct Jakarta – Madinah',
                    'Hotel Makkah & Madinah Bintang 5 (±100m Pelataran)',
                    'Bimbingan Manasik & Muthawif Bersanad Resmi',
                    'Gratis Kereta Cepat Haramain & Air Zamzam 5 Liter',
                ],
                'whatsapp_contact' => '6281290001445',
                'is_active'        => true,
                'is_featured'      => true,
            ],
            [
                'title'            => 'Mushaf Al-Qur\'an Rasm Utsmani Tajwid Warna A5',
                'slug'             => 'mushaf-utsmani-tajwid-warna-a5',
                'category'         => 'buku',
                'partner_name'     => 'Lajnah Pentashihan & Penerbit Syiar Sahabat',
                'badge'            => 'Tashih Kemenag',
                'original_price'   => 145000,
                'price'            => 98000,
                'stock'            => 120,
                'sold_count'       => 215,
                'rating'           => 4.9,
                'image_url'        => 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=900&q=80',
                'description'      => 'Mushaf Al-Qur\'an standar Madinah Rasm Utsmani dengan panduan tajwid warna, terjemahan resmi Kemenag RI terbaru, asbabun nuzul, serta kertas QPP khusus yang teduh di mata untuk tilawah berjam-jam.',
                'highlights'       => [
                    'Surat Tanda Tashih Resmi LPMQ Kemenag RI',
                    'Kertas Quranic Paper Premium (QPP) Tahan Puluhan Tahun',
                    'Dilengkapi Kode Tajwid Warna & Waqaf Ibtida',
                    'Hardcover Emboss Kaligrafi Emas Eksklusif',
                ],
                'whatsapp_contact' => '6281290001445',
                'is_active'        => true,
                'is_featured'      => true,
            ],
            [
                'title'            => 'Ensiklopedia Akhlak & Sirah Nabawiyah (3 Jilid)',
                'slug'             => 'ensiklopedia-sirah-nabawiyah-3-jilid',
                'category'         => 'buku',
                'partner_name'     => 'Penerbit Pustaka Khazanah Islam',
                'badge'            => 'Diskon 30%',
                'original_price'   => 450000,
                'price'            => 315000,
                'stock'            => 45,
                'sold_count'       => 89,
                'rating'           => 4.9,
                'image_url'        => 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=900&q=80',
                'description'      => 'Karya rujukan keluarga Muslim yang mengupas perjalanan hidup Rasulullah ﷺ dari kelahiran hingga wafat secara kronologis, dilengkapi peta sejarah full-color dan intisari keteladanan adab harian.',
                'highlights'       => [
                    '3 Jilid Hardcover Eksklusif + Box Koleksi',
                    'Dilengkapi Peta Visual Jejak Dakwah & Ghazwah',
                    'Tahqiq Riwayat Shahih & Bahasa Mudah Dipahami',
                ],
                'whatsapp_contact' => '6281290001445',
                'is_active'        => true,
                'is_featured'      => false,
            ],
            [
                'title'            => 'Sajadah Raudhah Velvet Tebal Memory Foam',
                'slug'             => 'sajadah-raudhah-velvet-memory-foam',
                'category'         => 'perlengkapan',
                'partner_name'     => 'Galeri Tenun Haramain Nusantara',
                'badge'            => 'Terlaris',
                'original_price'   => 249000,
                'price'            => 179000,
                'stock'            => 85,
                'sold_count'       => 164,
                'rating'           => 4.9,
                'image_url'        => 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=900&q=80',
                'description'      => 'Sajadah premium terinspirasi karpet hijau Raudhah Masjid Nabawi dengan lapisan empuk memory foam setebal 15mm yang menjaga kenyamanan lutut & dahi saat sujud lama maupun qiyamul lail.',
                'highlights'       => [
                    'Ketebalan 15mm Empuk Ramah Lutut Lansia & Dewasa',
                    'Permukaan Beludru Halus Anti-Selip di Lantai Keramik',
                    'Bonus Tasbih Kayu Kokka & Pouch Travel Eksklusif',
                ],
                'whatsapp_contact' => '6281290001445',
                'is_active'        => true,
                'is_featured'      => true,
            ],
            [
                'title'            => 'Set Mukena Silk Armani & Tasbih Digital Kayu',
                'slug'             => 'set-mukena-silk-armani-travel',
                'category'         => 'perlengkapan',
                'partner_name'     => 'Busana Muslimah Hayya Syar\'i',
                'badge'            => 'Edisi Hadiah',
                'original_price'   => 320000,
                'price'            => 245000,
                'stock'            => 60,
                'sold_count'       => 112,
                'rating'           => 4.8,
                'image_url'        => 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=900&q=80',
                'description'      => 'Mukena adem berbahan Armani Silk yang ringan, tidak menerawang, dan mudah dilipat kecil untuk dibawa bepergian maupun hadiah istimewa untuk ibu dan istri tercinta.',
                'highlights'       => [
                    'Bahan Armani Silk Dingin, Jatuh & Tidak Menerawang',
                    'Ukuran Jumbo Syar\'i Menutup Dagu dengan Sempurna',
                    'Sudah Termasuk Sajadah Muka & Hardbox Pita',
                ],
                'whatsapp_contact' => '6281290001445',
                'is_active'        => true,
                'is_featured'      => false,
            ],
            [
                'title'            => 'Kurma Ajwa Aliyah Madinah Asli (500gr VIP)',
                'slug'             => 'kurma-ajwa-aliyah-madinah-500gr',
                'category'         => 'herbal',
                'partner_name'     => 'Kebun Sunnah Al-Madinah Import',
                'badge'            => 'Panen Baru',
                'original_price'   => 195000,
                'price'            => 155000,
                'stock'            => 95,
                'sold_count'       => 230,
                'rating'           => 5.0,
                'image_url'        => 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=900&q=80',
                'description'      => 'Kurma Ajwa kualitas VIP dari dataran tinggi Aliyah, Madinah Al-Munawwarah. Tekstur lembut, daging tebal, manis alami rendah glikemik untuk mengamalkan sunnah 7 butir setiap pagi.',
                'highlights'       => [
                    '100% Asli Kebun Aliyah Madinah Bersertifikat',
                    'Ukuran Jumbo Grade A, Lembut & Tidak Kering',
                    'Kemasan Jar Kedap Udara Food-Grade Segel Aman',
                ],
                'whatsapp_contact' => '6281290001445',
                'is_active'        => true,
                'is_featured'      => true,
            ],
            [
                'title'            => 'Madu Yaman Sidr Murni & Habbatussauda Perasan Pertama',
                'slug'             => 'madu-yaman-sidr-habbatussauda',
                'category'         => 'herbal',
                'partner_name'     => 'Thibbun Nabawi Nusantara',
                'badge'            => 'Uji Lab Murni',
                'original_price'   => 260000,
                'price'            => 210000,
                'stock'            => 70,
                'sold_count'       => 138,
                'rating'           => 4.9,
                'image_url'        => 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=900&q=80',
                'description'      => 'Paket penjaga imunitas harian sesuai tuntunan Thibbun Nabawi: kombinasi Madu Sidr mentah tanpa pemanasan (raw honey) dan kapsul minyak Habbatussauda Habasyah cold-pressed.',
                'highlights'       => [
                    'Madu Raw Unfiltered Kaya Enzim Alami (350gr)',
                    'Bonus 100 Kapsul Minyak Habbatussauda Habasyah',
                    'Terdaftar Halal MUI & BPOM RI Resmi',
                ],
                'whatsapp_contact' => '6281290001445',
                'is_active'        => true,
                'is_featured'      => false,
            ],
            [
                'title'            => 'Qurban Domba / Kambing Premium Bobot 30kg+ (Salur Pelosok)',
                'slug'             => 'qurban-kambing-premium-30kg',
                'category'         => 'qurban',
                'partner_name'     => 'Lembaga Qurban & Aqiqah Amanah Nusantara',
                'badge'            => 'Sesuai Syariat',
                'original_price'   => 2250000,
                'price'            => 1950000,
                'stock'            => 150,
                'sold_count'       => 67,
                'rating'           => 5.0,
                'image_url'        => 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=900&q=80',
                'description'      => 'Layanan pemesanan hewan Qurban maupun Aqiqah sehat, cukup umur, tidak cacat, diawasi dokter hewan dan disembelih sesuai syariat untuk disalurkan ke desa-desa minim pequrban.',
                'highlights'       => [
                    'Jaminan Bobot Hidup 30–35 kg Sehat & Cukup Umur',
                    'Sudah Termasuk Biaya Pemotongan & Distribusi Pelosok',
                    'Laporan Foto, Video Sebut Nama & Sertifikat Resmi',
                ],
                'whatsapp_contact' => '6281290001445',
                'is_active'        => true,
                'is_featured'      => true,
            ],
        ];

        foreach ($defaults as $item) {
            CatalogItem::create($item);
        }
    }

    public function index(Request $request)
    {
        self::ensureDefaultCatalogSeeded();

        $query = CatalogItem::where('is_active', true);

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('partner_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $items = $query->orderByDesc('is_featured')->orderByDesc('id')->get();

        return response()->json([
            'status'     => 'success',
            'categories' => CatalogItem::categoryLabels(),
            'data'       => $items,
        ]);
    }

    public function show($id)
    {
        self::ensureDefaultCatalogSeeded();

        $item = CatalogItem::where('is_active', true)->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data'   => $item,
        ]);
    }

    public function createOrder(Request $request)
    {
        $raw = json_decode($request->getContent(), true);
        $data = is_array($raw) ? array_merge($request->all(), $raw) : $request->all();

        $validator = Validator::make($data, [
            'catalog_item_id'  => 'required|exists:catalog_items,id',
            'buyer_name'       => 'required|string|max:150',
            'buyer_phone'      => 'required|string|max:40',
            'shipping_address' => 'required|string|max:1000',
            'notes'            => 'nullable|string|max:500',
            'quantity'         => 'required|integer|min:1|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Mohon lengkapi nama, nomor WhatsApp, dan alamat pengiriman.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $item = CatalogItem::where('is_active', true)->findOrFail($data['catalog_item_id']);
        $qty = (int) $data['quantity'];

        if ($item->stock < $qty) {
            return response()->json([
                'status'  => 'error',
                'message' => "Stok produk tersisa {$item->stock} unit.",
            ], 422);
        }

        $user = $request->user('sanctum') ?: $request->user();
        $totalAmount = (int) $item->price * $qty;
        $orderCode = 'ORD-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5));

        $order = CatalogOrder::create([
            'order_code'       => $orderCode,
            'user_id'          => $user?->id,
            'catalog_item_id'  => $item->id,
            'buyer_name'       => trim($data['buyer_name']),
            'buyer_phone'      => trim($data['buyer_phone']),
            'shipping_address' => trim($data['shipping_address']),
            'notes'            => $data['notes'] ?? null,
            'quantity'         => $qty,
            'unit_price'       => (int) $item->price,
            'total_amount'     => $totalAmount,
            'status'           => 'menunggu_konfirmasi',
        ]);

        $item->decrement('stock', $qty);
        $item->increment('sold_count', $qty);

        return response()->json([
            'status'  => 'success',
            'message' => 'Pesanan berhasil dicatat! Tim mitra kami akan segera memproses pesanan Anda.',
            'data'    => $order->load('item'),
        ], 201);
    }

    public function myOrders(Request $request)
    {
        $user = $request->user('sanctum') ?: $request->user();

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Silakan masuk ke akun Noor untuk melihat riwayat pesanan.',
            ], 401);
        }

        $orders = CatalogOrder::with('item')
            ->where('user_id', $user->id)
            ->latest()
            ->take(30)
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $orders,
        ]);
    }
}

