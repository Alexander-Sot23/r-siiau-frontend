import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setIsLoading(false);
            return;
        }

        const result = await login(code, password);

        if (result.success) {
            navigate('/inicio');
        } else {
            setError(result.message || 'Código o contraseña incorrectos');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-siiau-light flex flex-col font-sans">
            {/* Superior Header Block (Login matching Layout colors and style) */}
            <header className="bg-gradient-to-r from-[#596E81] to-[#455A6D] text-gray-100 shadow-md w-full py-3">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-4 sm:gap-6 min-h-[5rem]">
                        <div className="flex flex-col text-white justify-center leading-tight text-center">
                            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ fontFamily: "'Sans Serif Collection', sans-serif" }}>SIIAU</span>
                            <span className="text-xs sm:text-sm font-medium tracking-tight hidden sm:block mt-1" style={{ fontFamily: "'Sans Serif Collection', sans-serif" }}>SISTEMA INTEGRAL DE INFORMACIÓN Y ADMINISTRACIÓN UNIVERSITARIA</span>
                            {/* Mobile truncation for smaller screens */}
                            <span className="text-[10px] sm:hidden font-medium tracking-tighter mt-1" style={{ fontFamily: "'Sans Serif Collection', sans-serif" }}>SISTEMA INTEGRAL DE INFORMACIÓN</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                        Iniciar Sesión
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Bienvenido al portal institucional
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 mx-4 sm:mx-0">
                        <form className="space-y-6" onSubmit={handleSubmit}>

                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
                                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                    Código de Usuario
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="code"
                                        name="code"
                                        type="text"
                                        required
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-siiau-blue focus:border-siiau-blue sm:text-sm transition-colors bg-gray-50 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Contraseña
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-siiau-blue focus:border-siiau-blue sm:text-sm transition-colors bg-gray-50 focus:bg-white"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" aria-hidden="true" />
                                        ) : (
                                            <Eye className="h-5 w-5" aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-siiau-blue focus:ring-siiau-blue border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                        Recordarme
                                    </label>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#596E81] to-[#455A6D] hover:from-[#455A6D] hover:to-[#344e60] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#455A6D] transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : 'Ingresar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
