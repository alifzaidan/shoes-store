<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::latest()->get();

        return Inertia::render('admin/products/index', ['products' => $products,]);
    }

    public function create()
    {
        return Inertia::render('admin/products/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png|max:2048',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|numeric|min:0',
        ]);

        $image = $request->file('image');
        $imagePath = $image->store('products', 'public');

        $data = $request->all();
        $data['user_id'] = $request->user()->id;
        $data['image'] = $imagePath;

        Product::create($data);

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }
}
