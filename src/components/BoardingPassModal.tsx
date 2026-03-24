import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Ticket, Tent } from 'lucide-react';
import { useState, useRef } from 'react';

interface BoardingPassModalProps {
    registration: any;
    camp: any;
    userName: string;
    onClose: () => void;
}

export default function BoardingPassModal({ registration, camp, userName, onClose }: BoardingPassModalProps) {
    if (!registration.qr_code) return null;
    
    const isCheckedIn = registration.check_in_status;
    const cardRef = useRef<HTMLDivElement>(null);
    const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
    const [rotated, setRotated] = useState({ rx: 0, ry: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        
        // Calculate glare position
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Calculate 3D rotation
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const rx = ((e.clientY - centerY) / centerY) * -15; // Max 15deg
        const ry = ((e.clientX - centerX) / centerX) * 15;
        
        setGlare({ x, y, opacity: 1 });
        setRotated({ rx, ry });
    };

    const handleMouseLeave = () => {
        setGlare(p => ({ ...p, opacity: 0 }));
        setRotated({ rx: 0, ry: 0 });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md perspective-1000"
        >
            <button 
                onClick={onClose} 
                className="absolute top-6 right-6 p-3 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-[60] backdrop-blur-sm shadow-xl"
            >
                <X className="w-6 h-6" />
            </button>

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }} 
                animate={{ scale: 1, opacity: 1, y: 0, rotateX: rotated.rx, rotateY: rotated.ry }} 
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="w-full max-w-sm rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative transform-style-3d cursor-pointer"
                style={{
                    transformStyle: 'preserve-3d',
                    background: 'linear-gradient(135deg, #111827, #000000)'
                }}
            >
                {/* Holographic Glare Effect */}
                <div 
                    className="absolute inset-0 z-50 rounded-[2rem] pointer-events-none transition-opacity duration-300"
                    style={{
                        opacity: glare.opacity,
                        background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)`,
                        mixBlendMode: 'screen'
                    }}
                />
                
                {/* Border Glow */}
                <div className="absolute inset-0 rounded-[2rem] border border-white/10 overflow-hidden">
                    <div 
                        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                        style={{
                            opacity: glare.opacity * 0.5,
                            background: `linear-gradient(${glare.x + glare.y}deg, rgba(255,100,50,0.2) 0%, transparent 40%, rgba(50,150,255,0.2) 100%)`
                        }}
                    />
                </div>

                {/* Header Ticket Style */}
                <div className="p-8 pb-10 relative text-white border-b border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-primary/80">
                            <Ticket className="w-5 h-5" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Plan V Access</span>
                        </div>
                        <Tent className="w-6 h-6 text-white/20" />
                    </div>
                    <h3 className="text-2xl font-black leading-tight mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                        {camp?.title || 'Campamento'}
                    </h3>
                    <p className="text-gray-400 text-sm font-medium">{camp?.date_string}</p>
                </div>

                {/* White Body - Overlapping Header */}
                <div className="bg-white/5 backdrop-blur-md px-8 py-8 flex flex-col items-center relative z-10 border-t border-white/5 rounded-b-[2rem]">
                    <div className="text-center w-full mb-8 relative">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Pasajero / Expedicionario</p>
                        <p className="text-2xl font-bold text-white tracking-tight">{userName}</p>
                    </div>

                    {/* QR Region or Success Message */}
                    <AnimatePresence mode="wait">
                        {isCheckedIn ? (
                            <motion.div 
                                key="success"
                                initial={{ scale: 0, rotate: -20 }} 
                                animate={{ scale: 1, rotate: 0 }} 
                                className="w-full flex flex-col items-center justify-center p-8 bg-green-500/10 rounded-[2rem] border border-green-500/20 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
                            >
                                <CheckCircle2 className="w-20 h-20 text-green-400 mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                                <h4 className="text-2xl font-black text-green-400 tracking-tight text-center">¡Estás dentro!</h4>
                                <p className="text-xs font-medium text-green-400/80 text-center mt-2 leading-relaxed">Tu acceso ha sido validado exitosamente en puerta.</p>
                            </motion.div>
                        ) : (
                            <motion.div key="qr" className="flex flex-col items-center w-full relative z-20">
                                <div className="p-4 bg-white rounded-3xl shadow-[0_0_20px_rgba(255,255,255,0.1)] border-4 border-white mb-2 transform-gpu">
                                    <QRCodeCanvas 
                                        value={registration.qr_code} 
                                        size={220}
                                        bgColor={"#ffffff"}
                                        fgColor={"#000000"}
                                        level={"H"}
                                        includeMargin={false}
                                    />
                                </div>
                                <p className="text-gray-500 text-[11px] text-center mt-4 font-mono tracking-[0.3em]">
                                    {registration.qr_code.split('-')[0].toUpperCase()}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="w-full mt-8 space-y-4">
                        {registration.cabin_id && (
                            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10 backdrop-blur-sm">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">Cabaña Asignada</p>
                                <p className="text-primary font-black text-lg tracking-tight">{registration.cabin_id}</p>
                            </div>
                        )}
                        {!isCheckedIn && (
                            <p className="text-center text-[11px] text-gray-500 max-w-[250px] mx-auto leading-relaxed">
                                Presenta esta tarjeta digital al paramédico o staff en la puerta del evento.
                            </p>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
