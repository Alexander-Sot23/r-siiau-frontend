import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Mail, Key, Calendar, ShieldCheck, Clock, ChevronDown, Home, LogOut } from 'lucide-react';
import AdminObtenerAlumnos from '../components/AdminObtenerAlumnos';
import AdminBuscarAlumno from '../components/AdminBuscarAlumno';
import AdminAnadirAlumno from '../components/AdminAnadirAlumno';
import AdminImportarAlumnos from '../components/AdminImportarAlumnos';
import AdminActualizarAlumno from '../components/AdminActualizarAlumno';
import AdminEliminarAlumno from '../components/AdminEliminarAlumno';
import TeacherObtenerAlumnos from '../components/TeacherObtenerAlumnos';
import TeacherBuscarAlumno from '../components/TeacherBuscarAlumno';
import MiPerfil from '../components/MiPerfil';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [isAlumnosOpen, setIsAlumnosOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [isMaestrosOpen, setIsMaestrosOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('inicio');
    const [searchPrefill,        setSearchPrefill]        = useState(null);
    const [teacherSearchPrefill, setTeacherSearchPrefill] = useState(null);

    // Role helpers
    const role = user?.role?.toUpperCase();
    const isAdmin = role === 'ADMIN';
    const isTeacher = role === 'TEACHER';
    const isStudent = !isAdmin && !isTeacher;

    // Admin: navega a la sección Admin de búsqueda
    const handleVerDetalles = (code) => {
        setSearchPrefill({ type: 'code', value: code });
        setActiveSection('BUSCAR USUARIO');
    };

    // Teacher: navega a la sección Teacher de búsqueda
    const handleTeacherVerDetalles = (code) => {
        setTeacherSearchPrefill({ type: 'code', value: code });
        setActiveSection('TEACHER BUSCAR ALUMNO');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No registrado';
        return new Date(dateString).toLocaleString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // STUDENT sees MI PERFIL + academic options
    const studentOptions = [
        "MI PERFIL",
        "ACADÉMICA",
        "CURRICULA",
        "PRERREGISTRO",
        "REGISTRO",
        "SERVICIOS",
        "SOBRESALIENTE"
    ];

    // ADMIN full options (MI PERFIL included)
    const adminOptions = [
        "MI PERFIL",
        "OBTENER USUARIOS",
        "BUSCAR USUARIO",
        "AÑADIR USUARIO",
        "IMPORTAR USUARIOS",
        "ACTUALIZAR USUARIO",
        "ELIMINAR USUARIO"
    ];

    // TEACHER limited options (prefixed to avoid collision with Admin sections)
    const teacherOptions = [
        "MI PERFIL",
        "TEACHER OBTENER ALUMNOS",
        "TEACHER BUSCAR ALUMNO"
    ];

    // Labels amigables para mostrar en el sidebar
    const teacherOptionLabels = {
        "MI PERFIL":               "MI PERFIL",
        "TEACHER OBTENER ALUMNOS": "OBTENER USUARIOS",
        "TEACHER BUSCAR ALUMNO":   "BUSCAR USUARIO"
    };

    const subOptions = [
        "Cambio de Nip",
        "Correo Google",
        "Correo Office365",
        "Oferta",
        "Orden De Pago",
        "Orden De Pago Cive"
    ];

    const handleOptionSelect = (option) => {
        setActiveSection(option);
    };

    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useState(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const formatDateTimeCompact = (date) => {
        return date.toLocaleString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace(',', '');
    };

    const renderMainContent = () => {
        if (activeSection === 'inicio' || activeSection === 'Conoce tu NSS (Número de Seguro Social)') {
            return (
                <div className="bg-white/80 p-6 flex flex-col gap-4 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 pb-2">
                        <img src="/src/assets/informacion.png" alt="Info" className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                        <h2 className="text-2xl font-bold text-[#c00000]">
                            Conoce tu NSS (Número de Seguro Social)
                        </h2>
                    </div>

                    {/* Table Design matching reference */}
                    <div className="border border-gray-300 w-full text-sm font-sans mt-2">
                        {/* Header Row */}
                        <div className="bg-[#003366] text-white font-bold text-center py-1 uppercase">
                            {user?.name || 'NAME'}
                        </div>

                        {/* Content Rows */}
                        <div className="bg-[#e6e6e6] p-2 border-b border-white">
                            <span className="font-bold">Puedes ingresar a los siguientes módulos:</span>
                        </div>
                        <div className="bg-[#f2f2f2] p-2 px-4 border-b border-white">
                            <ul className="list-disc list-inside">
                                <li><strong>ALUMNOS</strong> - Módulo de Estudiantes</li>
                            </ul>
                        </div>

                        <div className="bg-[#e6e6e6] p-2 border-b border-white">
                            <span className="font-bold">TIPS sobre el uso de la página:</span>
                        </div>
                        <div className="bg-[#f2f2f2] p-2 px-4 border-b border-white">
                            <ul className="list-disc list-inside text-gray-800">
                                <li>Si pones la flecha del ratón en la imagen triangular del lado izquierdo del nombre del menú podrás ver la descripción del mismo.</li>
                            </ul>
                        </div>

                        <div className="bg-[#e6e6e6] p-2 border-b border-white">
                            <span className="font-bold">Recomendaciones de seguridad:</span>
                        </div>
                        <div className="bg-[#f2f2f2] p-2 px-4 flex flex-col gap-1">
                            <ul className="list-disc list-inside text-gray-800 space-y-1">
                                <li>Es muy importante mantener la confidencialidad del NIP, no lo hagas del conocimiento de otras personas.</li>
                                <li>Si sospechas que alguien mas conoce tu NIP cámbialo de inmediato.</li>
                                <li>No olvides cambiar tu NIP periódicamente.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer Date/Time */}
                    <div className="text-right text-[#c00000] text-xs font-semibold mt-4 pr-1">
                        {formatDateTimeCompact(currentTime)}
                    </div>
                </div>
            );
        }

        // Profile View — visible for ALL roles, fetches live status from API
        if (activeSection === 'Mi perfil' || activeSection === 'perfil' || activeSection === 'MI PERFIL') {
            return <MiPerfil />;
        }

        // Admin section components
        if (activeSection === 'OBTENER USUARIOS') {
            return <AdminObtenerAlumnos onVerDetalles={handleVerDetalles} />;
        }

        if (activeSection === 'BUSCAR USUARIO') {
            return <AdminBuscarAlumno prefill={searchPrefill} />;
        }

        if (activeSection === 'AÑADIR USUARIO') {
            return <AdminAnadirAlumno />;
        }

        if (activeSection === 'IMPORTAR USUARIOS') {
            return <AdminImportarAlumnos />;
        }

        if (activeSection === 'ACTUALIZAR USUARIO') {
            return <AdminActualizarAlumno />;
        }

        if (activeSection === 'ELIMINAR USUARIO') {
            return <AdminEliminarAlumno />;
        }

        // Teacher section components
        if (activeSection === 'TEACHER OBTENER ALUMNOS') {
            return <TeacherObtenerAlumnos onVerDetalles={handleTeacherVerDetalles} />;
        }

        if (activeSection === 'TEACHER BUSCAR ALUMNO') {
            return <TeacherBuscarAlumno prefill={teacherSearchPrefill} />;
        }


        // Placeholder View for other sections
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex items-center justify-center animate-in fade-in duration-300">
                <div className="text-center p-8">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        {`Seccion ${activeSection}`}
                    </h2>
                    <p className="mt-2 flex items-center justify-center gap-2 text-gray-500">
                        <Clock size={16} className="text-blue-500" />
                        proximamente
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 items-stretch min-h-[calc(100vh-8rem)]">
            {/* Left Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0 flex flex-col">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-4 flex-1 flex flex-col justify-between overflow-y-auto">
                    <div className="mb-2">
                        <h3 className="text-red-600 font-bold tracking-wider mb-2">MODULO</h3>

                        {/* ── STUDENT: Alumnos accordion only ───────────────── */}
                        {isStudent && (
                            <div>
                                <button onClick={() => setIsAlumnosOpen(!isAlumnosOpen)}
                                    className="w-full flex items-center justify-between text-black hover:bg-gray-50 p-2 rounded-md font-medium transition-colors">
                                    <span>Alumnos</span>
                                    <ChevronDown size={18} className={`text-gray-500 transform transition-transform duration-200 ${isAlumnosOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isAlumnosOpen && (
                                    <div className="ml-4 mt-2 pl-2 border-l-2 border-gray-100 flex flex-col gap-1 text-sm animate-in slide-in-from-top-2 duration-300">
                                        {studentOptions.map((opt) => (
                                            <button key={opt} onClick={() => handleOptionSelect(opt)}
                                                className={`text-left p-2 rounded-md text-black hover:bg-gray-50 transition-colors ${activeSection === opt ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>
                                                {opt}
                                            </button>
                                        ))}
                                        <div className="my-2 border-t border-gray-100"></div>
                                        {subOptions.map((opt) => (
                                            <button key={opt} onClick={() => handleOptionSelect(opt)}
                                                className={`flex items-center gap-2 text-left p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-50 py-1.5 transition-colors ${activeSection === opt ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>
                                                <svg className="w-3 h-3 text-[#B08D6A] transform rotate-180 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3L1 17h18L10 3z" /></svg>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── ADMIN: Administradores accordion only ────────────── */}
                        {isAdmin && (
                            <div>
                                <button onClick={() => setIsAdminOpen(!isAdminOpen)}
                                    className="w-full flex items-center justify-between text-black hover:bg-gray-50 p-2 rounded-md font-medium transition-colors">
                                    <span>Administradores</span>
                                    <ChevronDown size={18} className={`text-gray-500 transform transition-transform duration-200 ${isAdminOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isAdminOpen && (
                                    <div className="ml-4 mt-2 pl-2 border-l-2 border-gray-100 flex flex-col gap-1 text-sm animate-in slide-in-from-top-2 duration-300">
                                        {adminOptions.map((opt) => (
                                            <button key={opt} onClick={() => handleOptionSelect(opt)}
                                                className={`text-left p-2 rounded-md text-black hover:bg-gray-50 transition-colors ${activeSection === opt ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── TEACHER: Maestros accordion only ─────────────────── */}
                        {isTeacher && (
                            <div>
                                <button onClick={() => setIsMaestrosOpen(!isMaestrosOpen)}
                                    className="w-full flex items-center justify-between text-black hover:bg-gray-50 p-2 rounded-md font-medium transition-colors">
                                    <span>Maestros</span>
                                    <ChevronDown size={18} className={`text-gray-500 transform transition-transform duration-200 ${isMaestrosOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isMaestrosOpen && (
                                    <div className="ml-4 mt-2 pl-2 border-l-2 border-gray-100 flex flex-col gap-1 text-sm animate-in slide-in-from-top-2 duration-300">
                                        {teacherOptions.map((opt) => (
                                            <button key={opt} onClick={() => handleOptionSelect(opt)}
                                                className={`text-left p-2 rounded-md text-black hover:bg-gray-50 transition-colors ${activeSection === opt ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>
                                                {teacherOptionLabels[opt] || opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bottom Sidebar Controls (Blue Separator, transparent buttons, black text) */}
                    <div className="mt-8 pt-4 border-t-2 border-[#455A6D] flex flex-col gap-2">
                        <button
                            onClick={() => handleOptionSelect('inicio')}
                            className="flex items-center gap-3 text-black hover:bg-gray-50 p-2 rounded-md font-medium transition-colors bg-transparent w-full text-left"
                        >
                            <Home size={18} className="text-gray-600" />
                            Inicio
                        </button>
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 text-black hover:bg-gray-50 p-2 rounded-md font-medium transition-colors bg-transparent w-full text-left"
                        >
                            <LogOut size={18} className="text-gray-600" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </aside>

            {/* Right Main Content */}
            <main className="flex-1 min-w-0">
                {/* Only show the top header block if we are NOT on the inicio/NSS page */}
                {activeSection !== 'inicio' && activeSection !== 'Conoce tu NSS (Número de Seguro Social)' && (
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                {activeSection === 'Mi perfil' || activeSection === 'perfil' || activeSection === 'MI PERFIL'
                                    ? 'Panel de Usuario'
                                    : (teacherOptionLabels[activeSection] || activeSection)}
                            </h1>
                        </div>
                    </div>
                )}

                {renderMainContent()}
            </main>
        </div>
    );
}
