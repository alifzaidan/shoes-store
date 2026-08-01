<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\PaymentGatewayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    protected PaymentGatewayService $paymentGatewayService;

    public function __construct(PaymentGatewayService $paymentGatewayService)
    {
        $this->paymentGatewayService = $paymentGatewayService;
    }

    /**
     * Handle inbound Webhook callback notification from Aksara Payment Gateway.
     *
     * Security flow:
     *  1. Cek apakah PAYMENT_GATEWAY_WEBHOOK_SECRET sudah dikonfigurasi di .env
     *     → Jika belum, tolak dengan 503 (Service Not Configured)
     *  2. Baca raw body request (sebelum Laravel parse JSON)
     *  3. Ambil header X-Merchant-Signature dari Payment Gateway
     *     → Jika tidak ada, tolak dengan 401 Unauthorized
     *  4. Verifikasi HMAC-SHA256 menggunakan PAYMENT_GATEWAY_WEBHOOK_SECRET
     *     → Jika tidak cocok, tolak dengan 401 Unauthorized
     *  5. Jika valid → proses update status order
     */
    public function handlePaymentGateway(Request $request)
    {
        Log::info('[Webhook] Received callback from Payment Gateway', [
            'ip'      => $request->ip(),
            'method'  => $request->method(),
            'path'    => $request->path(),
        ]);

        // ─── 1. Pastikan Webhook Secret sudah dikonfigurasi ───────────────────
        $webhookSecret = config('services.payment_gateway.webhook_secret');

        if (empty($webhookSecret)) {
            Log::error('[Webhook] PAYMENT_GATEWAY_WEBHOOK_SECRET belum dikonfigurasi di .env! ' .
                'Silakan generate Webhook Secret di portal merchant dan isi di .env.');

            return response()->json([
                'error'   => 'Webhook tidak dikonfigurasi',
                'message' => 'PAYMENT_GATEWAY_WEBHOOK_SECRET belum diisi di environment. ' .
                             'Generate Webhook Secret di portal merchant terlebih dahulu.',
            ], 503);
        }

        // ─── 2. Baca Raw Body & Ambil Signature Header ───────────────────────
        $rawPayload = $request->getContent();

        // Payment Gateway mengirim signature di header X-Merchant-Signature
        $signature = $request->header('X-Merchant-Signature');

        if (empty($signature)) {
            Log::warning('[Webhook] Header X-Merchant-Signature tidak ada. Request ditolak.', [
                'ip'      => $request->ip(),
                'headers' => array_keys($request->headers->all()),
            ]);

            return response()->json([
                'error'   => 'Missing signature',
                'message' => 'Header X-Merchant-Signature wajib disertakan.',
            ], 401);
        }

        // ─── 3. Verifikasi HMAC-SHA256 Signature ─────────────────────────────
        $isValid = $this->paymentGatewayService->verifyWebhookSignature($rawPayload, $signature);

        if (!$isValid) {
            Log::warning('[Webhook] Signature tidak valid! Request kemungkinan palsu atau secret salah.', [
                'received_signature' => substr($signature, 0, 16) . '...',
                'ip'                 => $request->ip(),
            ]);

            return response()->json([
                'error'   => 'Invalid signature',
                'message' => 'Signature HMAC-SHA256 tidak cocok. Pastikan PAYMENT_GATEWAY_WEBHOOK_SECRET ' .
                             'di .env sesuai dengan Webhook Secret di portal merchant.',
            ], 401);
        }

        Log::info('[Webhook] Signature valid. Melanjutkan proses update order...');

        // ─── 4. Parsing Payload ───────────────────────────────────────────────
        $externalId = $request->input('external_id');
        $status     = strtoupper($request->input('status', ''));
        $paymentId  = $request->input('payment_id') ?? $request->input('id');
        $paidAt     = $request->input('paid_at');

        Log::info('[Webhook] Payload parsed', [
            'external_id' => $externalId,
            'status'      => $status,
            'payment_id'  => $paymentId,
        ]);

        if (!$externalId) {
            Log::warning('[Webhook] Payload tidak memiliki external_id.');
            return response()->json(['error' => 'Missing external_id'], 400);
        }

        if (!$status) {
            Log::warning('[Webhook] Payload tidak memiliki status.');
            return response()->json(['error' => 'Missing status'], 400);
        }

        // ─── 5. Temukan Order berdasarkan external_id ─────────────────────────
        $order = Order::where('order_number', $externalId)->first();

        if (!$order) {
            Log::warning('[Webhook] Order tidak ditemukan', ['external_id' => $externalId]);
            return response()->json(['error' => 'Order not found'], 404);
        }

        // ─── 6. Update status Order ───────────────────────────────────────────
        $previousStatus = $order->payment_status;
        $order->payment_status = $status;

        if ($paymentId && !$order->payment_gateway_id) {
            $order->payment_gateway_id = $paymentId;
        }

        match ($status) {
            'PAID'      => $order->paid_at      = $paidAt ? now()->parse($paidAt) : now(),
            'CANCELLED' => $order->cancelled_at = now(),
            'REFUNDED'  => $order->refunded_at  = now(),
            'EXPIRED'   => $order->cancelled_at = now(),
            default     => null,
        };

        $order->save();

        Log::info("[Webhook] Order #{$order->order_number} status updated", [
            'from'   => $previousStatus,
            'to'     => $status,
            'paid_at' => $order->paid_at,
        ]);

        return response()->json([
            'status'  => 'SUCCESS',
            'message' => "Order #{$order->order_number} updated to {$status}",
        ]);
    }
}
