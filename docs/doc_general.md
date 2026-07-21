# React + Laravel: Comunicación con el Backend (Guía de Referencia)

```
code --install-extension continue.continue
code --install-extension anthropic.claude-code
code --install-extension cweijan.vscode-database-client2
code --install-extension cweijan.dbclient-jdbc
code --install-extension rangav.vscode-thunder-client
code --install-extension ms-azuretools.vscode-containers
code --install-extension bierner.markdown-mermaid
code --install-extension bmewburn.vscode-intelephense-client
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
code --install-extension open-southeast.laravel-pint
```


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
15. React + fetch
16. Patrón Repositorio
17. Propiedades reservadas del modelo
18. Seeders
19. Base de datos en Docker
20. Soft Deletes
21. Proteger archivos privados en Storage
22. CRUD completo de Publicaciones (repositorio + controlador)
23. Flujo completo React + Laravel

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

# 16. Patrón Repositorio

Sin repositorio, el controlador habla directo con el modelo:

```
Controller
    │
Modelo (Eloquent)
    │
Base de datos
```

El controlador termina mezclando dos cosas: manejar la petición HTTP (validar, responder) y saber cómo se guardan/leen los datos (queries, storage). Con repositorio se agrega una capa entre medio:

```
Controller
    │
Repositorio
    │
Modelo (Eloquent) / Storage
    │
Base de datos / Disco
```

El repositorio es una clase cuyo único trabajo es "conseguir y guardar datos". Expone métodos de negocio (`store`, `find`, `all`, `update`, `delete`), no queries sueltas. El controlador le pide cosas sin saber cómo están implementadas por dentro.

## Piezas

- **Interfaz** (`ArchivoRepositoryInterface`): define el contrato (qué métodos debe tener).
- **Implementación** (`EloquentArchivoRepository`): la clase real, usa Eloquent y `Storage::put()`.
- **Binding** en `AppServiceProvider`: le dice a Laravel "cuando pidan la interfaz, entrega esta implementación". Esto permite inyectar el repositorio en el constructor del controlador.

## Ventajas

- Controlador queda limpio, solo valida y llama al repositorio.
- La misma lógica se reutiliza desde un comando, un job, etc.
- Se puede testear el controlador con un repositorio falso (mock), sin tocar la base de datos real.
- Si cambia la fuente de datos (ej. de disco local a S3, o de MySQL a otra cosa), solo se toca el repositorio, el controlador ni se entera.

---

# 17. Propiedades reservadas del modelo

La clase `Model` de Eloquent (que todo modelo extiende) ya trae definidas ciertas propiedades que ella misma usa internamente para armar las queries. No se deben reutilizar esos nombres para guardar otra cosa, porque Eloquent literalmente lee `$this->table`, `$this->fillable`, etc. para funcionar.

```php
class Publicacion extends Model
{
    // En qué tabla busca/guarda. Sin esto, Eloquent la adivina
    // (nombre de la clase → snake_case → plural).
    protected $table = 'publicaciones';

    // Qué columnas se pueden llenar con create()/update() pasando un array.
    protected $fillable = ['titulo', 'descripcion', 'ruta_archivo'];
}
```

Otras propiedades reservadas comunes:

| Propiedad | Para qué sirve | Default si no se declara |
|---|---|---|
| `$table` | Nombre de la tabla | nombre de la clase en snake_case plural |
| `$primaryKey` | Columna llave primaria | `id` |
| `$fillable` | Lista blanca de columnas asignables por array | ninguna (bloqueado) |
| `$guarded` | Lista negra (opuesto a `$fillable`, no usar ambas) | — |
| `$timestamps` | Si la tabla tiene `created_at`/`updated_at` | `true` |
| `$casts` | Conversión automática de tipos (ej. `'fecha' => 'datetime'`) | ninguna |

Toda propiedad de clase en PHP necesita un modificador de visibilidad (`protected`, `public` o `private`). `$table = 'x';` sin eso es un error de sintaxis.

## Cómo se conecta el modelo con la base de datos real

