# React + Laravel: Comunicación con el Backend (Guía de Referencia)

## Índice

1. Arquitecturas de Laravel
2. Flujo de una petición
3. Rutas
4. Controladores
5. Modelos
6. Migraciones
7. Relaciones y llaves foráneas
8. Middleware
9. Fetch
10. Métodos HTTP
11. async/await
12. then()
13. useState()
14. useEffect()
15. Flujo completo React + Laravel

---

# 1. Arquitecturas de Laravel

Laravel puede utilizarse de tres maneras principales.

## Laravel clásico (MVC + Blade)

```
Navegador
    │
    ▼
Ruta
    │
    ▼
Middleware
    │
    ▼
Controlador
    │
    ▼
Modelo
    │
    ▼
Base de datos
    │
    ▼
Controlador
    │
    ▼
Blade
    │
    ▼
HTML
```

El controlador obtiene los datos y genera el HTML.

No existe `fetch()`.

---

## Laravel como API + React

```
React
   │
fetch()
   │
Middleware
   │
Ruta API
   │
Controlador
   │
Modelo
   │
Base de datos
   │
JSON
   │
React
```

Laravel solo devuelve JSON.

React construye toda la interfaz.

---

## Laravel + React + Inertia

```
React
   ▲
Inertia
   ▲
Controlador
   ▲
Modelo
   ▲
Base de datos
```

Aquí normalmente no utilizas `fetch` para cargar páginas.

---

# 2. Flujo de una petición

```
Petición HTTP
      │
      ▼
Middleware
      │
      ▼
Ruta
      │
      ▼
Controlador
      │
      ▼
Modelo
      │
      ▼
Base de datos
      │
      ▼
Modelo
      │
      ▼
Controlador
      │
      ▼
Respuesta
```

---

# 3. Rutas

```php
Route::get('/users',[UserController::class,'index']);

Route::post('/users',[UserController::class,'store']);

Route::put('/users/{id}',[UserController::class,'update']);

Route::delete('/users/{id}',[UserController::class,'destroy']);

Route::get('/users/{id}',[UserController::class,'show']);
```

Cada ruta llama a un método diferente.

---

También puedes crear cualquier método.

```php
class UserController extends Controller
{
    public function usuariosActivos()
    {

    }

    public function buscar()
    {

    }

    public function generarReporte()
    {

    }
}
```

Ruta

```php
Route::get(
    '/usuarios-activos',
    [UserController::class,'usuariosActivos']
);
```

---

# 4. Controladores

## MVC clásico

```php
public function index()
{
    $usuarios = User::all();

    return view(
        'users.index',
        compact('usuarios')
    );
}
```

---

## API

```php
public function index()
{
    return response()->json(
        User::all()
    );
}
```

---

## Crear

```php
public function store(Request $request)
{
    User::create([

        'name'=>$request->name,

        'email'=>$request->email

    ]);

    return response()->json([
        "ok"=>true
    ]);
}
```

---

# 5. Modelos

Un modelo representa una tabla.

```
app/
└── Models/
    └── User.php
```

Ejemplo

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table="users";

    protected $fillable=[

        "name",

        "email",

        "password"

    ];
}
```

---

## ¿Qué hace internamente?

Cuando escribes

```php
User::all();
```

Laravel hace algo parecido a

```php
SELECT * FROM users;
```

---

Cuando escribes

```php
User::find(5);
```

Internamente

```sql
SELECT *
FROM users
WHERE id=5;
```

---

Cuando haces

```php
User::create([

    "name"=>"Kevin",

    "email"=>"kevin@email.com"

]);
```

Internamente

```sql
INSERT INTO users(name,email)

VALUES('Kevin','kevin@email.com');
```

---

# 6. Migraciones

Las migraciones crean la estructura de la base de datos.

Crear

```bash
php artisan make:migration create_users_table
```

Archivo

```
database/migrations/
```

Ejemplo

```php
public function up()
{

    Schema::create("users",function(Blueprint $table){

        $table->id();

        $table->string("name");

        $table->string("email")->unique();

        $table->string("password");

        $table->timestamps();

    });

}
```

Ejecutar

```bash
php artisan migrate
```

---

# 7. Relaciones y llaves foráneas

Supongamos estas tablas

```
users

id
name

----------------

posts

id
title
content
user_id
```

Cada post pertenece a un usuario.

Un usuario puede tener muchos posts.

---

## Migración

```php
Schema::create("posts",function(Blueprint $table){

    $table->id();

    $table->string("title");

    $table->text("content");

    $table->foreignId("user_id")
          ->constrained()
          ->onDelete("cascade");

    $table->timestamps();

});
```

Esto genera aproximadamente:

```sql
CREATE TABLE posts(

id BIGINT PRIMARY KEY,

title VARCHAR(255),

content TEXT,

user_id BIGINT,

FOREIGN KEY(user_id)

REFERENCES users(id)

ON DELETE CASCADE

);
```

---

## ¿Qué significa CASCADE?

Antes

```
users

