import { Tent, User, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface NavItem {
    icon: any;
    label: string;
    href: string;
    sectionId: string | null;
    external?: boolean;
}

export default function BottomNavbar({ modalOpen = false }: { modalOpen?: boolean }) {
    const [activeLabel, setActiveLabel] = useState<string | null>(null);
    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Scroll-to-hide logic
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Show bar when scrolling up, hide when scrolling down
            // Threshold of 10px to avoid flickering on micro-scrolls
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                if (visible) setVisible(false);
            } else if (currentScrollY < lastScrollY) {
                if (!visible) setVisible(true);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY, visible]);

    // Scroll spy for "Eventos" section
    useEffect(() => {
        const el = document.getElementById('campamentos');
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { 
                if (entry.isIntersecting) setActiveLabel('Eventos'); 
                else if (activeLabel === 'Eventos') setActiveLabel(null);
            },
            { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [activeLabel]);

    const navItems: NavItem[] = [
        { icon: Tent,          label: 'Eventos',  href: '#campamentos',  sectionId: 'campamentos' },
        { icon: User,          label: 'Perfil',   href: '/portal',       sectionId: null },
        { icon: MessageCircle, label: 'Soporte',  href: 'https://wa.me/529633989055', sectionId: null, external: true },
    ];

    const handleItemClick = (e: React.MouseEvent, item: NavItem) => {
        e.preventDefault();
        setActiveLabel(item.label);
        
        // Haptic feedback
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(12);
        }

        // Delay to let the user see the "red" state and pulse animation
        setTimeout(() => {
            if (item.external) {
                window.open(item.href, '_blank', 'noopener,noreferrer');
            } else if (item.href.startsWith('#')) {
                const id = item.href.replace('#', '');
                const target = document.getElementById(id);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                window.location.href = item.href;
            }
        }, 300); 
    };

    return (
        <div 
            style={{
                transform: (modalOpen || !visible) ? 'translateY(calc(100% + 40px))' : 'translateY(0)',
                transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
            }}
            className="md:hidden fixed bottom-5 left-12 right-12 z-[100] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-2xl shadow-black/20 pb-[env(safe-area-inset-bottom)] transition-colors duration-300"
        >
            <div className="flex items-center justify-around p-2">
                {navItems.map((item) => {
                    const isActive = activeLabel === item.label;

                    return (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={(e) => handleItemClick(e, item)}
                            className="flex flex-col items-center gap-0.5 p-2"
                        >
                            <motion.div
                                animate={isActive ? { 
                                    scale: 1.25, 
                                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                    boxShadow: '0 0 15px rgba(239, 68, 68, 0.1)'
                                } : { 
                                    scale: 1, 
                                    backgroundColor: 'transparent',
                                    boxShadow: '0 0 0px transparent'
                                }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                className={`p-2 rounded-2xl transition-colors ${
                                    isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                                }`}
                            >
                                <item.icon className="w-6 h-6" />
                            </motion.div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-500'
                            }`}>
                                {item.label}
                            </span>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
