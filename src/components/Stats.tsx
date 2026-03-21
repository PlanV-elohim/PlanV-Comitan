import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Heart, Users, Tent, Star } from 'lucide-react';

interface StatItem {
    icon: React.ReactNode;
    target: number;
    suffix: string;
    label: string;
}

function AnimatedNumber({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target]);

    return (
        <span className="tabular-nums">
            {count.toLocaleString()}{suffix}
        </span>
    );
}

export default function Stats() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.1, margin: "-100px" });

    const stats: StatItem[] = [
        { icon: <Heart className="w-7 h-7" />, target: 1000, suffix: '+', label: 'Vidas Transformadas' },
        { icon: <Tent className="w-7 h-7" />, target: 25, suffix: '+', label: 'Campamentos Realizados' },
        { icon: <Users className="w-7 h-7" />, target: 50, suffix: '+', label: 'Voluntarios Activos' },
        { icon: <Star className="w-7 h-7" />, target: 8, suffix: '', label: 'Años de Ministerio' },
    ];

    return (
        <section ref={ref} className="py-20 bg-white px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-primary rounded-2xl mb-4">
                                {stat.icon}
                            </div>
                            <div className="text-4xl md:text-5xl font-bold text-dark mb-2">
                                <AnimatedNumber target={stat.target} suffix={stat.suffix} inView={inView} />
                            </div>
                            <div className="text-gray-500 font-medium text-sm">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
