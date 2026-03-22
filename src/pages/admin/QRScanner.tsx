import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '../../lib/supabase';
import { supabaseApi } from '../../lib/api';
import { CheckCircle2, Ticket, XCircle, AlertCircle, Loader2, HeartPulse, X, ShieldAlert, ChevronLeft, ScanBarcode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function QRScanner() {
    const [scanResult, setScanResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cabins, setCabins] = useState<any[]>([]);
    const [medicalFullData, setMedicalFullData] = useState<any | null>(null);

    useEffect(() => {
        supabase.from('cabins').select('*').then(({ data }) => {
            if (data) setCabins(data);
        });
    }, []);

    const getCabinName = (id: string | number | null) => {
        if (!id) return 'Por asignar';
        return cabins.find(c => c.id === id)?.name || `Cabaña ${id}`;
    };

    const handleScan = async (detectedCodes: any[]) => {
        if (!detectedCodes || detectedCodes.length === 0) return;
        const code = detectedCodes[0].rawValue;
        
        if (loading || scanResult) return;
        
        setLoading(true);
        setError(null);
        try {
            // Minimum 2.5s delay for cool animation + parallel fetching
            const [regResult, memberResult] = await Promise.all([
                supabase.from('registrations').select('*, camp:camp_id(*)').eq('qr_code', code).maybeSingle(),
                supabase.from('group_members').select('*, registration:registration_id(*, camp:camp_id(*))').eq('qr_code', code).maybeSingle(),
                new Promise(r => setTimeout(r, 2500))
            ]);
            
            const regData = regResult.data;
            if (regData) {
                if (!regData.check_in_status) {
                    await supabaseApi.registrations.update(regData.id, { check_in_status: true });
                    regData.check_in_status = true;
                }
                setScanResult({ type: 'main', registration: regData, camp: regData.camp });
                setLoading(false);
                return;
            }

            const memberData = memberResult.data;
            if (memberData) {
                if (!memberData.check_in_status) {
                    await supabaseApi.groupMembers.update(memberData.id, { check_in_status: true });
                    memberData.check_in_status = true;
                }
                setScanResult({ type: 'member', member: memberData, registration: memberData.registration, camp: memberData.registration.camp });
                setLoading(false);
                return;
            }

            setError("Código QR inválido o no encontrado.");
        } catch (err: any) {
            console.error(err);
            setError("Error al consultar la base de datos.");
        } finally {
            setLoading(false);
        }
    };

    const handleError = (error: unknown) => {
        console.error(error);
        if (error instanceof Error) {
            if (error.name === 'NotAllowedError') {
                setError("Permiso de cámara denegado.");
            } else if (error.name === 'NotFoundError') {
                setError("No se detectó ninguna cámara.");
            } else {
                setError(`Error: ${error.message}`);
            }
        } else {
            setError("Error desconocido en la cámara.");
        }
    };

    const handleReset = () => {
        setScanResult(null);
        setError(null);
        setMedicalFullData(null);
    };

    return (
        <div className="relative max-w-2xl mx-auto w-full h-[calc(100vh-140px)] flex flex-col">
            <AnimatePresence mode="wait">
                {/* SCANNER VIEW */}
                {!scanResult ? (
                    <motion.div 
                        key="scanner-view"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="flex-1 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold dark:text-white mt-2">Escáner de Acceso</h2>
                        </div>
                        
                        <div className="flex-1 bg-black rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/10 relative flex flex-col border border-gray-800">
                            {/* Camera overlay UI (native feel) */}
                            <div className="absolute top-0 left-0 right-0 p-6 z-10 bg-gradient-to-b from-black/80 to-transparent flex justify-center pointer-events-none">
                                <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-white text-xs font-bold tracking-widest uppercase shadow-lg">
                                    Alinea el código QR
                                </div>
                            </div>

                            <div className="flex-1 w-full relative">
                                <Scanner 
                                    onScan={handleScan}
                                    onError={handleError}
                                    formats={['qr_code']}
                                    components={{ finder: true }}
                                    styles={{ container: { width: '100%', height: '100%' } }}
                                />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-8 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-center pointer-events-none">
                                <div className="text-white/60 text-sm font-medium flex items-center gap-2">
                                    <ScanBarcode className="w-5 h-5 opacity-50" />
                                    Buscando pase...
                                </div>
                            </div>
                            
                            {loading && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-md z-20 overflow-hidden"
                                >
                                    {/* Scanning laser effect */}
                                    <motion.div 
                                        className="absolute top-0 left-0 right-0 h-1 bg-primary drop-shadow-[0_0_15px_rgba(239,68,68,1)] z-30"
                                        animate={{ y: ['0%', '800px', '0%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    />
                                    
                                    {/* Sonar pulses */}
                                    <motion.div 
                                        className="absolute w-32 h-32 border border-primary/40 rounded-full"
                                        animate={{ scale: [0.8, 2.5], opacity: [0.8, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                                    />
                                    <motion.div 
                                        className="absolute w-32 h-32 border border-primary/40 rounded-full"
                                        animate={{ scale: [0.8, 2.5], opacity: [0.8, 0] }}
                                        transition={{ duration: 1.5, delay: 0.75, repeat: Infinity, ease: 'easeOut' }}
                                    />
                                    
                                    <div className="relative z-40 bg-black/50 backdrop-blur-xl p-8 rounded-[2rem] flex flex-col items-center gap-6 border border-white/5 shadow-2xl">
                                        <div className="relative">
                                            <ScanBarcode className="w-16 h-16 text-primary animate-pulse" />
                                            <div className="absolute inset-0 bg-primary blur-2xl opacity-40 animate-pulse" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-black text-xl tracking-tight mb-1">Analizando QR</p>
                                            <p className="text-white/60 text-sm font-medium">Buscando expediente en servidor...</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Camera Error Overlay */}
                            {error && (
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-md z-30 p-6 text-center">
                                    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl max-w-sm">
                                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                        <p className="font-bold text-white mb-2">Error de escaneo</p>
                                        <p className="text-white/70 text-sm mb-6">{error}</p>
                                        <button onClick={handleReset} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors">
                                            Reintentar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    /* RESULT VIEW (NATIVE SLIDE UP) */
                    <motion.div 
                        key="result-view"
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute inset-0 z-50 bg-gray-50 dark:bg-gray-950 flex flex-col"
                    >
                        {/* Native App Header Area */}
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                            <button onClick={handleReset} className="flex items-center gap-1 text-primary hover:text-primary-dark transition-colors py-2 px-1 font-medium">
                                <ChevronLeft className="w-6 h-6" /> Escáner
                            </button>
                            <span className="font-bold tracking-tight text-gray-900 dark:text-white">Acceso a Evento</span>
                            <div className="w-20" /> {/* Balancer */}
                        </div>

                        {/* Result Card taking full height comfortably */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32">
                            <div className="bg-white dark:bg-gray-900 shadow-xl shadow-green-900/5 rounded-[2rem] overflow-hidden border border-green-100 dark:border-green-900/30">
                                {/* Success Header */}
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-center relative overflow-hidden text-white">
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                                        className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-inner relative z-10"
                                    >
                                        <CheckCircle2 className="w-10 h-10 text-white" />
                                    </motion.div>
                                    <h3 className="text-2xl font-black tracking-tight relative z-10">¡Acceso Autorizado!</h3>
                                    <p className="text-green-50/90 font-medium mt-1 relative z-10">{scanResult.camp?.title}</p>
                                    
                                    {/* Deco curves */}
                                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-black/10 rounded-full blur-2xl" />
                                </div>

                                {/* Body Information */}
                                <div className="p-6 sm:p-8 space-y-6">
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Nombre del Acampante</p>
                                        <p className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                                            {scanResult.type === 'member' 
                                                ? `${scanResult.member.first_name} ${scanResult.member.last_name}`
                                                : (scanResult.registration.user_name || scanResult.registration.user_email)}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Cabaña Asignada</p>
                                            <p className="font-bold text-lg dark:text-white">
                                                {scanResult.type === 'member' 
                                                    ? getCabinName(scanResult.member.cabin_id)
                                                    : getCabinName(scanResult.registration.cabin_id)}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Tipo de Pase</p>
                                            <p className="font-bold text-lg dark:text-white capitalize">
                                                {scanResult.type === 'member'
                                                    ? `Miembro`
                                                    : (scanResult.registration.reg_type === 'group' ? `Líder (${scanResult.registration.group_size})` : 'Individual')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Medical Status Card */}
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <p className="text-xs uppercase font-bold text-gray-400 mb-3 text-center">Estado de Salud</p>
                                        
                                        {(scanResult.type === 'member' ? scanResult.member.medical_cleared : scanResult.registration.medical_cleared) ? (
                                            <button 
                                                onClick={async () => {
                                                    setLoading(true);
                                                    try {
                                                        const data = scanResult.type === 'member' 
                                                            ? await supabaseApi.medicalForms.getByMember(scanResult.member.id)
                                                            : await supabaseApi.medicalForms.getByRegistration(scanResult.registration.id);
                                                        setMedicalFullData(data || { empty: true });
                                                    } finally { setLoading(false); }
                                                }}
                                                className="w-full flex items-center justify-center gap-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 p-4 rounded-2xl font-bold transition-colors border border-green-200 dark:border-green-800/50"
                                            >
                                                <HeartPulse className="w-6 h-6" /> Abrir Expediente Médico
                                            </button>
                                        ) : (
                                            <div className="w-full flex flex-col items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-2xl font-bold border border-red-200 dark:border-red-800/50">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="w-5 h-5"/> 
                                                    <span>Sin Ficha Médica (RIESGO)</span>
                                                </div>
                                                <p className="text-xs font-normal opacity-80 text-center">No se ha llenado el formulario de salud obligatorio para este acampante.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Floating Action Button for Next Scan */}
                            <div className="fixed bottom-24 lg:bottom-10 left-0 right-0 px-6 max-w-2xl mx-auto z-40">
                                <button 
                                    onClick={handleReset} 
                                    className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-lg font-bold rounded-2xl shadow-xl shadow-gray-900/20 dark:shadow-white/10 active:scale-95 transition-transform flex items-center justify-center gap-2"
                                >
                                    <ScanBarcode className="w-6 h-6" /> Escanear Siguiente
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Medical Detail Fullscreen Native Modal */}
            <AnimatePresence>
                {medicalFullData && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-gray-950"
                    >
                        {/* Fake Native Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
                            <button onClick={() => setMedicalFullData(null)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white p-2 flex items-center gap-1 font-medium">
                                <ChevronLeft className="w-6 h-6" /> Volver
                            </button>
                            <span className="font-bold">Info. Médica</span>
                            <div className="w-20" /> {/* Balancer */}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20">
                            <div className="max-w-xl mx-auto">
                                <div className="text-center mb-8 mt-4">
                                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-gray-950 shadow-lg">
                                        <HeartPulse className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tight dark:text-white">Expediente Clínico</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Información vital de este asistente</p>
                                </div>

                                {medicalFullData.empty ? (
                                    <div className="bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-8 text-center">
                                        <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p className="font-bold text-gray-600 dark:text-gray-300">No se encontraron datos médicos llenados.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                            <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Alergias</p>
                                            <p className="text-base font-medium dark:text-white">{medicalFullData.allergies || 'Ninguna conocida'}</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                            <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Medicamentos / Condiciones</p>
                                            <p className="text-base font-medium dark:text-white whitespace-pre-line">{medicalFullData.medications || 'Ninguna condición especial reportada'}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm text-center">
                                                <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Tipo de Sangre</p>
                                                <p className="text-2xl font-black dark:text-white text-red-500">{medicalFullData.blood_type || 'Desconocido'}</p>
                                            </div>
                                            <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-3xl border border-red-200 dark:border-red-900/30">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Contacto de Emergencia</p>
                                                <p className="text-sm font-bold dark:text-white line-clamp-2 leading-tight mb-1">{medicalFullData.emergency_name}</p>
                                                <p className="text-sm font-black text-red-600">{medicalFullData.emergency_phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
