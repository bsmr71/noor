<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_premium')) {
                $table->boolean('is_premium')->default(false)->after('role');
            }
            if (!Schema::hasColumn('users', 'premium_plan')) {
                $table->string('premium_plan', 40)->nullable()->after('is_premium');
            }
            if (!Schema::hasColumn('users', 'premium_expires_at')) {
                $table->timestamp('premium_expires_at')->nullable()->after('premium_plan');
            }
        });

        if (!Schema::hasTable('premium_subscriptions')) {
            Schema::create('premium_subscriptions', function (Blueprint $table) {
                $table->id();
                $table->string('invoice_code', 50)->unique();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('plan_key', 30); // monthly, yearly, lifetime, admin_grant
                $table->string('plan_name', 100);
                $table->unsignedBigInteger('amount')->default(0);
                $table->string('payment_method', 40)->default('QRIS');
                $table->string('status', 30)->default('paid'); // paid, revoked, expired
                $table->timestamp('starts_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('premium_subscriptions');

        Schema::table('users', function (Blueprint $table) {
            $cols = array_filter(
                ['is_premium', 'premium_plan', 'premium_expires_at'],
                fn ($col) => Schema::hasColumn('users', $col)
            );
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};

