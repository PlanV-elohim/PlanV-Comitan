import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Calendar, MapPin, Users, Tent, X, Save } from 'lucide-react';
import { supabaseApi, uploadToStorage } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/ConfirmDialog';

export default function CampsManager() {
    const [camps, setCamps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        date_string: '',
        capacity: 100,
        price: 0,
        image_url: '',
        status: 'active'
    });

    useEffect(() => {
        loadCamps();
    }, []);

    const loadCamps = async () => {
        try {
            setLoading(true);
            const [campsData, regsData] = await Promise.all([
                supabaseApi.camps.getAll(),
                supabaseApi.registrations.getAll()
            ]);

            const enrichedCamps = campsData.map((c: any) => {
                const count = regsData
                    .filter((r: any) => r.camp_id === c.id)
                    .reduce((sum: number, r: any) => sum + (r.group_size || 1), 0);
                return { ...c, registered: count };
            });
            
            setCamps(enrichedCamps);
        } catch (error) {
            console.error("Error loading camps:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (camp?: any) => {
        if (camp) {
            setEditingId(camp.id);
            setFormData({
                title: camp.title || '',
                description: camp.description || '',
                location: camp.location || '',
                date_string: camp.date_string || '',
                capacity: camp.capacity || 100,
                price: camp.price || 0,
                image_url: camp.image_url || '',
                status: camp.status || 'active'
            });
        } else {
            setEditingId(null);
            setFormData({
                title: '',
                description: '',
                location: '',
                date_string: '',
                capacity: 100,
                price: 0,
                image_url: '',
                status: 'active'
            });
            setImageFile(null);
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            const payload = { ...formData };
            // La base de datos no tiene columna 'description', así que la removemos antes de enviarla
            delete (payload as any).description;

            if (imageFile) {
                const url = await uploadToStorage('images', `camps/${Date.now()}_${imageFile.name}`, imageFile);
                payload.image_url = url;
            }

            if (editingId) {
                // Update
                const updated = await supabaseApi.camps.update(editingId.toString(), payload);
                const updatedCamp = Array.isArray(updated) ? updated[0] : updated;
                setCamps(camps.map(c => c.id === editingId ? updatedCamp : c));
            } else {
                // Create
                const created = await supabaseApi.camps.create(payload);
                const newCamp = Array.isArray(created) ? created[0] : created;
                setCamps([newCamp, ...camps]);
            }
            setIsModalOpen(false);
            showToast(editingId ? 'Campamento actualizado' : 'Campamento creado', 'success');
        } catch (error) {
            console.error("Error saving camp:", error);
            showToast('Error al guardar el campamento.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        const ok = await confirm({
            title: '¿Eliminar campamento?',
            message: 'Esta acción es permanente. El campamento y todos sus datos asociados serán eliminados. ¿Deseas continuar?',
            confirmText: 'Sí, eliminar',
            variant: 'danger'
        });
        if (!ok) return;
        try {
            await supabaseApi.camps.delete(id.toString());
            setCamps(camps.filter(c => c.id !== id));
            showToast('Campamento eliminado', 'success');
        } catch (error) {
            console.error("Error deleting camp:", error);
            showToast('Error al eliminar. Puede tener registros asociados.', 'error');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold dark:text-white tracking-tight mb-2">Campamentos</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Administra los próximos eventos, cupos y precios.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nuevo Campamento
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {camps.map((camp, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={camp.id}
                            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 lg:p-8 flex flex-col lg:flex-row gap-8 shadow-xl shadow-gray-200/20 dark:shadow-none hover:border-primary/30 transition-colors group relative overflow-hidden"
                        >
                            {/* Camp Info */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                                                camp.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                                camp.status === 'history' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                                {camp.status === 'active' ? 'Activo' : camp.status === 'history' ? 'Pasado' : 'Borrador'}
                                            </span>
                                            <h2 className="text-2xl font-bold dark:text-white">{camp.title}</h2>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mt-3">
                                            <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {camp.date_string || 'Fechas por definir'}</div>
                                            <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {camp.location}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats & Actions */}
                            <div className="flex flex-col sm:flex-row lg:flex-col lg:items-end justify-between gap-6 lg:gap-4 shrink-0 lg:w-48 z-10">
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl w-full">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-gray-500 font-medium flex items-center gap-1.5"><Users className="w-4 h-4" /> Cupos</span>
                                        <span className="font-bold dark:text-white">{camp.registered || 0} / {camp.capacity}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className={`h-full ${((camp.registered || 0) / camp.capacity) > 0.9 ? 'bg-red-500' : 'bg-primary'}`} 
                                            style={{ width: `${Math.min(((camp.registered || 0) / camp.capacity) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full">
                                    <button onClick={() => handleOpenModal(camp)} className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                                        <Edit2 className="w-4 h-4" /> Editar
                                    </button>
                                    <button onClick={() => handleDelete(camp.id)} className="p-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors shrink-0">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
            
            {/* Vacant State (if zero camps) */}
            {!loading && camps.length === 0 && (
                <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-12 text-center">
                    <Tent className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold dark:text-white mb-2">No hay campamentos</h3>
                    <p className="text-gray-500 mb-6">Comienza creando tu primer campamento para recibir reservas.</p>
                    <button onClick={() => handleOpenModal()} className="bg-primary text-white px-6 py-3 rounded-xl font-medium">Crear Campamento</button>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 rounded-t-3xl">
                                <h2 className="text-2xl font-bold dark:text-white">
                                    {editingId ? 'Editar Campamento' : 'Nuevo Campamento'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Título del evento</label>
                                        <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Ej: Campamento Renacer 2026" />
                                    </div>

                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Descripción</label>
                                        <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Detalles del campamento..." />
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fechas (Texto)</label>
                                            <input required type="text" value={formData.date_string} onChange={e => setFormData({...formData, date_string: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Ej: 15-18 Agosto, 2026" />
                                        </div>
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lugar</label>
                                            <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Ej: Las Nubes, Chiapas" />
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cupo Total</label>
                                            <input required type="number" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Precio (MXN)</label>
                                            <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Imagen del Campamento</label>
                                        <input type="file" accept="image/*" onChange={e => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setImageFile(e.target.files[0]);
                                            }
                                        }} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs text-gray-500 whitespace-nowrap">O enlace directo:</span>
                                            <input type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none" placeholder="https://..." />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Estado</label>
                                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer">
                                            <option value="active">Activo (Abierto al público)</option>
                                            <option value="draft">Borrador (Oculto)</option>
                                            <option value="history">Pasado (Solo en línea de tiempo)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3 sticky bottom-0 bg-white dark:bg-gray-900 pb-2">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors">
                                        Cancelar
                                    </button>
                                    <button disabled={isSaving} type="submit" className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isSaving ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                {editingId ? 'Guardar Cambios' : 'Crear Campamento'}
                                            </>
                                        )}
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
