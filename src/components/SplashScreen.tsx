import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 1.5,
    duration: Math.random() * 2 + 1.5,
}));

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
    const [phase, setPhase] = useState<'letters' | 'tagline' | 'done'>('letters');

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('tagline'), 1000);
        const t2 = setTimeout(() => setPhase('done'), 2200);
        const t3 = setTimeout(onComplete, 2900);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#080808] overflow-hidden"
            exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] } }}
        >
            {/* Ambient gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.18) 0%, transparent 70%)' }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            {/* Floating particles */}
            {PARTICLES.map(p => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-red-500/40"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                    animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
                />
            ))}

            {/* Main logo */}
            <div className="relative flex flex-col items-center">
                <div className="flex items-end gap-3 mb-4">
                    {['P', 'L', 'A', 'N'].map((letter, i) => (
                        <motion.span
                            key={letter}
                            className="text-7xl md:text-9xl font-black text-white leading-none tracking-tighter"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                            initial={{ y: 80, opacity: 0, filter: 'blur(20px)' }}
                            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {letter}
                        </motion.span>
                    ))}

                    {/* The V — pops with fire effect */}
                    <motion.div
                        className="relative"
                        initial={{ scale: 0, rotate: -15, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ delay: 0.45, duration: 0.6, type: 'spring', bounce: 0.5 }}
                    >
                        <span
                            className="text-7xl md:text-9xl font-black leading-none tracking-tighter"
                            style={{ color: '#EF4444', fontFamily: "'Inter', sans-serif", textShadow: '0 0 40px rgba(239,68,68,0.8), 0 0 80px rgba(239,68,68,0.4)' }}
                        >
                            V
                        </span>
                        {/* Fire glow pulse */}
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                        >
                            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-red-500 blur-2xl" />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Tagline */}
                <AnimatePresence>
                    {phase !== 'letters' && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-px w-12 bg-red-500/60" />
                                <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">
                                    Comitán · 2025
                                </p>
                                <div className="h-px w-12 bg-red-500/60" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-900">
                <motion.div
                    className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-red-500"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 2.5, ease: 'easeInOut' }}
                />
            </div>
        </motion.div>
    );
}
