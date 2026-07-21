<?php

namespace App\Repositories;

class EloquentPublicacionRepository implements PublicacionRepositoryInterface
{
    protected $model;

    public function __construct(\App\Models\Publicacion $model)
    {
        $this->model = $model;
    }

    public function all()
    {
        return $this->model->all();
    }

    public function find($id)
    {
        return $this->model->find($id) ?? null;
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update($id, array $data)
    {
        $publicacion = $this->find($id);
        if ($publicacion) {
            $publicacion->update($data);
            return $publicacion;
        }
        return null;
    }

    public function delete($id)
    {
        $publicacion = $this->find($id);
        if ($publicacion) {
            return $publicacion->delete();
        }
        return false;
    }
}