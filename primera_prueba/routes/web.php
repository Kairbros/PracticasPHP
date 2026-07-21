<?php

use App\Http\Controllers\PublicacionController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::inertia('publicaciones', 'publicaciones/index')->name('publicaciones.index');

    Route::prefix('api/publicaciones')->group(function () {
        Route::get('/', [PublicacionController::class, 'index']);
        Route::post('/', [PublicacionController::class, 'store']);
        Route::get('/{id}', [PublicacionController::class, 'show']);
        Route::post('/{id}', [PublicacionController::class, 'update']);
        Route::delete('/{id}', [PublicacionController::class, 'destroy']);
    });
});

require __DIR__.'/settings.php';
