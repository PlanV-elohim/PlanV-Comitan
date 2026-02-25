import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

export default function Navbar({ onJoin }: { onJoin: () => void }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const links = [
        { href: "#inicio", label: "Inicio" },
        { href: "#campamentos", label: "Campamentos" },
        { href: "#nosotros", label: "Nosotros" },
        { href: "#contacto", label: "Contacto" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="font-bold text-2xl tracking-tight">
                    PLAN <span className="text-primary">V</span>
                </div>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-8 font-medium text-sm">
                    {links.map(link => (
                        <a key={link.href} href={link.href} className="hover:text-primary transition-colors">
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onJoin}
                        className="bg-dark text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-primary transition-colors duration-300"
                    >
                        Unirse
                    </motion.button>

                    {/* Hamburger for mobile */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        aria-label="Menú"
                    >
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
