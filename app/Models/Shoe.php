<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shoe extends Model
{
    protected $fillable = [
        'name',
        'brand',
        'price',
        'description',
        'image_url',
        'stock',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
