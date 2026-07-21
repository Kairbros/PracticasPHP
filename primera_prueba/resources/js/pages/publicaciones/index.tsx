import { Head } from '@inertiajs/react';
import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Publicacion = {
    id: number;
    titulo: string;
    descripcion: string | null;
    ruta_archivo: string;
    created_at: string;
};

export default function PublicacionesIndex() {
    const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [archivo, setArchivo] = useState<File | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<Publicacion | null>(null);

    const cargar = async () => {
        const { data } = await axios.get<Publicacion[]>('/api/publicaciones');
        setPublicaciones(data);
    };

    useEffect(() => {
        cargar();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!archivo) {
            setError('Selecciona un archivo.');
            return;
        }

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descripcion', descripcion);
        formData.append('archivo', archivo);

        setEnviando(true);
        try {
            await axios.post('/api/publicaciones', formData);
            setTitulo('');
            setDescripcion('');
            setArchivo(null);
            await cargar();
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 422) {
                const primerError = Object.values(
                    err.response.data.errors as Record<string, string[]>,
                )[0]?.[0];
                setError(primerError ?? 'Datos inválidos.');
            } else {
                setError('Ocurrió un error al guardar.');
            }
        } finally {
            setEnviando(false);
        }
    };

    const handleDelete = async (id: number) => {
        await axios.delete(`/api/publicaciones/${id}`);
        await cargar();
    };

    return (
        <>
            <Head title="Publicaciones" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <h2 className="text-lg font-semibold">Nueva publicación</h2>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="titulo">Título</Label>
                        <Input
                            id="titulo"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Input
                            id="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="archivo">Archivo</Label>
                        <Input
                            id="archivo"
                            type="file"
                            accept=".png, .pdf"
                            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                            required
                        />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <Button type="submit" disabled={enviando} className="w-fit">
                        {enviando ? 'Guardando...' : 'Guardar'}
                    </Button>
                </form>

                <div className="flex flex-col gap-3">
                    <h2 className="text-lg font-semibold">Publicaciones</h2>

                    {publicaciones.length === 0 && (
                        <p className="text-sm text-muted-foreground">No hay publicaciones todavía.</p>
                    )}

                    {publicaciones.map((publicacion) => (
                        <div
                            key={publicacion.id}
                            className="flex items-center justify-between rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border"
                        >
                            <div>
                                <p className="font-medium">{publicacion.titulo}</p>
                                {publicacion.descripcion && (
                                    <p className="text-sm text-muted-foreground">{publicacion.descripcion}</p>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setPreview(publicacion)}
                                    className="text-sm text-primary underline-offset-4 hover:underline"
                                >
                                    Ver archivo
                                </button>
                            </div>

                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(publicacion.id)}
                            >
                                Eliminar
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogTitle>{preview?.titulo}</DialogTitle>

                    {preview && (
                        preview.ruta_archivo.toLowerCase().endsWith('.pdf') ? (
                            <iframe
                                src={`/storage/${preview.ruta_archivo}`}
                                className="h-[70vh] w-full rounded-md border"
                                title={preview.titulo}
                            />
                        ) : (
                            <img
                                src={`/storage/${preview.ruta_archivo}`}
                                alt={preview.titulo}
                                className="max-h-[70vh] w-full rounded-md object-contain"
                            />
                        )
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
