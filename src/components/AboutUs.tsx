import { motion } from 'motion/react';

export default function AboutUs() {
    return (
        <section id="nosotros" className="py-20 md:py-24 bg-white px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                
                {/* --------------------- MOBILE ZIG-ZAG LAYOUT --------------------- */}
                <div className="block md:hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-block px-4 py-2 bg-red-50 text-primary rounded-full text-xs font-bold tracking-wider uppercase mb-5">
                            Nuestra Historia
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-gray-900 leading-tight">
                            Acerca de <br /> <span className="text-primary">Nosotros</span>
                        </h2>
                    </motion.div>

                    <div className="space-y-6 relative">
                        
                        {/* Text Block 1 - Left */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-left pr-4"
                        >
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Plan V Elohim nació con una visión clara: brindar un espacio donde las personas puedan tener un encuentro genuino con Dios, lejos de las distracciones de la vida cotidiana.
                            </p>
                        </motion.div>

                        {/* Logo Block - Center/Right floating feel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="flex justify-end pr-2"
                        >
                            <div className="w-[170px] aspect-square bg-[#0a0a0a] flex items-center justify-center rounded-[2.5rem] shadow-xl overflow-hidden p-6 relative z-10">
                                <img
                                    src="/PLAN V EN CIRCULO.png"
                                    alt="Logo Plan V Elohim"
                                    className="w-full h-auto block"
                                    draggable="false"
                                />
                            </div>
                        </motion.div>

                        {/* Text Block 2 - Right */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-right pl-4 mt-2 relative z-20"
                        >
                            <p className="text-gray-600 text-sm leading-relaxed bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-sm border border-gray-50 inline-block text-left max-w-[260px]">
                                Ubicados en Comitán, Chiapas, organizamos retiros que combinan la naturaleza, aventura y profundidad espiritual. Creemos que la vida con Dios es el mejor camino.
                            </p>
                        </motion.div>

                        {/* Text Block 3 - Left */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-left pr-4 pt-4"
                        >
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Nuestro equipo está comprometido en crear experiencias seguras, divertidas y transformadoras para jóvenes y adultos que buscan renovar su fe y propósito.
                            </p>
                        </motion.div>

                        {/* +1000 Card - Center */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex justify-center pt-4"
                        >
                            <div className="bg-white p-5 rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-800 w-[240px]">
                                <div className="text-3xl font-bold text-primary mb-1">+1000</div>
                                <div className="text-gray-600 dark:text-gray-400 font-medium text-xs leading-snug">
                                    Vidas transformadas a través de nuestros campamentos
                                </div>
                            </div>
                        </motion.div>
                        
                    </div>
                </div>

                {/* --------------------- DESKTOP LAYOUT (Original) --------------------- */}
                <div className="hidden md:grid md:grid-cols-2 gap-16 items-center">
                    
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-block px-4 py-2 bg-red-50 text-primary rounded-full text-sm font-bold tracking-wider uppercase mb-6">
                            Nuestra Historia
                        </div>
                        <h2 className="text-5xl font-bold tracking-tight mb-6 text-gray-900">
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
                    
                    {/* Branding Image & Stats Card Group */}
                    <div className="relative">
                        {/* Dark Background Logo Box */}
                        <div className="w-full max-w-sm aspect-square bg-[#0a0a0a] flex items-center justify-center rounded-[3rem] shadow-2xl overflow-hidden p-10 ml-auto mr-0 z-10 relative">
                            <img
                                src="/PLAN V EN CIRCULO.png"
                                alt="Logo Plan V Elohim"
                                className="w-full h-auto block"
                                draggable="false"
                            />
                        </div>
                        
                        {/* The +1000 card elegantly overlapping the image */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-xs absolute z-20 -bottom-8 -left-8"
                        >
                            <div className="text-4xl font-bold text-primary mb-2">+1000</div>
                            <div className="text-gray-600 dark:text-gray-400 font-medium text-base leading-snug">
                                Vidas transformadas a través de nuestros campamentos
                            </div>
                        </motion.div>
                    </div>

                </div>

            </div>
        </section>
    );
}
