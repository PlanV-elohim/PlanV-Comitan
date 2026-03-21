import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '../../lib/supabase';
import { supabaseApi } from '../../lib/api';
import { CheckCircle2, Ticket, XCircle, AlertCircle, Loader2, HeartPulse, X, ShieldAlert } from 'lucide-react';

export default function QRScanner() {
    const [scanResult, setScanResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cabins, setCabins] = useState<any[]>([]);
    const [medicalFullData, setMedicalFullData] = useState<any | null>(null);

    useEffect(() => {
        // Load cabins for display
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
        
        if (loading || (scanResult && scanResult.registration.qr_code === code)) return; // Prevent double scan
        
        setLoading(true);
        setError(null);
        try {
            const { data: regData } = await supabase.from('registrations').select('*, camp:camp_id(*)').eq('qr_code', code).maybeSingle();
            
            if (regData) {
                if (!regData.check_in_status) {
                    await supabaseApi.registrations.update(regData.id, { check_in_status: true });
                    regData.check_in_status = true;
                }
                setScanResult({ type: 'main', registration: regData, camp: regData.camp });
                setLoading(false);
                return;
            }

            const { data: memberData } = await supabase.from('group_members').select('*, registration:registration_id(*, camp:camp_id(*))').eq('qr_code', code).maybeSingle();
            
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
                setError("Permiso de cámara denegado. Ve a los ajustes de tu navegador y permite el uso de la cámara.");
            } else if (error.name === 'NotFoundError') {
                setError("No se detectó ninguna cámara en este dispositivo.");
            } else if (error.name === 'NotSupportedError' || window.location.protocol !== 'https:') {
                // If not localhost and not https, browsers block getUserMedia silently
                if (window.location.hostname !== 'localhost' && window.location.protocol !== 'https:') {
                    setError("Android y iOS bloquean la cámara si no usas HTTPS. Si estás probando en tu red local, usa un túnel seguro (ngrok) o HTTPS.");
                } else {
                    setError("Tu navegador no soporta acceso a la cámara o el contexto no es seguro.");
                }
            } else {
                setError(`Error de cámara: ${error.message}`);
            }
        } else {
            setError("Error desconocido al abrir la cámara.");
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">Escáner de Acceso (QR)</h2>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="aspect-square w-full sm:w-[400px] mx-auto rounded-3xl overflow-hidden bg-black relative shadow-inner">
                    <Scanner 
                        onScan={handleScan}
                        onError={handleError}
                        formats={['qr_code']}
                        components={{ finder: true }}
                    />
                    
                    {loading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        </div>
                    )}
                </div>
                
                <p className="text-center text-sm text-gray-500 mt-4">
                    Apunta la cámara al pase de abordar del acampante.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-6 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                    <XCircle className="w-8 h-8 shrink-0" />
                    <div>
                        <p className="font-bold">Error de escaneo</p>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {scanResult && !error && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-6 rounded-3xl flex items-start gap-4 animate-in slide-in-from-bottom-4 relative overflow-hidden shadow-lg border border-green-200 dark:border-green-800/50">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full -z-10"></div>
                    <CheckCircle2 className="w-10 h-10 shrink-0 text-green-500 z-10" />
                    <div className="z-10 w-full pl-2">
                        <div className="flex justify-between items-start w-full">
                            <div>
                                <p className="font-black text-xl mb-1 flex items-center gap-2 tracking-tight">
                                    <Ticket className="w-5 h-5 text-green-600 dark:text-green-400" /> Acceso Autorizado
                                </p>
                                <p className="text-lg font-bold opacity-90">
                                    {scanResult.type === 'member' 
                                        ? `${scanResult.member.first_name} ${scanResult.member.last_name}`
                                        : (scanResult.registration.user_name || scanResult.registration.user_email)}
                                </p>
                                <p className="text-sm font-medium opacity-80 mt-1">{scanResult.camp?.title}</p>
                            </div>
                            <button onClick={() => setScanResult(null)} className="text-sm bg-white/50 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/40 px-3 py-1.5 rounded-xl font-bold transition-colors">
                                Siguiente
                            </button>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-green-200/50 dark:border-green-800/50 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="opacity-60 font-medium text-xs uppercase tracking-wider">Cabaña / ID</p>
                                <p className="font-bold">
                                    {scanResult.type === 'member' 
                                        ? getCabinName(scanResult.member.cabin_id)
                                        : getCabinName(scanResult.registration.cabin_id)}
                                </p>
                            </div>
                            <div>
                                <p className="opacity-60 font-medium text-xs uppercase tracking-wider">Tipo</p>
                                <p className="font-bold uppercase">
                                    {scanResult.type === 'member'
                                        ? `Miembro Grupo`
                                        : (scanResult.registration.reg_type === 'group' ? `Grupo Líder (${scanResult.registration.group_size})` : 'Individual')}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="opacity-60 font-medium text-xs uppercase tracking-wider mb-2">Salud / Expediente</p>
                                <div className="flex gap-2">
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
                                            className="inline-flex items-center gap-2 bg-green-200/70 dark:bg-green-800/50 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight hover:bg-green-300 transition-colors"
                                        >
                                            <HeartPulse className="w-4 h-4" /> Ver Ficha Médica ✓
                                        </button>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight">
                                            <AlertCircle className="w-4 h-4"/> Sin Ficha (RIESGO)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Medical Detail Overlay (Reusing same style plan) */}
            {medicalFullData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setMedicalFullData(null)}>
                    <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-br from-red-600 to-orange-500 p-8 text-white relative">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <HeartPulse className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight">Expediente Clínico</h3>
                                        <p className="text-white/80 text-sm font-medium">Información vital del acampante</p>
                                    </div>
                                </div>
                                <button onClick={() => setMedicalFullData(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {medicalFullData.empty ? (
                                <div className="text-center py-10 opacity-50">
                                    <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
                                    <p className="font-bold">No se encontraron datos médicos.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Alergias</p>
                                        <p className="text-sm font-bold dark:text-white leading-relaxed">{medicalFullData.allergies || 'Ninguna'}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Medicamentos / Condiciones</p>
                                        <p className="text-sm font-bold dark:text-white leading-relaxed">{medicalFullData.medications || 'Ninguna'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Sangre</p>
                                            <p className="text-xl font-black dark:text-white">{medicalFullData.blood_type || '—'}</p>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/20">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Contacto Emergencia</p>
                                            <p className="text-[10px] font-bold dark:text-white break-words line-clamp-1">{medicalFullData.emergency_name || '—'}</p>
                                            <p className="text-sm font-black text-red-600 mt-1">{medicalFullData.emergency_phone || '—'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <button onClick={() => setMedicalFullData(null)} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-center transition-transform active:scale-95 shadow-xl">
                                Cerrar Detalle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
