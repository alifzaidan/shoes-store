<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Shoe;
use App\Services\PaymentGatewayService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Exception;

class OrderController extends Controller
{
    protected PaymentGatewayService $paymentGatewayService;

    public function __construct(PaymentGatewayService $paymentGatewayService)
    {
        $this->paymentGatewayService = $paymentGatewayService;
    }

    /**
     * Display catalog of shoes and recent orders
     */
    public function index()
    {
        $shoes = Shoe::where('stock', '>', 0)->get();
        $recentOrders = Order::with('shoe')->latest()->take(10)->get();

        return Inertia::render('shoes/Catalog', [
            'shoes' => $shoes,
            'recentOrders' => $recentOrders,
        ]);
    }

    /**
     * Store new order and trigger Payment Gateway payment creation
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shoe_id' => 'required|exists:shoes,id',
            'payment_method' => 'required|string|in:QRIS,VIRTUAL_ACCOUNT',
            'checkout_mode' => 'nullable|string|in:hosted,custom',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:20',
        ]);

        $shoe = Shoe::findOrFail($validated['shoe_id']);

        $orderNumber = 'SHOES-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        $order = Order::create([
            'order_number' => $orderNumber,
            'shoe_id' => $shoe->id,
            'amount' => $shoe->price,
            'payment_method' => $validated['payment_method'],
            'payment_status' => 'PENDING',
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'] ?? null,
        ]);

        try {
            $paymentRes = $this->paymentGatewayService->createPayment($order);

            $paymentDataRaw = $paymentRes['payment_data'] ?? null;
            $formattedPaymentData = [];

            if (is_array($paymentDataRaw)) {
                $formattedPaymentData = $paymentDataRaw;
            } elseif (is_string($paymentDataRaw)) {
                $decoded = json_decode($paymentDataRaw, true);
                if (is_array($decoded)) {
                    $formattedPaymentData = $decoded;
                } else {
                    if ($validated['payment_method'] === 'QRIS') {
                        $formattedPaymentData = ['qr_string' => $paymentDataRaw];
                    } else {
                        $formattedPaymentData = ['va_number' => $paymentDataRaw];
                    }
                }
            }

            $order->update([
                'payment_gateway_id' => $paymentRes['id'] ?? null,
                'payment_data' => $formattedPaymentData,
            ]);

            $checkoutMode = $validated['checkout_mode'] ?? 'hosted';

            if ($checkoutMode === 'hosted') {
                return redirect()->route('orders.show', ['order' => $order->id, 'hosted' => 1])
                    ->with('success', 'Pesanan berhasil dibuat!');
            }

            return redirect()->route('orders.show', $order->id)
                ->with('success', 'Pesanan berhasil dibuat! Silakan selesaikan pembayaran.');
        } catch (Exception $e) {
            $order->update(['payment_status' => 'FAILED']);
            return back()->withErrors(['error' => 'Gagal menghubungkan ke Payment Gateway: ' . $e->getMessage()]);
        }
    }

    /**
     * View order details & payment status
     *
     * Status order HANYA diperbarui via webhook callback dari Payment Gateway.
     * Tidak ada polling aktif ke Payment Gateway API agar konsisten dengan
     * arsitektur event-driven dan keamanan verifikasi signature HMAC.
     */
    public function show(Order $order)
    {
        $order->load('shoe');

        return Inertia::render('shoes/OrderDetail', [
            'order' => $order,
        ]);
    }

    /**
     * Cancel an active order via Payment Gateway API
     */
    public function cancel(Order $order)
    {
        if ($order->payment_status !== 'PENDING') {
            return back()->withErrors(['error' => 'Hanya pesanan berstatus PENDING yang dapat dibatalkan.']);
        }

        try {
            if ($order->payment_gateway_id) {
                $this->paymentGatewayService->cancelPayment($order->payment_gateway_id);
            }

            $order->update([
                'payment_status' => 'CANCELLED',
                'cancelled_at' => now(),
            ]);

            return back()->with('success', 'Pesanan berhasil dibatalkan.');
        } catch (Exception $e) {
            return back()->withErrors(['error' => 'Gagal membatalkan pesanan: ' . $e->getMessage()]);
        }
    }

    /**
     * Refund a paid order via Payment Gateway API
     */
    public function refund(Request $request, Order $order)
    {
        if ($order->payment_status !== 'PAID') {
            return back()->withErrors(['error' => 'Hanya pesanan yang sudah dibayar (PAID) yang dapat di-refund.']);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:255',
        ]);

        try {
            if ($order->payment_gateway_id) {
                $this->paymentGatewayService->refundPayment(
                    $order->payment_gateway_id,
                    $order->amount,
                    $validated['reason'] ?? 'Permintaan refund pelanggan'
                );
            }

            $order->update([
                'payment_status' => 'REFUNDED',
                'refunded_at' => now(),
            ]);

            return back()->with('success', 'Permintaan refund berhasil diproses.');
        } catch (Exception $e) {
            return back()->withErrors(['error' => 'Gagal memproses refund: ' . $e->getMessage()]);
        }
    }
}
