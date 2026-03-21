import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Clock, 
    X, 
    MapPin, 
    Loader2, 
    Calendar,
    ChevronRight
} from 'lucide-react';
import { supabaseApi } from '../lib/api';

interface ItineraryModalProps {
    camp: any;
    onClose: () => void;
}

export default function ItineraryModal({ camp, onClose }: ItineraryModalProps) {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (camp?.id) {
            loadEvents(camp.id);
        }
    }, [camp]);

    async function loadEvents(campId: string) {
        setLoading(true);
        try {
            const data = await supabaseApi.itinerary.getByCamp(campId);
            setEvents(data);
        } catch (error) {
            console.error('Error loading itinerary:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
                    <div>
                        <h2 className="text-2xl font-black dark:text-white tracking-tight flex items-center gap-2">
                            <Clock className="w-6 h-6 text-primary" /> Itinerario en Vivo
                        </h2>
                        <p className="text-gray-500 text-sm font-medium">{camp?.title}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-2xl transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-hide pb-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <p className="font-bold">Sincronizando horarios...</p>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold dark:text-white">Horarios no disponibles</h3>
                            <p className="text-gray-500 text-sm mt-2 px-4">El administrador aún no ha publicado el cronograma detallado.</p>
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-primary/20 ml-3 py-2 space-y-10">
                            {events.map((event, idx) => {
                                const startTime = new Date(event.start_time);
                                const endTime = new Date(event.end_time);
                                const timeStr = startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                const durationStr = `${timeStr} - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                                
                                const isNow = new Date() >= startTime && new Date() <= endTime;

                                return (
                                    <motion.div 
                                        key={event.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="relative pl-8"
                                    >
                                        {/* Timeline Dot */}
                                        <div className={`absolute -left-[11px] top-1.5 w-5 h-5 rounded-full border-4 border-white dark:border-gray-900 shadow-sm transition-all ${isNow ? 'bg-primary scale-125 ring-4 ring-primary/20' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                                        
                                        <div className={`p-5 rounded-3xl border transition-all ${isNow ? 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5' : 'bg-gray-50/50 dark:bg-gray-800/50 border-transparent dark:border-gray-800/50'}`}>
                                            <div className="flex justify-between items-start gap-4 mb-2">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${isNow ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                                    {isNow ? 'AHORA MISMO' : durationStr}
                                                </span>
                                                {event.location && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                        <MapPin className="w-3 h-3" /> {event.location}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className={`text-lg font-black tracking-tight ${isNow ? 'text-primary' : 'dark:text-white'}`}>
                                                {event.title}
                                            </h4>
                                            {event.description && (
                                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 leading-relaxed">{event.description}</p>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Tip */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/80 text-center border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">El Itinerario puede variar según el clima o logística</p>
                </div>
            </motion.div>
        </div>
    );
}
