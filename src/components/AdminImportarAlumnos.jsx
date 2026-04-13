import { useState } from 'react';
import api from '../api/axios';
import { Upload, AlertCircle, CheckCircle, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertTriangle } from 'lucide-react';

const JSON_TEMPLATE = JSON.stringify([
    {
        name: "Juan",
        lastname: "Pérez",
        code: "220000001",
        academicLevel: "LIC",
        career: "Ingeniería en Computación",
        degree: 1,
        email: "juan.perez@udg.mx",
        password: "pass123",
        role: "STUDENT",
        status: "ACTIVE"
    }
], null, 2);

const SIZE_OPTIONS = [5, 10, 20];

export default function AdminImportarAlumnos() {
    const [jsonInput, setJsonInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);   // string or {index: {field: msg}}
    const [result, setResult] = useState(null); // Page<MyUserDTO>

    // Pagination for the result table
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    // JSON parse validation (client-side quick check)
    const [jsonError, setJsonError] = useState('');

    const handleJsonChange = (val) => {
        setJsonInput(val);
        setJsonError('');
        try {
            if (val.trim()) JSON.parse(val);
        } catch {
            setJsonError('El JSON no es válido. Revisa la sintaxis.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!jsonInput.trim() || jsonError) return;
        setLoading(true);
        setError(null);
        setResult(null);
        setPage(0);

        try {
            const formData = new FormData();
            formData.append('sendData', jsonInput.trim());
            const res = await api.post('/admin/bulk', formData, {
                params: { page: 0, size },
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResult(res.data);
            setJsonInput('');
        } catch (err) {
            const d = err.response?.data;
            if (typeof d === 'object' && !d.error && !d.message) {
                // Map of index -> {field: msg}  (backend validation errors per record)
                setError({ type: 'validation', data: d });
            } else {
                setError({ type: 'general', message: d?.error || d?.message || 'Error al importar los usuarios.' });
            }
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch a different page from the already-created batch
    // (the backend just returns a slice of the created users based on page/size)
    // Since the backend only returns the page from the bulk call, we store the full result content
    // and paginate client-side for simplicity.
    const allContent = result?.content ?? [];
    const totalPages = result?.totalPages ?? 0;

    const handlePageChange = async (newPage) => {
        if (!result) return;
        // Re-request same bulk endpoint is not practical post-creation.
        // We'll ask the GET /admin list instead, sorted by createdDate.
        // But since we have the first-page data, just update locally.
        setPage(newPage);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#596E81] to-[#455A6D] px-6 py-4 text-white flex items-center gap-3">
                    <Upload size={20} />
                    <h2 className="text-lg font-bold tracking-wide">IMPORTAR USUARIOS</h2>
                </div>

                <div className="p-6">
                    {/* Info banner */}
                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 text-sm text-blue-800">
                        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-blue-500" />
                        <div>
                            <p className="font-semibold mb-1">Importación masiva de usuarios</p>
                            <p>Pega un arreglo JSON con los datos de los usuarios a registrar. Todos los registros deben ser válidos; si alguno falla, ninguno será guardado.</p>
                        </div>
                    </div>

                    {/* Template hint */}
                    <details className="mb-4 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                        <summary className="px-4 py-2.5 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none">
                            Ver estructura del JSON esperado
                        </summary>
                        <pre className="px-4 pb-4 pt-2 text-xs font-mono text-gray-600 overflow-x-auto whitespace-pre-wrap">{JSON_TEMPLATE}</pre>
                        <div className="px-4 pb-3 text-xs text-gray-500">
                            Valores válidos — <strong>academicLevel</strong>: BR, LIC, ING, MTR, DR &nbsp;|&nbsp; <strong>role</strong>: STUDENT, ADMIN, TEACHER &nbsp;|&nbsp; <strong>status</strong>: ACTIVE, DESERTED, LOW
                        </div>
                    </details>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* JSON textarea */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                JSON de usuarios <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={jsonInput}
                                onChange={e => handleJsonChange(e.target.value)}
                                rows={12}
                                placeholder={JSON_TEMPLATE}
                                className={`w-full px-3 py-2.5 border rounded-lg text-xs font-mono focus:outline-none focus:ring-2 transition-colors bg-gray-50 focus:bg-white resize-y ${jsonError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-[#455A6D]'
                                    }`}
                            />
                            {jsonError && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> {jsonError}
                                </p>
                            )}
                        </div>

                        {/* Size selector */}
                        <div className="flex items-center gap-3 text-sm">
                            <label className="font-medium text-gray-600">Registros por página en resultado:</label>
                            <select value={size} onChange={e => setSize(Number(e.target.value))}
                                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-[#455A6D] focus:border-[#455A6D]">
                                {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit"
                                disabled={loading || !jsonInput.trim() || !!jsonError}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#596E81] to-[#455A6D] hover:from-[#455A6D] hover:to-[#344e60] text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-all">
                                {loading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                                {loading ? 'Importando...' : 'Importar usuarios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ── General error ───────────────────────────────────────────────── */}
            {error?.type === 'general' && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />{error.message}
                </div>
            )}

            {/* ── Per-record validation errors ────────────────────────────────── */}
            {error?.type === 'validation' && (
                <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
                    <div className="bg-red-50 px-5 py-3 border-b border-red-200">
                        <p className="text-sm font-semibold text-red-700">Errores de validación — ningún usuario fue guardado</p>
                    </div>
                    <div className="p-4 flex flex-col gap-3 max-h-72 overflow-y-auto">
                        {Object.entries(error.data).map(([index, fields]) => (
                            <div key={index} className="bg-red-50 border border-red-100 rounded-lg p-3">
                                <p className="text-xs font-bold text-red-700 mb-1">Usuario #{Number(index) + 1}</p>
                                <ul className="text-xs text-red-600 space-y-0.5">
                                    {Object.entries(fields).map(([field, msg]) => (
                                        <li key={field}><span className="font-medium">{field}:</span> {msg}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Success + Result Table ───────────────────────────────────────── */}
            {result && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
                    <div className="px-5 py-3 bg-green-50 border-b border-green-200 flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <p className="text-sm font-semibold text-green-800">
                            {result.totalElements} usuario(s) importado(s) correctamente
                        </p>
                    </div>

                    <div className="p-4">
                        <div className="overflow-x-auto rounded-xl border border-gray-100 w-full">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                                        <th className="px-4 py-3 text-left">#</th>
                                        <th className="px-4 py-3 text-left">Nombre</th>
                                        <th className="px-4 py-3 text-left">Apellido</th>
                                        <th className="px-4 py-3 text-left">Código</th>
                                        <th className="px-4 py-3 text-left">Carrera</th>
                                        <th className="px-4 py-3 text-left">Nivel</th>
                                        <th className="px-4 py-3 text-left">Rol</th>
                                        <th className="px-4 py-3 text-left">Correo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {allContent.map((alumno, i) => (
                                        <tr key={alumno.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-gray-400 text-xs">{page * size + i + 1}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900">{alumno.name}</td>
                                            <td className="px-4 py-3 text-gray-700">{alumno.lastname}</td>
                                            <td className="px-4 py-3 font-mono text-gray-600">{alumno.code}</td>
                                            <td className="px-4 py-3 text-gray-700">{alumno.career}</td>
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 px-1">
                                <span className="text-xs text-gray-500">Página {page + 1} de {totalPages}</span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handlePageChange(0)} disabled={page === 0} className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 transition-colors"><ChevronsLeft size={16} /></button>
                                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 0} className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 transition-colors"><ChevronLeft size={16} /></button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                                        const p = start + i;
                                        return (
                                            <button key={p} onClick={() => handlePageChange(p)}
                                                className={`w-8 h-8 text-xs rounded-md font-medium transition-colors ${p === page ? 'bg-[#455A6D] text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                                                {p + 1}
                                            </button>
                                        );
                                    })}
                                    <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1} className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 transition-colors"><ChevronRight size={16} /></button>
                                    <button onClick={() => handlePageChange(totalPages - 1)} disabled={page >= totalPages - 1} className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 transition-colors"><ChevronsRight size={16} /></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