Son dos preguntas separadas:

1. **¿A qué servidor/base me conecto?** → sale de `config/database.php`, que lee las variables del `.env` (`DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`...). Es igual para todos los modelos salvo que se indique `protected $connection = '...'`.
2. **¿A qué tabla dentro de esa base?** → sale de `$table` en la clase del modelo (o de la convención automática si no se declara).

```
Publicacion::create([...])
        │
        ▼
  lee $table = 'publicaciones'
        │
        ▼
  lee config/database.php (desde .env) para saber a qué servidor conectarse
        │
        ▼
  INSERT INTO publicaciones (...) VALUES (...)
```

---

# 18. Seeders

Un seeder llena de datos una tabla que ya existe (la migración crea la estructura, el seeder mete filas). Son pasos independientes: correr `migrate` no llena datos, correr `db:seed` no crea tablas.

Crear un seeder:

```bash
php artisan make:model Publicacion -m
php artisan make:seeder CreatePublicaciones
```

## Seeder simple

```php
public function run(): void
{
    Publicacion::create([
        'titulo' => 'Ralsei',
        'descripcion' => 'Imagen de Ralsei',
        'ruta_archivo' => 'Publicaciones/ralsei.png',
    ]);
}
```

## Seeder con datos desde un JSON (evita repetir `create()` a mano)

Archivo `database/seeders/Json/Publicaciones.json`:

```json
{
    "publicaciones": [
        { "titulo": "Ralsei", "descripcion": "Imagen de Ralsei", "ruta_archivo": "Publicaciones/ralsei.png" },
        { "titulo": "Banco", "descripcion": "PDF del banco", "ruta_archivo": "Publicaciones/banco.pdf" }
    ]
}
```

Seeder:

```php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use App\Models\Publicacion;

class CreatePublicaciones extends Seeder
{
    public function run(): void
    {
        $json = File::get(database_path('seeders/Json/Publicaciones.json'));
        $items = json_decode($json, true)['publicaciones'];

        foreach ($items as $item) {
            Publicacion::create($item);
        }
    }
}
```

Notas:
- `json_decode($json, true)` — el `true` es importante, sin eso devuelve objetos (`stdClass`) en vez de arrays.
- Las claves del JSON deben coincidir con `$fillable` del modelo para poder pasar `$item` directo a `create()`.
- En `ruta_archivo` va la ruta relativa al disco (`Publicaciones/archivo.png`), no la ruta completa del sistema de archivos — así funciona con `Storage::url()` más adelante.

## Ejecutar

```bash
# corre solo esta clase, sin pasar por DatabaseSeeder
php artisan db:seed --class=CreatePublicaciones
```

Para que se ejecute automáticamente con `php artisan db:seed` (sin `--class`) o con `migrate --seed`, hay que registrarlo dentro de `DatabaseSeeder.php`:

```php
public function run(): void
{
    $this->call(CreatePublicaciones::class);
}
```

---

# 19. Base de datos en Docker

