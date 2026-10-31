<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category')->default('Sedekah');
            $table->string('partner')->default('BAZNAS RI Pusat');
            $table->unsignedBigInteger('target_amount')->default(100000000);
            $table->unsignedBigInteger('collected_amount')->default(0);
            $table->unsignedInteger('donor_count')->default(0);
            $table->string('status')->default('active');
            $table->string('badge')->nullable();
            $table->text('image_url')->nullable();
            $table->text('description')->nullable();
            $table->integer('days_left')->default(30);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};
