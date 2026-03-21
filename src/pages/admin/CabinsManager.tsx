import { useState, useEffect } from 'react';
import { supabaseApi } from '../../lib/api';
import { Home, Plus, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useConfirm } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

export default function CabinsManager() {
    const [cabins, setCabins] = useState<any[]>([]);
    const [camps, setCamps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampId, setSelectedCampId] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    
    const { confirm } = useConfirm();
    const { showToast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [campsData, cabinsData] = await Promise.all([
                supabaseApi.camps.getAll(),
                supabaseApi.cabins.getAll()
            ]);
            setCamps(campsData);
            setCabins(cabinsData);
            if (campsData.length > 0 && !selectedCampId) {
                setSelectedCampId(campsData[0].id);
            }
        } catch (error) {
            console.error(error);
            showToast("Error al cargar datos", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (formData.id) {
                await supabaseApi.cabins.update(formData.id, formData);
                showToast("Cabaña actualizada correctamente", "success");
            } else {
                await supabaseApi.cabins.create(formData);
                showToast("Cabaña creada correctamente", "success");
            }
            setIsEditing(false);
            setFormData(null);
            loadData();
        } catch (error) {
            console.error(error);
            showToast("No se pudo guardar la cabaña", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await confirm({
            title: "Eliminar Cabaña",
            message: "¿Estás seguro de eliminar esta cabaña? Perderás las asignaciones existentes.",
            confirmText: "Eliminar",
            cancelText: "Cancelar"
        });
        if (!confirmed) return;

        try {
            await supabaseApi.cabins.delete(id);
            showToast("Cabaña eliminada", "success");
            loadData();
        } catch (error) {
            console.error(error);
            showToast("No se pudo eliminar", "error");
        }
    };

    const openForm = (cabin?: any) => {
        if (cabin) {
            setFormData(cabin);
        } else {
            setFormData({ camp_id: selectedCampId, name: '', capacity: 10, gender: 'mixed' });
        }
        setIsEditing(true);
    };

    const filteredCabins = cabins.filter(c => c.camp_id === selectedCampId);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold dark:text-white tracking-tight mb-2">Gestor de Cabañas</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Crea dormitorios y escuadrones para logística.</p>
                </div>
                <button onClick={() => openForm()} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 shrink-0">
                    <Plus className="w-5 h-5" /> Nueva Cabaña
                </button>
            </header>

            {loading ? (
                 <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
            ) : (
                <>
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex gap-4 overflow-x-auto">
                        {camps.map(camp => (
                            <button
                                key={camp.id}
                                onClick={() => setSelectedCampId(camp.id)}
                                className={`shrink-0 px-6 py-3 rounded-xl font-bold text-sm transition-all ${selectedCampId === camp.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                {camp.title}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCabins.length === 0 ? (
                            <div className="col-span-full py-10 text-center text-gray-400">
                                <Home className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No hay cabañas creadas para este campamento.</p>
                            </div>
                        ) : (
                            filteredCabins.map(cabin => (
                                <motion.div key={cabin.id} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-shadow group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cabin.gender === 'male' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : cabin.gender === 'female' ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                                <Home className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl dark:text-white leading-tight">{cabin.name}</h3>
                                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{cabin.gender === 'male' ? 'Solo Hombres' : cabin.gender === 'female' ? 'Solo Mujeres' : 'Mixto'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-4 flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Capacidad Max.</span>
                                        <span className="text-xl font-black">{cabin.capacity}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openForm(cabin)} className="flex-1 py-2 text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                                            <Edit2 className="w-4 h-4" /> Editar
                                        </button>
                                        <button onClick={() => handleDelete(cabin.id)} className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* Modal Form */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditing(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 sm:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black dark:text-white">{formData.id ? 'Editar Cabaña' : 'Nueva Cabaña'}</h3>
                                <button onClick={() => setIsEditing(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nombre (ej. Cabaña Osos)</label>
                                    <input required type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Capacidad</label>
                                        <input required type="number" min="1" value={formData.capacity || 10} onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                                        <select required value={formData.gender || 'mixed'} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                            <option value="male">Hombres</option>
                                            <option value="female">Mujeres</option>
                                            <option value="mixed">Mixto</option>
                                        </select>
                                    </div>
                                </div>

                                <button disabled={submitting} type="submit" className="w-full mt-6 flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-black text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Guardar
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