id
1

----------------

posts

id user_id

5     1

6     1
```

Si haces

```php
User::find(1)->delete();
```

Después

```
users

(vacío)

posts

(vacío)
```

Los posts también desaparecen.

---

## Restrict

```php
->restrictOnDelete();
```

No permite borrar un usuario si tiene publicaciones.

---

## Null

```php
$table->foreignId("user_id")
      ->nullable()
      ->constrained()
      ->nullOnDelete();
```

Si eliminas el usuario

Antes

```
id user_id

5    3
```

Después

```
id user_id

5   NULL
```

---

## Relaciones en los modelos

### User

```php
public function posts()
{
    return $this->hasMany(
        Post::class
    );
}
```

### Post

```php
public function user()
{
    return $this->belongsTo(
        User::class
    );
}
```

Ahora puedes hacer

```php
$user=User::find(1);

$posts=$user->posts;
```

O

```php
$post=Post::find(5);

echo $post->user->name;
```

Sin escribir SQL.

---

# 8. Middleware

Todo pasa por el middleware.

```
Petición

    │

Middleware

    │

¿Puede continuar?

  │        │

 Sí       No

 │         │

 ▼         ▼

Controlador

      401

      403

 Redirect
```

Crear

```bash
php artisan make:middleware EsAdmin
```

Ejemplo

```php
public function handle(
    Request $request,
    Closure $next
){

    if(auth()->user()->rol!="admin"){

        abort(403);

    }

    return $next($request);

}
```

Usarlo

```php
Route::get(
    "/admin",
    [AdminController::class,"index"]
)->middleware("admin");
```

---

# 9. Fetch

```javascript
fetch(url,{
    method:"",
    headers:{},
    body:{}
});
```

GET por defecto

```javascript
fetch("/api/users");
```

Es igual a

```javascript
fetch("/api/users",{

    method:"GET"

});
```

---

# 10. Métodos HTTP

GET

```javascript
fetch("/api/users",{

    method:"GET"

});
```

POST

```javascript
fetch("/api/users",{

    method:"POST",

    headers:{

        "Content-Type":"application/json"

    },

    body:JSON.stringify({

        name:"Kevin"

    })

});
```

PUT

```javascript
fetch("/api/users/5",{

    method:"PUT"

});
```

DELETE

```javascript
fetch("/api/users/5",{

    method:"DELETE"

});
```

---

# 11. async / await

```javascript
const response=await fetch("/api/users");

const data=await response.json();
```

await espera que termine una operación.

No define si es GET o POST.

---

# 12. then()

```javascript
fetch("/api/users")

.then(response=>response.json())

.then(data=>{

});
```

Equivale a

```javascript
const response=await fetch("/api/users");

const data=await response.json();
```

---

# 13. useState()

```javascript
const [users,setUsers]=useState([]);
```

Devuelve

```
Estado

+

Función para actualizarlo
```

No debes hacer

```javascript
users=data;
```

Debes hacer

```javascript
setUsers(data);
```

Cuando llamas

```javascript
setUsers(data);
```

React

1. Actualiza el estado.
2. Ejecuta nuevamente el componente.
3. Actualiza el DOM.

---

# 14. useEffect()

Se ejecuta automáticamente.

```javascript
useEffect(()=>{

},[]);
```

Muy parecido a

```csharp
void Start()
{

}
```

de Unity.

---

# 15. React + fetch

```jsx
function Usuarios(){

    const [usuarios,setUsuarios]=useState([]);

    useEffect(()=>{

        async function cargar(){

            const response=await fetch("/api/users");

            const data=await response.json();

            setUsuarios(data);

        }

        cargar();

    },[]);

}
```

---

# Flujo completo React

```
Componente

      │

useEffect

      │

fetch

      │

Middleware

      │

Ruta

      │

Controlador

      │

Modelo

      │

Base de datos

      │

Modelo

      │

Controlador

      │

JSON

      │

await response.json()

      │

setUsuarios()

      │

React renderiza nuevamente
```

---

# Resumen

| Componente | Función |
|------------|----------|
| Migration | Crea la estructura de la base de datos |
| Model | Accede a la base de datos mediante Eloquent |
| Controller | Contiene la lógica de negocio |
| Route | Decide qué método ejecutar |
| Middleware | Filtra las peticiones antes del controlador |
| Blade | Vista HTML renderizada por Laravel |
| React | Interfaz de usuario |
| fetch | Envía peticiones HTTP |
| useState | Almacena el estado del componente |
| useEffect | Ejecuta código automáticamente al montar el componente |
| await | Espera una operación asíncrona |
| then | Sintaxis alternativa a `await` para manejar promesas |