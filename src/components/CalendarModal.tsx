import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, MapPin, Clock, ArrowRight, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { CampEvent } from '../types';
import { EVENTS, monthNames, dayNames } from '../data/events';

interface CalendarModalProps {
    onClose: () => void;
    onRegister: (camp: CampEvent) => void;
}

export default function CalendarModal({ onClose, onRegister }: CalendarModalProps) {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1));
    const [selectedEvent, setSelectedEvent] = useState<CampEvent | null>(null);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedEvent(null);
    };
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedEvent(null);
    };

    const getEventsForDay = (day: number) => {
        const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return EVENTS.filter(e => {
            const start = new Date(e.date.getFullYear(), e.date.getMonth(), e.date.getDate());
            const end = new Date(e.endDate.getFullYear(), e.endDate.getMonth(), e.endDate.getDate());
            return dateToCheck >= start && dateToCheck <= end;
        });
    };

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
                className="bg-gray-50 rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl my-8 relative flex flex-col max-h-[90vh]"
            >
                <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Calendario de <span className="text-primary">Eventos</span></h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto">
                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-dark text-white px-6 py-6 flex items-center justify-between">
                                <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <h3 className="text-2xl font-bold capitalize">
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </h3>
                                <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
                                    {dayNames.map(day => (
                                        <div key={day} className="text-center text-sm font-bold text-gray-400 uppercase tracking-wider">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-2 md:gap-4">
                                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                        <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-gray-50/50" />
                                    ))}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const dayEvents = getEventsForDay(day);
                                        const hasEvent = dayEvents.length > 0;
                                        const isSelected = selectedEvent && dayEvents.some(e => e.id === selectedEvent.id);

                                        return (
                                            <button
                                                key={day}
                                                onClick={() => hasEvent && setSelectedEvent(dayEvents[0])}
                                                disabled={!hasEvent}
                                                className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 ${isSelected
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105 z-10'
                                                        : hasEvent
                                                            ? 'bg-red-50 text-primary hover:bg-red-100 cursor-pointer border border-red-100'
                                                            : 'bg-white text-gray-600 border border-gray-100 opacity-50 cursor-default'
                                                    }`}
                                            >
                                                <span className="text-lg md:text-xl font-semibold">{day}</span>
                                                {hasEvent && !isSelected && (
                                                    <span className="w-1.5 h-1.5 bg-primary rounded-full absolute bottom-3" />
                                                )}
                                                {isSelected && (
                                                    <span className="w-1.5 h-1.5 bg-white rounded-full absolute bottom-3" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5">
                            <AnimatePresence mode="wait">
                                {selectedEvent ? (
                                    <motion.div
                                        key={selectedEvent.id}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                        transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                                        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                                    >
                                        <div className="h-48 relative">
                                            <img
                                                src={selectedEvent.image}
                                                alt={selectedEvent.title}
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                            <div className="absolute bottom-6 left-6 right-6 text-white">
                                                <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-2 uppercase tracking-wider">
                                                    Evento Seleccionado
                                                </div>
                                                <h3 className="text-2xl font-bold leading-tight">{selectedEvent.title}</h3>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                                                {selectedEvent.description}
                                            </p>

                                            <div className="space-y-4 mb-8">
                                                <div className="flex items-start gap-4">
                                                    <div className="bg-red-50 p-3 rounded-xl text-primary shrink-0">
                                                        <CalendarIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 font-medium">Fecha</p>
                                                        <p className="font-semibold text-dark text-sm">
                                                            {selectedEvent.date.getDate()} al {selectedEvent.endDate.getDate()} de {monthNames[selectedEvent.date.getMonth()]}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-4">
                                                    <div className="bg-red-50 p-3 rounded-xl text-primary shrink-0">
                                                        <Clock className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 font-medium">Hora</p>
                                                        <p className="font-semibold text-dark text-sm">{selectedEvent.time}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-4">
                                                    <div className="bg-red-50 p-3 rounded-xl text-primary shrink-0">
                                                        <MapPin className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 font-medium">Lugar</p>
                                                        <p className="font-semibold text-dark text-sm">{selectedEvent.location}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    onClose();
                                                    onRegister(selectedEvent);
                                                }}
                                                className="w-full bg-dark text-white py-4 rounded-xl font-medium hover:bg-primary transition-colors duration-300 flex items-center justify-center gap-2"
                                            >
                                                Reservar Lugar <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-white"
                                    >
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                                            <CalendarIcon className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Ninguna fecha seleccionada</h3>
                                        <p className="text-gray-500 max-w-xs text-sm">
                                            Haz clic en los días resaltados en el calendario para ver los detalles del evento.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
