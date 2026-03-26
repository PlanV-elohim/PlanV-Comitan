import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, MapPin, ChevronRight, Info, CheckCircle } from 'lucide-react';
import { CampEvent } from '../types';
import { supabaseApi } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import TiltCard from './ui/TiltCard';
import MagneticButton from './ui/MagneticButton';

interface UpcomingEventsProps {
    onRegister: (camp: any) => void;
    onOpenCalendar: () => void;
    onInfo: (camp: any) => void;
}

export default function UpcomingEvents({ onRegister, onOpenCalendar, onInfo }: UpcomingEventsProps) {
    const [camps, setCamps] = useState<any[]>([]);
    const [myRegistrationIds, setMyRegistrationIds] = useState<Set<number>>(new Set());
    const { user, loading } = useAuth();

    useEffect(() => {
        const loadCampsAndRegistrations = async () => {
            try {
                const [campsData, regsData] = await Promise.all([
                    supabaseApi.camps.getAll(),
                    supabase.from('registrations').select('camp_id, group_size')
                ]);

                if (campsData) {
                    const activeCamps = campsData
                        .filter((c: any) => c.status !== 'history')
                        .map((c: any) => {
                            // Calculate registered count from registrations table
                            const registeredCount = (regsData.data || [])
                                .filter((r: any) => r.camp_id === c.id)
                                .reduce((sum: number, r: any) => sum + (r.group_size || 1), 0);
                            
                            return { ...c, registered: registeredCount };
                        });
                    setCamps(activeCamps);
                }
            } catch (err) {
                console.error("Error loading camps/registrations:", err);
            }
        };

        loadCampsAndRegistrations();
    }, []);

    useEffect(() => {
        const fetchMyRegistrations = async () => {
            if (!user?.email) return;
            const cleanEmail = user.email.trim().toLowerCase();
            const { data } = await supabase.from('registrations').select('camp_id').eq('responsable_email', cleanEmail);
            if (data) setMyRegistrationIds(new Set(data.map((r: any) => r.camp_id)));
        };

        if (!loading) {
            fetchMyRegistrations();
        }

        const handleFocus = () => {
            if (!loading && user?.email) fetchMyRegistrations();
            // Also refresh overall registration counts on focus
            supabase.from('registrations').select('camp_id, group_size').then(({ data }) => {
                if (data) {
                    setCamps(prev => prev.map(c => {
                        const count = data
                            .filter((r: any) => r.camp_id === c.id)
                            .reduce((sum: number, r: any) => sum + (r.group_size || 1), 0);
                        return { ...c, registered: count };
                    }));
                }
            });
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [user, loading, camps.length]);

    return (
        <section id="campamentos" className="py-20 md:py-24 bg-gray-50 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        <h2 className="text-4xl font-bold tracking-tight mb-4">Próximos Campamentos</h2>
                        <p className="text-gray-600 max-w-2xl">Reserva tu lugar en nuestros próximos eventos. Los cupos son limitados.</p>
                    </motion.div>
                    <MagneticButton onClick={onOpenCalendar} className="shrink-0">
                        <div className="bg-dark text-white px-6 py-3 rounded-full font-medium hover:bg-primary transition-colors flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5" /> Ver fechas en calendario
                        </div>
                    </MagneticButton>
                </div>

                {camps.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                        <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-600">No hay campamentos programados</h3>
                        <p className="text-gray-500 mt-2">Próximamente anunciaremos nuevas fechas.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {camps.slice(0, 3).map((camp, index) => (
                            <motion.div
                                key={camp.id || `camp-${index}`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="h-full"
                            >
                                <TiltCard className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 group flex flex-col h-full">
                                    <div className="aspect-[4/3] relative overflow-hidden">
                                        <img
                                            src={camp.image_url || 'https://picsum.photos/seed/camp/800/600'}
                                            alt={camp.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            referrerPolicy="no-referrer"
                                        />
                                        {camp.has_promo && (
                                            <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full text-xs font-black tracking-wide shadow-lg flex items-center gap-1.5 border border-white/20 z-10">
                                                <span className="text-[14px]">🎟️</span> PROMO ACTIVA
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-dark flex items-center gap-2 shadow-lg z-10">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-[ping_2s_infinite]" />
                                            {camp.capacity - (camp.registered || 0)} cupos libres
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col flex-grow relative bg-white z-10">
                                        <h3 className="text-xl sm:text-2xl font-black mb-4 tracking-tight drop-shadow-sm">{camp.title}</h3>
                                        <div className="space-y-4 mb-8 text-gray-600 font-medium flex-grow">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <CalendarIcon className="w-5 h-5 text-primary" />
                                                </div>
                                                <span className="text-[15px]">{camp.date_string}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <MapPin className="w-5 h-5 text-primary" />
                                                </div>
                                                <span className="text-[15px] leading-tight">{camp.location}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 mt-auto">
                                            <MagneticButton className="flex-1" onClick={() => onInfo(camp)}>
                                                <div className="w-full border-2 border-gray-100 bg-gray-50/50 text-dark py-3.5 rounded-2xl font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 shadow-sm">
                                                    <Info className="w-4 h-4" /> Info
                                                </div>
                                            </MagneticButton>
                                            {myRegistrationIds.has(camp.id) ? (
                                                <div className="flex-1 bg-green-50 border-2 border-green-400 text-green-700 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm">
                                                    <CheckCircle className="w-4 h-4" /> Ya inscrito
                                                </div>
                                            ) : (
                                                <MagneticButton className="flex-1" onClick={() => onRegister(camp)}>
                                                    <div className="w-full bg-dark text-white py-3.5 rounded-2xl font-bold hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-xl shadow-dark/20 text-[15px]">
                                                        Reservar <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                </MagneticButton>
                                            )}
                                        </div>
                                    </div>
                                </TiltCard>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
