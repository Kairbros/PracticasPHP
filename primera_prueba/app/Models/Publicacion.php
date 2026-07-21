<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Publicacion extends Model
{
    use SoftDeletes;

    // Le dice a Eloquent en qué tabla de la base de datos buscar/guardar.
    // Sin esta línea, Eloquent adivinaría el nombre solo (convención),
    // pero lo dejamos explícito para no depender de esa adivinanza.
    protected $table = 'publicaciones';

    // Columnas que se pueden llenar con create()/update() pasando un array.
    protected $fillable = ['titssssulo', 'descripcion', 'ruta_archivo'];
}
