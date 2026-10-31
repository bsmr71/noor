<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CatalogItem extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'category',
        'partner_name',
        'badge',
        'original_price',
        'price',
        'stock',
        'sold_count',
        'rating',
        'image_url',
        'description',
        'highlights',
        'whatsapp_contact',
        'is_active',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'original_price' => 'integer',
            'price'          => 'integer',
            'stock'          => 'integer',
            'sold_count'     => 'integer',
            'rating'         => 'float',
            'highlights'     => 'array',
            'is_active'      => 'boolean',
            'is_featured'    => 'boolean',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(CatalogOrder::class);
    }

    public static function categoryLabels(): array
    {
        return [
            'umrah'        => 'Umrah & Haji',
            'buku'         => 'Buku & Mushaf',
            'perlengkapan' => 'Perlengkapan Ibadah',
            'herbal'       => 'Herbal & Kurma Sunnah',
            'qurban'       => 'Qurban & Aqiqah',
        ];
    }

    public function getCategoryLabelAttribute(): string
    {
        return self::categoryLabels()[$this->category] ?? ucfirst($this->category);
    }
}

