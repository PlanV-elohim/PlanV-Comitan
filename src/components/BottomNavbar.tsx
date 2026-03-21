import { Home, Tent, User, Shield, MessageCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { motion } from 'motion/react';

export default function BottomNavbar() {
    const { user, isAdmin } = useAuth();

    const navItems = [
        { icon: Home, label: 'Inicio', href: '#inicio' },
        { icon: Tent, label: 'Eventos', href: '#campamentos' },
        { icon: User, label: 'Portal', href: '/portal' },
        { icon: MessageCircle, label: 'Chat', href: 'https://wa.me/529633989055', external: true },
    ];

    if (isAdmin) {
        navItems.push({ icon: Shield, label: 'Admin', href: '/admin' });
    }

    return (
        <motion.nav 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="md:hidden fixed bottom-6 left-6 right-6 z-[100] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-[2rem] shadow-2xl overflow-hidden shadow-black/20 pb-[env(safe-area-inset-bottom)]"
        >
            <div className="flex items-center justify-around p-3">
                {navItems.map((item) => (
                    <a 
                        key={item.label}
                        href={item.href}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        className="flex flex-col items-center gap-1 p-2 group"
                    >
                        <div className="p-2 rounded-2xl group-hover:bg-primary/10 transition-colors">
                            <item.icon className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-500 group-hover:text-primary transition-colors">
                            {item.label}
                        </span>
                    </a>
                ))}
            </div>
        </motion.nav>
    );
}
