import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabaseApi } from '../lib/api';

const PLACEHOLDERS = [
    { src: "https://picsum.photos/seed/gallery1/800/600", caption: "" },
    { src: "https://picsum.photos/seed/gallery2/800/600", caption: "" },
    { src: "https://picsum.photos/seed/gallery3/800/600", caption: "" },
    { src: "https://picsum.photos/seed/gallery4/800/600", caption: "" },
    { src: "https://picsum.photos/seed/gallery5/800/600", caption: "" },
    { src: "https://picsum.photos/seed/gallery6/800/600", caption: "" },
];

export default function Gallery() {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const [images, setImages] = useState(PLACEHOLDERS);

    useEffect(() => {
        supabaseApi.gallery.getAll('gallery')
            .then((data: any[]) => {
                if (data.length > 0) {
                    setImages(data.map((img: any) => ({ src: img.image_url, caption: '' })));
                }
            })
            .catch(() => {}); // keep placeholders on error
    }, []);

    const navigate = (dir: number) => {
        if (selectedImage === null) return;
        const next = (selectedImage + dir + images.length) % images.length;
        setSelectedImage(next);
    };

    return (
        <section className="py-24 bg-gray-50 px-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block px-4 py-2 bg-red-50 text-primary rounded-full text-sm font-bold tracking-wider uppercase mb-6">
                        Galería
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Momentos <span className="text-primary">Inolvidables</span>
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Revive los mejores momentos de nuestros campamentos anteriores.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img: { src: string; caption: string }, i: number) => (
                        <motion.button
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ scale: 1.03 }}
                            onClick={() => setSelectedImage(i)}
                            className={`relative overflow-hidden rounded-2xl group cursor-pointer ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''
                                }`}
                        >
                            <div className={`${i === 0 ? 'aspect-square' : 'aspect-video'}`}>
                                <img
                                    src={img.src}
                                    alt={img.caption}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    referrerPolicy="no-referrer"
                                    loading="lazy"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <p className="font-medium text-sm">{img.caption}</p>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-10"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <button
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigate(-1); }}
                            className="absolute left-4 text-white/70 hover:text-white p-2 z-10"
                        >
                            <ChevronLeft className="w-10 h-10" />
                        </button>
                        <button
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigate(1); }}
                            className="absolute right-4 text-white/70 hover:text-white p-2 z-10"
                        >
                            <ChevronRight className="w-10 h-10" />
                        </button>

                        <motion.div
                            key={selectedImage}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="max-w-5xl w-full"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            <img
                                src={images[selectedImage].src}
                                alt={images[selectedImage].caption}
                                className="w-full rounded-2xl"
                                referrerPolicy="no-referrer"
                            />
                            <p className="text-white text-center mt-4 font-medium">
                                {images[selectedImage].caption}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
