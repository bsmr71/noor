<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\CatalogController as ApiCatalogController;
use App\Models\CatalogItem;
use App\Models\CatalogOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CatalogController extends Controller
{
    public function index(Request $request)
    {
        ApiCatalogController::ensureDefaultCatalogSeeded();

        $query = CatalogItem::query();

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('partner_name', 'like', "%{$search}%");
            });
        }

        $items = $query->orderByDesc('is_featured')->orderByDesc('id')->get();
        $categories = CatalogItem::categoryLabels();
        $orders = CatalogOrder::with(['item', 'user'])->latest()->take(50)->get();

        $stats = [
            'active_items'   => CatalogItem::where('is_active', true)->count(),
            'total_orders'   => CatalogOrder::count(),
            'pending_orders' => CatalogOrder::where('status', 'menunggu_konfirmasi')->count(),
            'total_gmv'      => (int) CatalogOrder::where('status', '!=', 'dibatalkan')->sum('total_amount'),
        ];

        return view('admin.catalog', compact('items', 'categories', 'orders', 'stats'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'            => 'required|string|max:200',
            'category'         => 'required|string|in:umrah,buku,perlengkapan,herbal,qurban',
            'partner_name'     => 'required|string|max:180',
            'badge'            => 'nullable|string|max:60',
            'original_price'   => 'nullable|integer|min:0',
            'price'            => 'required|integer|min:1000',
            'stock'            => 'required|integer|min:0',
            'image_url'        => 'required|url|max:1000',
            'description'      => 'required|string|max:2000',
            'highlights_text'  => 'nullable|string|max:1500',
            'whatsapp_contact' => 'nullable|string|max:30',
            'is_featured'      => 'nullable|boolean',
        ]);

        $highlights = array_values(array_filter(array_map(
            'trim',
            preg_split('/\r\n|\r|\n/', $validated['highlights_text'] ?? '')
        )));

        CatalogItem::create([
            'title'            => $validated['title'],
            'slug'             => Str::slug($validated['title']) . '-' . strtolower(Str::random(4)),
            'category'         => $validated['category'],
            'partner_name'     => $validated['partner_name'],
            'badge'            => $validated['badge'] ?: null,
            'original_price'   => !empty($validated['original_price']) ? (int) $validated['original_price'] : null,
            'price'            => (int) $validated['price'],
            'stock'            => (int) $validated['stock'],
            'rating'           => 5.0,
            'image_url'        => $validated['image_url'],
            'description'      => $validated['description'],
            'highlights'       => $highlights,
            'whatsapp_contact' => $validated['whatsapp_contact'] ?: '6281290001445',
            'is_active'        => true,
            'is_featured'      => $request->boolean('is_featured'),
        ]);

        return redirect()
            ->route('admin.catalog')
            ->with('success', "Produk/Paket \"{$validated['title']}\" berhasil ditambahkan ke Katalog Mobile!");
    }

    public function update(Request $request, $id)
    {
        $item = CatalogItem::findOrFail($id);

        $validated = $request->validate([
            'title'            => 'required|string|max:200',
            'category'         => 'required|string|in:umrah,buku,perlengkapan,herbal,qurban',
            'partner_name'     => 'required|string|max:180',
            'badge'            => 'nullable|string|max:60',
            'original_price'   => 'nullable|integer|min:0',
            'price'            => 'required|integer|min:1000',
            'stock'            => 'required|integer|min:0',
            'image_url'        => 'required|url|max:1000',
            'description'      => 'required|string|max:2000',
            'highlights_text'  => 'nullable|string|max:1500',
            'whatsapp_contact' => 'nullable|string|max:30',
        ]);

        $highlights = array_values(array_filter(array_map(
            'trim',
            preg_split('/\r\n|\r|\n/', $validated['highlights_text'] ?? '')
        )));

        $item->update([
            'title'            => $validated['title'],
            'category'         => $validated['category'],
            'partner_name'     => $validated['partner_name'],
            'badge'            => $validated['badge'] ?: null,
            'original_price'   => !empty($validated['original_price']) ? (int) $validated['original_price'] : null,
            'price'            => (int) $validated['price'],
            'stock'            => (int) $validated['stock'],
            'image_url'        => $validated['image_url'],
            'description'      => $validated['description'],
            'highlights'       => $highlights,
            'whatsapp_contact' => $validated['whatsapp_contact'] ?: '6281290001445',
            'is_featured'      => $request->boolean('is_featured'),
        ]);

        return redirect()
            ->route('admin.catalog')
            ->with('success', "Katalog \"{$item->title}\" berhasil diperbarui!");
    }

    public function toggleStatus($id)
    {
        $item = CatalogItem::findOrFail($id);
        $item->is_active = !$item->is_active;
        $item->save();

        $state = $item->is_active ? 'diaktifkan' : 'disembunyikan';
        return redirect()
            ->route('admin.catalog')
            ->with('success', "Item katalog \"{$item->title}\" berhasil {$state}.");
    }

    public function destroy($id)
    {
        $item = CatalogItem::findOrFail($id);
        $title = $item->title;
        $item->delete();

        return redirect()
            ->route('admin.catalog')
            ->with('success', "Item katalog \"{$title}\" berhasil dihapus.");
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $order = CatalogOrder::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:menunggu_konfirmasi,diproses,dikirim,selesai,dibatalkan',
        ]);

        $order->status = $validated['status'];
        $order->save();

        return redirect()
            ->route('admin.catalog')
            ->with('success', "Status pesanan {$order->order_code} berhasil diubah menjadi " . strtoupper(str_replace('_', ' ', $order->status)) . "!");
    }
}

