<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [HomeController::class, 'dashboard'])->name('dashboard');
    Route::get('/product/{id}', [HomeController::class, 'detailProduct'])->name('product.detail');

    Route::get('/invoice/show', function () {
        return Inertia::render('invoice');
    })->name('invoice.show');
    Route::get('/invoice/show/{id}', function () {
        return Inertia::render('invoice-detail');
    })->name('invoice.showDetail');
});

Route::middleware(['auth', EnsureAdmin::class])->group(function () {
    Route::get('/admin', function () {
        return Inertia::render('admin/dashboard');
    })->name('admin.dashboard');

    Route::resource('/admin/products', ProductController::class);
    Route::resource('/admin/categories', CategoryController::class);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
