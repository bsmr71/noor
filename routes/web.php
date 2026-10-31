<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\QuranController;
use App\Http\Controllers\Admin\PrayerScheduleController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ZakatController;
use App\Http\Controllers\Admin\PremiumController;
use App\Http\Controllers\Admin\CatalogController;

// Public Authentication Routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::match(['get', 'post'], '/logout', [AuthController::class, 'logout'])->name('logout');

// Root Route: Redirect based on authentication
Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('admin.dashboard')
        : redirect()->route('login');
});

// Graceful redirects for user convenience (e.g. typing muslimpro.test/backend)
Route::redirect('/backend', '/admin/dashboard');
Route::redirect('/backend/admin/dashboard', '/admin/dashboard');
Route::redirect('/backend/public', '/admin/dashboard');
Route::redirect('/backend/public/admin/dashboard', '/admin/dashboard');

// Protected Admin Console Routes
Route::prefix('admin')->middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/quran', [QuranController::class, 'index'])->name('admin.quran');
    Route::get('/quran/editor', [QuranController::class, 'editor'])->name('admin.quran.editor');
    Route::get('/prayer-schedule', [PrayerScheduleController::class, 'index'])->name('admin.prayer.schedule');
    Route::get('/banners', [BannerController::class, 'index'])->name('admin.banners');
    
    // Manajemen Pengguna & Jamaah
    Route::get('/users', [UserController::class, 'index'])->name('admin.users');
    Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
    Route::patch('/users/{id}/role', [UserController::class, 'updateRole'])->name('admin.users.role');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('admin.users.destroy');

    // Manajemen Zakat, Infaq & Wakaf
    Route::get('/zakat', [ZakatController::class, 'index'])->name('admin.zakat');
    Route::post('/zakat/campaign', [ZakatController::class, 'storeCampaign'])->name('admin.zakat.campaign.store');

    // Manajemen Member Noor+ (Bebas Iklan Mobile)
    Route::get('/premium', [PremiumController::class, 'index'])->name('admin.premium');
    Route::post('/premium/plans', [PremiumController::class, 'updatePlans'])->name('admin.premium.plans.update');
    Route::post('/premium/grant', [PremiumController::class, 'grantUser'])->name('admin.premium.grant');
    Route::delete('/premium/revoke/{id}', [PremiumController::class, 'revokeUser'])->name('admin.premium.revoke');

    // Manajemen Katalog Produk & Layanan Syariah
    Route::get('/catalog', [CatalogController::class, 'index'])->name('admin.catalog');
    Route::post('/catalog', [CatalogController::class, 'store'])->name('admin.catalog.store');
    Route::put('/catalog/{id}', [CatalogController::class, 'update'])->name('admin.catalog.update');
    Route::patch('/catalog/{id}/toggle', [CatalogController::class, 'toggleStatus'])->name('admin.catalog.toggle');
    Route::delete('/catalog/{id}', [CatalogController::class, 'destroy'])->name('admin.catalog.destroy');
    Route::patch('/catalog/orders/{id}/status', [CatalogController::class, 'updateOrderStatus'])->name('admin.catalog.orders.status');

    // Internal Admin Console AJAX Endpoints (Session Auth + CSRF Protected)
    Route::prefix('internal-api')->group(function () {
        Route::get('/settings', [\App\Http\Controllers\Api\ApiController::class, 'getSettings'])->name('admin.api.settings.get');
        Route::post('/settings', [\App\Http\Controllers\Api\ApiController::class, 'updateSettings'])->name('admin.api.settings.post');
        Route::post('/banners', [\App\Http\Controllers\Api\ApiController::class, 'updateBanners'])->name('admin.api.banners.post');
        Route::get('/prayer-times', [\App\Http\Controllers\Api\ApiController::class, 'prayerTimes'])->name('admin.api.prayer.get');
    });
});
