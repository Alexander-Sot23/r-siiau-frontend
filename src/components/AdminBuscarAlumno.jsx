import { useState } from 'react';
import api from '../api/axios';
import { Search, AlertCircle, Loader2, UserCircle, Key, Mail, ShieldCheck, Calendar, Clock, BookOpen, GraduationCap, Hash } from 'lucide-react';

const SEARCH_TYPES = [
    { value: 'code', label: 'Código', placeholder: 'Ej. 220000000', icon: Key },
    { value: 'email', label: 'Correo electrónico', placeholder: 'Ej. alumno@udg.mx', icon: Mail },
    { value: 'id', label: 'ID de Perfil (UUID)', placeholder: 'Ej. 550e8400-e29b-41d4-a716-446655440000', icon: Hash },
];

const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

export default function AdminBuscarAlumno({ prefill }) {
    const [searchType, setSearchType] = useState(prefill?.type || 'code');
    const [query, setQuery] = useState(prefill?.value || '');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // When prefill changes (from "Ver detalles"), run the search automatically
    const [lastPrefill, setLastPrefill] = useState(null);
    if (prefill && prefill !== lastPrefill) {
        setLastPrefill(prefill);
        setSearchType(prefill.type);
        setQuery(prefill.value);
        // Trigger search after state settles via a small trick — we'll handle it with a flag
    }

    const selectedType = SEARCH_TYPES.find(t => t.value === searchType);

    const handleSearch = async (e, overrideType, overrideQuery) => {
        if (e) e.preventDefault();
        const sType = overrideType || searchType;
        const sQuery = overrideQuery || query;
        if (!sQuery.trim()) return;
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const response = await api.get(`/admin/${sType}`, {
                params: { [sType]: sQuery.trim() },
            });
            setResult(response.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setError(`No se encontró ningún alumno con ese ${SEARCH_TYPES.find(t => t.value === sType)?.label?.toLowerCase()}.`);
            } else {
                setError(err.response?.data?.message || 'Error al realizar la búsqueda.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Auto-search when prefill arrives
    if (prefill && prefill !== lastPrefill) {
        setTimeout(() => handleSearch(null, prefill.type, prefill.value), 50);
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-[#596E81] to-[#455A6D] px-6 py-4 text-white">
                <h2 className="text-lg font-bold tracking-wide">BUSCAR USUARIO</h2>
            </div>

            <div className="p-6 border-b border-gray-100 bg-gray-50">
                <form onSubmit={handleSearch} className="flex flex-col gap-4">
                    <div className="flex gap-2 flex-wrap">
                        {SEARCH_TYPES.map(type => (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => { setSearchType(type.value); setQuery(''); setResult(null); setError(''); }}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${searchType === type.value
                                        ? 'bg-[#455A6D] text-white shadow-sm'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <type.icon size={14} />
                                {type.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                                <selectedType.icon size={16} />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder={selectedType?.placeholder}
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#455A6D] focus:border-[#455A6D] bg-white transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#596E81] to-[#455A6D] text-white rounded-lg text-sm font-medium hover:from-[#455A6D] hover:to-[#344e60] disabled:opacity-50 transition-all"
                        >
                            {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                            Buscar
                        </button>
                    </div>
                </form>
            </div>

            <div className="p-6">
                {error && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center items-center py-12 text-gray-400">
                        <Loader2 size={24} className="animate-spin mr-2" />
                        <span className="text-sm">Buscando...</span>
                    </div>
                )}

                {!loading && result && (
                    <div className="animate-in fade-in duration-300">
                        {/* Profile Banner */}
                        {(() => {
                            const statusConfig = {
                                ACTIVE:   { label: 'Activo',    cls: 'bg-green-100 text-green-700' },
                                DESERTED: { label: 'Deserción', cls: 'bg-yellow-100 text-yellow-700' },
                                LOW:      { label: 'Baja',       cls: 'bg-red-100 text-red-700' },
                            };
                            const statusInfo = statusConfig[result.status] || { label: 'Error de consulta', cls: 'bg-gray-100 text-gray-500' };
                            return (
                                <div className="bg-gradient-to-r from-[#596E81] to-[#455A6D] rounded-xl p-6 text-white flex items-center gap-4 mb-5">
                                    <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                                        <UserCircle size={40} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{result.name} {result.lastname}</h3>
                                        <div className="flex items-center gap-2 mt-1 text-blue-100 text-sm">
                                            <ShieldCheck size={14} />
                                            <span className="capitalize">{result.role || 'STUDENT'}</span>
                                            <span className="mx-1">·</span>
                                            <span className="font-mono">{result.code}</span>
                                            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusInfo.cls}`}>
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                { icon: Key, label: 'Código', value: result.code },
                                { icon: Mail, label: 'Correo', value: result.email || '—' },
                                { icon: ShieldCheck, label: 'Rol', value: result.role || '—' },
                                { icon: BookOpen, label: 'Carrera', value: result.career },
                                { icon: GraduationCap, label: 'Nivel Académico', value: result.academicLevel },
                                { icon: Hash, label: 'Grado', value: result.degree },
                                { icon: Calendar, label: 'Primer Ingreso', value: formatDate(result.firstLogin) },
                                { icon: Clock, label: 'Último Ingreso', value: formatDate(result.lastLogin) },
                                { icon: Calendar, label: 'Fecha de Creación', value: formatDate(result.createdDate) },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 hover:shadow-sm transition-all">
                                    <dt className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
                                        <Icon size={13} className="text-[#455A6D]" />
                                        {label}
                                    </dt>
                                    <dd className="text-sm font-semibold text-gray-900 break-all">{value}</dd>
                                </div>
                            ))}
                            <div className="sm:col-span-2 lg:col-span-3 border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 hover:shadow-sm transition-all">
                                <dt className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
                                    <Hash size={13} className="text-[#455A6D]" /> ID de Perfil
                                </dt>
                                <dd className="text-xs font-mono text-gray-400">{result.id}</dd>
                            </div>
                        </dl>
                    </div>
                )}

                {!loading && !result && !error && (
                    <div className="text-center py-12 text-gray-400">
                        <Search size={36} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Ingresa un {selectedType?.label?.toLowerCase()} para buscar un usuario.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
