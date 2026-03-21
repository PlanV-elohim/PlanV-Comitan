import { motion } from 'motion/react';

const testimonials = [
    {
        name: "María Gutiérrez",
        role: "Asistente Campamento Renacer 2025",
        text: "Fue una experiencia que cambió mi vida. Llegué con el corazón roto y encontré sanidad, propósito y una comunidad que me apoya. ¡Gracias Plan V!",
        avatar: "MG"
    },
    {
        name: "Carlos López",
        role: "Líder juvenil",
        text: "Llevo a mis jóvenes cada año. El equipo de Plan V crea un ambiente seguro donde Dios puede trabajar. Las dinámicas son increíbles y la palabra que se comparte es poderosa.",
        avatar: "CL"
    },
    {
        name: "Ana Sofía Méndez",
        role: "Retiro de Jóvenes: Fuego 2025",
        text: "Nunca había sentido la presencia de Dios tan fuerte como en ese campamento. Las noches de fogata, la adoración y los amigos que hice... ¡no lo cambio por nada!",
        avatar: "AS"
    }
];

export default function Testimonials() {
    return (
        <section className="py-24 bg-gray-50 px-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block px-4 py-2 bg-red-50 text-primary rounded-full text-sm font-bold tracking-wider uppercase mb-6">
                        Testimonios
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Vidas <span className="text-primary">Transformadas</span>
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Historias reales de personas que encontraron su propósito en nuestros campamentos.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ delay: index * 0.15 }}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col"
                        >
                            {/* Quote icon */}
                            <div className="text-primary/20 text-6xl font-serif leading-none mb-4">"</div>

                            <p className="text-gray-600 leading-relaxed mb-8 flex-grow">
                                {testimonial.text}
                            </p>

                            <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <p className="font-bold text-dark">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
