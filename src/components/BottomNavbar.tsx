import { Home, Tent, User, Shield, MessageCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useEffect, useRef, useState } from 'react';

export default function BottomNavbar() {
    const { user, isAdmin } = useAuth();
    const [hidden, setHidden] = useState(false);
    const lastY = useRef(0);

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
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
        <div
            style={{
                transform: hidden ? 'translateY(calc(100% + 24px))' : 'translateY(0)',
                transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
            }}
            className="md:hidden fixed bottom-6 left-6 right-6 z-[100] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-[2rem] shadow-2xl shadow-black/20 pb-[env(safe-area-inset-bottom)]"
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
        </div>
    );
}
