import { motion } from 'motion/react';
import { Calendar as CalendarIcon, MapPin, ChevronRight, Info } from 'lucide-react';
import { CampEvent } from '../types';
import { EVENTS, monthNames } from '../data/events';

interface UpcomingEventsProps {
    onRegister: (camp: CampEvent) => void;
    onOpenCalendar: () => void;
    onInfo: (camp: CampEvent) => void;
}

export default function UpcomingEvents({ onRegister, onOpenCalendar, onInfo }: UpcomingEventsProps) {
    return (
        <section id="campamentos" className="py-24 bg-gray-50 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold tracking-tight mb-4">Próximos Campamentos</h2>
                        <p className="text-gray-600 max-w-2xl">Reserva tu lugar en nuestros próximos eventos. Los cupos son limitados.</p>
                    </motion.div>
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onOpenCalendar}
                        className="bg-dark text-white px-6 py-3 rounded-full font-medium hover:bg-primary transition-colors flex items-center gap-2 shrink-0"
                    >
                        <CalendarIcon className="w-5 h-5" /> Ver fechas en calendario
                    </motion.button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {EVENTS.slice(0, 3).map((camp, index) => (
                        <motion.div
                            key={camp.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 group flex flex-col"
                        >
                            <div className="aspect-video relative overflow-hidden">
                                <img
                                    src={camp.image}
                                    alt={camp.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-dark">
                                    {camp.available} cupos
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                                <h3 className="text-2xl font-bold mb-4">{camp.title}</h3>
                                <div className="space-y-3 mb-8 text-gray-600 text-sm flex-grow">
                                    <div className="flex items-center gap-3">
                                        <CalendarIcon className="w-5 h-5 text-primary shrink-0" />
                                        <span>{camp.date.getDate()} {monthNames[camp.date.getMonth()]} {camp.date.getFullYear()}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-primary shrink-0" />
                                        <span>{camp.location}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onInfo(camp)}
                                        className="flex-1 border border-gray-200 text-dark py-3 rounded-xl font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Info className="w-4 h-4" /> Info
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onRegister(camp)}
                                        className="flex-1 bg-dark text-white py-3 rounded-xl font-medium hover:bg-primary transition-colors flex items-center justify-center gap-2"
                                    >
                                        Reservar <ChevronRight className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
