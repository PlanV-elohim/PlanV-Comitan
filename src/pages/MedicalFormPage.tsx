import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, AlertCircle, Loader2, CheckCircle2, ArrowLeft, HeartPulse, ShieldAlert, ArrowRight, User as UserIcon, Activity, Phone } from 'lucide-react';
import { useParams, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { supabaseApi } from '../lib/api';
import { useAuth } from '../lib/auth';


export default function MedicalFormPage() {
    const { id: registrationId } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const memberId = searchParams.get('member_id');
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [memberName, setMemberName] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    
    const [formData, setFormData] = useState({
        registration_id: memberId ? null : (registrationId || ''),
        group_member_id: memberId || null,
        user_email: user?.email || '',
        allergies: '',
        medications: '',
        emergency_name: '',
        emergency_phone: '',
        blood_type: ''
    });

    useEffect(() => {
        const fetchForm = async () => {
            try {
                if (memberId) {
                    const existingForm = await supabaseApi.medicalForms.getByMember(memberId);
                    if (existingForm) setFormData(existingForm);
                    
                    const { data: member } = await supabase.from('group_members').select('first_name, last_name').eq('id', memberId).single();
                    if (member) setMemberName(`${member.first_name} ${member.last_name}`);
                } else if (registrationId) {
                    const existingForm = await supabaseApi.medicalForms.getByRegistration(registrationId);
                    if (existingForm) setFormData(existingForm);
                }
            } catch (error) {
                console.error("No form found or error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [registrationId, memberId]);

    useEffect(() => {
        if (user?.email && !formData.user_email) {
            setFormData(prev => ({ ...prev, user_email: user.email as string }));
        }
    }, [user, formData.user_email]);

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Loader2 className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"/></div>;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await supabaseApi.medicalForms.upsert(formData);
            
            if (memberId) {
                await supabaseApi.groupMembers.update(memberId, { medical_cleared: true });
            } else if (registrationId) {
                await supabaseApi.registrations.update(registrationId, { medical_cleared: true });
            }
            
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/portal');
            }, 3000);
        } catch (error) {
            console.error("Error saving form", error);
            alert("No se pudo guardar la información. Por favor, revisa tu conexión.");
        } finally {
            setSaving(false);
        }
    };

    const nextStep = () => {
        // Validation per step
        if (step === 1) {
            if (!formData.allergies || !formData.medications) return alert('Completa los campos requeridos para continuar.');
            setStep(2);
        } else if (step === 2) {
            if (!formData.blood_type || !formData.emergency_name || !formData.emergency_phone) return alert('Completa los datos de emergencia y tipo de sangre.');
            setStep(3);
        }
    };

    const prevStep = () => setStep(step - 1);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-10 font-sans flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/portal')}
                        className="p-2 -ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <div>
                        <h1 className="text-lg sm:text-2xl font-bold dark:text-white tracking-tight leading-tight">
                            {memberName ? `Ficha de: ${memberName}` : 'Expediente Médico'}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Requisito obligatorio para acampar</p>
                    </div>
                </div>
                
                {/* Progress Bar */}
                {!loading && !isSuccess && (
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <motion.div 
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: step / 3 }}
                            style={{ transformOrigin: 'left' }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-primary to-orange-400"
                        />
                    </div>
                )}
            </header>

            {/* Main Form Area */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-10 flex flex-col md:flex-row gap-8">
                {loading ? (
                    <div className="flex-1 flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                ) : isSuccess ? (
                    <div className="flex-1 w-full">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 sm:p-12 shadow-sm border border-gray-200 dark:border-gray-800 text-center max-w-xl mx-auto mt-10">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16" />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black dark:text-white mb-4 tracking-tight">¡Expediente Validado!</h2>
                            <p className="text-gray-500 text-base sm:text-lg mb-8 max-w-md mx-auto">
                                Tu información clínica ha sido encriptada y guardada. Tu pase de abordar ha sido habilitado exitosamente. Redirigiendo al portal...
                            </p>
                            <button onClick={() => navigate('/portal')} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                Volver al Portal
                            </button>
                        </motion.div>
                    </div>
                ) : (
                    <>
                        {/* Sidebar Information */}
                        <div className="md:w-1/3 shrink-0 space-y-6 hidden md:block">
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-[2rem] p-6 sm:p-8 border border-red-100 dark:border-red-900/50 sticky top-28">
                                <div className="bg-red-100 dark:bg-red-900/40 w-12 h-12 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 mb-6">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-3">Tu Seguridad es Primero</h3>
                                <p className="text-red-800/80 dark:text-red-300/80 text-sm leading-relaxed mb-6">
                                    Esta información es manejada con estricta confidencialidad médica. Solo el paramédico jefe del campamento y tu líder asignado tendrán acceso a esto en caso de una eventualidad.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <div className={`flex items-center gap-3 text-sm font-bold p-3 rounded-xl transition-colors ${step >= 1 ? 'bg-white/60 dark:bg-black/40 text-red-900 dark:text-red-200 shadow-sm' : 'text-red-900/50 dark:text-red-200/50'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-red-200 dark:bg-red-800/50' : 'bg-red-200/50 dark:bg-red-800/20'}`}>1</div>
                                        Antecedentes Clínicos
                                    </div>
                                    <div className={`flex items-center gap-3 text-sm font-bold p-3 rounded-xl transition-colors ${step >= 2 ? 'bg-white/60 dark:bg-black/40 text-red-900 dark:text-red-200 shadow-sm' : 'text-red-900/50 dark:text-red-200/50'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-red-200 dark:bg-red-800/50' : 'bg-red-200/50 dark:bg-red-800/20'}`}>2</div>
                                        Emergencias & Sangre
                                    </div>
                                    <div className={`flex items-center gap-3 text-sm font-bold p-3 rounded-xl transition-colors ${step >= 3 ? 'bg-white/60 dark:bg-black/40 text-red-900 dark:text-red-200 shadow-sm' : 'text-red-900/50 dark:text-red-200/50'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-red-200 dark:bg-red-800/50' : 'bg-red-200/50 dark:bg-red-800/20'}`}>3</div>
                                        Firma y Consentimiento
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Body - Wizard Steps */}
                        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-gray-800 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none"></div>

                            <form onSubmit={handleSubmit} className="flex-1 flex flex-col relative z-10 w-full min-h-[400px]">
                                <AnimatePresence mode="wait">
                                    {/* STEP 1 */}
                                    {step === 1 && (
                                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 space-y-6">
                                            <div className="mb-8">
                                                <h3 className="text-2xl font-black dark:text-white flex items-center gap-3">
                                                    <Activity className="w-8 h-8 text-primary bg-primary/10 p-1.5 rounded-xl" /> Antecedentes
                                                </h3>
                                                <p className="text-gray-500 mt-2">Dinos todo lo que nuestro equipo médico debería saber.</p>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Alergias Conocidas (Alimentos, Medicinas, Ambientes)</label>
                                                <textarea required value={formData.allergies || ''} onChange={e => setFormData({...formData, allergies: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none" rows={4} placeholder="Menciona cualquier tipo de alergia. Si no tienes, escribe 'Ninguna'." />
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Medicamentos Actuales o Condiciones Relevantes</label>
                                                <textarea required value={formData.medications || ''} onChange={e => setFormData({...formData, medications: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none" rows={4} placeholder="Ej. Uso inhalador para asma, uso insulina... Si ninguna, escribe 'Ninguna'." />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 2 */}
                                    {step === 2 && (
                                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 space-y-6">
                                            <div className="mb-8">
                                                <h3 className="text-2xl font-black dark:text-white flex items-center gap-3">
                                                    <AlertCircle className="w-8 h-8 text-blue-500 bg-blue-500/10 p-1.5 rounded-xl" /> Emergencias
                                                </h3>
                                                <p className="text-gray-500 mt-2">¿A quién debemos llamar si necesitamos ayuda?</p>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tipo de Sangre</label>
                                                <select required value={formData.blood_type || ''} onChange={e => setFormData({...formData, blood_type: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none font-medium">
                                                    <option value="" disabled>Selecciona tu tipo sanguíneo...</option>
                                                    <option value="O+">O Positivo (O+)</option><option value="O-">O Negativo (O-)</option>
                                                    <option value="A+">A Positivo (A+)</option><option value="A-">A Negativo (A-)</option>
                                                    <option value="B+">B Positivo (B+)</option><option value="B-">B Negativo (B-)</option>
                                                    <option value="AB+">AB Positivo (AB+)</option><option value="AB-">AB Negativo (AB-)</option>
                                                    <option value="Desconocido">No lo sé</option>
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-1 gap-5 mt-6 border-t border-gray-100 dark:border-gray-800 pt-6">
                                                <div className="space-y-3">
                                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><UserIcon className="w-4 h-4"/> Nombre del Contacto de Emergencia</label>
                                                    <input required type="text" value={formData.emergency_name || ''} onChange={e => setFormData({...formData, emergency_name: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="Nombre completo" />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Phone className="w-4 h-4"/> Teléfono a 10 Dígitos</label>
                                                    <input required type="tel" value={formData.emergency_phone || ''} onChange={e => setFormData({...formData, emergency_phone: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="10 dígitos" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 3 */}
                                    {step === 3 && (
                                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col pt-6">
                                            <div className="text-center mb-10">
                                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-3">
                                                    <ShieldAlert className="w-10 h-10" />
                                                </div>
                                                <h3 className="text-3xl font-black dark:text-white mb-3">Términos Finales</h3>
                                                <p className="text-gray-500 max-w-sm mx-auto">Confirma la veracidad de tu información para generar tu Pase de Abordar.</p>
                                            </div>

                                            <div className="flex items-start gap-4 bg-gray-50 dark:bg-gray-800/50 p-6 md:p-8 rounded-[2rem] border-2 border-transparent hover:border-primary/20 transition-colors mb-auto">
                                                <input id="consent" required type="checkbox" className="mt-1.5 w-6 h-6 shrink-0 text-primary rounded-[0.4rem] border-gray-300 ring-primary focus:ring-primary cursor-pointer transition-all" />
                                                <label htmlFor="consent" className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium cursor-pointer">
                                                    Declaro bajo protesta de decir verdad que los datos médicos proporcionados son correctos y completos. Entiendo que ocultar condiciones críticas exime al escuadrón médico de toda responsabilidad legal, y en caso de eventualidad accedo a recibir intervención oportuna.
                                                </label>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Bottom Navigation */}
                                <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    {step > 1 ? (
                                        <button type="button" onClick={prevStep} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 dark:hover:text-white transition-colors py-3 px-2">
                                            <ArrowLeft className="w-5 h-5" /> Atrás
                                        </button>
                                    ) : <div></div>}

                                    {step < 3 ? (
                                        <button type="button" onClick={nextStep} className="bg-dark dark:bg-white text-white dark:text-gray-900 px-8 py-3.5 rounded-2xl font-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2 shadow-lg shadow-black/10 dark:shadow-white/10">
                                            Siguiente <ArrowRight className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button disabled={saving} type="submit" className="bg-green-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-green-700 transition-all flex items-center gap-2 shadow-xl shadow-green-600/20 disabled:opacity-50 disabled:scale-100 transform hover:scale-[1.02]">
                                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            {saving ? 'Validando...' : 'Firmar y Generar Pase'}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
