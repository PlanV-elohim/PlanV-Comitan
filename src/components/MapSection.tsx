import { motion } from 'motion/react';
import { MapPin, Navigation } from 'lucide-react';

export default function MapSection() {
    return (
        <section id="contacto" className="py-20 md:py-24 bg-dark text-white px-6">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-bold tracking-wider uppercase mb-6">
                        Ubicación
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Nuestra <span className="text-primary">Sede</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Te esperamos en nuestras instalaciones en Chiapas para vivir una experiencia inolvidable.
                    </p>
                </motion.div>

                <motion.a
                    href="https://maps.app.goo.gl/v6kaivpgqo36SeTs8"
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="block bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-14 text-center hover:border-primary/50 transition-all duration-300 group shadow-2xl relative overflow-hidden mx-auto max-w-2xl"
                >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 text-primary rounded-3xl mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-300 relative z-10 shadow-lg">
                        <MapPin className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">Campamento Plan V Elohim</h3>
                    <p className="text-gray-400 text-base md:text-lg mb-10 max-w-md mx-auto relative z-10 leading-relaxed">
                        Sede principal del ministerio. Comitán de Domínguez, Chiapas, México.
                    </p>
                    <div className="inline-flex items-center gap-2 text-primary font-bold text-lg group-hover:text-white transition-colors duration-300 relative z-10">
                        <Navigation className="w-5 h-5" />
                        <span>Abrir en Google Maps</span>
                    </div>
                </motion.a>
            </div>
        </section>
    );
}
