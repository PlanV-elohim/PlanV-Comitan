import { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, Trash2, CheckCircle2, Loader2, ImageIcon, Star } from 'lucide-react';
import { supabaseApi, uploadToStorage } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';

type GalleryImage = { 
    id: string; 
    type: string; 
    image_url: string; 
    is_active: boolean; 
    created_at: string;
    camp_id?: string;
    caption?: string; 
};

function UploadZone({
    label, accept, onUpload, uploading
}: { label: string; accept: string; onUpload: (files: FileList) => void; uploading: boolean }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) onUpload(e.dataTransfer.files);
    };

    return (
        <div
            onClick={() => !uploading && inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all select-none ${
                dragging ? 'border-primary bg-primary/10 scale-[1.02]' : 
                'border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-primary/5'
            }`}
        >
            <input ref={inputRef} type="file" accept={accept} multiple className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) => e.target.files && onUpload(e.target.files)} />
            {uploading ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            ) : (
                <UploadCloud className={`w-10 h-10 transition-colors ${dragging ? 'text-primary' : 'text-gray-400'}`} />
            )}
            <p className="font-semibold text-gray-600 dark:text-gray-300 text-center">
                {uploading ? 'Subiendo...' : label}
            </p>
            <p className="text-xs text-gray-400">Arrastra aquí o toca para seleccionar · JPG, PNG, WEBP</p>
        </div>
    );
}

export default function GalleryManager() {
    const [heroImages, setHeroImages] = useState<GalleryImage[]>([]);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [loadingHero, setLoadingHero] = useState(true);
    const [loadingGallery, setLoadingGallery] = useState(true);
    const [uploadingHero, setUploadingHero] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [camps, setCamps] = useState<any[]>([]);
    const [selectedCampId, setSelectedCampId] = useState<string>('');
    const { showToast } = useToast();

    const [uploadingHeroText, setUploadingHeroText] = useState(false);

    useEffect(() => {
        Promise.all([
            supabaseApi.gallery.getAll('hero_bg'),
            supabaseApi.gallery.getAll('hero_bg_text'),
            supabaseApi.gallery.getAll('hero_mobile'),
            supabaseApi.gallery.getAll('hero_mobile_text'),
        ])
            .then(([normal, text, mobileNormal, mobileText]) => setHeroImages([...normal, ...text, ...mobileNormal, ...mobileText]))
            .catch(console.error)
            .finally(() => setLoadingHero(false));

        supabaseApi.gallery.getAll('gallery')
            .then((d: GalleryImage[]) => setGalleryImages(d))
            .catch(console.error)
            .finally(() => setLoadingGallery(false));

        supabaseApi.camps.getAll()
            .then((data: any[]) => setCamps(data))
            .catch(console.error);
    }, []);

    const handleHeroUpload = async (files: FileList) => {
        try {
            setUploadingHero(true);
            for (const file of Array.from(files)) {
                const path = `hero/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
                const url = await uploadToStorage('gallery', path, file);
                const type = uploadingHeroText ? 'hero_bg_text' : 'hero_bg';
                const res = await supabaseApi.gallery.create({ type, image_url: url, is_active: false });
                const created = Array.isArray(res) ? res[0] : res;
                setHeroImages(prev => [created, ...prev]);
            }
        } catch (e: any) {
            showToast('Error al subir (PC): ' + e.message, 'error');
        } finally {
            setUploadingHero(false);
        }
    };

    const handleHeroMobileUpload = async (files: FileList) => {
        try {
            setUploadingHero(true);
            for (const file of Array.from(files)) {
                const path = `hero_mobile/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
                const url = await uploadToStorage('gallery', path, file);
                const type = uploadingHeroText ? 'hero_mobile_text' : 'hero_mobile';
                const res = await supabaseApi.gallery.create({ type, image_url: url, is_active: false });
                const created = Array.isArray(res) ? res[0] : res;
                setHeroImages(prev => [created, ...prev]);
            }
        } catch (e: any) {
            showToast('Error al subir (Móvil): ' + e.message, 'error');
        } finally {
            setUploadingHero(false);
        }
    };

    const handleGalleryUpload = async (files: FileList) => {
        try {
            setUploadingGallery(true);
            for (const file of Array.from(files)) {
                const path = `gallery/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
                const url = await uploadToStorage('gallery', path, file);
                const res = await supabaseApi.gallery.create({ 
                    type: 'gallery', 
                    image_url: url,
                    camp_id: selectedCampId || null 
                });
                const created = Array.isArray(res) ? res[0] : res;
                setGalleryImages(prev => [created, ...prev]);
            }
            showToast('Fotos subidas correctamente', 'success');
        } catch (e: any) {
            showToast('Error al subir: ' + e.message, 'error');
        } finally {
            setUploadingGallery(false);
        }
    };

    const handleSetActive = async (image: GalleryImage) => {
        try {
            await supabaseApi.gallery.setActive(image.id, image.type);
            setHeroImages(prev => prev.map(i => {
                // If it's a desktop image, un-activate other desktop images
                if (image.type.startsWith('hero_bg') && i.type.startsWith('hero_bg')) {
                    return { ...i, is_active: i.id === image.id };
                }
                // If it's a mobile image, un-activate other mobile images
                if (image.type.startsWith('hero_mobile') && i.type.startsWith('hero_mobile')) {
                    return { ...i, is_active: i.id === image.id };
                }
                return i;
            }));
            showToast('Fondo activado correctamente', 'success');
        } catch (e: any) {
            showToast('Error: ' + e.message, 'error');
        }
    };

    const handleDelete = async (image: GalleryImage) => {
        if (!confirm('¿Eliminar esta imagen? Esta acción no se puede deshacer.')) return;
        try {
            await supabaseApi.gallery.delete(image.id);
            if (image.type === 'hero_bg') setHeroImages(prev => prev.filter(i => i.id !== image.id));
            else setGalleryImages(prev => prev.filter(i => i.id !== image.id));
            showToast('Imagen eliminada', 'success');
        } catch (e: any) {
            showToast('Error: ' + e.message, 'error');
        }
    };

    const activeHero = heroImages.find(i => i.is_active);

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl lg:text-4xl font-bold dark:text-white tracking-tight mb-2">Galería y Medios</h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Sube fotos desde tu PC o móvil directamente a Supabase.</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* === HERO BACKGROUND === */}
                <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl shadow-gray-200/20 dark:shadow-none space-y-5">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white mb-1">Fondo Principal (Hero)</h2>
                        <p className="text-sm text-gray-500">La foto de inicio de la web. Solo una puede estar activa.</p>
                    </div>

                    {/* Active Preview */}
                    {activeHero ? (
                        <div className="relative aspect-video rounded-2xl overflow-hidden group">
                            <img src={activeHero.image_url} alt="Fondo activo" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Activa
                            </span>
                        </div>
                    ) : !loadingHero && (
                        <div className="aspect-video rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Sin fondo activo</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <UploadZone
                            label="Fondo PC (Horizontal)"
                            accept="image/*"
                            onUpload={handleHeroUpload}
                            uploading={uploadingHero}
                        />
                        <UploadZone
                            label="Fondo Móvil (Vertical)"
                            accept="image/*"
                            onUpload={handleHeroMobileUpload}
                            uploading={uploadingHero}
                        />
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <input 
                            type="checkbox" 
                            id="hasText" 
                            checked={uploadingHeroText}
                            onChange={(e) => setUploadingHeroText(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="hasText" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                            Esta imagen ya contiene texto importante (oculta el título de la web)
                        </label>
                    </div>

                    {/* Hero Library */}
                    {heroImages.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Biblioteca de Fondos</p>
                            <div className="grid grid-cols-3 gap-3">
                                <AnimatePresence>
                                    {heroImages.map(img => (
                                        <motion.div
                                            key={img.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className={`relative aspect-video rounded-xl overflow-hidden group cursor-pointer ring-2 ring-offset-2 transition-all ${
                                                img.is_active ? 'ring-primary' : 'ring-transparent hover:ring-primary/50'
                                            }`}
                                            onClick={() => handleSetActive(img)}
                                        >
                                            <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleSetActive(img); }}
                                                    className="w-8 h-8 rounded-full bg-white/90 text-yellow-500 flex items-center justify-center hover:bg-white transition-colors"
                                                    title="Activar"
                                                >
                                                    <Star className="w-4 h-4" fill={img.is_active ? 'currentColor' : 'none'} />
                                                </button>
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleDelete(img); }}
                                                    className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {img.is_active && (
                                                <div className="absolute top-1.5 left-1.5">
                                                    <CheckCircle2 className="w-5 h-5 text-primary drop-shadow-lg" fill="white" />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </section>

                {/* === GALLERY === */}
                <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl shadow-gray-200/20 dark:shadow-none space-y-5">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white mb-1">Galería de Fotos</h2>
                        <p className="text-sm text-gray-500">Fotos que aparecen en la sección de galería de la web.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="flex-1 w-full">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block ml-1">Asociar a Campamento</label>
                            <select 
                                value={selectedCampId} 
                                onChange={(e) => setSelectedCampId(e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-primary"
                            >
                                <option value="">General / Sin Campamento</option>
                                {camps.map(camp => (
                                    <option key={camp.id} value={camp.id}>{camp.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 w-full">
                            <UploadZone
                                label="Subir fotos"
                                accept="image/*"
                                onUpload={handleGalleryUpload}
                                uploading={uploadingGallery}
                            />
                        </div>
                    </div>

                    {loadingGallery ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : galleryImages.length === 0 ? (
                        <div className="py-10 text-center text-gray-400">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Aún no hay fotos en la galería</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* Group gallery images by camp */}
                            {(() => {
                                const groups: Record<string, GalleryImage[]> = { 'Generales': [] };
                                galleryImages.forEach(img => {
                                    const camp = camps.find(c => c.id === img.camp_id);
                                    const key = camp ? camp.title : 'Generales';
                                    if (!groups[key]) groups[key] = [];
                                    groups[key].push(img);
                                });

                                return Object.entries(groups)
                                    .filter(([_, images]) => images.length > 0)
                                    .map(([title, images]) => (
                                        <div key={title} className="space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                {title}
                                            </h3>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                                <AnimatePresence>
                                                    {images.map(img => (
                                                        <motion.div
                                                            key={img.id}
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            className="relative aspect-square rounded-xl overflow-hidden group shadow-sm"
                                                        >
                                                            <img src={img.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <button
                                                                    onClick={() => handleDelete(img)}
                                                                    className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors hover:scale-110"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    ));
                            })()}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
