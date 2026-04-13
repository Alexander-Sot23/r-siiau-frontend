import { useState } from 'react';
import api from '../api/axios';
import { Trash2, AlertTriangle, Search, AlertCircle, CheckCircle, Loader2, ShieldAlert } from 'lucide-react';

export default function AdminEliminarAlumno() {
    const [searchQuery, setSearchQuery] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    // Confirmation modal state
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState('');
    const [deleteError, setDeleteError] = useState('');

    // ── Search ───────────────────────────────────────────────────────────────────
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearchLoading(true);
        setSearchError('');
        setFoundUser(null);
        setDeleteSuccess('');
        setDeleteError('');
        setShowConfirm(false);
        setConfirmText('');
        try {
            const res = await api.get('/admin/id', { params: { id: searchQuery.trim() } });
            setFoundUser(res.data);
        } catch (err) {
            setSearchError(err.response?.status === 404
                ? 'No se encontró un usuario con ese dato.'
                : err.response?.data?.message || 'Error al buscar.');
        } finally {
            setSearchLoading(false);
        }
    };

    // ── Delete ───────────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!foundUser) return;
        setDeleteLoading(true);
        setDeleteError('');
        try {
            await api.delete('/admin', { params: { id: foundUser.id } });
            setDeleteSuccess(`El usuario "${foundUser.name} ${foundUser.lastname}" (Código: ${foundUser.code}) ha sido eliminado permanentemente.`);
            setFoundUser(null);
            setShowConfirm(false);
            setConfirmText('');
            setSearchQuery('');
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Error al eliminar el usuario.');
            setShowConfirm(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    const CONFIRM_KEYWORD = foundUser?.code || 'ELIMINAR';
    const isConfirmValid = confirmText === CONFIRM_KEYWORD;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">

            {/* ── Header + Search ──────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-red-700 to-red-900 px-6 py-4 text-white flex items-center gap-3">
                    <Trash2 size={20} />
                    <h2 className="text-lg font-bold tracking-wide">ELIMINAR USUARIO</h2>
                </div>

                <div className="p-6 bg-red-50/40">
                    <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5 text-sm text-orange-800">
                        <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-orange-500" />
                        <p>Esta acción <strong>eliminará permanentemente</strong> al usuario del sistema. No puede deshacerse. Busca al usuario antes de continuar.</p>
                    </div>

                    <form onSubmit={handleSearch} className="flex flex-col gap-4">
                        <p className="text-sm text-gray-600">
                            Ingresa el <strong>ID de Perfil (UUID)</strong> del usuario.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Ej. 550e8400-e29b-41d4-a716-446655440000"
                                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white font-mono"
                            />
                            <button type="submit" disabled={searchLoading || !searchQuery.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-all">
                                {searchLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                                Buscar
                            </button>
                        </div>
                        {searchError && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />{searchError}
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* ── Success message ──────────────────────────────────────────────── */}
            {deleteSuccess && (
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 rounded-2xl p-5 text-sm animate-in fade-in duration-300">
                    <CheckCircle size={18} className="mt-0.5 flex-shrink-0 text-green-600" />
                    <div>
                        <p className="font-semibold mb-1">Eliminación exitosa</p>
                        <p>{deleteSuccess}</p>
                    </div>
                </div>
            )}

            {deleteError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />{deleteError}
                </div>
            )}

            {/* ── Found User Card ──────────────────────────────────────────────── */}
            {foundUser && !showConfirm && (
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden animate-in fade-in duration-300">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-800">{foundUser.name} {foundUser.lastname}</p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{foundUser.code} · {foundUser.email || 'Sin correo'}</p>
                        </div>
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all shadow"
                        >
                            <Trash2 size={15} />
                            Eliminar
                        </button>
                    </div>
                    <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        {[
                            { label: 'Carrera', value: foundUser.career },
                            { label: 'Grado', value: foundUser.degree },
                            { label: 'Nivel', value: foundUser.academicLevel },
                            { label: 'Rol', value: foundUser.role },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <dt className="text-xs text-gray-400">{label}</dt>
                                <dd className="font-medium text-gray-800">{value}</dd>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── CONFIRMATION MODAL ───────────────────────────────────────────── */}
            {showConfirm && foundUser && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-white rounded-2xl border-2 border-red-400 shadow-xl overflow-hidden">
                        {/* Danger header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-900 px-6 py-5 text-white flex items-center gap-4">
                            <div className="bg-white/20 p-2.5 rounded-full">
                                <ShieldAlert size={28} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold tracking-tight">ACCIÓN IRREVERSIBLE</h3>
                                <p className="text-red-200 text-sm mt-0.5">Esta operación no puede deshacerse bajo ninguna circunstancia.</p>
                            </div>
                        </div>

                        <div className="p-6 flex flex-col gap-5">
                            {/* What will be deleted */}
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-sm font-bold text-red-800 mb-2">Se eliminará permanentemente:</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-bold text-lg">
                                        {foundUser.name[0]}{foundUser.lastname[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-red-900">{foundUser.name} {foundUser.lastname}</p>
                                        <p className="text-xs text-red-600 font-mono">{foundUser.code} · {foundUser.email || 'Sin correo'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Consequences list */}
                            <div className="text-sm text-gray-700 space-y-2">
                                <p className="font-semibold text-gray-800">Lo que ocurrirá:</p>
                                <ul className="space-y-1.5 pl-1">
                                    {[
                                        'Todos los datos del usuario serán borrados del sistema.',
                                        'No podrá iniciar sesión con sus credenciales.',
                                        'Esta acción es permanente e irreversible.',
                                        'No recibirás confirmación adicional del servidor.',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-red-500 mt-0.5">✕</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Confirm input */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <p className="text-sm text-gray-700 mb-2">
                                    Para confirmar, escribe el código del usuario:{' '}
                                    <code className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono text-sm font-bold">{CONFIRM_KEYWORD}</code>
                                </p>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={e => setConfirmText(e.target.value)}
                                    placeholder={`Escribe "${CONFIRM_KEYWORD}" para confirmar`}
                                    className={`w-full px-3 py-2.5 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 transition-colors ${isConfirmValid ? 'border-red-400 focus:ring-red-400 bg-red-50 text-red-700' : 'border-gray-300 focus:ring-gray-400 bg-white'
                                        }`}
                                />
                                {isConfirmValid && (
                                    <p className="text-xs text-red-600 font-semibold mt-1.5">Confirmado — el botón de eliminar está habilitado.</p>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3 justify-end pt-1">
                                <button
                                    onClick={() => { setShowConfirm(false); setConfirmText(''); }}
                                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar, mantener usuario
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={!isConfirmValid || deleteLoading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-lg text-sm font-bold transition-all shadow-sm disabled:shadow-none"
                                >
                                    {deleteLoading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                    {deleteLoading ? 'Eliminando...' : 'Eliminar permanentemente'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
