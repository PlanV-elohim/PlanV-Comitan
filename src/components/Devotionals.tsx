import { motion } from 'motion/react';
import { BookOpen, ArrowRight, Calendar } from 'lucide-react';

const DEVOTIONALS = [
    {
        title: "Deja que Dios escriba tu historia",
        excerpt: "A veces queremos controlar cada detalle de nuestra vida, pero la paz verdadera llega cuando confiamos en que Él tiene un plan mucho mejor que el nuestro.",
        date: "22 Mar 2025",
        category: "Fe y Propósito",
        readTime: "3 min",
        emoji: "✍️",
        color: "from-red-500/10 to-orange-500/10 dark:from-red-900/20 dark:to-orange-900/20",
        accent: "text-red-600 dark:text-red-400",
    },
    {
        title: "El poder de la comunidad",
        excerpt: "Dios no nos creó para vivir solos. El hierro afila al hierro, y cuando nos reunimos en su nombre, algo sobrenatural sucede. Eso es Plan V.",
        date: "15 Mar 2025",
        category: "Comunidad",
        readTime: "4 min",
        emoji: "🔥",
        color: "from-blue-500/10 to-indigo-500/10 dark:from-blue-900/20 dark:to-indigo-900/20",
        accent: "text-blue-600 dark:text-blue-400",
    },
    {
        title: "Propósito en el desierto",
        excerpt: "Los tiempos difíciles no son el fin de tu historia. Son el lugar donde Dios moldea tu carácter y te prepara para algo más grande de lo que imaginas.",
        date: "8 Mar 2025",
        category: "Crecimiento",
        readTime: "5 min",
        emoji: "🌿",
        color: "from-green-500/10 to-teal-500/10 dark:from-green-900/20 dark:to-teal-900/20",
        accent: "text-green-600 dark:text-green-400",
    },
];

export default function Devotionals() {
    return (
        <section id="devocionales" className="py-20 md:py-24 bg-white dark:bg-gray-950 px-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block px-4 py-2 bg-red-50 dark:bg-red-900/30 text-primary rounded-full text-sm font-bold tracking-wider uppercase mb-6">
                        Blog
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
                        Devocionales y <span className="text-primary">Reflexiones</span>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                        Palabras que alimentan el espíritu. Nuevos artículos cada semana.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {DEVOTIONALS.map((dev, i) => (
                        <motion.article
                            key={dev.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ delay: i * 0.12 }}
                            whileHover={{ y: -4 }}
                            className={`group rounded-3xl p-8 bg-gradient-to-br ${dev.color} border border-gray-100 dark:border-gray-800 cursor-pointer transition-shadow hover:shadow-xl`}
                        >
                            {/* Emoji + Category */}
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-4xl">{dev.emoji}</span>
                                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/60 dark:bg-black/30 ${dev.accent}`}>
                                    {dev.category}
                                </span>
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-primary transition-colors">
                                {dev.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                                {dev.excerpt}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{dev.date}</span>
                                    <span>·</span>
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>{dev.readTime}</span>
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-semibold ${dev.accent} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                    Leer <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
