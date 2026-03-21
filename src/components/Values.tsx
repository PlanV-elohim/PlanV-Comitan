import { motion } from 'motion/react';
import { Flame, Shield, Compass, BookOpen } from 'lucide-react';

const values = [
    {
        icon: <Flame className="w-8 h-8" />,
        title: "Pasión",
        description: "Encendemos el fuego de la fe a través de experiencias que despiertan el corazón."
    },
    {
        icon: <Shield className="w-8 h-8" />,
        title: "Seguridad",
        description: "Creamos espacios seguros donde cada persona puede ser auténtica y vulnerable."
    },
    {
        icon: <Compass className="w-8 h-8" />,
        title: "Aventura",
        description: "Combinamos la adrenalina de la naturaleza con la profundidad espiritual."
    },
    {
        icon: <BookOpen className="w-8 h-8" />,
        title: "Palabra",
        description: "La Biblia es nuestro fundamento. Cada enseñanza está basada en la verdad de Dios."
    }
];

export default function Values() {
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
                        Lo Que Nos Mueve
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Nuestros <span className="text-primary">Valores</span>
                    </h2>
                </motion.div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {values.map((val, i) => (
                        <motion.div
                            key={val.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -8 }}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center group hover:shadow-xl transition-shadow duration-300"
                        >
                            <motion.div
                                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-primary rounded-2xl mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300"
                            >
                                {val.icon}
                            </motion.div>
                            <h3 className="text-xl font-bold mb-3">{val.title}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">{val.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
