import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, User } from 'lucide-react';
import MagneticButton from './ui/MagneticButton';
import { useAuth } from '../lib/auth';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ onJoin, modalOpen = false }: { onJoin: () => void; modalOpen?: boolean }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('inicio');
    const lastY = useRef(0);

    const { user, isAdmin } = useAuth();

    const links = [
        { href: "/#inicio", label: "Inicio", id: "inicio" },
        { href: "/#campamentos", label: "Campamentos", id: "campamentos" },
        { href: "/#nosotros", label: "Nosotros", id: "nosotros" },
        { href: "/#contacto", label: "Contacto", id: "contacto" },
    ];

    // Scroll spy — passive IntersectionObserver, zero scroll listener cost
    useEffect(() => {
        const observers: IntersectionObserver[] = [];
        links.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
                { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
            );
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach(o => o.disconnect());
    }, []);

    useEffect(() => {
        const onScroll = () => { setScrolled(window.scrollY > 20); };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (modalOpen) setMenuOpen(false);
    }, [modalOpen]);

    return (
        <div
            style={{
                transform: modalOpen ? 'translateY(-100%)' : 'translateY(0)',
                transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), background-color 0.5s ease',
            }}
            className={`fixed top-0 left-0 right-0 z-40 ${(scrolled || menuOpen) ? 'bg-black shadow-xl' : 'bg-transparent shadow-none border-none'
                }`}
        >
            <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between">
                <a href="/" className="flex items-center shrink-0">
                    <img
                        src="/PLAN V EN CIRCULO.svg"
                        alt="Plan V"
                        className="h-18 w-auto"
                        draggable="false"
                    />
                </a>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {links.map(link => {
                        const isActive = activeSection === link.id;
                        return (
                            <a
                                key={link.href}
                                href={link.href}
                                className={`relative flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                {link.label}
                                {/* Active dot */}
                                <span className={`block h-0.5 w-full rounded-full bg-primary transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'
                                    }`} />
                            </a>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle className="w-8 h-8 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hidden md:flex" />

                    {(user || isAdmin) ? (
                        <a href="/portal" className="hidden md:flex items-center justify-center w-8 h-8 bg-gradient-to-tr from-primary to-orange-500 text-white rounded-full shadow-md shadow-primary/30 hover:scale-110 transition-transform border-2 border-white/20">
                            <User className="w-3.5 h-3.5" />
                        </a>
                    ) : (
                        <div className="hidden md:block">
                            <MagneticButton>
                                <a href="/portal" className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-orange-500 text-white px-3.5 py-1 rounded-full text-xs font-bold tracking-wide transition-all hover:scale-105">
                                    Regístrate
                                </a>
                            </MagneticButton>
                        </div>
                    )}

                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
                        aria-label="Menú"
                    >
                        <motion.div
                            animate={{ rotate: menuOpen ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </motion.div>
                    </button>
                </div>
            </div>

            {/* Mobile menu — GPU Accelerated (opacity + translateY) */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            opacity: { duration: 0.2 }
                        }}
                        className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden"
                    >
                        <div className="px-6 py-4 space-y-1">
                            {/* Theme Toggle in Mobile Menu */}
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-50 dark:border-gray-800">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Modo Oscuro</span>
                                <ThemeToggle className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800" />
                            </div>
                            {links.map((link, i) => {
                                const isActive = activeSection === link.id;
                                return (
                                    <motion.a
                                        key={link.href}
                                        href={link.href}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 + 0.1 }}
                                        onClick={() => setMenuOpen(false)}
                                        className={`flex items-center gap-2 py-3 px-4 rounded-xl text-base font-medium transition-colors ${isActive
                                                ? 'text-primary bg-primary/8 font-semibold'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                                            }`}
                                    >
                                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                                        {link.label}
                                    </motion.a>
                                );
                            })}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="pt-2 mt-2 border-t border-gray-100"
                            >
                                <a
                                    href="/portal"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 py-3 mt-2 rounded-xl text-base font-bold text-white bg-gradient-to-r from-primary to-orange-500 shadow-md"
                                >
                                    {(user || isAdmin) ? (<><User className="w-5 h-5" /> Mi Portal</>) : 'Regístrate / Login'}
                                </a>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
