import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Tent, History, Image as ImageIcon, MessageSquare, Menu, X, LogOut, Loader2, Users, ScanBarcode, Home as HomeIcon, Clock } from 'lucide-react';
import { useAuth } from '../../lib/auth';

const navItems = [
    { name: 'Resumen', path: '/admin', icon: LayoutDashboard },
    { name: 'Campamentos', path: '/admin/campamentos', icon: Tent },
    { name: 'Cabañas y Log.', path: '/admin/cabanas', icon: HomeIcon },
    { name: 'Reservaciones', path: '/admin/reservaciones', icon: Users },
    { name: 'Escáner QR', path: '/admin/scanner', icon: ScanBarcode },
    { name: 'Timeline Histórico', path: '/admin/timeline', icon: History },
    { name: 'Galería General', path: '/admin/galeria', icon: ImageIcon },
    { name: 'Buzón Contacto', path: '/admin/contacto', icon: MessageSquare },
    { name: 'Gestión Itinerario', path: '/admin/itinerario', icon: Clock },
];

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { isAdmin, loading, logoutAdmin } = useAuth();

    // Close sidebar on mobile when route changes
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="flex bg-gray-50 dark:bg-gray-950 min-h-[100dvh] text-gray-900 dark:text-gray-100 selection:bg-primary/30 font-sans">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-40 flex items-center justify-between px-4">
                <div className="font-bold text-xl tracking-tight">PLAN <span className="text-primary">V</span> Dashboard</div>
                <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* Sidebar (Desktop) + Drawer (Mobile) */}
            <AnimatePresence>
                {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
                    <>
                        {/* Backdrop for mobile */}
                        {sidebarOpen && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                            />
                        )}

                        {/* Sidebar */}
                        <motion.aside
                            initial={typeof window !== 'undefined' && window.innerWidth < 1024 ? { x: '-100%' } : { x: 0 }}
                            animate={{ x: 0 }}
                            exit={typeof window !== 'undefined' && window.innerWidth < 1024 ? { x: '-100%' } : { x: 0 }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                            className={`fixed lg:sticky top-0 left-0 z-50 w-72 h-[100dvh] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-2xl lg:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                        >
                            <div className="h-16 lg:h-24 flex items-center justify-between px-6 lg:px-8 border-b border-gray-100 dark:border-gray-800/50">
                                <div className="font-bold text-2xl tracking-tight">
                                    PLAN <span className="text-primary">V</span> <span className="font-light text-gray-400 dark:text-gray-500 text-lg">Admin</span>
                                </div>
                                <button className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors" onClick={() => setSidebarOpen(false)}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                                    const Icon = item.icon;
                                    
                                    return (
                                        <Link 
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                                                isActive 
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-4 lg:p-6 border-t border-gray-100 dark:border-gray-800/50">
                                <button 
                                    onClick={() => {
                                        logoutAdmin();
                                        window.location.href = '/';
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                                >
                                    <LogOut className="w-5 h-5 opacity-70" />
                                    Cerrar Sesión Segura
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto overflow-x-hidden pt-16 pb-20 lg:pt-0 lg:pb-0 scroll-smooth">
                <div className="flex-1 p-4 sm:p-6 lg:p-10 w-full max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation Bar styled like a Native App */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe z-40">
                <div className="flex justify-around items-center p-2">
                    <Link to="/admin" onClick={() => setSidebarOpen(false)} className={`flex flex-col items-center p-2 rounded-2xl w-full transition-colors ${location.pathname === '/admin' ? 'text-primary' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <LayoutDashboard className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Inicio</span>
                    </Link>
                    <Link to="/admin/reservaciones" onClick={() => setSidebarOpen(false)} className={`flex flex-col items-center p-2 rounded-2xl w-full transition-colors ${location.pathname.startsWith('/admin/reservaciones') ? 'text-primary' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <Users className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Pases</span>
                    </Link>
                    <Link to="/admin/scanner" onClick={() => setSidebarOpen(false)} className={`flex flex-col items-center p-2 rounded-2xl w-full transition-colors ${location.pathname.startsWith('/admin/scanner') ? 'text-primary' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <ScanBarcode className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Escáner</span>
                    </Link>
                    <button onClick={() => setSidebarOpen(true)} className={`flex flex-col items-center p-2 rounded-2xl w-full transition-colors ${sidebarOpen ? 'text-primary' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <Menu className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Más</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
