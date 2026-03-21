import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Save, History } from 'lucide-react';
import { supabaseApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';

export default function TimelineManager() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        year: '',
        date_string: '',
        title: '',
        location: '',
        description: '',
        image_url: ''
    });

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            setLoading(true);
            const data = await supabaseApi.timeline.getAll();
            setEvents(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (ev?: any) => {
        if (ev) {
            setEditingId(ev.id);
            setFormData({
                year: ev.year || '',
                date_string: ev.date_string || '',
                title: ev.title || '',
                location: ev.location || '',
                description: ev.description || '',
                image_url: ev.image_url || ''
            });
        } else {
            setEditingId(null);
            setFormData({ year: '', date_string: '', title: '', location: '', description: '', image_url: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            if (editingId) {
                const res = await supabaseApi.timeline.update(editingId.toString(), formData);
                const updated = Array.isArray(res) ? res[0] : res;
                setEvents(events.map(ev => ev.id === editingId ? updated : ev));
            } else {
                const res = await supabaseApi.timeline.create(formData);
                const created = Array.isArray(res) ? res[0] : res;
                setEvents([created, ...events]);
            }
            setIsModalOpen(false);
            showToast(editingId ? 'Evento actualizado' : 'Evento creado', 'success');
        } catch (e) {
            console.error(e);
            showToast('Error al guardar el evento.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este evento del timeline?')) return;
        await supabaseApi.timeline.delete(id.toString());
        setEvents(events.filter(ev => ev.id !== id));
        showToast('Evento eliminado', 'success');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold dark:text-white tracking-tight mb-2">Timeline Histórico</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Administra los eventos que aparecen en la sección Historia.</p>
                </div>
                <button onClick={() => openModal()} className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Nuevo Evento
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden">
                    {events.length === 0 ? (
                        <div className="p-16 text-center">
                            <History className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold dark:text-white mb-2">Sin eventos</h3>
                            <p className="text-gray-500 mb-6">Añade el primer evento histórico al timeline.</p>
                            <button onClick={() => openModal()} className="bg-primary text-white px-6 py-3 rounded-xl font-medium">Crear Evento</button>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 grid grid-cols-12 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6">
                                <div className="col-span-2">Año</div>
                                <div className="col-span-6">Evento</div>
                                <div className="col-span-4 text-right">Acciones</div>
                            </div>
                            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                                {events.map((ev, i) => (
                                    <motion.li
                                        key={ev.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="grid grid-cols-12 items-center p-4 px-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                                    >
                                        <div className="col-span-2">
                                            <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">{ev.year}</span>
                                        </div>
                                        <div className="col-span-6">
                                            <p className="font-bold dark:text-white">{ev.title}</p>
                                            <p className="text-sm text-gray-500">{ev.location}</p>
                                        </div>
                                        <div className="col-span-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openModal(ev)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(ev.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
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
                            className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-t-3xl z-10">
                                <h2 className="text-xl font-bold dark:text-white">{editingId ? 'Editar Evento' : 'Nuevo Evento'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Año</label>
                                        <input required type="text" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-primary outline-none transition-all" placeholder="2023" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fecha (Texto)</label>
                                        <input type="text" value={formData.date_string} onChange={e => setFormData({...formData, date_string: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-primary outline-none transition-all" placeholder="Agosto 2023" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Título</label>
                                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-primary outline-none transition-all" placeholder="Campamento Renacer" />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lugar</label>
                                    <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-primary outline-none transition-all" placeholder="San Cristóbal de las Casas" />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Descripción</label>
                                    <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-primary outline-none transition-all" placeholder="Descripción del evento..." />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Link de Imagen</label>
                                    <input type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-primary outline-none transition-all" placeholder="https://..." />
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors">
                                        Cancelar
                                    </button>
                                    <button disabled={isSaving} type="submit" className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50">
                                        {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> {editingId ? 'Guardar' : 'Crear'}</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