Si MySQL corre en un contenedor Docker (en vez de instalado local), las credenciales del `.env` (`DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) deben coincidir con las del contenedor.

## Ver las tablas desde la terminal

```bash
docker ps
# copia el NAME del contenedor de mysql

docker exec -it <nombre_contenedor> mysql -uroot -p<password> <base_de_datos>
```

Eso abre el prompt `mysql>` donde corres `SHOW TABLES;`, `SELECT * FROM publicaciones;`, etc.

## Ver las tablas con extensión de VSCode

Con **SQLTools** (`mtxr.sqltools` + `mtxr.sqltools-driver-mysql`) o **Database Client** (`cweijan.vscode-mysql-client2`), agregar una conexión nueva con:

- Host: `127.0.0.1`
- Puerto: `3306` (o el que tenga mapeado el contenedor)
- Usuario / Password / Base: los mismos del `.env`

Como el puerto del contenedor está mapeado al host (`0.0.0.0:3306->3306/tcp` en `docker ps`), se conecta igual que si MySQL estuviera instalado local.

---

# 20. Soft Deletes

En vez de borrar la fila físicamente, `delete()` le pone una fecha a la columna `deleted_at`. Mientras esa columna sea `NULL` el registro está "vivo"; con fecha, está "borrado". Las queries normales (`all()`, `find()`, `where()`, etc.) filtran automáticamente los registros con `deleted_at` no nulo, sin que tengas que agregar esa condición a mano.

## Caso A: tabla nueva (todo en la migración de creación)

```php
public function up(): void
{
    Schema::create('publicaciones', function (Blueprint $table) {
        $table->id();
        $table->string('titulo');
        $table->text('descripcion')->nullable();
        $table->string('ruta_archivo')->nullable();
        $table->softDeletes();   // agrega deleted_at aquí mismo
        $table->timestamps();
    });
}
```

Como es `Schema::create`, el `down()` solo hace `Schema::dropIfExists(...)` — borra la tabla entera, columna incluida, no hace falta revertir el soft delete aparte.

## Caso B: tabla que ya existe (migración separada)

Cuando la tabla ya está creada (y quizás con datos), no se puede reescribir la migración original que ya corrió — hay que sumar una migración nueva que la modifique:

```bash
php artisan make:migration add_soft_deletes_to_publicaciones_table --table=publicaciones
```

```php
public function up(): void
{
    Schema::table('publicaciones', function (Blueprint $table) {
        $table->softDeletes();
    });
}

public function down(): void
{
    Schema::table('publicaciones', function (Blueprint $table) {
        $table->dropSoftDeletes();
    });
}
```

## En el modelo

```php
use Illuminate\Database\Eloquent\SoftDeletes;

class Publicacion extends Model
{
    use SoftDeletes;

    protected $table = 'publicaciones';
    protected $fillable = ['titulo', 'descripcion', 'ruta_archivo'];
}
```

Ojo con mayúsculas: es `Illuminate` (con `I` mayúscula) y `SoftDeletes` (con `S` y `D` mayúsculas). En Windows el autoloader no distingue mayúsculas de minúsculas y no se nota el error, pero en Linux (por ejemplo el propio contenedor Docker, o un servidor de producción) sí es sensible a mayúsculas y tronaría con `Class not found`.

## ¿Por qué un registro "borrado" deja de aparecer solo?

El trait `SoftDeletes` mete un **global scope**: una condición `WHERE deleted_at IS NULL` que Eloquent agrega automáticamente a TODAS las queries normales del modelo, sin que el repositorio/controlador tenga que filtrarla a mano.

```php
Publicacion::all();       // → SELECT * FROM publicaciones WHERE deleted_at IS NULL
Publicacion::find($id);   // si esa fila tiene deleted_at con fecha, devuelve null
```

Por eso `find()`/`all()`/`destroy()` en el repositorio siguen funcionando igual sin cambiar código al agregar soft delete — el filtro pasa por debajo, en el modelo.

Para ver los borrados hay que pedirlo explícito (si no, están escondidos siempre):

```php
Publicacion::withTrashed()->get();       // todas, incluidas las borradas
Publicacion::onlyTrashed()->get();       // solo las borradas
Publicacion::withTrashed()->find($id);   // encuentra aunque esté borrada
Publicacion::withTrashed()->find($id)->restore();   // la "revive"
```

---

# 21. Proteger archivos privados en Storage

El disco `public` (`storage/app/public`, symlinkeado en `public/storage`) es servido **directo por el servidor web**, sin pasar por Laravel — ni el middleware `auth` ni ninguna lógica propia se ejecuta. Cualquiera con la URL puede verlo, sin login.

## Solución: disco `local` + ruta protegida

**1. Guardar en el disco `local` en vez de `public`** (no tiene symlink, nadie llega por URL directa):

```php
$request->file('archivo')->store('Publicaciones', 'local');
```

**2. Ruta protegida con middleware `auth`:**

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('publicaciones/{id}/archivo', [PublicacionController::class, 'archivo'])
        ->name('publicaciones.archivo');
});
```

**3. Controlador — sirve el archivo bajo demanda, pasando primero por `auth`:**

```php
use Illuminate\Support\Facades\Storage;

public function archivo($id)
{
    $publicacion = $this->publicacionRepository->find($id);

    if (!$publicacion) {
        abort(404);
    }

    return Storage::disk('local')->response($publicacion->ruta_archivo);
}
```

`Storage::response()` arma la respuesta HTTP con los headers correctos (`Content-Type`, etc.) para que el navegador lo muestre igual que un archivo público, pero esta vez sí pasa por el middleware de la ruta — sin sesión, redirige a login en vez de mostrar el archivo.

**4. Frontend**: cambiar el `src` de `/storage/${ruta_archivo}` a la nueva ruta protegida, ej. `/publicaciones/${id}/archivo`.

**Siguiente nivel (para más adelante)**: si además de "debe estar logueado" se necesita "solo el dueño puede verlo", esa comparación (`auth()->id() === $publicacion->user_id`) va dentro de ese mismo método `archivo()` — requiere agregar una columna `user_id` a la tabla.

---

# 22. CRUD completo de Publicaciones (repositorio + controlador)

Armado real de todo lo que vimos hoy, de atrás hacia adelante: interfaz → implementación → binding → Form Requests → controlador → rutas.

## 1. Interfaz del repositorio

`app/Repositories/PublicacionRepositoryInterface.php`

```php
interface PublicacionRepositoryInterface
{
    public function all();
    public function find($id);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);
}
```

Ojo: es `interface`, no `class`. Una `class` normal no puede tener métodos sin cuerpo (sin `{ }`) — eso es exclusivo de `interface` (o clases `abstract`). Escribirlo como `class` tira un error fatal en cuanto Laravel intenta cargarla.

## 2. Implementación

`app/Repositories/EloquentPublicacionRepository.php`

```php
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
        return $this->model->find($id);
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
```

## 3. Binding en AppServiceProvider

`app/Providers/AppServiceProvider.php`, dentro de `register()`:

```php
public function register(): void
{
    $this->app->bind(
        \App\Repositories\PublicacionRepositoryInterface::class,
        \App\Repositories\EloquentPublicacionRepository::class
    );
}
```

`bind(A, B)` = "cada vez que algo pida `A` (la interfaz) en un constructor, resuélvelo instanciando `B`". Esto es lo que permite inyectar el repositorio en el controlador sin usar `new` en ningún lado. `register()` es solo para declarar bindings; `boot()` es para lógica que depende de que todo ya esté registrado.

## 4. Form Requests (validación + autorización)

`app/Http/Requests/StorePublicacionRequest.php`:

```php
public function authorize(): bool
{
    return true;   // si se deja en false, TODA petición se rechaza con 403
}

public function rules(): array
{
    return [
        'titulo' => 'required|string|max:255',
        'descripcion' => 'nullable|string',
        'archivo' => 'required|file|max:5120|mimes:png,jpg,jpeg,pdf',
    ];
}
```

`app/Http/Requests/UpdatePublicacionRequest.php` — mismas reglas pero `archivo` opcional (`nullable`), porque al editar no siempre se sube un archivo nuevo:

```php
public function rules(): array
{
    return [
        'titulo' => 'required|string|max:255',
        'descripcion' => 'nullable|string',
        'archivo' => 'nullable|file|max:5120|mimes:png,jpg,jpeg,pdf',
    ];
}
```

`authorize()` = "¿tiene permiso para ESTA acción?" (autorización). `rules()` = "¿los datos están bien formados?" (validación). La autenticación (¿quién eres?) ya la resuelve el middleware `auth` en la ruta, antes de llegar aquí.

## 5. Controlador

`app/Http/Controllers/PublicacionController.php`

```php
class PublicacionController extends Controller
{
    public function __construct(private PublicacionRepositoryInterface $publicacionRepository)
    {
    }

    public function index()
    {
        return response()->json($this->publicacionRepository->all());
    }

    public function store(StorePublicacionRequest $request)
    {
        $ruta = $request->file('archivo')->store('Publicaciones', 'public');

        $datos = $request->validated();
        $datos['ruta_archivo'] = $ruta;

        $publicacion = $this->publicacionRepository->create($datos);

        return response()->json($publicacion, 201);
    }

    public function show($id)
    {
        $publicacion = $this->publicacionRepository->find($id);

        if (!$publicacion) {
            return response()->json(['message' => 'No encontrada'], 404);
        }

        return response()->json($publicacion);
    }

    public function update(UpdatePublicacionRequest $request, $id)
    {
        $datos = $request->validated();

        if ($request->hasFile('archivo')) {
            $datos['ruta_archivo'] = $request->file('archivo')->store('Publicaciones', 'public');
        }

        $publicacion = $this->publicacionRepository->update($id, $datos);

        return response()->json($publicacion, 200);
    }

    public function destroy($id)
    {
        $eliminado = $this->publicacionRepository->delete($id);

        if (!$eliminado) {
            return response()->json(['message' => 'No encontrada'], 404);
        }

        return response()->json(['message' => 'Eliminada correctamente']);
    }
}
```

`extends Controller` es obligatorio (hereda de la clase base de Laravel). El `private PublicacionRepositoryInterface $publicacionRepository` en el constructor es "constructor property promotion": PHP crea y asigna la propiedad solo con declararla ahí, no hace falta reasignarla a mano en el cuerpo del constructor.

## 6. Rutas

`routes/web.php`:

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('publicaciones', 'publicaciones/index')->name('publicaciones.index');

    Route::prefix('api/publicaciones')->group(function () {
        Route::get('/', [PublicacionController::class, 'index']);
        Route::post('/', [PublicacionController::class, 'store']);
        Route::get('/{id}', [PublicacionController::class, 'show']);
        Route::post('/{id}', [PublicacionController::class, 'update']);   // POST, no PUT
        Route::delete('/{id}', [PublicacionController::class, 'destroy']);
    });
});
```

`update` usa `POST` en vez de `PUT`: PHP no parsea bien `$_FILES`/multipart en peticiones `PUT` reales (solo en `POST`), así que para endpoints que reciben archivos con `FormData`, `POST` evita ese problema.

## Bugs reales que salieron al escribir esto (para no repetirlos)

- **Interfaz declarada como `class`** → error fatal al cargar. Fix: `interface`.
- **`bind()` apuntando a una clase con nombre distinto** al archivo real (`PublicacionRepository` vs `EloquentPublicacionRepository`) → "class not found" en cuanto se resuelve el binding.
- **`use illuminate\...\softDeletes;`** con minúsculas → funciona en Windows (case-insensitive) pero truena en Linux/producción. Los namespaces/clases de PHP son sensibles a mayúsculas.
- **`authorize()` dejado en `return false;`** por defecto (así lo genera `make:request`) → bloquea el 100% de las peticiones con 403 hasta cambiarlo a `true`.
- **`update()` sobrescribiendo `ruta_archivo` con `null`** cuando no se sube archivo nuevo, por no usar `hasFile()` antes de asignar. Borraba la referencia al archivo existente en cada edición sin archivo nuevo.
- **Subir el archivo dos veces** en `update()` por dejar una variable vieja sin borrar tras refactorizar la lógica — cada edición con archivo nuevo dejaba un archivo huérfano extra en el disco.
- **Ruta guardada mal en el seed JSON**: se guardó la ruta absoluta del sistema de archivos (`primera_prueba/storage/app/public/...`) en vez de la ruta relativa al disco (`Publicaciones/...`). Rompía los links del frontend con 403 al intentar resolver una ruta que no existe dentro de `public/`.
- **Se borró sin querer `app/Http/Controllers/Controller.php`** (la clase base) al renombrar `publicaciones.php` → `PublicacionController.php` — el editor lo trató como el mismo archivo movido. Sin esa clase base, ningún controlador puede cargar. Se recuperó con `git checkout <commit> -- ruta/al/archivo`.

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