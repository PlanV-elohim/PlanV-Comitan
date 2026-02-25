import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
    return (
        <section id="inicio" className="pt-32 pb-20 md:pt-48 md:pb-32 px-6">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
                        Transforma tu <br />
                        <span className="text-primary">propósito</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                        Únete a nuestros campamentos y retiros espirituales. Un espacio diseñado para reconectar, crecer y encontrar tu propósito en Dios.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a href="#campamentos" className="bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-primary-dark transition-all hover:shadow-lg hover:shadow-primary/30 flex items-center gap-2">
                            Ver Campamentos <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative"
                >
                    <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 relative">
                        <img
                            src="https://picsum.photos/seed/camp/800/1000"
                            alt="Campamento Plan V Elohim"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-8 left-8 right-8 text-white">
                            <div className="bg-white/20 backdrop-blur-md inline-block px-4 py-2 rounded-full text-sm font-medium mb-3">
                                Próximo Evento
                            </div>
                            <h3 className="text-3xl font-bold">Campamento de Verano 2026</h3>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
