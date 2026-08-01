<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Exception;

class PaymentGatewayService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected string $apiSecret;
    protected bool $isProduction;

    public function __construct()
    {
        $this->baseUrl      = rtrim(config('services.payment_gateway.url', 'http://localhost:8080'), '/');
        $this->apiKey       = config('services.payment_gateway.api_key') ?? '';
        $this->apiSecret    = config('services.payment_gateway.api_secret') ?? '';
        $this->isProduction = (bool) config('services.payment_gateway.is_production', false);

        if (empty($this->apiKey) || empty($this->apiSecret)) {
            Log::warning('[PaymentGateway] API Key atau API Secret belum dikonfigurasi di .env');
        }
    }

    /**
     * Base HTTP headers wajib untuk setiap request ke Payment Gateway API.
     * - X-API-Key    : Identitas publik Merchant
     * - X-API-Secret : Kunci rahasia Merchant (JANGAN bocorkan ke client-side)
     */
    protected function headers(array $additional = []): array
    {
        return array_merge([
            'X-API-Key'       => $this->apiKey,
            'X-API-Secret'    => $this->apiSecret,
            'Content-Type'    => 'application/json',
            'Accept'          => 'application/json',
            'Idempotency-Key' => 'IDEM-' . Str::uuid()->toString(),
        ], $additional);
    }

    /**
     * Verifikasi Webhook Callback Signature menggunakan HMAC-SHA256.
     * Gunakan ini di WebhookController sebelum memproses notifikasi masuk.
     *
     * @param  string $rawPayload  Raw body string dari request webhook
     * @param  string $receivedSig Nilai header X-Signature dari request webhook
     * @return bool
     */
    public function verifyWebhookSignature(string $rawPayload, string $receivedSig): bool
    {
        $webhookSecret = config('services.payment_gateway.webhook_secret');

        if (empty($webhookSecret)) {
            Log::error('[PaymentGateway] Webhook Secret belum dikonfigurasi di .env. Tolak semua callback masuk untuk keamanan.');
            return false; // Strict mode: tolak jika secret belum dikonfigurasi
        }

        $computed = hash_hmac('sha256', $rawPayload, $webhookSecret);

        return hash_equals($computed, $receivedSig);
    }

    /**
     * Mode operasi: production atau sandbox/development
     */
    public function isProduction(): bool
    {
        return $this->isProduction;
    }

    /**
     * Create a payment invoice/transaction in Payment Gateway
     */
    public function createPayment(Order $order): array
    {
        $url = "{$this->baseUrl}/v1/payments";
        $payload = [
            'external_id'         => $order->order_number,
            'payment_method'      => $order->payment_method,
            'amount'              => (int) $order->amount,
            'currency'            => 'IDR',
            'description'         => "Pembelian {$order->shoe->name} (Order #{$order->order_number})",
            'customer_name'       => $order->customer_name,
            'customer_email'      => $order->customer_email,
            'customer_phone'      => $order->customer_phone ?: null,
            'success_redirect_url' => route('orders.show', $order->id),
        ];

        Log::info('[PaymentGateway] Create Payment Request', [
            'url'           => $url,
            'is_production' => $this->isProduction,
            'merchant_key'  => substr($this->apiKey, 0, 12) . '...', // Log partial key only
            'payload'       => $payload,
        ]);

        $response = Http::withHeaders($this->headers())->post($url, $payload);

        if ($response->failed()) {
            Log::error('[PaymentGateway] Create Payment Failed', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            $errorData = $response->json();
            throw new Exception($errorData['error'] ?? $errorData['message'] ?? 'Gagal membuat pembayaran di Payment Gateway');
        }

        return $response->json();
    }

    /**
     * Cancel an active payment
     */
    public function cancelPayment(string $paymentGatewayId): array
    {
        $url = "{$this->baseUrl}/v1/payments/{$paymentGatewayId}/cancel";

        Log::info('[PaymentGateway] Cancel Payment Request', ['payment_id' => $paymentGatewayId]);

        $response = Http::withHeaders($this->headers())->post($url);

        if ($response->failed()) {
            Log::error('[PaymentGateway] Cancel Payment Failed', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            $errorData = $response->json();
            throw new Exception($errorData['error'] ?? $errorData['message'] ?? 'Gagal membatalkan pembayaran di Payment Gateway');
        }

        return $response->json();
    }

    /**
     * Refund a paid payment
     */
    public function refundPayment(string $paymentGatewayId, int $amount, string $reason): array
    {
        $url = "{$this->baseUrl}/v1/payments/{$paymentGatewayId}/refunds";
        $payload = [
            'amount' => $amount,
            'reason' => $reason ?: 'Permintaan refund dari pelanggan',
        ];

        Log::info('[PaymentGateway] Refund Request', ['payment_id' => $paymentGatewayId, 'payload' => $payload]);

        $response = Http::withHeaders($this->headers())->post($url, $payload);

        if ($response->failed()) {
            Log::error('[PaymentGateway] Refund Failed', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            $errorData = $response->json();
            throw new Exception($errorData['error'] ?? $errorData['message'] ?? 'Gagal memproses refund di Payment Gateway');
        }

        return $response->json();
    }

    /**
     * Fetch payment status details
     */
    public function getPaymentDetails(string $paymentGatewayId): array
    {
        $url = "{$this->baseUrl}/v1/payments/{$paymentGatewayId}";

        $response = Http::withHeaders($this->headers())->get($url);

        if ($response->failed()) {
            throw new Exception('Gagal mengambil detail pembayaran dari Payment Gateway');
        }

        return $response->json();
    }
}
