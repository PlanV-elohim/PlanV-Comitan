import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Clock, 
    Plus, 
    Search, 
    Trash2, 
    Edit2, 
    Calendar, 
    MapPin, 
    Loader2, 
    ChevronRight,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { supabaseApi } from '../../lib/api';
import { useConfirm } from '../../components/ui/ConfirmDialog';

export default function ItineraryManager() {
    const [camps, setCamps] = useState<any[]>([]);
    const [selectedCampId, setSelectedCampId] = useState<string | null>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const { confirm } = useConfirm();

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        start_time: '',
        end_time: ''
    });

    useEffect(() => {
        loadCamps();
    }, []);

    useEffect(() => {
        if (selectedCampId) {
            loadEvents(selectedCampId);
        }
    }, [selectedCampId]);

    async function loadCamps() {
        try {
            const data = await supabaseApi.camps.getAll();
            setCamps(data);
            if (data.length > 0 && !selectedCampId) {
                setSelectedCampId(data[0].id);
            }
        } catch (error) {
            console.error('Error loading camps:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadEvents(campId: string) {
        setLoading(true);
        try {
            const data = await supabaseApi.itinerary.getByCamp(campId);
            setEvents(data);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    }

    function openAddModal() {
        setEditingEvent(null);
        setFormData({
            title: '',
            description: '',
            location: '',
            start_time: '',
            end_time: ''
        });
        setIsModalOpen(true);
    }

    function openEditModal(event: any) {
        setEditingEvent(event);
        // Format dates for datetime-local input
        const start = new Date(event.start_time).toISOString().slice(0, 16);
        const end = new Date(event.end_time).toISOString().slice(0, 16);
        
        setFormData({
            title: event.title,
            description: event.description || '',
            location: event.location || '',
            start_time: start,
            end_time: end
        });
        setIsModalOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedCampId) return;
        
        setSaving(true);
        try {
            if (editingEvent) {
                await supabaseApi.itinerary.update(editingEvent.id, formData);
            } else {
                await supabaseApi.itinerary.create({
                    ...formData,
                    camp_id: selectedCampId
                });
            }
            setIsModalOpen(false);
            loadEvents(selectedCampId);
        } catch (error) {
            console.error('Error saving event:', error);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        const isConfirmed = await confirm({
            title: '¿Eliminar evento?',
            message: 'Esta acción no se puede deshacer.',
            confirmText: 'Eliminar',
            variant: 'danger'
        });

        if (isConfirmed && selectedCampId) {
            try {
                await supabaseApi.itinerary.delete(id);
                loadEvents(selectedCampId);
            } catch (error) {
                console.error('Error deleting event:', error);
            }
        }
    }

    const selectedCamp = camps.find(c => c.id === selectedCampId);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black dark:text-white tracking-tight flex items-center gap-3">
                        <Clock className="w-8 h-8 text-primary" />
                        Itinerario del Campamento
                    </h1>
                    <p className="text-gray-500 mt-2">Gestiona el cronograma de actividades en tiempo real.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 pl-3">Campamento:</span>
                    <select 
                        value={selectedCampId || ''} 
                        onChange={(e) => setSelectedCampId(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 font-bold text-gray-900 dark:text-white cursor-pointer min-w-[200px]"
                    >
                        {camps.map(camp => (
                            <option key={camp.id} value={camp.id}>{camp.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Statistics / Sidebar Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-primary text-white p-6 rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5" /> Info Evento
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-white/60 text-xs uppercase tracking-widest font-bold">Total Actividades</p>
                                <p className="text-3xl font-black">{events.length}</p>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <p className="text-white/60 text-xs uppercase tracking-widest font-bold">Fecha Campamento</p>
                                <p className="font-bold">{selectedCamp?.date_string || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={openAddModal}
                        className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:shadow-lg transition-all flex flex-col items-center justify-center gap-3 group"
                    >
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-bold">Nuevo Evento</span>
                    </button>
                </div>

                {/* Itinerary List */}
                <div className="lg:col-span-3 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <p>Cargando itinerario...</p>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold dark:text-white">Aún no hay actividades</h3>
                            <p className="text-gray-500 mt-2">Empieza a definir el cronograma de este campamento.</p>
                            <button onClick={openAddModal} className="mt-6 bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-colors">
                                Agregar primer evento
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {events.map((event, idx) => {
                                const startTime = new Date(event.start_time);
                                const endTime = new Date(event.end_time);
                                const timeStr = `${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                                
                                return (
                                    <motion.div 
                                        key={event.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:shadow-lg transition-all"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-full uppercase tracking-tighter">
                                                    {timeStr}
                                                </span>
                                                {event.location && (
                                                    <span className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                                                        <MapPin className="w-3 h-3" /> {event.location}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-black dark:text-white">{event.title}</h3>
                                            {event.description && (
                                                <p className="text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 text-sm">{event.description}</p>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => openEditModal(event)}
                                                className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(event.id)}
                                                className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Creación/Edición */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden"
                        >
                            <form onSubmit={handleSubmit}>
                                <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                                    <h2 className="text-2xl font-black dark:text-white">
                                        {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">Configura los detalles de la actividad.</p>
                                </div>

                                <div className="p-8 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">Título de Actividad</label>
                                        <input 
                                            required placeholder="Ej. Desayuno General"
                                            value={formData.title} 
                                            onChange={e => setFormData({...formData, title: e.target.value})}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3.5 outline-none dark:text-white focus:ring-2 focus:ring-primary transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">Inicio</label>
                                            <input 
                                                required type="datetime-local"
                                                value={formData.start_time} 
                                                onChange={e => setFormData({...formData, start_time: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3.5 outline-none dark:text-white focus:ring-2 focus:ring-primary transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">Fin</label>
                                            <input 
                                                required type="datetime-local"
                                                value={formData.end_time} 
                                                onChange={e => setFormData({...formData, end_time: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3.5 outline-none dark:text-white focus:ring-2 focus:ring-primary transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">Lugar</label>
                                        <input 
                                            placeholder="Ej. Comedor Principal"
                                            value={formData.location} 
                                            onChange={e => setFormData({...formData, location: e.target.value})}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3.5 outline-none dark:text-white focus:ring-2 focus:ring-primary transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">Descripción (Opcional)</label>
                                        <textarea 
                                            rows={3} placeholder="Detalles extra sobre la actividad..."
                                            value={formData.description} 
                                            onChange={e => setFormData({...formData, description: e.target.value})}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3.5 outline-none dark:text-white focus:ring-2 focus:ring-primary transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="p-8 bg-gray-50/50 dark:bg-gray-800/50 flex gap-3">
                                    <button 
                                        type="button" onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        disabled={saving} type="submit"
                                        className="flex-[2] bg-primary text-white py-4 font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                        {editingEvent ? 'Guardar Cambios' : 'Crear Evento'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
