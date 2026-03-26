import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        question: "¿Cuánto cuesta asistir a un campamento?",
        answer: "Los costos varían según el evento. Generalmente incluyen hospedaje, alimentación, materiales y actividades. Contáctanos para conocer el costo del próximo campamento y las opciones de becas disponibles."
    },
    {
        question: "¿Qué debo llevar al campamento?",
        answer: "Te recomendamos llevar ropa cómoda, zapatos para caminar, artículos de higiene personal, sleeping bag, linterna, protector solar, repelente de insectos, y tu Biblia. Te enviaremos una lista completa al registrarte."
    },
    {
        question: "¿Hay límite de edad para participar?",
        answer: "Tenemos campamentos para diferentes edades. Los retiros juveniles son para jóvenes de 15 a 29 años, y los campamentos familiares son para todas las edades. Menores de 15 años deben ir acompañados de un adulto."
    },
    {
        question: "¿Es seguro el campamento?",
        answer: "La seguridad es nuestra prioridad. Contamos con personal capacitado en primeros auxilios, protocolos de emergencia, y vigilancia las 24 horas. Todas las actividades son supervisadas por líderes experimentados."
    },
    {
        question: "¿Puedo ir si no soy cristiano?",
        answer: "¡Por supuesto! Nuestros campamentos están abiertos a todas las personas sin importar su experiencia espiritual. Es un espacio de respeto, inclusión y descubrimiento personal."
    },
    {
        question: "¿Cómo puedo ser voluntario?",
        answer: "Haz clic en el botón 'Unirse' en la página principal y déjanos tus datos. Nuestro equipo se pondrá en contacto contigo para compartirte las oportunidades de servicio disponibles."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-20 md:py-24 bg-white dark:bg-gray-950 px-6">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block px-4 py-2 bg-red-50 dark:bg-red-900/30 text-primary rounded-full text-sm font-bold tracking-wider uppercase mb-6">
                        FAQ
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
                        Preguntas <span className="text-primary">Frecuentes</span>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Resolvemos tus dudas sobre nuestros campamentos.
                    </p>
                </motion.div>

                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ delay: i * 0.05 }}
                            className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                                <motion.div
                                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="shrink-0 text-primary"
                                >
                                    <ChevronDown className="w-5 h-5" />
                                </motion.div>
                            </button>
                            {/* CSS max-height accordion — no Framer layout recalc */}
                            <div
                                className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                                    openIndex === i ? 'max-h-96' : 'max-h-0'
                                }`}
                            >
                                <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
