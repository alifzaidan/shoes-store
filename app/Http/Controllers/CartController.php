<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $userId =  Auth::id();

        $cartItem = Cart::where('user_id', $userId)
            ->where('product_id', $request->product_id)
            ->where('status', 'active')
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $request->quantity;
            $cartItem->save();
        } else {
            Cart::create([
                'user_id' => $userId,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'status' => 'active',
            ]);
        }

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan ke keranjang!');
    }

    public function getCart()
    {
        $userId =  Auth::id();
        $cart = Cart::with('product')
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->get();

        return response()->json($cart);
    }

    public function cancel($id)
    {
        $userId = Auth::id();
        $cartItem = Cart::where('id', $id)
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->firstOrFail();

        $cartItem->status = 'cancelled';
        $cartItem->save();

        return redirect()->back()->with('success', 'Produk berhasil dihapus dari keranjang!');
    }
}
