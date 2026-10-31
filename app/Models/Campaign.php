<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'category',
        'partner',
        'target_amount',
        'collected_amount',
        'donor_count',
        'status',
        'badge',
        'image_url',
        'description',
        'days_left',
    ];

    protected $appends = ['progress_percentage'];

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function getProgressPercentageAttribute()
    {
        if ($this->target_amount <= 0) return 0;
        $pct = ($this->collected_amount / $this->target_amount) * 100;
        return min(100, round($pct, 1));
    }
}
