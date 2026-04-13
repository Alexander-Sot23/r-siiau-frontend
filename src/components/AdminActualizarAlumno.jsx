import { useState } from 'react';
import api from '../api/axios';
import { Pencil, AlertCircle, CheckCircle, Loader2, Search, Eye, EyeOff, Key } from 'lucide-react';

const ACADEMIC_LEVELS = ['BR', 'LIC', 'ING', 'MTR', 'DR'];
const USER_ROLES = ['STUDENT', 'ADMIN', 'TEACHER'];
const USER_STATUSES = ['ACTIVE', 'DESERTED', 'LOW'];

const INITIAL_UPDATE = { name: '', lastname: '', academicLevel: 'LIC', career: '', degree: '', role: 'STUDENT', status: 'ACTIVE' };
const INITIAL_PASSWORD = { oldPassword: '', newPassword: '', newPasswordConfirm: '' };

export default function AdminActualizarAlumno() {
    // Step 1: find user by code/id
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('code');
    const [foundUser, setFoundUser] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    // Form state
    const [updateForm, setUpdateForm] = useState(INITIAL_UPDATE);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState('');

    // Password form
    const [pwForm, setPwForm] = useState(INITIAL_PASSWORD);
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showNewConfirm, setShowNewConfirm] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState(null);
    const [pwSuccess, setPwSuccess] = useState('');

    // ── Search ──────────────────────────────────────────────────────────────────
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearchLoading(true);
        setSearchError('');
        setFoundUser(null);
        setUpdateSuccess('');
        setPwSuccess('');
        try {
            const res = await api.get(`/admin/${searchType}`, { params: { [searchType]: searchQuery.trim() } });
            const u = res.data;
            setFoundUser(u);
            setUpdateForm({
                name: u.name || '',
                lastname: u.lastname || '',
                academicLevel: u.academicLevel || 'LIC',
                career: u.career || '',
                degree: String(u.degree || ''),
                role: u.role || 'STUDENT',
                status: u.status || 'ACTIVE',
            });
        } catch (err) {
            setSearchError(err.response?.status === 404
                ? 'No se encontró un usuario con ese dato.'
                : err.response?.data?.message || 'Error al buscar el usuario.');
        } finally {
            setSearchLoading(false);
        }
    };

    // ── Update info ─────────────────────────────────────────────────────────────
    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        setUpdateError(null);
        setUpdateSuccess('');
        try {
            const formData = new FormData();
            formData.append('sendData', JSON.stringify({ ...updateForm, degree: Number(updateForm.degree) }));
            const res = await api.put('/admin', formData, {
                params: { id: foundUser.id },
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFoundUser(res.data);
            setUpdateSuccess('Información actualizada correctamente.');
        } catch (err) {
            const d = err.response?.data;
            if (typeof d === 'object' && d !== null) {
                const HTTP_META_KEYS = new Set(['status', 'error', 'message', 'path', 'timestamp', 'trace']);
                const fieldErrors = Object.fromEntries(
                    Object.entries(d).filter(([k]) => !HTTP_META_KEYS.has(k))
                );
                setUpdateError(Object.keys(fieldErrors).length > 0
                    ? fieldErrors
                    : { general: d?.message || d?.error || 'Error al actualizar.' }
                );
            } else {
                setUpdateError({ general: d?.message || 'Error al actualizar.' });
            }
        } finally {
            setUpdateLoading(false);
        }
    };

    // ── Update password ─────────────────────────────────────────────────────────
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.newPasswordConfirm) {
            setPwError({ general: 'Las contraseñas nuevas no coinciden.' });
            return;
        }
        setPwLoading(true);
        setPwError(null);
        setPwSuccess('');
        try {
            const formData = new FormData();
            formData.append('sendData', JSON.stringify({
                oldPassword: pwForm.oldPassword,
                newPassword: pwForm.newPassword,
            }));
            await api.put('/admin/password', formData, {
                params: { id: foundUser.id },
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setPwSuccess('Contraseña actualizada correctamente.');
            setPwForm(INITIAL_PASSWORD);
        } catch (err) {
            const d = err.response?.data;
            setPwError(typeof d === 'object' ? d : { general: d?.message || 'Error al actualizar la contraseña.' });
        } finally {
            setPwLoading(false);
        }
    };

    const fieldErr = (errors, field) => errors && typeof errors === 'object' ? errors[field] || null : null;
    const inputCls = (errors, field) =>
        `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#455A6D] transition-colors bg-gray-50 focus:bg-white ${fieldErr(errors, field) ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
        }`;

    const pwMatch = pwForm.newPassword && pwForm.newPasswordConfirm && pwForm.newPassword === pwForm.newPasswordConfirm;
    const pwMismatch = pwForm.newPasswordConfirm && pwForm.newPassword !== pwForm.newPasswordConfirm;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">

            {/* ── Section Header & Search ─────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#596E81] to-[#455A6D] px-6 py-4 text-white flex items-center gap-3">
                    <Pencil size={20} />
                    <h2 className="text-lg font-bold tracking-wide">ACTUALIZAR USUARIO</h2>
                </div>
                <div className="p-6 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-4">Primero busca al usuario para cargar sus datos.</p>
                    <form onSubmit={handleSearch} className="flex flex-col gap-4">
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { value: 'code', label: 'Código' },
                                { value: 'email', label: 'Correo' },
                                { value: 'id', label: 'ID de Perfil' },
                            ].map(t => (
                                <button key={t.value} type="button"
                                    onClick={() => { setSearchType(t.value); setSearchQuery(''); }}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${searchType === t.value ? 'bg-[#455A6D] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >{t.label}</button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder={searchType === 'code' ? 'Ej. 220000000' : searchType === 'email' ? 'Ej. usuario@udg.mx' : 'UUID del usuario'}
                                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#455A6D] bg-white"
                            />
                            <button type="submit" disabled={searchLoading || !searchQuery.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#596E81] to-[#455A6D] text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-all">
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

            {/* ── Update Info Form ────────────────────────────────────────────── */}
            {foundUser && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-700">
                            Editando: <span className="text-[#455A6D]">{foundUser.name} {foundUser.lastname}</span>
                            <span className="ml-2 font-mono text-xs text-gray-400">({foundUser.code})</span>
                        </p>
                    </div>
                    <div className="p-6">
                        {updateSuccess && (
                            <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 text-sm mb-5">
                                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />{updateSuccess}
                            </div>
                        )}
                        {updateError?.general && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm mb-5">
                                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />{updateError.general}
                            </div>
                        )}
                        <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {[
                                { name: 'name', label: 'Nombre', placeholder: 'Juan' },
                                { name: 'lastname', label: 'Apellido', placeholder: 'Pérez García' },
                                { name: 'career', label: 'Carrera', placeholder: 'Ingeniería en Computación' },
                                { name: 'degree', label: 'Grado', placeholder: '1', type: 'number' },
                            ].map(f => (
                                <div key={f.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label} <span className="text-red-500">*</span></label>
                                    <input
                                        type={f.type || 'text'} name={f.name}
                                        value={updateForm[f.name]}
                                        onChange={e => setUpdateForm(p => ({ ...p, [f.name]: e.target.value }))}
                                        required placeholder={f.placeholder}
                                        className={inputCls(updateError, f.name)}
                                    />
                                    {fieldErr(updateError, f.name) && <p className="text-xs text-red-500 mt-1">{fieldErr(updateError, f.name)}</p>}
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Académico <span className="text-red-500">*</span></label>
                                <select name="academicLevel" value={updateForm.academicLevel}
                                    onChange={e => setUpdateForm(p => ({ ...p, academicLevel: e.target.value }))}
                                    className={inputCls(updateError, 'academicLevel')}>
                                    {ACADEMIC_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol <span className="text-red-500">*</span></label>
                                <select name="role" value={updateForm.role}
                                    onChange={e => setUpdateForm(p => ({ ...p, role: e.target.value }))}
                                    className={inputCls(updateError, 'role')}>
                                    {USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado <span className="text-red-500">*</span></label>
                                <select name="status" value={updateForm.status}
                                    onChange={e => setUpdateForm(p => ({ ...p, status: e.target.value }))}
                                    className={inputCls(updateError, 'status')}>
                                    {USER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {fieldErr(updateError, 'status') && <p className="text-xs text-red-500 mt-1">{fieldErr(updateError, 'status')}</p>}
                            </div>
                            <div className="sm:col-span-2 flex justify-end pt-2">
                                <button type="submit" disabled={updateLoading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#596E81] to-[#455A6D] hover:from-[#455A6D] hover:to-[#344e60] text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-all">
                                    {updateLoading ? <Loader2 size={15} className="animate-spin" /> : <Pencil size={15} />}
                                    {updateLoading ? 'Actualizando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Update Password Form ────────────────────────────────────────── */}
            {foundUser && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <Key size={15} className="text-[#455A6D]" />
                        <p className="text-sm font-semibold text-gray-700">Actualizar Contraseña</p>
                    </div>
                    <div className="p-6">
                        {pwSuccess && (
                            <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 text-sm mb-5">
                                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />{pwSuccess}
                            </div>
                        )}
                        {pwError?.general && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm mb-5">
                                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />{pwError.general}
                            </div>
                        )}
                        <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Old password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input type={showOld ? 'text' : 'password'} value={pwForm.oldPassword}
                                        onChange={e => setPwForm(p => ({ ...p, oldPassword: e.target.value }))}
                                        required placeholder="••••••••"
                                        className={`${inputCls(pwError, 'oldPassword')} pr-10`} />
                                    <button type="button" onClick={() => setShowOld(v => !v)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                        {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {fieldErr(pwError, 'oldPassword') && <p className="text-xs text-red-500 mt-1">{fieldErr(pwError, 'oldPassword')}</p>}
                            </div>

                            {/* New password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input type={showNew ? 'text' : 'password'} value={pwForm.newPassword}
                                        onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                                        required minLength={6} placeholder="••••••••"
                                        className={`${inputCls(pwError, 'newPassword')} pr-10`} />
                                    <button type="button" onClick={() => setShowNew(v => !v)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                        {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {fieldErr(pwError, 'newPassword') && <p className="text-xs text-red-500 mt-1">{fieldErr(pwError, 'newPassword')}</p>}
                            </div>

                            {/* Confirm new password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input type={showNewConfirm ? 'text' : 'password'} value={pwForm.newPasswordConfirm}
                                        onChange={e => setPwForm(p => ({ ...p, newPasswordConfirm: e.target.value }))}
                                        required placeholder="••••••••"
                                        className={`pr-10 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors bg-gray-50 focus:bg-white ${pwMismatch ? 'border-red-400 focus:ring-red-400' :
                                                pwMatch ? 'border-green-400 focus:ring-green-400' : 'border-gray-300 focus:ring-[#455A6D]'
                                            }`} />
                                    <button type="button" onClick={() => setShowNewConfirm(v => !v)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                        {showNewConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {pwMismatch && <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden.</p>}
                                {pwMatch && <p className="text-xs text-green-600 mt-1">✓ Las contraseñas coinciden.</p>}
                            </div>

                            <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
                                <button type="submit" disabled={pwLoading || pwMismatch}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#596E81] to-[#455A6D] hover:from-[#455A6D] hover:to-[#344e60] text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-all">
                                    {pwLoading ? <Loader2 size={15} className="animate-spin" /> : <Key size={15} />}
                                    {pwLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
