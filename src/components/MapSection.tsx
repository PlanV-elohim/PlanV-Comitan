import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';

const locations = [
    { name: "Comitán de Domínguez", description: "Sede principal del ministerio", position: { top: '55%', left: '62%' } },
    { name: "Lagos de Montebello", description: "Retiros juveniles", position: { top: '65%', left: '72%' } },
    { name: "Las Nubes", description: "Campamentos extremos", position: { top: '48%', left: '55%' } },
];

export default function MapSection() {
    return (
        <section id="contacto" className="py-24 bg-dark text-white px-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-bold tracking-wider uppercase mb-6">
                        Ubicaciones
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Nuestros <span className="text-primary">Destinos</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Realizamos campamentos en las ubicaciones más hermosas de Chiapas, México.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {locations.map((loc, i) => (
                        <motion.div
                            key={loc.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ delay: i * 0.15 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center hover:border-primary/50 transition-colors duration-300"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 text-primary rounded-2xl mb-6">
                                <MapPin className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{loc.name}</h3>
                            <p className="text-gray-400 text-sm">{loc.description}</p>
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <span className="text-primary font-medium text-sm">Chiapas, México 🇲🇽</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
