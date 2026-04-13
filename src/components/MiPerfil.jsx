import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { UserCircle, Key, Mail, ShieldCheck, Calendar, Clock, Loader2, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
    ACTIVE:   { label: 'Activo',    cls: 'bg-green-100 text-green-700' },
    DESERTED: { label: 'Deserción', cls: 'bg-yellow-100 text-yellow-700' },
    LOW:      { label: 'Baja',      cls: 'bg-red-100 text-red-700' },
};

const formatDate = (dateString) => {
    if (!dateString) return 'No registrado';
    return new Date(dateString).toLocaleString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

export default function MiPerfil() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
        if (!user?.userId) { setLoading(false); return; }
        setLoading(true);
        setFetchError('');
        let rolePath = 'student';
        if (user.role === 'ADMIN') rolePath = 'admin';
        else if (user.role === 'TEACHER') rolePath = 'teacher';
        api.get(`/${rolePath}/id`, { params: { id: user.userId } })
            .then(res => setProfile(res.data))
            .catch(() => setFetchError('No se pudo obtener el estado del perfil desde el servidor.'))
            .finally(() => setLoading(false));
    }, [user?.userId]);

    // Merge token data with fetched profile (profile takes priority for status)
    const data = { ...user, ...(profile || {}) };
    const statusInfo = STATUS_CONFIG[data.status] || { label: 'Error de consulta', cls: 'bg-gray-100 text-gray-500' };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-24 text-gray-400">
                <Loader2 size={28} className="animate-spin mr-2" />
                <span className="text-sm">Cargando perfil...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
            {/* Banner */}
            <div className="bg-gradient-to-r from-[#596E81] to-[#455A6D] px-6 py-8 sm:px-8 text-white">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                        <UserCircle size={48} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{data.name} {data.lastname}</h2>
                        <div className="flex items-center gap-2 mt-1 text-blue-100 flex-wrap">
                            <ShieldCheck size={16} />
                            <span className="capitalize">{data.role || 'Estudiante'}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusInfo.cls}`}>
                                {statusInfo.label}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fetch warning (non-blocking) */}
            {fetchError && (
                <div className="mx-6 mt-4 flex items-start gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 text-sm">
                    <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                    {fetchError}
                </div>
            )}

            {/* Info grid */}
            <div className="px-6 py-8 sm:px-8">
                <h3 className="text-lg font-medium text-gray-900 mb-6 border-b border-gray-100 pb-2">
                    Información de la Cuenta
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        { icon: Key,         label: 'Código',            value: data.code },
                        { icon: Mail,        label: 'Correo Electrónico',value: data.email || 'N/A' },
                        { icon: ShieldCheck, label: 'Rol',               value: data.role || 'N/A' },
                        { icon: ShieldCheck, label: 'Estado',            value: statusInfo.label, cls: statusInfo.cls },
                        { icon: Calendar,    label: 'Primer Ingreso',    value: formatDate(data.firstLogin) },
                        { icon: Clock,       label: 'Último Ingreso',    value: formatDate(data.lastLogin) },
                    ].map(({ icon: Icon, label, value, cls }) => (
                        <div key={label} className="sm:col-span-1 border border-gray-50 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 hover:shadow-sm transition-all">
                            <dt className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                                <Icon size={16} className="text-siiau-blue" /> {label}
                            </dt>
                            <dd className="mt-1">
                                {cls ? (
                                    <span className={`px-2 py-0.5 rounded-full text-sm font-semibold ${cls}`}>{value}</span>
                                ) : (
                                    <span className="text-lg font-semibold text-gray-900">{value}</span>
                                )}
                            </dd>
                        </div>
                    ))}

                    {/* ID full width */}
                    <div className="sm:col-span-2 lg:col-span-3 border border-gray-50 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 hover:shadow-sm transition-all">
                        <dt className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                            <UserCircle size={16} className="text-siiau-blue" /> ID de Perfil
                        </dt>
                        <dd className="mt-1 text-xs font-mono text-gray-400">{data.userId || data.id}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}
