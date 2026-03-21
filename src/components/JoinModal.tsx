import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2 } from 'lucide-react';
import Confetti from './Confetti';
import { playSuccessSound } from '../lib/sound';

export default function JoinModal({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(1);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { supabaseApi } = await import('../lib/api');
            await supabaseApi.messages.create({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                message: "Interés en unirse al Plan V desde el modal principal."
            });
            setStep(2);
            setShowConfetti(true);
            playSuccessSound();
        } catch (error) {
            console.error('Failed to submit message:', error);
            alert("Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
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
                className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl my-8 relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-dark bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    {step === 1 ? (
                        <>
                            <div className="text-center mb-8">
                                <h3 className="text-3xl font-bold mb-2">Únete al <span className="text-primary">Plan V</span></h3>
                                <p className="text-gray-600">Déjanos tus datos y nos pondremos en contacto contigo para darte más información.</p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Nombre completo</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Juan Pérez" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="juan@ejemplo.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Teléfono</label>
                                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="+52 000 000 0000" />
                                </div>

                                <div className="pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-dark text-white py-4 rounded-xl font-medium hover:bg-primary transition-colors duration-300 disabled:opacity-70"
                                    >
                                        {isSubmitting ? 'Enviando...' : 'Enviar Información'}
                                    </motion.button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-8 text-center flex flex-col items-center"
                        >
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h4 className="text-2xl font-bold mb-2">¡Mensaje Enviado!</h4>
                            <p className="text-gray-600 mb-8">
                                Gracias por tu interés. Nos pondremos en contacto contigo muy pronto.
                            </p>
                            <button
                                onClick={onClose}
                                className="bg-dark text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
                            >
                                Cerrar
                            </button>
                        </motion.div>
                    )}
                </div>
                {/* Visual Confetti Reaction */}
                <Confetti active={showConfetti} />
            </motion.div>
        </motion.div>
    );
}
