import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { ChevronLeft, ChevronRight, RefreshCw, ChevronsLeft, ChevronsRight, AlertCircle, Loader2 } from 'lucide-react';

const SORT_OPTIONS = [
    { value: 'createdDate', label: 'Fecha de Creación' },
    { value: 'name', label: 'Nombre' },
    { value: 'lastname', label: 'Apellido' },
    { value: 'code', label: 'Código' },
    { value: 'career', label: 'Carrera' },
];

const SIZE_OPTIONS = [5, 10, 20, 50];

export default function AdminObtenerAlumnos({ onVerDetalles }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sort, setSort] = useState('createdDate');

    const fetchAlumnos = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/admin', {
                params: { page, size, sort },
            });
            setData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al obtener los alumnos.');
        } finally {
            setLoading(false);
        }
    }, [page, size, sort]);

    useEffect(() => {
        fetchAlumnos();
    }, [fetchAlumnos]);

    const totalPages = data?.totalPages ?? 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-[#596E81] to-[#455A6D] px-6 py-4 text-white flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-wide">OBTENER USUARIOS</h2>
                <button
                    onClick={fetchAlumnos}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors font-medium"
                >
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                    Actualizar
                </button>
            </div>

            {/* Controls */}
            <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-gray-50">
                <div className="flex items-center gap-2 text-sm">
                    <label className="font-medium text-gray-600">Ordenar por:</label>
                    <select
                        value={sort}
                        onChange={(e) => { setSort(e.target.value); setPage(0); }}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-[#455A6D] focus:border-[#455A6D]"
                    >
                        {SORT_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <label className="font-medium text-gray-600">Por página:</label>
                    <select
                        value={size}
                        onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-[#455A6D] focus:border-[#455A6D]"
                    >
                        {SIZE_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                {data && (
                    <span className="text-xs text-gray-500 ml-auto">
                        {data.totalElements} usuario(s) en total
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {error && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center items-center py-16 text-gray-400">
                        <Loader2 size={28} className="animate-spin mr-2" />
                        <span className="text-sm">Cargando usuarios...</span>
                    </div>
                )}

                {!loading && !error && data && (
                    <>
                        {data.content.length === 0 ? (
                            <p className="text-center text-gray-500 py-12 text-sm">No se encontraron usuarios.</p>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-100 w-full">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                                            <th className="px-3 py-3 text-left w-8"></th>
                                            <th className="px-4 py-3 text-left">Nombre</th>
                                            <th className="px-4 py-3 text-left">Apellido</th>
                                            <th className="px-4 py-3 text-left">Código</th>
                                            <th className="px-4 py-3 text-left">Carrera</th>
                                            <th className="px-4 py-3 text-left">Grado</th>
                                            <th className="px-4 py-3 text-left">Nivel Acad.</th>
                                            <th className="px-4 py-3 text-left">Rol</th>
                                            <th className="px-4 py-3 text-left">Correo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.content.map((alumno) => (
                                            <tr key={alumno.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-3 py-3">
                                                    <button
                                                        onClick={() => onVerDetalles && onVerDetalles(alumno.code)}
                                                        title="Ver detalles de usuario"
                                                        className="w-6 h-6 flex items-center justify-center rounded-full bg-[#455A6D] hover:bg-[#344e60] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                                                    >
                                                        !
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900">{alumno.name}</td>
                                                <td className="px-4 py-3 text-gray-700">{alumno.lastname}</td>
                                                <td className="px-4 py-3 font-mono text-gray-600">{alumno.code}</td>
                                                <td className="px-4 py-3 text-gray-700">{alumno.career}</td>
                                                <td className="px-4 py-3 text-gray-700">{alumno.degree}</td>
                                                <td className="px-4 py-3 text-gray-700">{alumno.academicLevel}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${alumno.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                                        {alumno.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{alumno.email || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 px-1">
                                <span className="text-xs text-gray-500">
                                    Página {page + 1} de {totalPages}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setPage(0)} disabled={page === 0} className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 transition-colors">
                                        <ChevronsLeft size={16} />
                                    </button>
                                    <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 transition-colors">
                                        <ChevronLeft size={16} />
                                    </button>

                                    {/* Page number pills */}
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                                        const p = start + i;
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-8 h-8 text-xs rounded-md font-medium transition-colors ${p === page ? 'bg-[#455A6D] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                                            >
                                                {p + 1}
                                            </button>
                                        );
                                    })}

                                    <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 transition-colors">
                                        <ChevronRight size={16} />
                                    </button>
                                    <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 transition-colors">
                                        <ChevronsRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
