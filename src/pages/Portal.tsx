
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import CampInfoModal from '../components/CampInfoModal';
import BoardingPassModal from '../components/BoardingPassModal';
import ItineraryModal from '../components/ItineraryModal';
import { 
    Tent, 
    Calendar as CalendarIcon, 
    LogOut, 
    User as UserIcon, 
    Settings, 
    CalendarDays, 
    Phone, 
    Save, 
    Loader2, 
    ArrowRight, 
    Info, 
    FileText, 
    QrCode, 
    Mail, 
    Plus, 
    Users,
    Clock, 
    Award, 
    ShieldCheck, 
    Zap, 
    Star 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabaseApi } from '../lib/api';

type TabType = 'profile' | 'reservations' | 'camps';

export default function Portal() {
    const { user, loading, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [statusAction, setStatusAction] = useState({ loading: false, error: '' });
    
    // Portal States
    const [activeTab, setActiveTab] = useState<TabType>('reservations');
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [camps, setCamps] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [infoCamp, setInfoCamp] = useState<any>(null);
    const [itineraryCamp, setItineraryCamp] = useState<any>(null);
    const [boardingPassReg, setBoardingPassReg] = useState<any>(null);
    
    // Profile Edit States
    const [profileName, setProfileName] = useState('');
    const [profilePhone, setProfilePhone] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileUpdateMsg, setProfileUpdateMsg] = useState({ type: '', text: '' });

    // Group Member States
    const [members, setMembers] = useState<any[]>([]);
    const [newMemberName, setNewMemberName] = useState<Record<string, {first: string, last: string}>>({});
    const [loadingMembers, setLoadingMembers] = useState<Record<string, boolean>>({});

    // Achievement States
    const [achievements, setAchievements] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            loadUserData();
            // Load initial metadata
            const meta = user.user_metadata || {};
            setProfileName(meta.name || '');
            setProfilePhone(meta.phone || '');
        }

        const handleFocus = () => {
            if (user) loadUserData();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [user]);

    const loadUserData = async () => {
        setIsLoadingData(true);
        try {
            // Fetch camps
            const { data: campsData } = await supabase.from('camps').select('*').order('date_string');
            if (campsData) setCamps(campsData);

            // Fetch user's registrations by email
            if (!user?.email) return;
            const cleanEmail = user.email.trim().toLowerCase();
            const { data: regsData } = await supabase
                .from('registrations')
                .select('*')
                .eq('responsable_email', cleanEmail)
                .order('created_at', { ascending: false });
            
            if (regsData) {
                setRegistrations(regsData);
                const regIds = regsData.map(r => r.id);
                if (regIds.length > 0) {
                    const { data: memsData } = await supabase.from('group_members').select('*').in('registration_id', regIds);
                    if (memsData) setMembers(memsData);
                }
            }

            // Fetch achievements
            const { data: achData } = await supabase.from('user_achievements').select('*').eq('user_email', cleanEmail);
            if (achData) setAchievements(achData);

            // Logic to auto-grant badges
            if (regsData && regsData.length > 0) {
                // Badge: "Expediente Completo" if at least one registration is medical_cleared
                if (regsData.some(r => r.medical_cleared)) {
                    await supabaseApi.achievements.grant(cleanEmail, 'expediente_completo');
                }
                // Badge: "Veterano" if more than 1 registration
                if (regsData.length > 1) {
                    await supabaseApi.achievements.grant(cleanEmail, 'veterano');
                }
                // Update achievements list if any were granted (simulated reload logic or just wait for next focus)
            }

        } catch (error) {
            console.error("Error loading user data", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusAction({ loading: true, error: '' });
        
        try {
            if (mode === 'register') {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setStatusAction({ loading: false, error: 'Revisa tu correo para confirmar el registro (si es requerido) o intenta iniciar sesión.' });
                // En modo desarrollo Supabase autologuea si no hay confirmación obligatoria.
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err: any) {
            setStatusAction({ loading: false, error: err.message || 'Error de autenticación' });
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        setProfileUpdateMsg({ type: '', text: '' });
        
        try {
            const { error } = await supabase.auth.updateUser({
                data: { name: profileName, phone: profilePhone }
            });
            if (error) throw error;
            setProfileUpdateMsg({ type: 'success', text: 'Perfil actualizado exitosamente.' });
        } catch (err: any) {
            setProfileUpdateMsg({ type: 'error', text: err.message || 'Error al guardar.' });
        } finally {
            setIsSavingProfile(false);
            setTimeout(() => setProfileUpdateMsg({ type: '', text: '' }), 4000);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Loader2 className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"/></div>;

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-800">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-tr from-primary to-orange-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-primary/30">
                            <UserIcon className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold dark:text-white">Portal de Usuarios</h1>
                        <p className="text-gray-500 text-sm mt-1">{mode === 'login' ? 'Ingresa a tu cuenta' : 'Regístrate para gestionar todo'}</p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <input
                            type="email"
                            required
                            placeholder="Correo Electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                        />
                        <input
                            type="password"
                            required
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                        />
                        
                        {statusAction.error && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-500/10 p-3 rounded-xl border border-red-100 dark:border-red-900/50">
                                {statusAction.error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={statusAction.loading}
                            className="w-full bg-gradient-to-r from-primary to-orange-500 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
                        >
                            {statusAction.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta')}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center space-y-4">
                        <button 
                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                            className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
                        >
                            {mode === 'login' ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                        
                        {isAdmin && (
                            <a href="/admin" className="block w-full py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                                <Settings className="w-4 h-4" /> Ir al Panel de Administración
                            </a>
                        )}
                    </div>
                    
                    <a href="/" className="block text-center mt-6 text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">&larr; Volver a la página principal</a>
                </motion.div>
            </div>
        );
    }

    const userName = user.user_metadata?.name || user.email?.split('@')[0];
    const userInitials = userName?.substring(0, 2).toUpperCase();
    const futureCamps = camps.filter(c => c.status !== 'history');

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-0 font-sans">
            {/* Desktop / Global Top Bar */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <a href="/" className="font-bold text-xl sm:text-2xl tracking-tight text-gray-900 dark:text-white">
                        PLAN <span className="text-primary">V</span>
                    </a>
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                                {userInitials}
                            </div>
                            <div className="text-sm hidden md:block">
                                <p className="font-semibold text-gray-900 dark:text-white leading-tight">{userName}</p>
                                <p className="text-gray-500 text-xs">Portal Personal</p>
                            </div>
                            {isAdmin && (
                                <a href="/admin" className="ml-2 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-1.5">
                                    <Settings className="w-3 h-3" /> Panel Admin
                                </a>
                            )}
                        </div>
                        <button onClick={handleLogout} className="p-2 sm:px-4 sm:py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors flex items-center gap-2">
                            <LogOut className="w-5 h-5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8">
                {/* Desktop Side Navigation */}
                <aside className="hidden md:flex flex-col w-64 shrink-0 space-y-2 sticky top-[104px] self-start">
                    <button onClick={() => setActiveTab('reservations')} className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-medium transition-all ${activeTab === 'reservations' ? 'bg-white dark:bg-gray-900 text-primary shadow-sm border border-gray-100 dark:border-gray-800' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white'}`}>
                        <Tent className="w-5 h-5" /> Mis Reservas
                    </button>
                    <button onClick={() => setActiveTab('camps')} className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-medium transition-all ${activeTab === 'camps' ? 'bg-white dark:bg-gray-900 text-primary shadow-sm border border-gray-100 dark:border-gray-800' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white'}`}>
                        <CalendarDays className="w-5 h-5" /> Explorar Campos
                    </button>
                    <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-medium transition-all ${activeTab === 'profile' ? 'bg-white dark:bg-gray-900 text-primary shadow-sm border border-gray-100 dark:border-gray-800' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white'}`}>
                        <Settings className="w-5 h-5" /> Mi Perfil
                    </button>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        {/* -------------------- RESERVATIONS TAB -------------------- */}
                        {activeTab === 'reservations' && (
                            <motion.div key="res" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                <div className="mb-8">
                                    <h2 className="text-2xl sm:text-3xl font-bold dark:text-white tracking-tight">Mis Reservas Activas</h2>
                                    <p className="text-gray-500 mt-2">Gestiona y consulta los campamentos a los que estás inscrito.</p>
                                </div>
                                
                                {isLoadingData ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={`h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse ${i===2?'delay-75':(i===3?'delay-150':'')}`}></div>
                                        ))}
                                    </div>
                                ) : registrations.length === 0 ? (
                                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-800">
                                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Tent className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sin reservaciones</h3>
                                        <p className="text-gray-500 mb-6">Aún no te has enrolado a ninguna aventura con nosotros.</p>
                                        <button onClick={() => setActiveTab('camps')} className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors">
                                            Explorar próximos eventos <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid gap-6">
                                        {registrations.map((reg, index) => {
                                            const camp = camps.find(c => c.id === reg.camp_id);
                                            return (
                                                <div key={reg.id || index} className="flex flex-col gap-2">
                                                    <div className="group bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all flex flex-col sm:flex-row justify-between gap-6 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                                                    
                                                    <div className="flex-1 space-y-4 z-10">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider rounded-full">Confirmado</span>
                                                                {reg.reg_type === 'group' && <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1"><UserIcon className="w-3 h-3"/> Grupal</span>}
                                                            </div>
                                                            <h3 className="text-2xl font-bold dark:text-white tracking-tight">{camp?.title || 'Campamento Exclusivo'}</h3>
                                                        </div>
                                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                                                                <CalendarIcon className="w-4 h-4 text-primary" /> {camp?.date_string || 'Fechas pendientes'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 flex flex-col items-center justify-center sm:justify-end border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-6 sm:pt-0 sm:pl-8 z-10 gap-3">
                                                        <div className="text-center w-full">
                                                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Cupos Reservados</p>
                                                            <div className="text-4xl font-black text-gray-900 dark:text-white leading-none">{reg.group_size || 1}</div>
                                                        </div>
                                                        {reg.medical_cleared ? (
                                                            <button 
                                                                onClick={() => setBoardingPassReg({ type: 'main', reg, camp })}
                                                                className="w-full text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                                                            >
                                                                <QrCode className="w-4 h-4" /> Pase Abordar
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => navigate(`/ficha-medica/${reg.id}`)}
                                                                className="w-full text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 animate-pulse"
                                                            >
                                                                <FileText className="w-4 h-4" /> Llenar Ficha
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => setInfoCamp(camp)} 
                                                            className="w-full text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Info className="w-4 h-4" /> Detalles
                                                        </button>
                                                        <button 
                                                            onClick={() => setItineraryCamp(camp)} 
                                                            className="w-full text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Clock className="w-4 h-4" /> Itinerario
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Group Members UI */}
                                                {reg.reg_type === 'group' && (
                                                    <div className="border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-4 sm:p-6 mt-4 shadow-inner">
                                                        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2"><Users className="w-4 h-4"/> Acompañantes ({members.filter(m => m.registration_id === reg.id).length} / {reg.group_size - 1})</h4>
                                                        <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mb-4">
                                                            Ingresa los nombres de tus acompañantes para que el administrador pueda asignarles Cabañas individualmente. Cada acompañante generará su propio Pase QR.
                                                        </p>
                                                        
                                                        <div className="space-y-3">
                                                            {members.filter(m => m.registration_id === reg.id).map((member, idx) => (
                                                                <div key={member.id} className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-800/50 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                                                                    <div className="flex-1">
                                                                        <p className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-tight">{idx+1}. {member.first_name} {member.last_name}</p>
                                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Cabaña: <span className="text-primary">{member.cabin_id ? 'Asignada' : 'Pendiente'}</span></span>
                                                                            <span className={`text-[10px] uppercase tracking-widest font-black ${member.medical_cleared ? 'text-green-600' : 'text-red-500'}`}>
                                                                                Ficha: {member.medical_cleared ? 'COMPLETADA ✓' : 'FALTA ✗'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {member.medical_cleared ? (
                                                                            <button 
                                                                                onClick={() => setBoardingPassReg({ type: 'member', member, reg, camp })}
                                                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl text-xs font-black transition-all hover:scale-105 shadow-sm"
                                                                            >
                                                                                <QrCode className="w-4 h-4" /> PASE QR
                                                                            </button>
                                                                        ) : (
                                                                            <button 
                                                                                onClick={() => navigate(`/ficha-medica/${reg.id}?member_id=${member.id}`)}
                                                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-xl text-xs font-black transition-all hover:scale-105 shadow-lg shadow-red-600/20 active:scale-95"
                                                                            >
                                                                                <FileText className="w-4 h-4" /> LLENAR FICHA
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            
                                                            {members.filter(m => m.registration_id === reg.id).length < (reg.group_size - 1) && (
                                                                <form 
                                                                    onSubmit={async (e) => {
                                                                        e.preventDefault();
                                                                        const currentInput = newMemberName[reg.id];
                                                                        if (!currentInput?.first || !currentInput?.last) return;
                                                                        setLoadingMembers(p => ({...p, [reg.id]: true}));
                                                                        try {
                                                                            const data = await supabaseApi.groupMembers.create({
                                                                                registration_id: reg.id,
                                                                                first_name: currentInput.first,
                                                                                last_name: currentInput.last
                                                                            });
                                                                            setMembers(prev => [...prev, data[0]]);
                                                                            setNewMemberName(p => ({...p, [reg.id]: {first:'', last:''}}));
                                                                        } catch (error) {
                                                                            console.error("Error creating member", error);
                                                                        } finally {
                                                                            setLoadingMembers(p => ({...p, [reg.id]: false}));
                                                                        }
                                                                    }}
                                                                    className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-800/50 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row gap-2 shadow-sm"
                                                                >
                                                                    <input 
                                                                        required placeholder="Nombre(s)" 
                                                                        value={newMemberName[reg.id]?.first || ''}
                                                                        onChange={e => setNewMemberName(p => ({...p, [reg.id]: {...(p[reg.id]||{}), first: e.target.value}}))}
                                                                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none dark:text-white"
                                                                    />
                                                                    <input 
                                                                        required placeholder="Apellido(s)" 
                                                                        value={newMemberName[reg.id]?.last || ''}
                                                                        onChange={e => setNewMemberName(p => ({...p, [reg.id]: {...(p[reg.id]||{}), last: e.target.value}}))}
                                                                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none dark:text-white"
                                                                    />
                                                                    <button disabled={loadingMembers[reg.id]} type="submit" className="sm:w-auto w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2 sm:mt-0">
                                                                        {loadingMembers[reg.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4"/>} Agregar
                                                                    </button>
                                                                </form>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        );
                                    })}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* -------------------- CAMPS TAB -------------------- */}
                        {activeTab === 'camps' && (
                            <motion.div key="cam" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                <div className="mb-8">
                                    <h2 className="text-2xl sm:text-3xl font-bold dark:text-white tracking-tight">Próximos Campamentos</h2>
                                    <p className="text-gray-500 mt-2">Encuentra una fecha y apúntate a nuestra siguiente expedición.</p>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    {futureCamps.map(camp => {
                                        const alreadyRegistered = registrations.some(r => r.camp_id === camp.id);
                                        return (
                                        <div key={camp.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm flex flex-col group hover:shadow-xl hover:border-primary/50 transition-all">
                                            <div className="h-48 overflow-hidden relative">
                                                {alreadyRegistered && (
                                                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                                        ✓ Ya inscrito
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                                                <img src={camp.image_url || 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7'} alt={camp.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <h3 className="text-xl font-bold dark:text-white mb-2">{camp.title}</h3>
                                                <div className="flex gap-4 text-sm text-gray-500 mb-6 font-medium">
                                                    <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4"/> {camp.date_string}</span>
                                                    <span className="flex items-center gap-1.5"><UserIcon className="w-4 h-4"/> {camp.capacity} cupos</span>
                                                </div>
                                                {alreadyRegistered ? (
                                                    <div className="mt-auto space-y-2">
                                                        <div className="w-full text-center py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-400 text-green-700 dark:text-green-400 font-bold flex items-center justify-center gap-2">
                                                            ✓ Ya te suscribiste
                                                        </div>
                                                        <button onClick={() => setActiveTab('reservations')} className="w-full text-center py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                                                            Ver mis reservas →
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <a href={`/#campamentos`} className="mt-auto w-full text-center py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors">
                                                        Ver detalles e Inscribirse
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        );
                                    })}
                                    {futureCamps.length === 0 && (
                                        <div className="col-span-2 text-center py-12 text-gray-500">
                                            No hay campamentos publicados en este momento.
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* -------------------- PROFILE TAB -------------------- */}
                        {activeTab === 'profile' && (
                            <motion.div key="pro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                <div className="mb-8">
                                    <h2 className="text-2xl sm:text-3xl font-bold dark:text-white tracking-tight">Mi Perfil Personal</h2>
                                    <p className="text-gray-500 mt-2">Actualiza tu información de contacto para agilizar tus reservas.</p>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 max-w-2xl">
                                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
                                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold shadow-inner">
                                            {userInitials}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg dark:text-white">{user.email}</p>
                                            <p className="text-sm text-gray-500">Credencial Principal de Acceso</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <UserIcon className="w-4 h-4" /> Nombre Completo
                                            </label>
                                            <input 
                                                type="text" 
                                                value={profileName} 
                                                onChange={e => setProfileName(e.target.value)} 
                                                placeholder="Ej. Juan Pérez"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <Phone className="w-4 h-4" /> Número de Teléfono
                                            </label>
                                            <input 
                                                type="tel" 
                                                value={profilePhone} 
                                                onChange={e => setProfilePhone(e.target.value)} 
                                                placeholder="Ej. 123 456 7890"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                            />
                                        </div>

                                        {profileUpdateMsg.text && (
                                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-sm font-medium p-3 rounded-xl border ${profileUpdateMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400'}`}>
                                                {profileUpdateMsg.text}
                                            </motion.p>
                                        )}

                                        <button disabled={isSavingProfile} type="submit" className="mt-4 bg-dark dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
                                            {isSavingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            {isSavingProfile ? 'Guardando...' : 'Guardar Cambios'}
                                        </button>
                                    </div>
                                </form>

                                {/* Achievements Section */}
                                <div className="max-w-2xl mt-12 space-y-6">
                                    <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                        <Award className="w-6 h-6 text-yellow-500" /> Mis Logros e Insignias
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {achievements.map((ach) => {
                                            const isExpediente = ach.badge_id === 'expediente_completo';
                                            const isVeterano = ach.badge_id === 'veterano';
                                            
                                            return (
                                                <motion.div 
                                                    key={ach.id}
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center shadow-sm"
                                                >
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${isExpediente ? 'bg-green-100 text-green-600' : (isVeterano ? 'bg-purple-100 text-purple-600' : 'bg-primary/10 text-primary')}`}>
                                                        {isExpediente ? <ShieldCheck className="w-6 h-6" /> : (isVeterano ? <Star className="w-6 h-6" /> : <Zap className="w-6 h-6" />)}
                                                    </div>
                                                    <p className="text-xs font-black uppercase tracking-tighter dark:text-white">
                                                        {isExpediente ? 'Expediente OK' : (isVeterano ? 'Veterano' : ach.badge_id)}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 mt-1">Conseguido el {new Date(ach.earned_at).toLocaleDateString()}</p>
                                                </motion.div>
                                            );
                                        })}
                                        {achievements.length === 0 && (
                                            <div className="col-span-full py-8 text-center bg-gray-100 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                                                <p className="text-gray-400 text-sm font-medium">Aún no has desbloqueado insignias.</p>
                                                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">¡Completa tu ficha médica para empezar!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe z-40">
                <div className="flex justify-around items-center p-2">
                    <button onClick={() => setActiveTab('reservations')} className={`flex flex-col items-center p-3 rounded-2xl w-full transition-colors ${activeTab === 'reservations' ? 'text-primary' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <Tent className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Reservas</span>
                    </button>
                    <button onClick={() => setActiveTab('camps')} className={`flex flex-col items-center p-3 rounded-2xl w-full transition-colors ${activeTab === 'camps' ? 'text-primary' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <CalendarDays className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Explorar</span>
                    </button>
                    <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center p-3 rounded-2xl w-full transition-colors ${activeTab === 'profile' ? 'text-primary' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <Settings className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Perfil</span>
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {infoCamp && (
                    <CampInfoModal camp={infoCamp} onClose={() => setInfoCamp(null)} onRegister={() => {}} hideRegisterButton={true} />
                )}
                {itineraryCamp && (
                    <ItineraryModal camp={itineraryCamp} onClose={() => setItineraryCamp(null)} />
                )}
                {boardingPassReg && (
                    <BoardingPassModal 
                        registration={boardingPassReg.type === 'member' ? boardingPassReg.member : boardingPassReg.reg} 
                        camp={boardingPassReg.camp}
                        userName={boardingPassReg.type === 'member' ? `${boardingPassReg.member.first_name} ${boardingPassReg.member.last_name}` : `${boardingPassReg.reg.responsable_name} ${boardingPassReg.reg.responsable_lastname}`}
                        onClose={() => setBoardingPassReg(null)} 
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

