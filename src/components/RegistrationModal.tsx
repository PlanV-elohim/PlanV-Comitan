import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2 } from 'lucide-react';
import { CampEvent } from '../types';

interface RegistrationModalProps {
    camp: CampEvent;
    onClose: () => void;
}

export default function RegistrationModal({ camp, onClose }: RegistrationModalProps) {
    const [step, setStep] = useState(1);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setStep(2);
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
                className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-8"
            >
                <div className="relative h-32 bg-dark">
                    <img src={camp.image} alt={camp.title} className="w-full h-full object-cover opacity-40" referrerPolicy="no-referrer" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-6 text-white">
                        <p className="text-sm font-medium text-primary mb-1">Registro</p>
                        <h3 className="text-2xl font-bold">{camp.title}</h3>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    {step === 1 ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Nombre</label>
                                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Juan" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Apellido</label>
                                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Pérez" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
                                <input required type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="juan@ejemplo.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Teléfono</label>
                                <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="+52 000 000 0000" />
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-medium hover:bg-primary-dark transition-colors duration-300">
                                    Confirmar Reserva
                                </button>
                            </div>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-8 text-center flex flex-col items-center"
                        >
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h4 className="text-2xl font-bold mb-2">¡Reserva Exitosa!</h4>
                            <p className="text-gray-600 mb-8">
                                Hemos enviado los detalles de pago y confirmación a tu correo electrónico.
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
            </motion.div>
        </motion.div>
    );
}
