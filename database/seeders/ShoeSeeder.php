<?php

namespace Database\Seeders;

use App\Models\Shoe;
use Illuminate\Database\Seeder;

class ShoeSeeder extends Seeder
{
    public function run(): void
    {
        $shoes = [
            [
                'name' => 'Nike Air Force 1 \'07',
                'brand' => 'Nike',
                'price' => 1549000,
                'description' => 'Ikonik, tahan lama, dan nyaman untuk penggunaan sehari-hari.',
                'image_url' => 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=60',
                'stock' => 15,
            ],
            [
                'name' => 'Adidas Ultraboost 1.0',
                'brand' => 'Adidas',
                'price' => 2200000,
                'description' => 'Sepatu lari berbahan PRIMEKNIT dengan bantalan BOOST super empuk.',
                'image_url' => 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=60',
                'stock' => 10,
            ],
            [
                'name' => 'Air Jordan 1 Low',
                'brand' => 'Jordan',
                'price' => 1799000,
                'description' => 'Desain klasik terinspirasi dari edisi asli 1985.',
                'image_url' => 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=60',
                'stock' => 8,
            ],
            [
                'name' => 'Puma Suede Classic',
                'brand' => 'Puma',
                'price' => 1199000,
                'description' => 'Gaya retro dengan bahan suede premium dan outsole karet tahan lama.',
                'image_url' => 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=60',
                'stock' => 12,
            ],
            [
                'name' => 'New Balance 530',
                'brand' => 'New Balance',
                'price' => 1699000,
                'description' => 'Kembali ke gaya lari klasik era 90-an dengan teknologi ABZORB.',
                'image_url' => 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=60',
                'stock' => 20,
            ],
        ];

        foreach ($shoes as $shoe) {
            Shoe::updateOrCreate(['name' => $shoe['name']], $shoe);
        }
    }
}
