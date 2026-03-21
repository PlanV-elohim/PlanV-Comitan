import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, User } from 'lucide-react';
import MagneticButton from './ui/MagneticButton';
import { useAuth } from '../lib/auth';

export default function Navbar({ onJoin }: { onJoin: () => void }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const { user, isAdmin } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const links = [
        { href: "/#inicio", label: "Inicio" },
        { href: "/#campamentos", label: "Campamentos" },
        { href: "/#nosotros", label: "Nosotros" },
        { href: "/#contacto", label: "Contacto" }
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
            scrolled ? 'bg-black/95 backdrop-blur-md shadow-lg' : 'bg-black/80 backdrop-blur-sm'
        }`}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="font-bold text-2xl tracking-tight text-white">
                    PLAN <span className="text-primary">V</span>
                </div>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-300">
                    {links.map(link => (
                        <a key={link.href} href={link.href} className="hover:text-primary transition-colors">
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    {/* Profile / CTA button - Hidden on mobile if bottom nav is active */}
                    {(user || isAdmin) ? (
                        <a href="/portal" className="hidden md:flex items-center justify-center w-10 h-10 bg-gradient-to-tr from-primary to-orange-500 text-white rounded-full shadow-lg shadow-primary/30 hover:scale-110 transition-transform border-2 border-white/20">
                            <User className="w-5 h-5" />
                        </a>
                    ) : (
                        <div className="hidden md:block">
                            <MagneticButton>
                                <a href="/portal" className="flex items-center gap-2 bg-gradient-to-r from-primary to-orange-500 text-white hover:shadow-lg hover:shadow-primary/40 px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 transform hover:scale-105 border border-primary/20">
                                    Regístrate
                                </a>
                            </MagneticButton>
                        </div>
                    )}

                    {/* Hamburger for mobile — always visible and distinctive */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                        aria-label="Menú"
                    >
                        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                            <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
                                <a
                                    href="/portal"
                                    onClick={() => setMenuOpen(false)}
                                    className="block text-center py-3 mt-2 rounded-xl text-base font-bold text-white bg-gradient-to-r from-primary to-orange-500 shadow-md flex items-center justify-center gap-2"
                                >
                                    {(user || isAdmin) ? (
                                        <>
                                            <User className="w-5 h-5" />
                                            Mi Portal
                                        </>
                                    ) : (
                                        'Regístrate / Login'
                                    )}
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
