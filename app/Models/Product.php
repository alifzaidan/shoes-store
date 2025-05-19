<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $guarded = ['created_at', 'updated_at'];

    protected $fillable = [
        'user_id',
        'image',
        'title',
        'description',
        'price',
        'stock',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
