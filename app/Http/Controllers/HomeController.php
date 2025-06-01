<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function dashboard()
    {
        $products = Product::with('category')->latest()->take(6)->get();
        return Inertia::render('dashboard', ['products' => $products]);
    }

    public function detailProduct($id)
    {
        $product = Product::with('category')->findOrFail($id);
        return Inertia::render('product-detail', ['product' => $product]);
    }
}
