<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\StorePublicacionRequest;
use App\Http\Requests\UpdatePublicacionRequest;

class PublicacionController extends Controller
{
    public function __construct(private \App\Repositories\PublicacionRepositoryInterface $publicacionRepository)
    {
        
    }

public function index()
{
    return response()->json($this->publicacionRepository->all());
}             // listar todas
    public function store(StorePublicacionRequest $request) { 
        $ruta = $request->file('archivo')->store('Publicaciones', 'public');
        
        $datos = $request->validated();
        $datos['ruta_archivo'] = $ruta;

        $publicacion = $this->publicacionRepository->create($datos);

        return response()->json($publicacion, 201);  
    }   // crear una nueva (con archivo)

public function show($id)
{
    $publicacion = $this->publicacionRepository->find($id);

    if (!$publicacion) {
        return response()->json(['message' => 'No encontrada'], 404);
    }

    return response()->json($publicacion);
}          // ver una sola
    public function update(UpdatePublicacionRequest $request, $id) { 

        $datos = $request->validated();

       if ($request->hasFile('archivo')) {
            $datos['ruta_archivo'] = $request->file('archivo')->store('Publicaciones', 'public');
        }

        $publicacion = $this->publicacionRepository->update($id, $datos);

        return response()->json($publicacion, 200);
    }  // editar
public function destroy($id)
{
    $eliminado = $this->publicacionRepository->delete($id);

    if (!$eliminado) {
        return response()->json(['message' => 'No encontrada'], 404);
    }

    return response()->json(['message' => 'Eliminada correctamente']);
}       // eliminar (soft delete)
}
