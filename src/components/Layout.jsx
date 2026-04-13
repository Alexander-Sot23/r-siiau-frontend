import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import udgLogo from '../assets/udg-logo-01.png';

export default function Layout() {
    const { user, logout, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-siiau-light flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-siiau-blue"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-siiau-light flex flex-col font-sans">
            {/* Superior Header Block (Main Dashboard) */}
            <header className="bg-gradient-to-r from-[#596E81] to-[#455A6D] text-white shadow-md w-full py-3">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="flex justify-between items-center min-h-[5rem]">

                        {/* Hidden spacer to keep center content perfectly balanced on large screens */}
                        <div className="hidden lg:block w-[120px]"></div>

                        {/* Centered Logo and Text Group */}
                        <div className="flex items-center justify-center flex-1 gap-4 sm:gap-6">
                            <img src={udgLogo} alt="Universidad de Guadalajara" className="h-16 sm:h-20 w-auto object-contain brightness-0 invert drop-shadow-sm" />
                            <div className="flex flex-col text-white justify-center leading-tight">
                                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ fontFamily: "'Sans Serif Collection', sans-serif" }}>SIIAU</span>
                                <span className="text-xs sm:text-sm font-medium tracking-widest hidden sm:block mt-1" style={{ fontFamily: "'Sans Serif Collection', sans-serif" }}>SISTEMA INTEGRAL DE INFORMACIÓN Y ADMINISTRACIÓN UNIVERSITARIA</span>
                                <span className="text-xs sm:hidden font-medium tracking-tight mt-1" style={{ fontFamily: "'Sans Serif Collection', sans-serif" }}>SISTEMA INTEGRAL DE INFORMACIÓN...</span>
                                <span className="text-sm sm:text-base font-bold tracking-widest mt-1">MÓDULO ESCOLAR</span>
                            </div>
                        </div>

                        {/* End Header */}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
                <Outlet />
            </main>
        </div>
    );
}
