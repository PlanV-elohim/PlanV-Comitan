import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X, User } from 'lucide-react';
import MagneticButton from './ui/MagneticButton';
import { useAuth } from '../lib/auth';

export default function Navbar({ onJoin, modalOpen = false }: { onJoin: () => void; modalOpen?: boolean }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const lastY = useRef(0);

    const { user, isAdmin } = useAuth();

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            setScrolled(y > 20);
            if (y > 80) {
                setHidden(y > lastY.current);
            } else {
                setHidden(false);
            }
            lastY.current = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (modalOpen) setMenuOpen(false);
    }, [modalOpen]);

    const links = [
        { href: "/#inicio", label: "Inicio" },
        { href: "/#campamentos", label: "Campamentos" },
        { href: "/#nosotros", label: "Nosotros" },
        { href: "/#contacto", label: "Contacto" }
    ];

    return (
        <div
            style={{
                transform: (hidden || modalOpen) ? 'translateY(-100%)' : 'translateY(0)',
                transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
            className={`fixed top-0 left-0 right-0 z-40 ${
                scrolled ? 'bg-black/95 backdrop-blur-md shadow-md' : 'bg-black/60 backdrop-blur-sm'
            } transition-colors duration-300`}
        >
            <div className="max-w-7xl mx-auto px-5 h-11 flex items-center justify-between">
                <a href="/" className="font-bold text-lg tracking-tight text-white">
                    PLAN <span className="text-primary">V</span>
                </a>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
                    {links.map(link => (
                        <a key={link.href} href={link.href} className="hover:text-primary transition-colors">
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-2">
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
                        className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
                        aria-label="Menú"
                    >
                        {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="px-6 py-4 space-y-1">
                            {links.map(link => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="block py-3 px-4 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <div className="pt-2 mt-2 border-t border-gray-100">
                                <a
                                    href="/portal"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 py-3 mt-2 rounded-xl text-base font-bold text-white bg-gradient-to-r from-primary to-orange-500 shadow-md"
                                >
                                    {(user || isAdmin) ? (<><User className="w-5 h-5" /> Mi Portal</>) : 'Regístrate / Login'}
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
