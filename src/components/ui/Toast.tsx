import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, XCircle, X, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

let nextId = 0;

const toastConfig: Record<ToastType, {
    bg: string; border: string; icon: typeof CheckCircle2; iconColor: string;
}> = {
    success: { bg: 'bg-gray-900', border: 'border-green-500/40', icon: CheckCircle2, iconColor: 'text-green-400' },
    error:   { bg: 'bg-gray-900', border: 'border-red-500/40',   icon: XCircle,      iconColor: 'text-red-400'   },
    info:    { bg: 'bg-gray-900', border: 'border-blue-500/40',  icon: Info,         iconColor: 'text-blue-400'  },
    warning: { bg: 'bg-gray-900', border: 'border-amber-500/40', icon: AlertTriangle, iconColor: 'text-amber-400' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = ++nextId;
        setToasts(prev => [...prev, { id, message, type }]);

        const duration = type === 'error' ? 6000 : 4000;
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2.5 items-center w-full max-w-md px-4 pointer-events-none">
                <AnimatePresence mode="sync">
                    {toasts.map(toast => {
                        const cfg = toastConfig[toast.type];
                        const Icon = cfg.icon;
                        return (
                            <motion.div
                                key={toast.id}
                                layout
                                initial={{ opacity: 0, y: 50, scale: 0.85 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.85, y: 20 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                                className={`w-full flex items-start gap-3 px-4 py-4 rounded-2xl shadow-2xl pointer-events-auto border ${cfg.bg} ${cfg.border} text-white`}
                            >
                                <div className={`mt-0.5 shrink-0 p-1.5 rounded-lg bg-white/10`}>
                                    <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                                </div>
                                <span className="flex-1 text-sm font-medium leading-snug text-white/90">{toast.message}</span>
                                <button
                                    onClick={() => dismiss(toast.id)}
                                    className="p-1 rounded-lg opacity-50 hover:opacity-100 hover:bg-white/10 transition-all shrink-0 mt-0.5"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
