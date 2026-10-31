<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CatalogOrder extends Model
{
    protected $fillable = [
        'order_code',
        'user_id',
        'catalog_item_id',
        'buyer_name',
        'buyer_phone',
        'shipping_address',
        'notes',
        'quantity',
        'unit_price',
        'total_amount',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'quantity'     => 'integer',
            'unit_price'   => 'integer',
            'total_amount' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(CatalogItem::class, 'catalog_item_id');
    }
}

