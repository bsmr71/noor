<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'avatar', 'bio', 'role', 'is_premium', 'premium_plan', 'premium_expires_at'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at'  => 'datetime',
            'password'           => 'hashed',
            'is_premium'         => 'boolean',
            'premium_expires_at' => 'datetime',
        ];
    }

    public function premiumSubscriptions(): HasMany
    {
        return $this->hasMany(PremiumSubscription::class)->latest();
    }

    public function hasActivePremium(): bool
    {
        if (!$this->is_premium) {
            return false;
        }

        if ($this->premium_expires_at && $this->premium_expires_at->isPast()) {
            return false;
        }

        return true;
    }

    public function getPremiumLabel(): ?string
    {
        if (!$this->hasActivePremium()) {
            return null;
        }

        return match ($this->premium_plan) {
            'monthly'     => 'Noor+ Bulanan',
            'yearly'      => 'Noor+ Tahunan',
            'lifetime'    => 'Noor+ Selamanya',
            'admin_grant' => 'Noor+ Kehormatan',
            default       => 'Noor+ Bebas Iklan',
        };
    }

    public function toMobileProfileArray(int $streakDays = 7, int $totalKhatam = 1): array
    {
        $activePremium = $this->hasActivePremium();

        return [
            'id'                 => $this->id,
            'name'               => $this->name,
            'email'              => $this->email,
            'avatar'             => $this->avatar,
            'bio'                => $this->bio,
            'role'               => $this->role,
            'is_premium'         => $activePremium,
            'premium_plan'       => $activePremium ? $this->premium_plan : null,
            'premium_label'      => $this->getPremiumLabel(),
            'premium_expires_at' => ($activePremium && $this->premium_expires_at)
                ? $this->premium_expires_at->toIso8601String()
                : null,
            'streakDays'         => $streakDays,
            'totalKhatam'        => $totalKhatam,
        ];
    }
}
