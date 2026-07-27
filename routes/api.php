<?php

use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/payment-gateway', [WebhookController::class, 'handlePaymentGateway']);
