import { motion } from 'motion/react';
import { Calendar as CalendarIcon, MapPin, Clock, Users, ArrowRight, X } from 'lucide-react';
import { CampEvent } from '../types';
import { monthNames } from '../data/events';

interface CampInfoModalProps {
    camp: CampEvent;
    onClose: () => void;
    onRegister: (camp: CampEvent) => void;
}

export default function CampInfoModal({ camp, onClose, onRegister }: CampInfoModalProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 relative"
            >
                <div className="h-64 relative">
                    <img
                        src={camp.image}
                        alt={camp.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3 uppercase tracking-wider">
                            Detalles del Evento
                        </div>
                        <h3 className="text-3xl font-bold leading-tight">{camp.title}</h3>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                        {camp.description}
                    </p>

                    <div className="grid sm:grid-cols-2 gap-6 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="bg-red-50 p-3 rounded-xl text-primary shrink-0">
                                <CalendarIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Fecha</p>
                                <p className="font-semibold text-dark">
                                    {camp.date.getDate()} al {camp.endDate.getDate()} de {monthNames[camp.date.getMonth()]}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-red-50 p-3 rounded-xl text-primary shrink-0">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Hora</p>
                                <p className="font-semibold text-dark">{camp.time}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-red-50 p-3 rounded-xl text-primary shrink-0">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Lugar</p>
                                <p className="font-semibold text-dark">{camp.location}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-red-50 p-3 rounded-xl text-primary shrink-0">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Disponibilidad</p>
                                <p className="font-semibold text-dark">{camp.available} cupos de {camp.spots}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="flex-1 bg-gray-100 text-dark py-4 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-300"
                        >
                            Cerrar
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                onClose();
                                onRegister(camp);
                            }}
                            className="flex-1 bg-primary text-white py-4 rounded-xl font-medium hover:bg-primary-dark transition-colors duration-300 flex items-center justify-center gap-2"
                        >
                            Reservar Lugar <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
