import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Delay showing so it doesn't appear immediately on load
            setTimeout(() => setShow(true), 4000);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShow(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShow(false);
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 120, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 120, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[9998]"
                >
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4">
                        {/* Icon */}
                        <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
                            ⛺
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white text-sm">Instala Plan V</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 truncate">
                                Accede más rápido desde tu pantalla de inicio
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleInstall}
                                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Instalar
                            </motion.button>
                            <button
                                onClick={handleDismiss}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
