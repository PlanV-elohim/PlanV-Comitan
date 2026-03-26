import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { supabaseApi } from '../lib/api';

const EVENT_FILTERS = ['Todos', 'Campamento 2024', 'Retiro 2025', 'Fogata', 'Generales'];

const PLACEHOLDERS = [
    { src: "https://picsum.photos/seed/g1/800/600", caption: "Momento de adoración", event: "Campamento 2024" },
    { src: "https://picsum.photos/seed/g2/400/600", caption: "Comunidad", event: "Retiro 2025" },
    { src: "https://picsum.photos/seed/g3/800/400", caption: "Fogata nocturna", event: "Fogata" },
    { src: "https://picsum.photos/seed/g4/600/800", caption: "Grupo de jóvenes", event: "Campamento 2024" },
    { src: "https://picsum.photos/seed/g5/800/600", caption: "Orando juntos", event: "Retiro 2025" },
    { src: "https://picsum.photos/seed/g6/600/400", caption: "Actividades al aire libre", event: "Generales" },
    { src: "https://picsum.photos/seed/g7/400/400", caption: "Alabanza", event: "Fogata" },
    { src: "https://picsum.photos/seed/g8/800/600", caption: "Atardecer en el campamento", event: "Generales" },
    { src: "https://picsum.photos/seed/g9/600/600", caption: "Equipo de líderes", event: "Campamento 2024" },
];

type GalleryImage = { src: string; caption: string; event?: string };

export default function Gallery() {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const [images, setImages] = useState<GalleryImage[]>(PLACEHOLDERS);
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [zoom, setZoom] = useState(false);

    useEffect(() => {
        supabaseApi.gallery.getAll('gallery')
            .then((data: any[]) => {
                if (data.length > 0) {
                    setImages(data.map((img: any) => ({ src: img.image_url, caption: img.caption || '', event: img.event || 'Generales' })));
                }
            })
            .catch(() => {});
    }, []);

    const filteredImages = activeFilter === 'Todos'
        ? images
        : images.filter(img => img.event === activeFilter);

    const navigateLightbox = (dir: number) => {
        if (selectedImage === null) return;
        setZoom(false);
        const next = (selectedImage + dir + filteredImages.length) % filteredImages.length;
        setSelectedImage(next);
    };

    // Keyboard navigation
    useEffect(() => {
        if (selectedImage === null) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
            if (e.key === 'Escape') { setSelectedImage(null); setZoom(false); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [selectedImage, filteredImages.length]);

    return (
        <section className="py-20 md:py-24 bg-gray-50 dark:bg-gray-950 px-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    className="text-center mb-12"
                >
                    <div className="inline-block px-4 py-2 bg-red-50 dark:bg-red-900/30 text-primary rounded-full text-sm font-bold tracking-wider uppercase mb-6">
                        Galería
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
                        Momentos <span className="text-primary">Inolvidables</span>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                        Revive los mejores momentos de nuestros campamentos.
                    </p>

                    {/* Filter chips */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {EVENT_FILTERS.map(filter => (
                            <motion.button
                                key={filter}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                                    activeFilter === filter
                                        ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700'
                                }`}
                            >
                                {filter}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Masonry Grid via CSS columns */}
                <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3 will-change-transform">
                    <AnimatePresence>
                        {filteredImages.map((img, i) => (
                            <motion.button
                                key={img.src + activeFilter}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.18) }}
                                onClick={() => setSelectedImage(i)}
                                className="relative overflow-hidden rounded-2xl group cursor-pointer break-inside-avoid w-full block"
                            >
                                {/* Fixed aspect box prevents CLS */}
                                <div className="relative aspect-[4/3] bg-gray-200 dark:bg-gray-800">
                                    <img
                                        src={img.src}
                                        alt={img.caption}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-active:scale-105"
                                        loading="lazy"
                                        decoding="async"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                    <p className="text-white text-xs font-medium truncate">{img.caption}</p>
                                    <ZoomIn className="absolute top-3 right-3 w-5 h-5 text-white/80" />
                                </div>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredImages.length === 0 && (
                    <p className="text-center text-gray-400 py-16">No hay fotos en esta categoría aún.</p>
                )}
            </div>

            {/* Enhanced Lightbox */}
            <AnimatePresence>
                {selectedImage !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => { setSelectedImage(null); setZoom(false); }}
                    >
                        {/* Close */}
                        <button onClick={() => { setSelectedImage(null); setZoom(false); }} className="absolute top-5 right-5 text-white/60 hover:text-white p-2 z-10 transition-colors">
                            <X className="w-7 h-7" />
                        </button>

                        {/* Counter */}
                        <div className="absolute top-5 left-5 text-white/60 text-sm font-mono z-10">
                            {selectedImage + 1} / {filteredImages.length}
                        </div>

                        {/* Nav */}
                        <button onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }} className="absolute left-3 md:left-6 text-white/60 hover:text-white p-3 z-10 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                            <ChevronLeft className="w-7 h-7" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }} className="absolute right-3 md:right-6 text-white/60 hover:text-white p-3 z-10 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                            <ChevronRight className="w-7 h-7" />
                        </button>

                        {/* Image */}
                        <motion.div
                            key={selectedImage}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={{ duration: 0.25 }}
                            className="max-w-4xl w-full mx-12 md:mx-24"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={filteredImages[selectedImage].src}
                                alt={filteredImages[selectedImage].caption}
                                className={`w-full rounded-2xl transition-transform duration-300 cursor-zoom-in ${zoom ? 'scale-150' : ''}`}
                                onClick={() => setZoom(z => !z)}
                                referrerPolicy="no-referrer"
                            />
                            {filteredImages[selectedImage].caption && (
                                <p className="text-white/80 text-center mt-4 font-medium text-sm">
                                    {filteredImages[selectedImage].caption}
                                </p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
