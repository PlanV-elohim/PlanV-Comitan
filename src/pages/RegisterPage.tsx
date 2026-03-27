import { useState, FormEvent, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowLeft, Users, User, ArrowRight, ChevronRight } from 'lucide-react';
import { CampEvent } from '../types';
import Confetti from '../components/Confetti';
import { useToast } from '../components/ui/Toast';
import { playSuccessSound } from '../lib/sound';
import { trackEvent } from '../lib/analytics';

export default function RegisterPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();
    
    // El campamento debe venir o del state (si navegó) o podríamos fetchearlo después si recargó
    const camp = location.state?.camp as CampEvent | undefined;

    const [step, setStep] = useState<number | 'pay' | 'success'>(1);
    const [regType, setRegType] = useState<'individual' | 'group' | null>(null);
    const [groupSize, setGroupSize] = useState<any>(2);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Form states
    const [responsible, setResponsible] = useState({
        name: '', lastName: '', age: '', phone: '', email: '', gender: '', isFromChurch: '', churchName: ''
    });
    const [companions, setCompanions] = useState<Array<{ name: string, lastName: string, age: string, phone: string, gender: string }>>([]);

    // Card States
    const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
    const [cardFlipped, setCardFlipped] = useState(false);
    const [payInputFocused, setPayInputFocused] = useState(false);
    const [payProcessing, setPayProcessing] = useState(false);
    const [currentOccupancy, setCurrentOccupancy] = useState<number>(0);

    useEffect(() => {
        if (camp?.id) {
            import('../lib/api').then(({ supabaseApi }) => {
                supabaseApi.registrations.getOccupancy(camp.id)
                    .then(setCurrentOccupancy)
                    .catch(console.error);
            });
        }
    }, [camp?.id]);

    // Redirect if no camp
    if (!camp) {
        return <Navigate to="/" replace />;
    }

    // Effect for companions array
    useEffect(() => {
        if (regType === 'group' && groupSize > 1) {
            setCompanions(prev => {
                const newCompanions = [...prev];
                while (newCompanions.length < groupSize - 1) {
                    newCompanions.push({ name: '', lastName: '', age: '', phone: '', gender: '' });
                }
                while (newCompanions.length > groupSize - 1) {
                    newCompanions.pop();
                }
                return newCompanions;
            });
        }
    }, [groupSize, regType]);

    const handleNext = (e: FormEvent) => {
        e.preventDefault();
        
        if (step === 1) {
            if (!regType) return;
            setStep(2);
            return;
        }

        if (step === 2) {
            if (regType === 'individual') {
                setStep('pay');
            } else {
                setStep(3); // Go to first companion
            }
            return;
        }

        if (typeof step === 'number' && step >= 3) {
            const companionIdx = step - 3;
            if (companionIdx === groupSize - 2) {
                // Last companion
                setStep('pay');
            } else {
                setStep(step + 1);
            }
        }
    };

    const handleBack = () => {
        if (step === 1 && regType === null) {
            navigate(-1);
        } else if (step === 1 && regType !== null) {
            setRegType(null);
        } else if (String(step) === 'pay') {
            setStep(regType === 'individual' ? 2 : 1 + groupSize);
        } else if (typeof step === 'number' && step > 1) {
            setStep(step - 1);
        }
    };

    const updateCompanion = (index: number, field: string, value: string) => {
        const newCompanions = [...companions];
        newCompanions[index] = { ...newCompanions[index], [field]: value };
        setCompanions(newCompanions);
    };

    const completeRegistration = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setPayProcessing(true);
        
        await new Promise(r => setTimeout(r, 1800));

        try {
            const { supabaseApi } = await import('../lib/api');
            const { supabase } = await import('../lib/supabase');

            const { data: existing } = await supabase
                .from('registrations')
                .select('id')
                .eq('camp_id', camp.id)
                .eq('responsable_email', responsible.email)
                .maybeSingle();

            if (existing) {
                showToast('Ya tienes una inscripción registrada para este campamento.', 'error');
                setIsSubmitting(false);
                setPayProcessing(false);
                return;
            }

            const currentSpaces = await supabaseApi.registrations.getOccupancy(camp.id);
            const maxCapacity = camp.capacity ?? 30; // Fallback to 30 as requested
            if (currentSpaces + groupSize > maxCapacity) {
                showToast(`Lo sentimos, solo quedan ${Math.max(0, maxCapacity - currentSpaces)} cupos disponibles.`, 'error');
                setIsSubmitting(false);
                setPayProcessing(false);
                return;
            }

            const cleanEmail = responsible.email.trim().toLowerCase();
            const regResponse = await supabaseApi.registrations.create({
                camp_id: camp.id,
                reg_type: regType,
                group_size: groupSize,
                responsable_name: responsible.name,
                responsable_lastname: responsible.lastName,
                responsable_age: parseInt(responsible.age) || 0,
                responsable_phone: responsible.phone,
                responsable_email: cleanEmail,
                gender: responsible.gender,
                is_from_church: responsible.isFromChurch === 'yes',
                church_name: responsible.churchName || null
            });

            const newRegId = regResponse[0]?.id;

            if (regType === 'group' && companions.length > 0 && newRegId) {
                for (const c of companions) {
                    if (c.name.trim() !== '') {
                        await supabaseApi.groupMembers.create({
                            registration_id: newRegId,
                            first_name: c.name,
                            last_name: c.lastName,
                            age: parseInt(c.age) || 0,
                            phone: c.phone || '',
                            gender: c.gender || null
                        });
                    }
                }
            }

            setPayProcessing(false);
            setStep('success');
            setShowConfetti(true);
            playSuccessSound();
            showToast('¡Registro completado con éxito!', 'success');
        } catch (error) {
            console.error('Registration error:', error);
            showToast('Error al procesar tu pago y registro. Por favor intenta de nuevo.', 'error');
            setIsSubmitting(false);
            setPayProcessing(false);
        }
    };

    const isPromoActive = useMemo(() => {
        if (!camp.has_promo) return false;
        if (camp.promo_capacity && camp.promo_capacity > 0 && currentOccupancy >= camp.promo_capacity) return false;
        return true;
    }, [camp, currentOccupancy]);

    const activePrice = isPromoActive ? (camp.promo_price ?? 0) : (camp.price ?? 0);
    const cardReady = card.number.replace(/\s/g, '').length === 16 && card.name.trim().length > 1;
    const currentGroupSize = typeof groupSize === 'number' ? groupSize : (parseInt(groupSize || '2') || 2);
    const totalPrice = activePrice * (regType === 'group' ? currentGroupSize : 1);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
            {showConfetti && <Confetti active={true} />}

            <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-4 px-6 sticky top-0 z-10 flex items-center shadow-sm">
                {step !== 'success' && (
                    <button onClick={handleBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mr-3">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                )}
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Min. Elohim</h1>
                <div className="ml-auto flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:block">
                        {camp.title}
                    </span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto p-4 sm:p-8 flex flex-col">
                {isPromoActive && step !== 'success' && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="mb-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-5 sm:p-6 shadow-xl shadow-orange-500/20 flex flex-col sm:flex-row items-center gap-5 text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
                        
                        <div className="shrink-0 bg-white/20 p-4 rounded-full backdrop-blur-md relative z-10 shadow-inner">
                           <span className="text-3xl">🏷️</span>
                        </div>
                        <div className="flex-1 text-center sm:text-left relative z-10">
                            <h3 className="font-black text-xl sm:text-2xl tracking-tight leading-tight shadow-sm drop-shadow-md">
                                {camp.promo_description}
                            </h3>
                            <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <span className="text-white/90 text-sm font-medium">Precio Especial:</span>
                                <span className="font-bold text-white bg-white/20 px-3 py-1 rounded-lg shadow-sm border border-white/10">${camp.promo_price} MXN</span> 
                                {(camp.promo_capacity ?? 0) > 0 && <span className="inline-block px-2.5 py-1 bg-red-900/40 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm border border-red-900/30">— Quedan pocos lugares</span>}
                            </div>
                        </div>
                    </motion.div>
                )}

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                    className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col flex-1"
                >
                    {step !== 'pay' && step !== 'success' && (
                        <>
                            <div className="relative h-40 bg-dark shrink-0">
                                <img src={camp.image} alt={camp.title} className="w-full h-full object-cover opacity-40" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                                <div className="absolute bottom-6 left-8 text-white">
                                    <p className="text-sm font-medium text-primary mb-1 uppercase tracking-wider">Registro al Campamento</p>
                                    <h3 className="text-3xl font-bold">{camp.title}</h3>
                                </div>
                            </div>

                            {/* Animated Progress Bar */}
                            {(() => {
                                const totalSteps = regType === 'group' ? 2 + (groupSize - 1) + 1 : 3;
                                const currentNum = typeof step === 'string' ? totalSteps : step;
                                const pct = Math.round((currentNum / totalSteps) * 100);
                                const labels: Record<string, string> = { '1': 'Tipo de registro', '2': 'Tus datos', 'pay': 'Pago' };
                                const label = typeof step === 'number' && step >= 3 ? `Acompañante ${step - 2}` : (labels[String(step)] ?? '');
                                return (
                                    <div className="px-8 pt-5 pb-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</span>
                                            <span className="text-xs font-black text-primary tabular-nums">{pct}%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full origin-left"
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: pct / 100 }}
                                                style={{ transformOrigin: 'left' }}
                                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                            />
                                        </div>
                                    </div>
                                );
                            })()}
                        </>
                    )}

                    <div className="p-6 md:p-8 flex-1 flex flex-col">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.form 
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleNext} 
                                    className="space-y-6 flex flex-col h-full"
                                >
                                    <div>
                                        <h4 className="text-xl font-bold dark:text-white mb-2">Selecciona tu tipo de inscripción</h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">¿Vienes solo o en grupo?</p>
                                    </div>
                                    <div className={`grid gap-4 ${regType === null ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                                        <AnimatePresence mode="popLayout">
                                            {(regType === null || regType === 'individual') && (
                                                <motion.button 
                                                    key="btn-individual"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    type="button" 
                                                    disabled={isPromoActive}
                                                    onClick={() => { setRegType('individual'); setGroupSize(1); }} 
                                                    className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${regType === 'individual' ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-100 dark:border-gray-800 hover:border-primary/50'} ${isPromoActive ? 'opacity-50 cursor-not-allowed hover:border-gray-100 dark:hover:border-gray-800 grayscale' : ''}`}
                                                >
                                                    <div className="mb-4 w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-primary">
                                                        <User className="w-6 h-6" />
                                                    </div>
                                                    <h5 className="font-bold text-lg dark:text-white mb-1">Individual</h5>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Voy por mi cuenta</p>
                                                    {isPromoActive && <div className="mt-3 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 inline-block px-2 py-1 rounded">Desactivado por Promo</div>}
                                                    {regType === 'individual' && <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>}
                                                </motion.button>
                                            )}

                                            {(regType === null || regType === 'group') && (
                                                <motion.button 
                                                    key="btn-group"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    type="button" 
                                                    onClick={() => setRegType('group')} 
                                                    className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${regType === 'group' ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-100 dark:border-gray-800 hover:border-primary/50'}`}
                                                >
                                                    <div className="mb-4 w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-primary">
                                                        <Users className="w-6 h-6" />
                                                    </div>
                                                    <h5 className="font-bold text-lg dark:text-white mb-1">Grupo / Pareja</h5>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Voy con acompañantes</p>
                                                    {regType === 'group' && <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>}
                                                </motion.button>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <AnimatePresence>
                                        {regType === 'group' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8 }}
                                                transition={{ duration: 0.2 }}
                                                className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl mt-6"
                                            >
                                                <label htmlFor="group-size" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    ¿Cuántas personas son en total? (incluyéndote)
                                                </label>
                                                <input 
                                                    id="group-size" type="text" inputMode="numeric" pattern="[0-9]*" min="2" max="50" value={groupSize}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '');
                                                        setGroupSize(val === '' ? '' : parseInt(val));
                                                    }}
                                                    onBlur={() => {
                                                        const val = parseInt(String(groupSize)) || 2;
                                                        setGroupSize(Math.max(2, val));
                                                    }}
                                                    onFocus={(e) => e.target.select()}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg font-medium" 
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <AnimatePresence>
                                        {regType !== null && (
                                            <motion.button 
                                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                                                type="submit" 
                                                disabled={currentOccupancy + (regType === 'group' ? parseInt(String(groupSize)) || 2 : 1) > (camp.capacity ?? 30)}
                                                className="w-full bg-primary text-white py-4 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {currentOccupancy + (regType === 'group' ? parseInt(String(groupSize)) || 2 : 1) > (camp.capacity ?? 30) 
                                                    ? `Solo quedan ${Math.max(0, (camp.capacity ?? 30) - currentOccupancy)} cupos`
                                                    : 'Siguiente'}
                                                {currentOccupancy + (regType === 'group' ? parseInt(String(groupSize)) || 2 : 1) <= (camp.capacity ?? 30) && <ArrowRight className="w-5 h-5" />}
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </motion.form>
                            )}

                            {step === 2 && (
                                <motion.form key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleNext} className="space-y-5">
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold dark:text-white">Datos del Responsable</h4>
                                            <p className="text-sm text-gray-500">Titular de la reserva</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nombre</label>
                                            <input required type="text" value={responsible.name} onChange={e => setResponsible({...responsible, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 outline-none" placeholder="Juan" />
                                        </div>
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Apellido</label>
                                            <input required type="text" value={responsible.lastName} onChange={e => setResponsible({...responsible, lastName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 outline-none" placeholder="Pérez" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Edad</label>
                                            <input required type="number" min="1" max="100" value={responsible.age} onChange={e => setResponsible({...responsible, age: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 outline-none" placeholder="25" />
                                        </div>
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Teléfono</label>
                                            <input required type="tel" value={responsible.phone} onChange={e => setResponsible({...responsible, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 outline-none" placeholder="+52 000 0000" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Correo</label>
                                            <input required type="email" value={responsible.email} onChange={e => setResponsible({...responsible, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 outline-none" placeholder="juan@ejemplo.com" />
                                        </div>
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Sexo</label>
                                            <select required value={responsible.gender} onChange={e => setResponsible({...responsible, gender: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white dark:focus:bg-gray-800 outline-none">
                                                <option value="" disabled hidden>Selecciona</option>
                                                <option value="male">Hombre</option>
                                                <option value="female">Mujer</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">¿Perteneces a alguna iglesia?</label>
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" required checked={responsible.isFromChurch === 'yes'} onChange={e => setResponsible({...responsible, isFromChurch: e.target.value})} value="yes" className="w-5 h-5 text-primary border-gray-300 dark:border-gray-600" />
                                                <span className="text-sm font-medium dark:text-gray-300">Sí</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" required checked={responsible.isFromChurch === 'no'} onChange={e => setResponsible({...responsible, isFromChurch: e.target.value})} value="no" className="w-5 h-5 text-primary border-gray-300 dark:border-gray-600" />
                                                <span className="text-sm font-medium dark:text-gray-300">No</span>
                                            </label>
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {responsible.isFromChurch === 'yes' && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-1.5 flex flex-col pt-3">
                                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nombre de Iglesia</label>
                                                <input required type="text" value={responsible.churchName} onChange={e => setResponsible({...responsible, churchName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white focus:bg-white outline-none" placeholder="Tu iglesia" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-4 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 mt-8">
                                        {regType === 'individual' ? 'Proceder al Pago' : 'Siguiente (Acompañantes)'}
                                        {regType !== 'individual' && <ArrowRight className="w-5 h-5" />}
                                    </button>
                                </motion.form>
                            )}

                            {(typeof step === 'number' && step >= 3) && (
                                <motion.form key={`step${step}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleNext} className="space-y-5">
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold">
                                            {step - 2}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold dark:text-white">Acompañante {step - 2}</h4>
                                            <p className="text-sm text-gray-500">de {groupSize - 1}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nombre</label>
                                            <input required type="text" value={companions[step - 3]?.name || ''} onChange={e => updateCompanion(step - 3, 'name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                                        </div>
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Apellido</label>
                                            <input required type="text" value={companions[step - 3]?.lastName || ''} onChange={e => updateCompanion(step - 3, 'lastName', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Edad</label>
                                            <input required type="number" min="1" max="100" value={companions[step - 3]?.age || ''} onChange={e => updateCompanion(step - 3, 'age', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                                        </div>
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Sexo</label>
                                            <select required value={companions[step - 3]?.gender || ''} onChange={e => updateCompanion(step - 3, 'gender', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                                                <option value="" disabled hidden>Selecciona</option>
                                                <option value="male">Hombre</option>
                                                <option value="female">Mujer</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Teléfono (Opcional)</label>
                                        <input type="tel" value={companions[step - 3]?.phone || ''} onChange={e => updateCompanion(step - 3, 'phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                                    </div>
                                    <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-4 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-primary-dark transition-colors mt-8">
                                        {step - 3 === groupSize - 2 ? 'Proceder al Pago' : 'Siguiente Acompañante'}
                                        {step - 3 !== groupSize - 2 && <ArrowRight className="w-5 h-5" />}
                                    </button>
                                </motion.form>
                            )}

                            {String(step) === 'pay' && (
                                <motion.div key="step-pay" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="space-y-5">
                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl font-bold dark:text-white mb-2">Completar Pago</h2>
                                        <p className="text-sm text-gray-500">Estás reservando para <span className="font-semibold">{camp.title}</span></p>
                                    </div>

                                    {/* Payment Processing Overlay */}
                                    <AnimatePresence>
                                        {payProcessing && (
                                            <motion.div key="pay-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl gap-6 m-1">
                                                <div className="relative w-24 h-24">
                                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary" />
                                                    <motion.div animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="absolute inset-3 rounded-full border-4 border-orange-400/20 border-t-orange-400" />
                                                    <div className="absolute inset-0 flex items-center justify-center"><span className="text-3xl">🔒</span></div>
                                                </div>
                                                <div className="text-center">
                                                    <motion.p animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-xl font-bold text-gray-900 dark:text-white">Procesando pago...</motion.p>
                                                    <p className="text-sm text-gray-500 mt-2">Verificando con el banco</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* 3D Flip Card */}
                                    <AnimatePresence mode="wait">
                                        {!payInputFocused && (
                                            <motion.div key="card-preview" initial={{ opacity: 0, y: -10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16, scale: 0.95 }} transition={{ duration: 0.28, ease: 'easeInOut' }} className="mb-2">
                                                <div style={{ perspective: '1000px' }} className="h-48 sm:h-52 select-none relative z-10">
                                                    <motion.div animate={{ rotateY: cardFlipped ? 180 : 0 }} transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }} style={{ transformStyle: 'preserve-3d', position: 'relative', width: '100%', height: '100%' }}>
                                                        {/* FRONT */}
                                                        <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }} className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 shadow-2xl overflow-hidden flex flex-col">
                                                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/30 rounded-full blur-2xl" />
                                                            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-600/20 rounded-full blur-2xl" />
                                                            <div className="flex justify-between items-start mb-auto relative z-10">
                                                                <div className="w-12 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md shadow flex-shrink-0" />
                                                            </div>
                                                            <p className="text-white font-mono text-xl tracking-widest z-10 relative mt-4 mb-6">{card.number || '•••• •••• •••• ••••'}</p>
                                                            <div className="flex justify-between items-end z-10 relative">
                                                                <div><p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Titular</p><p className="text-white font-medium text-sm sm:text-base uppercase tracking-wide truncate max-w-[180px]">{card.name || 'NOMBRE APELLIDO'}</p></div>
                                                                <div className="text-right"><p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Vence</p><p className="text-white font-mono text-sm sm:text-base">{card.expiry || 'MM/AA'}</p></div>
                                                            </div>
                                                        </div>
                                                        {/* BACK */}
                                                        <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl overflow-hidden flex flex-col">
                                                            <div className="w-full h-12 bg-gray-950 mt-6 shrink-0" />
                                                            <div className="px-6 pt-6 flex items-center gap-4">
                                                                <div className="flex-1 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md flex items-center px-4 shadow-inner" />
                                                                <div className="bg-white rounded-md px-4 py-2 min-w-[60px] text-center shadow">
                                                                    <p className="text-[10px] text-gray-400 font-semibold uppercase mb-0.5">CVV</p>
                                                                    <p className="font-mono font-bold text-gray-900 text-base">{card.cvv || '•••'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5 mb-4"><span>🔒</span> Transacción simulada</p>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5 relative">
                                            <input type="text" placeholder="NOMBRE EN TARJETA" value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value.toUpperCase() }))} onFocus={() => setPayInputFocused(true)} onBlur={() => setPayInputFocused(false)} className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white outline-none" />
                                        </div>
                                        <div className="space-y-1.5 relative">
                                            <input type="text" inputMode="numeric" maxLength={19} placeholder="1234 5678 9012 3456" value={card.number} onChange={e => { const raw = e.target.value.replace(/\D/g, '').slice(0, 16); setCard(c => ({ ...c, number: raw.replace(/(.{4})/g, '$1 ').trim() })); }} onFocus={() => setPayInputFocused(true)} onBlur={() => setPayInputFocused(false)} className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-white outline-none font-mono tracking-widest text-lg" />
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {cardReady && (
                                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.4 }} className="overflow-hidden space-y-5 pt-3">
                                                <div className="grid grid-cols-2 gap-5">
                                                    <input type="text" inputMode="numeric" maxLength={5} placeholder="MM/AA" value={card.expiry} onChange={e => { let val = e.target.value.replace(/\D/g, '').slice(0, 4); if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2); setCard(c => ({ ...c, expiry: val })); }} onFocus={() => setPayInputFocused(true)} onBlur={() => setPayInputFocused(false)} className="w-full px-5 py-4 rounded-2xl border outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white font-mono text-lg" />
                                                    <input type="password" inputMode="numeric" maxLength={4} placeholder="CVV" value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} onFocus={() => { setCardFlipped(true); setPayInputFocused(false); }} onBlur={() => { setCardFlipped(false); setPayInputFocused(false); }} className="w-full px-5 py-4 rounded-2xl border outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white font-mono tracking-widest text-lg" />
                                                </div>
                                                <div className={`rounded-2xl p-5 flex justify-between items-center border ${totalPrice > 0 ? 'bg-primary/5 border-primary/20' : 'bg-green-50 border-green-200'}`}>
                                                    <div><p className="text-xs text-gray-500 uppercase">Total a pagar</p><p className={`text-3xl font-black ${totalPrice > 0 ? 'text-primary' : 'text-green-600'}`}>{totalPrice > 0 ? `$${totalPrice.toLocaleString()} MXN` : 'Gratis'}</p></div>
                                                </div>
                                                <button type="button" disabled={isSubmitting || card.expiry.length < 5 || card.cvv.length < 3} onClick={completeRegistration} className="w-full bg-gradient-to-r from-primary to-orange-500 text-white py-5 rounded-2xl font-bold hover:shadow-xl disabled:opacity-40 text-lg">
                                                    Pagar y Confirmar Reserva
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}

                            {step === 'success' && (
                                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center flex flex-col items-center">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.2 }} className="w-28 h-28 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8">
                                        <CheckCircle2 className="w-14 h-14" />
                                    </motion.div>
                                    <h4 className="text-3xl font-black mb-4 dark:text-white">¡Pago Exitoso!</h4>
                                    <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-sm text-lg mx-auto leading-relaxed">Confirmamos tu reserva hacia <span className="font-semibold">{responsible.email}</span>.</p>
                                    <button onClick={() => navigate('/portal', { replace: true })} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all text-lg w-full sm:w-auto">
                                        Ir a Mi Portal
                                    </button>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
