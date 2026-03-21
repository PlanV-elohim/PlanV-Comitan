import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'default';
}

interface ConfirmDialogContextValue {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue>({ confirm: async () => false });

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
    const [dialog, setDialog] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialog({ ...options, resolve });
        });
    }, []);

    const handleResponse = (value: boolean) => {
        dialog?.resolve(value);
        setDialog(null);
    };

    const isDanger = dialog?.variant === 'danger';

    return (
        <ConfirmDialogContext.Provider value={{ confirm }}>
            {children}
            <AnimatePresence>
                {dialog && (
                    <motion.div
                        key="confirm-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
                        onClick={() => handleResponse(false)}
                    >
                        <motion.div
                            key="confirm-panel"
                            initial={{ scale: 0.95, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
                        >
                            {/* Icon + Header */}
                            <div className={`px-6 pt-7 pb-4 flex flex-col items-center text-center border-b border-gray-100 dark:border-gray-800 ${isDanger ? 'bg-red-50 dark:bg-red-950/20' : 'bg-amber-50 dark:bg-amber-950/10'}`}>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${isDanger ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'}`}
                                >
                                    {isDanger ? <Trash2 className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
                                </motion.div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    {dialog.title || (isDanger ? '¿Eliminar?' : '¿Estás seguro?')}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                    {dialog.message}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="p-4 flex gap-3">
                                <button
                                    onClick={() => handleResponse(false)}
                                    className="flex-1 py-3.5 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    {dialog.cancelText || 'Cancelar'}
                                </button>
                                <button
                                    onClick={() => handleResponse(true)}
                                    className={`flex-1 py-3.5 px-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg ${isDanger
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/30'
                                        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                                    }`}
                                >
                                    {isDanger ? <Trash2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                    {dialog.confirmText || (isDanger ? 'Eliminar' : 'Confirmar')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ConfirmDialogContext.Provider>
    );
}

export function useConfirm() {
    return useContext(ConfirmDialogContext);
}
