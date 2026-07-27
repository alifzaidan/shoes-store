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

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.payment_gateway.url', 'http://localhost:8080'), '/');
        $this->apiKey = config('services.payment_gateway.api_key', 'test-api-key');
        $this->apiSecret = config('services.payment_gateway.api_secret', 'test-api-secret');
    }

    protected function headers(array $additional = []): array
    {
        return array_merge([
            'X-API-Key' => $this->apiKey,
            'X-API-Secret' => $this->apiSecret,
            'Content-Type' => 'application/json',
            'Idempotency-Key' => 'IDEM-' . Str::uuid()->toString(),
        ], $additional);
    }

    /**
     * Create a payment invoice/transaction in Payment Gateway
     */
    public function createPayment(Order $order): array
    {
        $url = "{$this->baseUrl}/v1/payments";
        $payload = [
            'external_id' => $order->order_number,
            'payment_method' => $order->payment_method,
            'amount' => (int) $order->amount,
            'currency' => 'IDR',
            'description' => "Pembelian {$order->shoe->name} (Order #{$order->order_number})",
            'customer_name' => $order->customer_name,
            'customer_email' => $order->customer_email,
            'customer_phone' => $order->customer_phone ?: null,
            'success_redirect_url' => route('orders.show', $order->id),
        ];

        Log::info('Sending Create Payment request to Payment Gateway', ['url' => $url, 'payload' => $payload]);

        $response = Http::withHeaders($this->headers())->post($url, $payload);

        if ($response->failed()) {
            Log::error('Payment Gateway Create Payment failed', [
                'status' => $response->status(),
                'body' => $response->body(),
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

        Log::info('Sending Cancel Payment request to Payment Gateway', ['payment_id' => $paymentGatewayId]);

        $response = Http::withHeaders($this->headers())->post($url);

        if ($response->failed()) {
            Log::error('Payment Gateway Cancel Payment failed', [
                'status' => $response->status(),
                'body' => $response->body(),
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

        Log::info('Sending Refund request to Payment Gateway', ['payment_id' => $paymentGatewayId, 'payload' => $payload]);

        $response = Http::withHeaders($this->headers())->post($url, $payload);

        if ($response->failed()) {
            Log::error('Payment Gateway Refund failed', [
                'status' => $response->status(),
                'body' => $response->body(),
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
