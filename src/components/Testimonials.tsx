import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
    {
        name: "María Gutiérrez",
        role: "Campamento Renacer 2025",
        text: "Fue una experiencia que cambió mi vida. Llegué con el corazón roto y encontré sanidad, propósito y una comunidad que me apoya. ¡Gracias Plan V!",
        initials: "MG",
        color: "from-red-500 to-orange-400",
        rating: 5,
    },
    {
        name: "Carlos López",
        role: "Líder Juvenil",
        text: "Llevo a mis jóvenes cada año. El equipo de Plan V crea un ambiente seguro donde Dios puede trabajar. Las dinámicas son increíbles y la palabra que se comparte es poderosa.",
        initials: "CL",
        color: "from-blue-500 to-indigo-400",
        rating: 5,
    },
    {
        name: "Ana Sofía Méndez",
        role: "Retiro Fuego 2025",
        text: "Nunca había sentido la presencia de Dios tan fuerte como en ese campamento. Las noches de fogata, la adoración y los amigos que hice... ¡no lo cambio por nada!",
        initials: "AS",
        color: "from-purple-500 to-pink-400",
        rating: 5,
    },
    {
        name: "Jorge Ruiz",
        role: "Primer campamento",
        text: "Vine sin saber qué esperar y regresé transformado. Las enseñanzas son profundas, el equipo es increíble y el lugar es hermoso. ¡Definitivamente volvería!",
        initials: "JR",
        color: "from-green-500 to-teal-400",
        rating: 5,
    },
    {
        name: "Valeria Torres",
        role: "Campamento Familiar 2024",
        text: "Vinimos en familia y fue el mejor regalo que nos pudimos dar. Ver a nuestros hijos conectarse con Dios de esa manera fue invaluable. ¡100% recomendado!",
        initials: "VT",
        color: "from-yellow-500 to-orange-400",
        rating: 5,
    },
];

const AUTOPLAY_INTERVAL = 5000;

export default function Testimonials() {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const go = (idx: number, dir: number) => {
        setDirection(dir);
        setCurrent(idx);
    };

    const next = () => go((current + 1) % testimonials.length, 1);
    const prev = () => go((current - 1 + testimonials.length) % testimonials.length, -1);

    // Auto-play
    useEffect(() => {
        timerRef.current = setInterval(next, AUTOPLAY_INTERVAL);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [current]);

    const resetTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(next, AUTOPLAY_INTERVAL);
    };

    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
    };

    const t = testimonials[current];

    return (
        <section className="py-24 bg-white dark:bg-gray-950 px-6">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block px-4 py-2 bg-red-50 dark:bg-red-900/30 text-primary rounded-full text-sm font-bold tracking-wider uppercase mb-6">
                        Testimonios
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
                        Vidas <span className="text-primary">Transformadas</span>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                        Historias reales de personas que encontraron su propósito.
                    </p>
                </motion.div>

                {/* Carousel */}
                <div className="relative">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={current}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-6">
                                {Array.from({ length: t.rating }).map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-gray-700 dark:text-gray-300 text-lg md:text-xl leading-relaxed mb-8 italic">
                                &ldquo;{t.text}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg`}>
                                    {t.initials}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-lg">{t.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Prev/Next buttons */}
                    <button
                        onClick={() => { prev(); resetTimer(); }}
                        className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => { next(); resetTimer(); }}
                        className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Dot indicators */}
                <div className="flex justify-center gap-2 mt-8">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { go(i, i > current ? 1 : -1); resetTimer(); }}
                            className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-red-600' : 'w-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
