<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('catalog_items')) {
            Schema::create('catalog_items', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('slug')->unique();
                $table->string('category', 40)->default('perlengkapan'); // umrah, buku, perlengkapan, herbal, qurban
                $table->string('partner_name')->default('Mitra Resmi Noor Syariah');
                $table->string('badge', 60)->nullable();
                $table->unsignedBigInteger('original_price')->nullable();
                $table->unsignedBigInteger('price')->default(0);
                $table->integer('stock')->default(50);
                $table->unsignedInteger('sold_count')->default(0);
                $table->decimal('rating', 2, 1)->default(4.9);
                $table->text('image_url')->nullable();
                $table->text('description')->nullable();
                $table->json('highlights')->nullable();
                $table->string('whatsapp_contact', 30)->nullable();
                $table->boolean('is_active')->default(true);
                $table->boolean('is_featured')->default(false);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('catalog_orders')) {
            Schema::create('catalog_orders', function (Blueprint $table) {
                $table->id();
                $table->string('order_code', 50)->unique();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('catalog_item_id')->constrained('catalog_items')->cascadeOnDelete();
                $table->string('buyer_name');
                $table->string('buyer_phone', 40);
                $table->text('shipping_address');
                $table->text('notes')->nullable();
                $table->unsignedInteger('quantity')->default(1);
                $table->unsignedBigInteger('unit_price')->default(0);
                $table->unsignedBigInteger('total_amount')->default(0);
                $table->string('status', 30)->default('menunggu_konfirmasi'); // menunggu_konfirmasi, diproses, dikirim, selesai, dibatalkan
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('catalog_orders');
        Schema::dropIfExists('catalog_items');
    }
};

