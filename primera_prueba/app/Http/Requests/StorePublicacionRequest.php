<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePublicacionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Cambiar según la lógica de autorización de tu aplicación
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            "titulo" => "required|string|max:255",
            "descripcion" => "nullable|string",
            "archivo" => "required|file|max:5120|mimes:png,jpg,jpeg,pdf",
            // "archivo" => "required|file|max:5120|mimes:png,jpg,jpeg,pdf", // 5MB max, adjust as needed
        ];
    }
}
