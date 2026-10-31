<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiController;

Route::prefix('v1')->group(function () {
    // Authentication Routes
    Route::post('/auth/login', [ApiController::class, 'login']);
    Route::post('/auth/register', [ApiController::class, 'register']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/user', [ApiController::class, 'user']);
        Route::post('/auth/logout', [ApiController::class, 'logout']);
        Route::post('/settings', [ApiController::class, 'updateSettings']);
        Route::post('/banners', [ApiController::class, 'updateBanners']);

        // Noor+ Premium Ad-Free Subscription Endpoints
        Route::get('/premium/my', [\App\Http\Controllers\Api\PremiumController::class, 'myStatus']);
        Route::post('/premium/subscribe', [\App\Http\Controllers\Api\PremiumController::class, 'subscribe']);
    });

    // Mobile App Public Read Routes (Protected by EnsureMobileClient HMAC Guard)
    Route::get('/prayer-times', [ApiController::class, 'prayerTimes']);
    Route::get('/banners', [ApiController::class, 'banners']);
    Route::get('/settings', [ApiController::class, 'getSettings']);
    Route::get('/premium/plans', [\App\Http\Controllers\Api\PremiumController::class, 'plans']);

    // Donation & Campaign API Routes
    Route::get('/campaigns', [\App\Http\Controllers\Api\DonationController::class, 'campaigns']);
    Route::get('/campaigns/{id}', [\App\Http\Controllers\Api\DonationController::class, 'campaignDetail']);
    Route::post('/donations', [\App\Http\Controllers\Api\DonationController::class, 'store']);
    Route::get('/donations/my', [\App\Http\Controllers\Api\DonationController::class, 'userDonations']);
    Route::get('/donations/{code}', [\App\Http\Controllers\Api\DonationController::class, 'show']);

    // Syariah Catalog & Orders API Routes
    Route::get('/catalog', [\App\Http\Controllers\Api\CatalogController::class, 'index']);
    Route::get('/catalog/orders/my', [\App\Http\Controllers\Api\CatalogController::class, 'myOrders']);
    Route::post('/catalog/orders', [\App\Http\Controllers\Api\CatalogController::class, 'createOrder']);
    Route::get('/catalog/{id}', [\App\Http\Controllers\Api\CatalogController::class, 'show']);
});
