import { motion } from 'motion/react';

export default function AboutUs() {
    return (
        <section id="nosotros" className="py-24 bg-white px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-block px-4 py-2 bg-red-50 text-primary rounded-full text-sm font-bold tracking-wider uppercase mb-6">
                        Nuestra Historia
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        Acerca de <span className="text-primary">Nosotros</span>
                    </h2>
                    <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                        <p>
                            Plan V Elohim nació con una visión clara: brindar un espacio donde las personas puedan tener un encuentro genuino con Dios, lejos de las distracciones de la vida cotidiana.
                        </p>
                        <p>
                            Ubicados en la hermosa región de Comitán, Chiapas, organizamos campamentos y retiros que combinan la naturaleza, la aventura y la profundidad espiritual. Creemos que la vida que Dios tiene para nosotros siempre es el mejor camino.
                        </p>
                        <p>
                            Nuestro equipo está comprometido en crear experiencias seguras, divertidas y transformadoras para jóvenes y adultos que buscan renovar su fe y propósito.
                        </p>
                    </div>
                </motion.div>

                <div className="flex items-center justify-center p-4">
                    <div className="w-full max-w-sm aspect-square bg-[#0a0a0a] flex items-center justify-center rounded-[3rem] shadow-2xl overflow-hidden p-10">
                        <img
                            src="/PLAN V EN CIRCULO.png"
                            alt="Logo Plan V Elohim"
                            className="w-full h-auto block"
                            draggable="false"
                        />
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ delay: 0.4 }}
                    className="md:col-start-2 -mt-16 bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-xs mx-auto md:mx-0 relative z-20"
                >
                    <div className="text-4xl font-bold text-primary mb-2">+1000</div>
                    <div className="text-gray-600 dark:text-gray-400 font-medium">Vidas transformadas a través de nuestros campamentos</div>
                </motion.div>
            </div>
        </section>
    );
}
