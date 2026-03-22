import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'motion/react';
import { X, CheckCircle2, Ticket } from 'lucide-react';

interface BoardingPassModalProps {
    registration: any;
    camp: any;
    userName: string;
    onClose: () => void;
}

export default function BoardingPassModal({ registration, camp, userName, onClose }: BoardingPassModalProps) {
    if (!registration.qr_code) return null; // Defensive check
    
    // For visual scan validation feedback (the scanner would hit an API and change the DB status,
    // this view is strictly the User's display screen)
    const isCheckedIn = registration.check_in_status;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
                className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden relative"
            >
                {/* Header Ticket Style */}
                <div className="bg-gradient-to-br from-gray-900 to-black p-6 pb-12 relative text-white">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/10 rounded-full transition-colors z-10">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2 text-primary/80 mb-2">
                        <Ticket className="w-5 h-5" />
                        <span className="text-xs uppercase tracking-widest font-bold">Pase de Abordar</span>
                    </div>
                    <h3 className="text-2xl font-black leading-tight mb-1">{camp?.title || 'Campamento'}</h3>
                    <p className="text-gray-400 text-sm">{camp?.date_string}</p>
                </div>

                {/* White Body - Overlapping Header */}
                <div className="bg-white dark:bg-gray-900 rounded-t-[2.5rem] -mt-8 pt-8 px-8 pb-8 flex flex-col items-center relative z-10">
                    <div className="text-center w-full mb-6 relative">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Acampante</p>
                        <p className="text-xl font-bold dark:text-white truncate">{userName}</p>
                        
                        {/* No Status Chip needed if we are replacing the entire QR */}
                    </div>

                    {/* QR Region or Success Message */}
                    {isCheckedIn ? (
                        <div className="w-full flex flex-col items-center justify-center p-8 bg-green-50 dark:bg-green-900/20 rounded-3xl border-2 border-green-200 dark:border-green-800 border-dashed mb-4">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                                <CheckCircle2 className="w-20 h-20 text-green-500 mb-4 drop-shadow-md" />
                            </motion.div>
                            <h4 className="text-2xl font-black text-green-700 dark:text-green-400 tracking-tight text-center">¡Estás dentro!</h4>
                            <p className="text-sm font-medium text-green-600/80 dark:text-green-400/80 text-center mt-2 leading-tight">Tu acceso ha sido validado exitosamente.</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 bg-white rounded-3xl shadow-xl shadow-primary/10 border-2 border-gray-100 mb-2">
                                <QRCodeCanvas 
                                    value={registration.qr_code} 
                                    size={200}
                                    bgColor={"#ffffff"}
                                    fgColor={"#0f172a"}
                                    level={"H"}
                                    includeMargin={false}
                                />
                            </div>
                            <p className="text-gray-400 text-xs text-center mb-6 font-mono tracking-widest">
                                {registration.qr_code.split('-')[0].toUpperCase()}
                            </p>
                        </>
                    )}

                    <div className="w-full mt-6 space-y-3">
                        {registration.cabin_id && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Cabaña / Escuadrón</p>
                                <p className="text-primary font-bold">{registration.cabin_id}</p> {/* Will be populated with actual name later */}
                            </div>
                        )}
                        {!isCheckedIn && (
                            <p className="text-center text-xs text-gray-400 max-w-[250px] mx-auto">
                                Muestra este código al líder de staff en la entrada del campamento.
                            </p>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
