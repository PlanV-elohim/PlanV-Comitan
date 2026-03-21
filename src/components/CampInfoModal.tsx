import { motion } from 'motion/react';
import { Calendar as CalendarIcon, MapPin, Clock, Users, ArrowRight, X } from 'lucide-react';
import { CampEvent } from '../types';
import { monthNames } from '../data/events';

interface CampInfoModalProps {
    camp: CampEvent;
    onClose: () => void;
    onRegister: (camp: CampEvent) => void;
    hideRegisterButton?: boolean;
}

export default function CampInfoModal({ camp, onClose, onRegister, hideRegisterButton }: CampInfoModalProps) {
    const freeSpots = camp.available !== undefined
        ? camp.available
        : (camp.capacity || 0) - (camp.registered || 0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto"
        >
            <motion.div
                initial={{ scale: 0.97, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                style={{ willChange: "transform, opacity" }}
                className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg sm:max-w-xl shadow-2xl overflow-hidden sm:my-4 relative"
            >
                {/* Hero Image */}
                <div className="h-48 sm:h-64 relative">
                    <img
                        src={camp.image_url || camp.image || 'https://picsum.photos/seed/info/800/600'}
                        alt={camp.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/20 hover:bg-black/50 rounded-full p-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-4 right-12 text-white">
                        <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-2 uppercase tracking-wider">
                            Detalles del Evento
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold leading-tight line-clamp-2">{camp.title}</h3>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5 sm:p-8">
                    <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
                        {camp.description || 'Únete a nuestro próximo campamento. Disfruta de conferencias, actividades al aire libre y tiempo de comunión. ¡Reserva tu lugar ahora, cupos limitados!'}
                    </p>

                    <div className="grid grid-cols-2 gap-3 sm:gap-5 mb-6">
                        {/* Date */}
                        <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-3 sm:p-4">
                            <div className="bg-red-50 p-2 sm:p-3 rounded-xl text-primary shrink-0">
                                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-medium">Fecha</p>
                                <p className="font-semibold text-dark text-[11px] sm:text-sm leading-snug">
                                    {camp.date && camp.endDate
                                        ? `${camp.date.getDate()} al ${camp.endDate.getDate()} de ${monthNames[camp.date.getMonth()]}`
                                        : camp.date_string}
                                </p>
                            </div>
                        </div>

                        {/* Price / Time */}
                        {(camp.time || camp.price) && (
                            <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-3 sm:p-4">
                                <div className="bg-red-50 p-2 sm:p-3 rounded-xl text-primary shrink-0">
                                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500 font-medium">{camp.price ? 'Precio' : 'Hora'}</p>
                                    <p className="font-semibold text-dark text-xs sm:text-sm">{camp.price ? `$${camp.price} MXN` : camp.time}</p>
                                </div>
                            </div>
                        )}

                        {/* Location */}
                        <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-3 sm:p-4">
                            <div className="bg-red-50 p-2 sm:p-3 rounded-xl text-primary shrink-0">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-medium">Lugar</p>
                                <p className="font-semibold text-dark text-xs sm:text-sm leading-snug">{camp.location || '—'}</p>
                            </div>
                        </div>

                        {/* Cupos */}
                        <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-3 sm:p-4">
                            <div className="bg-red-50 p-2 sm:p-3 rounded-xl text-primary shrink-0">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-medium">Lugares</p>
                                <p className={`font-semibold text-[11px] sm:text-sm ${freeSpots <= 5 ? 'text-red-600' : 'text-dark'}`}>
                                    {freeSpots > 0 ? `${freeSpots} libres` : 'Lleno'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={onClose}
                            className={`${hideRegisterButton ? 'w-full' : 'flex-1'} bg-gray-100 text-dark py-3.5 rounded-2xl font-semibold hover:bg-gray-200 transition-colors text-sm`}
                        >
                            Cerrar
                        </motion.button>
                        {!hideRegisterButton && (
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => { onClose(); onRegister(camp); }}
                                disabled={freeSpots <= 0}
                                className="flex-1 bg-primary text-white py-3.5 rounded-2xl font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Reservar Lugar <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
