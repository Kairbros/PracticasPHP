<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use App\Models\Publicacion;

class CreatePublicaciones extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $json = File::get(database_path('seeders/Json/Publicaciones.json'));
        $items = json_decode($json, true)['publicaciones'];

        foreach ($items as $item) {
            Publicacion::create($item);
        }
    }
}
