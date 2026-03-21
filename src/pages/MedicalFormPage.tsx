import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, AlertCircle, Loader2, CheckCircle2, ArrowLeft, HeartPulse, ShieldAlert } from 'lucide-react';
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
                    
                    // Fetch member name to show in title
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

    // Ensure formData takes the user email after auth resolves
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
            
            // Mark as medical_cleared = true
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-10 font-sans">
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
            </header>

            {/* Main Form Area */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                ) : isSuccess ? (
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
                ) : (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col lg:flex-row gap-8">
                        
                        {/* Sidebar Information */}
                        <div className="lg:w-1/3 shrink-0 space-y-6">
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-[2rem] p-6 sm:p-8 border border-red-100 dark:border-red-900/50">
                                <div className="bg-red-100 dark:bg-red-900/40 w-12 h-12 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 mb-6">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-3">Tu Seguridad es Primero</h3>
                                <p className="text-red-800/80 dark:text-red-300/80 text-sm leading-relaxed mb-6">
                                    Esta información es manejada con estricta confidencialidad médica. Solo el paramédico jefe del campamento y tu líder asignado tendrán acceso a esto en caso de una eventualidad.
                                </p>
                                <div className="flex items-center gap-2 text-red-900 dark:text-red-300 text-sm font-bold bg-white/50 dark:bg-black/20 p-3 rounded-xl">
                                    <HeartPulse className="w-4 h-4" /> Formulario Encriptado
                                </div>
                            </div>
                        </div>

                        {/* Form Body */}
                        <div className="lg:w-2/3 bg-white dark:bg-gray-900 rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-gray-800 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none"></div>

                            <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
                                        <AlertCircle className="w-5 h-5 text-primary" /> Antecedentes Médicos
                                    </h3>
                                    
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Alergias Conocidas (Alimentos, Medicinas, Ambientes)</label>
                                        <textarea required value={formData.allergies || ''} onChange={e => setFormData({...formData, allergies: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none" rows={3} placeholder="Menciona cualquier tipo de alergia. Si no tienes, escribe 'Ninguna'." />
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Medicamentos Actuales o Condiciones Relevantes</label>
                                        <textarea required value={formData.medications || ''} onChange={e => setFormData({...formData, medications: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none" rows={3} placeholder="Ej. Llevo inhalador para asma, uso insulina... Si ninguna, escribe 'Ninguna'." />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tipo de Sangre</label>
                                        <select required value={formData.blood_type || ''} onChange={e => setFormData({...formData, blood_type: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none">
                                            <option value="" disabled>Selecciona tu tipo sanguíneo...</option>
                                            <option value="O+">O Positivo (O+)</option><option value="O-">O Negativo (O-)</option>
                                            <option value="A+">A Positivo (A+)</option><option value="A-">A Negativo (A-)</option>
                                            <option value="B+">B Positivo (B+)</option><option value="B-">B Negativo (B-)</option>
                                            <option value="AB+">AB Positivo (AB+)</option><option value="AB-">AB Negativo (AB-)</option>
                                            <option value="Desconocido">No lo sé</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-6">
                                    <h3 className="text-xl font-bold dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
                                        Contactos de Emergencia
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Nombre Completo del Tutor/Contacto</label>
                                            <input required type="text" value={formData.emergency_name || ''} onChange={e => setFormData({...formData, emergency_name: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="Juan Pérez G." />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Teléfono a 10 Dígitos</label>
                                            <input required type="tel" value={formData.emergency_phone || ''} onChange={e => setFormData({...formData, emergency_phone: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="55 1234 5678" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <div className="flex items-start gap-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 mb-8">
                                        <input id="consent" required type="checkbox" className="mt-1.5 w-6 h-6 shrink-0 text-primary rounded-lg border-gray-300 ring-primary focus:ring-primary" />
                                        <label htmlFor="consent" className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                            Declaro bajo protesta de decir verdad que los datos médicos proporcionados son correctos y completos. Entiendo que ocultar condiciones médicas críticas exime al escuadrón médico de toda responsabilidad legal, y en caso de eventualidad accedo a recibir intervención médica oportuna.
                                        </label>
                                    </div>

                                    <button disabled={saving} type="submit" className="w-full sm:w-auto sm:min-w-[300px] float-right bg-primary text-white py-4 px-8 rounded-2xl font-black text-lg hover:bg-primary-dark transition-all transform hover:scale-[1.02] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                                        {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                        {saving ? 'Procesando Expediente...' : 'Firmar Ficha Médica'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
