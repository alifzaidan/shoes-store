<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Product::create([
            'image' => 'products/RWVECRtHYdI22RQVpYjvjeslmUkYqgOFXlNV7Ki5.jpg',
            'title' => 'Nike Shox TL',
            'description' => 'Sepatu pria yang nyaman dan stylish.',
            'price' => 2500000,
            'stock' => 100,
            'category_id' => 1,
        ]);
        Product::create([
            'image' => 'products/wldyD2LXH08VlSnCKZM2iukN5oOyb3gu6rYewCrK.jpg',
            'title' => 'Nike Air Force 1',
            'description' => 'Sepatu wanita yang stylish dan nyaman.',
            'price' => 1000000,
            'stock' => 120,
            'category_id' => 2,
        ]);
        Product::create([
            'image' => 'products/sweVLTxLoBg95Ok9Hpfb4utFt9fUTqJ5pOfqg94n.jpg',
            'title' => 'Nike Shox TL',
            'description' => 'Sepatu anak-anak yang nyaman dan stylish.',
            'price' => 750000,
            'stock' => 50,
            'category_id' => 3,
        ]);
    }
}
