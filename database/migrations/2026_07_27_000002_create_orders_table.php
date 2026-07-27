<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('shoe_id')->constrained('shoes')->onDelete('cascade');
            $table->integer('amount');
            $table->string('payment_method');
            $table->string('payment_gateway_id')->nullable();
            $table->string('payment_status')->default('PENDING'); // PENDING, PAID, CANCELLED, EXPIRED, FAILED, REFUNDED
            $table->json('payment_data')->nullable();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
