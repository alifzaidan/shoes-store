<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function handlePaymentGateway(Request $request)
    {
        Log::info('Received Webhook from Payment Gateway', [
            'payload' => $request->all(),
        ]);

        $webhookSecret = config('services.payment_gateway.webhook_secret');
        $signature = $request->header('X-Merchant-Signature');

        if ($webhookSecret && $signature) {
            $computedSignature = hash_hmac('sha256', $request->getContent(), $webhookSecret);
            if (!hash_equals($computedSignature, $signature)) {
                Log::warning('Invalid Payment Gateway webhook signature', [
                    'computed' => $computedSignature,
                    'received' => $signature,
                ]);
                return response()->json(['error' => 'Invalid signature'], 401);
            }
        }

        $externalId = $request->input('external_id');
        $status = strtoupper($request->input('status', ''));
        $paymentId = $request->input('payment_id');
        $paidAt = $request->input('paid_at');

        if (!$externalId) {
            return response()->json(['error' => 'Missing external_id'], 400);
        }

        $order = Order::where('order_number', $externalId)->first();

        if (!$order) {
            Log::warning('Webhook received for non-existent order', ['external_id' => $externalId]);
            return response()->json(['error' => 'Order not found'], 404);
        }

        $order->payment_status = $status;
        if ($paymentId && !$order->payment_gateway_id) {
            $order->payment_gateway_id = $paymentId;
        }

        if ($status === 'PAID') {
            $order->paid_at = $paidAt ? now()->parse($paidAt) : now();
        } elseif ($status === 'CANCELLED') {
            $order->cancelled_at = now();
        } elseif ($status === 'REFUNDED') {
            $order->refunded_at = now();
        }

        $order->save();

        Log::info("Order #{$order->order_number} status updated to {$status} via Webhook");

        return response()->json([
            'status' => 'SUCCESS',
            'message' => "Order #{$order->order_number} updated to {$status}",
        ]);
    }
}
