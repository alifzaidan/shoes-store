<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'shoe_id',
        'amount',
        'payment_method',
        'payment_gateway_id',
        'payment_status',
        'payment_data',
        'customer_name',
        'customer_email',
        'customer_phone',
        'paid_at',
        'refunded_at',
        'cancelled_at',
    ];

    protected $casts = [
        'payment_data' => 'array',
        'paid_at' => 'datetime',
        'refunded_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function shoe(): BelongsTo
    {
        return $this->belongsTo(Shoe::class);
    }
}
