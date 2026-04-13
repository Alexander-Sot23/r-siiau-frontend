import { useState } from 'react';
import api from '../api/axios';
import { UserPlus, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const ACADEMIC_LEVELS = ['BR', 'LIC', 'ING', 'MTR', 'DR'];
const USER_ROLES = ['STUDENT', 'ADMIN', 'TEACHER'];
const USER_STATUSES = ['ACTIVE', 'DESERTED', 'LOW'];

const INITIAL_FORM = {
    name: '',
    lastname: '',
    code: '',
    academicLevel: 'LIC',
    career: '',
    degree: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'STUDENT',
    status: 'ACTIVE',
};

export default function AdminAnadirAlumno() {
    const [form, setForm] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (form.password !== form.passwordConfirm) {
            setError({ general: 'Las contraseñas no coinciden.' });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            const { passwordConfirm, ...payload } = form;
            formData.append('sendData', JSON.stringify({ ...payload, degree: Number(payload.degree) }));

            const response = await api.post('/admin', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSuccess(`Usuario "${response.data.name} ${response.data.lastname}" creado con éxito (Código: ${response.data.code}).`);
            setForm(INITIAL_FORM);
        } catch (err) {
            const responseData = err.response?.data;
            if (typeof responseData === 'object' && responseData !== null) {
                // Filtrar claves de metadatos HTTP de Spring Boot (status, error, message, etc.)
                // para quedarnos solo con los errores de campo reales
                const HTTP_META_KEYS = new Set(['status', 'error', 'message', 'path', 'timestamp', 'trace']);
                const fieldErrors = Object.fromEntries(
                    Object.entries(responseData).filter(([k]) => !HTTP_META_KEYS.has(k))
                );
                if (Object.keys(fieldErrors).length > 0) {
                    setError(fieldErrors);
                } else {
                    // No había errores de campo reales: mostrar mensaje general
                    setError({ general: responseData?.message || responseData?.error || 'Error al crear el usuario.' });
                }
            } else {
                setError({ general: responseData?.error || responseData?.message || 'Error al crear el usuario.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const getFieldError = (field) => {
        if (!error || typeof error === 'string') return null;
        // Excluir claves de metadatos HTTP que Spring Boot incluye en la respuesta
        // (status, error, message, path, timestamp) para no mostrarlas como errores de campo
        const HTTP_META_KEYS = new Set(['status', 'error', 'message', 'path', 'timestamp', 'trace']);
        if (HTTP_META_KEYS.has(field)) return null;
        return error[field] || null;
    };

    const inputClass = (field) =>
        `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#455A6D] transition-colors bg-gray-50 focus:bg-white ${getFieldError(field) ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
        }`;

    const passwordMatch = form.password && form.passwordConfirm && form.password === form.passwordConfirm;
    const passwordMismatch = form.passwordConfirm && form.password !== form.passwordConfirm;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-[#596E81] to-[#455A6D] px-6 py-4 text-white flex items-center gap-3">
                <UserPlus size={20} />
                <h2 className="text-lg font-bold tracking-wide">AÑADIR USUARIO</h2>
            </div>

            <div className="p-6">
                {success && (
                    <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 text-sm mb-5 animate-in fade-in duration-300">
                        <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                        {success}
                    </div>
                )}

                {error?.general && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm mb-5">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        {error.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                        <input name="name" value={form.name} onChange={handleChange} required placeholder="Juan" className={inputClass('name')} />
                        {getFieldError('name') && <p className="text-xs text-red-500 mt-1">{getFieldError('name')}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apellido <span className="text-red-500">*</span></label>
                        <input name="lastname" value={form.lastname} onChange={handleChange} required placeholder="Pérez García" className={inputClass('lastname')} />
                        {getFieldError('lastname') && <p className="text-xs text-red-500 mt-1">{getFieldError('lastname')}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Código <span className="text-red-500">*</span></label>
                        <input name="code" value={form.code} onChange={handleChange} required placeholder="220000001" minLength={6} maxLength={15} className={inputClass('code')} />
                        {getFieldError('code') && <p className="text-xs text-red-500 mt-1">{getFieldError('code')}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico <span className="text-red-500">*</span></label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="usuario@udg.mx" className={inputClass('email')} />
                        {getFieldError('email') && <p className="text-xs text-red-500 mt-1">{getFieldError('email')}</p>}
                    </div>

                    {/* Password with show/hide */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className={`${inputClass('password')} pr-10`}
                            />
                            <button type="button" onClick={() => setShowPassword(v => !v)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {getFieldError('password') && <p className="text-xs text-red-500 mt-1">{getFieldError('password')}</p>}
                    </div>

                    {/* Password confirm */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                type={showPasswordConfirm ? 'text' : 'password'}
                                name="passwordConfirm"
                                value={form.passwordConfirm}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className={`pr-10 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors bg-gray-50 focus:bg-white ${passwordMismatch ? 'border-red-400 focus:ring-red-400' :
                                        passwordMatch ? 'border-green-400 focus:ring-green-400' : 'border-gray-300 focus:ring-[#455A6D]'
                                    }`}
                            />
                            <button type="button" onClick={() => setShowPasswordConfirm(v => !v)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                {showPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {passwordMismatch && <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden.</p>}
                        {passwordMatch && <p className="text-xs text-green-600 mt-1">✓ Las contraseñas coinciden.</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Carrera <span className="text-red-500">*</span></label>
                        <input name="career" value={form.career} onChange={handleChange} required placeholder="Ingeniería en Computación" className={inputClass('career')} />
                        {getFieldError('career') && <p className="text-xs text-red-500 mt-1">{getFieldError('career')}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grado <span className="text-red-500">*</span></label>
                        <input type="number" name="degree" value={form.degree} onChange={handleChange} required min={1} placeholder="1" className={inputClass('degree')} />
                        {getFieldError('degree') && <p className="text-xs text-red-500 mt-1">{getFieldError('degree')}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Académico <span className="text-red-500">*</span></label>
                        <select name="academicLevel" value={form.academicLevel} onChange={handleChange} className={inputClass('academicLevel')}>
                            {ACADEMIC_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        {getFieldError('academicLevel') && <p className="text-xs text-red-500 mt-1">{getFieldError('academicLevel')}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol <span className="text-red-500">*</span></label>
                        <select name="role" value={form.role} onChange={handleChange} className={inputClass('role')}>
                            {USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        {getFieldError('role') && <p className="text-xs text-red-500 mt-1">{getFieldError('role')}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado <span className="text-red-500">*</span></label>
                        <select name="status" value={form.status} onChange={handleChange} className={inputClass('status')}>
                            {USER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {getFieldError('status') && <p className="text-xs text-red-500 mt-1">{getFieldError('status')}</p>}
                    </div>

                    <div className="sm:col-span-2 flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={loading || passwordMismatch}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#596E81] to-[#455A6D] hover:from-[#455A6D] hover:to-[#344e60] text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-all"
                        >
                            {loading ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
                            {loading ? 'Creando...' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
