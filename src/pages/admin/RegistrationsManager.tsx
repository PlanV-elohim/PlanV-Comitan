import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Search, X, Phone, Mail, MapPin, Calendar, User, Church, Hash, ChevronRight, Download, CheckCircle2, ShieldAlert, HeartPulse, Home } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { supabaseApi } from '../../lib/api';

export default function RegistrationsManager() {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [camps, setCamps] = useState<any[]>([]);
    const [cabins, setCabins] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCampFilter, setSelectedCampFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [selectedReg, setSelectedReg] = useState<any | null>(null);
    const [updatingReg, setUpdatingReg] = useState(false);
    const [magicAssigning, setMagicAssigning] = useState(false);
    const [viewMode, setViewMode] = useState<'reservations' | 'individuals'>('reservations');
    const [medicalFormData, setMedicalFormData] = useState<any | null>(null);
    const [loadingMedical, setLoadingMedical] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [{ data: regs }, { data: campsData }, { data: cabinsData }, { data: memsData }] = await Promise.all([
                supabase.from('registrations').select('*').order('created_at', { ascending: false }),
                supabase.from('camps').select('id, title, date_string'),
                supabase.from('cabins').select('*').order('name'),
                supabase.from('group_members').select('*')
            ]);
            if (regs) setRegistrations(regs);
            if (campsData) setCamps(campsData);
            if (cabinsData) setCabins(cabinsData);
            if (memsData) setMembers(memsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getCampName = (campId: number) => {
        const c = camps.find(c => c.id === campId);
        return c?.title || 'Campamento #' + campId;
    };
    const getCampDate = (campId: number) => {
        const c = camps.find(c => c.id === campId);
        return c?.date_string || '—';
    };
    const getCabinName = (cabinId: number | null) => {
        if (!cabinId) return 'Sin asignar';
        return cabins.find(c => c.id === cabinId)?.name || 'Desconocida';
    };

    const filtered = registrations.filter(r => {
        const q = search.toLowerCase();
        const matchSearch = !q || [r.responsable_name, r.responsable_lastname, r.responsable_email, r.responsable_phone, getCampName(r.camp_id)]
            .some(v => (v || '').toLowerCase().includes(q));
        const matchCamp = selectedCampFilter === 'all' || String(r.camp_id) === selectedCampFilter;
        const matchPayment = paymentFilter === 'all' || r.payment_status === paymentFilter;
        return matchSearch && matchCamp && matchPayment;
    });

    const totalSpots = filtered.reduce((acc, r) => acc + (r.group_size || 1), 0);

    const openMedicalForm = async (regId: string, memberId?: string) => {
        setLoadingMedical(true);
        try {
            let data;
            if (memberId) {
                data = await supabaseApi.medicalForms.getByMember(memberId);
            } else {
                data = await supabaseApi.medicalForms.getByRegistration(regId);
            }
            setMedicalFormData(data || { empty: true });
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingMedical(false);
        }
    };

    // CSV export
    const exportCSV = () => {
        const headers = ['ID', 'Campamento', 'Titular/Responsable', 'Nombre', 'Apellido', 'Edad', 'Email', 'Teléfono', 'Tipo', 'Cupos', 'Iglesia', 'Expediente Médico', 'Check-In', 'Cabaña/Escuadrón', 'Fecha Registro'];
        
        const rows: any[] = [];
        filtered.forEach(r => {
            // Main registration
            rows.push([
                r.id, getCampName(r.camp_id), 'TITULAR', r.responsable_name, r.responsable_lastname, r.responsable_age,
                r.responsable_email, r.responsable_phone, r.reg_type, r.group_size || 1,
                r.is_from_church ? (r.church_name || 'Sí') : 'No',
                r.medical_cleared ? 'COMPLETO' : 'FALTANTE',
                r.check_in_status ? 'ADENTRO' : 'PENDIENTE',
                getCabinName(r.cabin_id),
                new Date(r.created_at).toLocaleDateString('es-MX')
            ]);
            
            // Group members
            if (r.reg_type === 'group') {
                const rMembers = members.filter(m => m.registration_id === r.id);
                rMembers.forEach(m => {
                    rows.push([
                        m.id, getCampName(r.camp_id), `${r.responsable_name} ${r.responsable_lastname}`, m.first_name, m.last_name, '-',
                        '-', '-', 'Miembro Grupo', '-', '-',
                        m.medical_cleared ? 'COMPLETO' : 'FALTANTE',
                        m.check_in_status ? 'ADENTRO' : 'PENDIENTE',
                        getCabinName(m.cabin_id),
                        new Date(m.created_at).toLocaleDateString('es-MX')
                    ]);
                });
            }
        });

        const csv = [headers, ...rows].map(row => row.map((v: any) => `"${v || ''}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reservaciones_${Date.now()}.csv`;
        link.click();
    };

    const runMagicAssignment = async () => {
        if (selectedCampFilter === 'all') {
            alert('Por favor selecciona un campamento específico en el filtro superior primero.');
            return;
        }
        
        const campId = Number(selectedCampFilter);
        const campCabins = cabins.filter(c => c.camp_id === campId);
        
        if(campCabins.length === 0) {
            alert('No hay cabañas creadas para este campamento. Ve a la sección de Cabañas primero.');
            return;
        }

        const confirmed = window.confirm('🪄 Asignación Mágica:\nEl sistema agrupará a los equipos en las cabañas disponibles respetando la capacidad máxima. ¿Deseas auto-asignar a todos los que aún no tienen cabaña?');
        if(!confirmed) return;

        setMagicAssigning(true);
        try {
            const campRegs = registrations.filter(r => r.camp_id === campId);
            const campRegIds = campRegs.map(r => r.id);
            const campMembers = members.filter(m => campRegIds.includes(m.registration_id));

            // Calculate current occupation
            const occupation: Record<number, number> = {};
            campCabins.forEach(c => occupation[c.id] = 0);
            
            campRegs.forEach(r => { if(r.cabin_id) occupation[r.cabin_id] = (occupation[r.cabin_id] || 0) + 1; });
            campMembers.forEach(m => { if(m.cabin_id) occupation[m.cabin_id] = (occupation[m.cabin_id] || 0) + 1; });

            const updatesReg: {id: string, cabin_id: number}[] = [];
            const updatesMem: {id: string, cabin_id: number}[] = [];

            // Grouping logic (keep groups together)
            for (const r of campRegs) {
                const groupHolders = !r.cabin_id ? [r] : [];
                const groupMems = campMembers.filter(m => m.registration_id === r.id && !m.cabin_id);
                const totalToAssign = groupHolders.length + groupMems.length;

                if (totalToAssign === 0) continue;

                // Find a cabin with space
                let assignedCabin = campCabins.find(c => (c.capacity - (occupation[c.id] || 0)) >= totalToAssign);
                
                // Fallback: If no single cabin fits the whole group, assign to any cabin with space
                if (!assignedCabin) {
                    assignedCabin = campCabins.find(c => (c.capacity - (occupation[c.id] || 0)) > 0);
                }

                if (assignedCabin) {
                    const cid = assignedCabin.id;
                    if(groupHolders.length > 0) updatesReg.push({ id: r.id, cabin_id: cid });
                    groupMems.forEach(m => updatesMem.push({ id: m.id, cabin_id: cid }));
                    occupation[cid] += totalToAssign;
                }
            }

            if(updatesReg.length === 0 && updatesMem.length === 0) {
                 alert('Todos los usuarios ya tienen cabaña o no hay espacio suficiente.');
                 return;
            }

            // Sync with Supabase (sequential to avoid locking)
            for (const u of updatesReg) await supabaseApi.registrations.update(u.id, { cabin_id: u.cabin_id });
            for (const u of updatesMem) await supabaseApi.groupMembers.update(u.id, { cabin_id: u.cabin_id });

            alert(`✨ ¡Acomodo Exitoso!\nSe asignaron ${updatesReg.length + updatesMem.length} acampantes a cabañas.`);
            await loadData();
        } catch (e) {
            console.error(e);
            alert('Hubo un error al auto-asignar cabañas.');
        } finally {
            setMagicAssigning(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold dark:text-white tracking-tight mb-2">Reservaciones</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Consulta y gestiona todas las inscripciones recibidas.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button disabled={magicAssigning} onClick={runMagicAssignment} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transform transition-all disabled:opacity-50 shrink-0">
                        {magicAssigning ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span>🪄</span>} 
                        {magicAssigning ? 'Asignando...' : 'Asignación Mágica'}
                    </button>
                    <button onClick={exportCSV} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm shrink-0">
                        <Download className="w-4 h-4" /> Exportar CSV
                    </button>
                </div>
            </header>

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Inscritos', value: filtered.length, icon: Users, color: 'text-primary bg-primary/10' },
                    { label: 'Total Cupos', value: totalSpots, icon: Hash, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
                    { label: 'Grupales', value: filtered.filter(r => r.reg_type === 'group').length, icon: User, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                    { label: 'De Iglesia', value: filtered.filter(r => r.is_from_church).length, icon: Church, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-black dark:text-white">{s.value}</p>
                            <p className="text-xs text-gray-500">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo o teléfono..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 w-full focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white"
                    />
                </div>
                <select value={selectedCampFilter} onChange={e => setSelectedCampFilter(e.target.value)} className="px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none font-medium min-w-48 cursor-pointer">
                    <option value="all">Todos los campamentos</option>
                    {camps.map(c => <option key={c.id} value={String(c.id)}>{c.title}</option>)}
                </select>
                <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none font-medium basis-1/5 cursor-pointer">
                    <option value="all">Estado: Todos</option>
                    <option value="pending">⚠️ Pendiente</option>
                    <option value="paid">✅ Pagado</option>
                    <option value="cancelled">❌ Cancelado</option>
                </select>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
                    <button 
                        onClick={() => setViewMode('reservations')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'reservations' ? 'bg-white dark:bg-gray-900 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Reservas
                    </button>
                    <button 
                        onClick={() => setViewMode('individuals')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'individuals' ? 'bg-white dark:bg-gray-900 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Acampantes
                    </button>
                </div>
            </div>

            {/* Table / List */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                        <p>No hay registros que coincidan con tu búsqueda.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50">
                        {(() => {
                            const groupedByCamp: Record<string, any[]> = {};
                            
                            if (viewMode === 'reservations') {
                                filtered.forEach(r => {
                                    if (!groupedByCamp[r.camp_id]) groupedByCamp[r.camp_id] = [];
                                    groupedByCamp[r.camp_id].push(r);
                                });
                            } else {
                                filtered.forEach(r => {
                                    // Holder
                                    if (!groupedByCamp[r.camp_id]) groupedByCamp[r.camp_id] = [];
                                    groupedByCamp[r.camp_id].push({ ...r, is_holder: true, full_name: `${r.responsable_name} ${r.responsable_lastname}` });
                                    // Companions
                                    const rMembers = members.filter(m => m.registration_id === r.id);
                                    rMembers.forEach(m => {
                                        groupedByCamp[r.camp_id].push({ ...m, is_holder: false, registration: r, full_name: `${m.first_name} ${m.last_name}`, camp_id: r.camp_id });
                                    });
                                });
                            }

                            return Object.entries(groupedByCamp).map(([campId, items]) => {
                                const cId = Number(campId);
                                const totalItems = items.length;
                                const paidCount = viewMode === 'reservations' ? items.filter(i => i.payment_status === 'paid').length : 0;
                                const totalSpotsGroup = viewMode === 'reservations' ? items.reduce((acc, i) => acc + (i.group_size || 1), 0) : totalItems;

                                return (
                                    <div key={campId} className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                                        {/* Group Header */}
                                        <div className="bg-gradient-to-r from-gray-100 to-white dark:from-gray-800 dark:to-gray-800/50 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800">
                                            <div>
                                                <h3 className="text-xl font-black dark:text-white flex items-center gap-2">🏕️ {getCampName(cId)}</h3>
                                                <p className="text-xs font-semibold text-gray-500 mt-1 flex items-center gap-1 uppercase tracking-widest"><Calendar className="w-3.5 h-3.5"/> {getCampDate(cId)}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="text-xs font-bold bg-white dark:bg-gray-700 px-3 py-1.5 rounded-full text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-600 flex items-center gap-1.5">{viewMode === 'reservations' ? <Hash className="w-3.5 h-3.5"/> : <Users className="w-3.5 h-3.5"/>} {viewMode === 'reservations' ? `${totalItems} Reservas (${totalSpotsGroup} Personas)` : `${totalItems} Personas`}</span>
                                                {viewMode === 'reservations' && (
                                                    <span className="text-xs font-bold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-full shadow-sm border border-green-200 dark:border-green-800 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5"/> {paidCount} Pagados completos</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Desktop Column Headers */}
                                        <div className="hidden sm:grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr_1fr_auto] px-6 py-3 bg-gray-50 dark:bg-gray-900/40 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-800">
                                            <span>{viewMode === 'reservations' ? 'Titular' : 'Acampante'}</span>
                                            <span>{viewMode === 'reservations' ? 'Asientos' : 'Rol'}</span>
                                            <span>{viewMode === 'reservations' ? 'Pago' : 'Cabaña'}</span>
                                            <span>Salud / Check-In</span>
                                            <span>Fecha Reg.</span>
                                            <span></span>
                                        </div>

                                        {/* Rows */}
                                        <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                                            {items.map((item, i) => {
                                                if (viewMode === 'reservations') {
                                                    const reg = item;
                                                    const regMembers = members.filter(m => m.registration_id === reg.id);
                                                    return (
                                                        <motion.div
                                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                                                            key={reg.id}
                                                            onClick={() => setSelectedReg(reg)}
                                                            className="px-6 py-4 flex flex-col sm:grid sm:grid-cols-[2.5fr_1fr_1.5fr_1.5fr_1fr_auto] items-start sm:items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer group transition-colors"
                                                        >
                                                            <div>
                                                                <p className="font-bold dark:text-white flex items-center gap-2">
                                                                    {reg.responsable_name} {reg.responsable_lastname}
                                                                    {reg.reg_type === 'group' && <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-wider">Líder</span>}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-0.5">{reg.responsable_email} • {reg.responsable_phone}</p>
                                                            </div>
                                                            <div className="hidden sm:block">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xl font-black dark:text-white leading-none">{reg.group_size || 1}</span>
                                                                    {reg.reg_type === 'group' && (
                                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{regMembers.length} / {reg.group_size}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="w-full sm:w-auto">
                                                                {reg.payment_status === 'paid' ? (
                                                                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                                        ✅ Liquidado
                                                                    </span>
                                                                ) : reg.payment_status === 'cancelled' ? (
                                                                    <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                                        ❌ Cancelado
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                                        ⚠️ Pendiente
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                                                                {reg.medical_cleared ? (
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); openMedicalForm(reg.id); }}
                                                                        className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider hover:underline"
                                                                    >
                                                                        <HeartPulse className="w-3.5 h-3.5" /> Ficha OK
                                                                    </button>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 text-red-500 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">
                                                                        <ShieldAlert className="w-3.5 h-3.5" /> Ficha Faltante
                                                                    </span>
                                                                )}
                                                                {reg.check_in_status ? (
                                                                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
                                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Check-in listo
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                                                        Check-in  pendiente
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 hidden sm:block font-semibold">{new Date(reg.created_at).toLocaleDateString('es-MX')}</p>
                                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors hidden sm:block justify-self-end" />
                                                        </motion.div>
                                                    );
                                                } else {
                                                    const person = item;
                                                    return (
                                                        <motion.div
                                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                                                            key={person.id + (person.is_holder ? '-h' : '-m')}
                                                            onClick={() => person.is_holder ? setSelectedReg(person) : setSelectedReg(person.registration)}
                                                            className="px-6 py-4 flex flex-col sm:grid sm:grid-cols-[2.5fr_1fr_1.5fr_1.5fr_1fr_auto] items-start sm:items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer group transition-colors"
                                                        >
                                                            <div>
                                                                <p className="font-bold dark:text-white flex items-center gap-2">
                                                                    {person.full_name}
                                                                    {person.is_holder ? (
                                                                        <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-wider">Resp.</span>
                                                                    ) : (
                                                                        <span className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-wider">Grupo</span>
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-0.5">{person.is_holder ? person.responsable_email : `Grupo: ${person.registration.responsable_name}`}</p>
                                                            </div>
                                                            <div className="hidden sm:block">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                                    {person.is_holder ? 'TITULAR' : 'ACOMPAÑANTE'}
                                                                </span>
                                                            </div>
                                                            <div className="w-full sm:w-auto">
                                                                <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider max-w-[120px] truncate">
                                                                    <Home className="w-3.5 h-3.5 shrink-0" /> {getCabinName(person.cabin_id)}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                                                                {person.medical_cleared ? (
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); openMedicalForm(person.registration?.id || person.id, person.is_holder ? undefined : person.id); }}
                                                                        className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider hover:underline"
                                                                    >
                                                                        <HeartPulse className="w-3.5 h-3.5" /> Ficha OK
                                                                    </button>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 text-red-500 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">
                                                                        <ShieldAlert className="w-3.5 h-3.5" /> Ficha Faltante
                                                                    </span>
                                                                )}
                                                                {person.check_in_status ? (
                                                                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
                                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Check-in listo
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                                                        Check-in  pendiente
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 hidden sm:block font-semibold">{new Date(person.created_at).toLocaleDateString('es-MX')}</p>
                                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors hidden sm:block justify-self-end" />
                                                        </motion.div>
                                                    );
                                                }
                                            })}
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedReg && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedReg(null)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-primary to-orange-500 p-6 text-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-primary-foreground/80 text-sm font-medium uppercase tracking-wider mb-1">Ficha de Registro #{selectedReg.id}</p>
                                        <h3 className="text-2xl font-black">{selectedReg.responsable_name} {selectedReg.responsable_lastname}</h3>
                                        <p className="text-white/80 mt-1">{getCampName(selectedReg.camp_id)}</p>
                                    </div>
                                    <button onClick={() => setSelectedReg(null)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { icon: Mail, label: 'Correo', value: selectedReg.responsable_email },
                                        { icon: Phone, label: 'Teléfono', value: selectedReg.responsable_phone },
                                        { icon: Users, label: 'Edad', value: selectedReg.responsable_age ? `${selectedReg.responsable_age} años` : 'N/E' },
                                        { icon: Hash, label: 'Cupos Reservados', value: selectedReg.group_size || 1 },
                                        { icon: Calendar, label: 'Fechas del Campo', value: getCampDate(selectedReg.camp_id) },
                                        { icon: MapPin, label: 'Tipo de Registro', value: selectedReg.reg_type === 'group' ? 'Grupal' : 'Individual' },
                                    ].map(item => (
                                        <div key={item.label} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                                <item.icon className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>
                                            </div>
                                            <p className="font-bold dark:text-white text-sm">{String(item.value)}</p>
                                        </div>
                                    ))}
                                </div>

                                {selectedReg.medical_cleared && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
                                                <HeartPulse className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Salud del Titular</p>
                                                <p className="font-bold text-blue-900 dark:text-blue-200">Ficha Médica Lista ✓</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => openMedicalForm(selectedReg.id)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                        >
                                            Ver Ficha
                                        </button>
                                    </div>
                                )}

                                {selectedReg.is_from_church && (
                                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 flex items-center gap-3">
                                        <Church className="w-5 h-5 text-purple-600 shrink-0" />
                                        <div>
                                            <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider">Iglesia</p>
                                            <p className="font-bold text-purple-900 dark:text-purple-200">{selectedReg.church_name || 'Sin especificar'}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Payment Status Management */}
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs font-bold uppercase tracking-wider text-green-600 flex items-center gap-2">💰 Estado del Pago</p>
                                    </div>
                                    <select 
                                        value={selectedReg.payment_status || 'pending'} 
                                        onChange={async (e) => {
                                            setUpdatingReg(true);
                                            const newStatus = e.target.value;
                                            try {
                                                await supabaseApi.registrations.update(selectedReg.id, { payment_status: newStatus });
                                                setSelectedReg((prev: any) => ({ ...prev, payment_status: newStatus }));
                                                setRegistrations(registrations.map(r => r.id === selectedReg.id ? { ...r, payment_status: newStatus } : r));
                                            } catch (error) {
                                                console.error("Error updating payment", error);
                                            } finally {
                                                setUpdatingReg(false);
                                            }
                                        }}
                                        disabled={updatingReg}
                                        className={`w-full border rounded-xl px-4 py-3 outline-none transition-all font-bold disabled:opacity-50 ${selectedReg.payment_status === 'paid' ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-800 dark:text-green-100 dark:border-green-600' : selectedReg.payment_status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-800 dark:text-red-100 dark:border-red-600' : 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-800 dark:text-yellow-100 dark:border-yellow-600'}`}
                                    >
                                        <option value="pending">⚠️ Pendiente / Con Anticipo</option>
                                        <option value="paid">✅ Liquidado (100% Pagado)</option>
                                        <option value="cancelled">❌ Cancelado / No Pagó</option>
                                    </select>
                                </div>

                                {/* Cabin Assignment */}
                                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-2"><Home className="w-4 h-4"/> Asignación de Cabaña</p>
                                    </div>
                                    <select 
                                        value={selectedReg.cabin_id || ''} 
                                        onChange={async (e) => {
                                            setUpdatingReg(true);
                                            const newCabinId = e.target.value ? Number(e.target.value) : null;
                                            try {
                                                await supabaseApi.registrations.update(selectedReg.id, { cabin_id: newCabinId });
                                                setSelectedReg((prev: any) => ({ ...prev, cabin_id: newCabinId }));
                                                setRegistrations(registrations.map(r => r.id === selectedReg.id ? { ...r, cabin_id: newCabinId } : r));
                                            } catch (error) {
                                                console.error("Error updating cabin", error);
                                            } finally {
                                                setUpdatingReg(false);
                                            }
                                        }}
                                        disabled={updatingReg}
                                        className="w-full bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium text-gray-800 dark:text-gray-200 disabled:opacity-50"
                                    >
                                        <option value="">-- Sin Asignar --</option>
                                        {cabins.filter(c => c.camp_id === selectedReg.camp_id).map(c => (
                                            <option key={c.id} value={c.id}>{c.name} (Capc: {c.capacity} / {c.gender === 'male' ? 'Hombres' : c.gender === 'female' ? 'Mujeres' : 'Mixto'})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Group Members Management */}
                                {selectedReg.reg_type === 'group' && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2">
                                                <Users className="w-4 h-4"/> Acompañantes ({members.filter(m => m.registration_id === selectedReg.id).length} registrados / {selectedReg.group_size - 1} cupos)
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            {members.filter(m => m.registration_id === selectedReg.id).length === 0 ? (
                                                <p className="text-sm text-gray-500 italic">El líder de grupo aún no ha registrado los nombres de sus acompañantes.</p>
                                            ) : (
                                                members.filter(m => m.registration_id === selectedReg.id).map(member => (
                                                    <div key={member.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex flex-col gap-3">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="font-bold text-sm dark:text-white">{member.first_name} {member.last_name}</p>
                                                                <div className="flex gap-2 mt-1">
                                                                    {member.medical_cleared ? (
                                                                        <button 
                                                                            onClick={() => openMedicalForm(selectedReg.id, member.id)}
                                                                            className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase hover:bg-green-200 transition-colors"
                                                                        >
                                                                            Ficha Lista ✓
                                                                        </button>
                                                                    ) : (
                                                                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase">Alta Medica Pendiente</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button 
                                                                disabled={updatingReg}
                                                                onClick={async () => {
                                                                    setUpdatingReg(true);
                                                                    try {
                                                                        const newStatus = !member.check_in_status;
                                                                        await supabaseApi.groupMembers.update(member.id, { check_in_status: newStatus });
                                                                        setMembers(members.map(m => m.id === member.id ? { ...m, check_in_status: newStatus } : m));
                                                                    } finally { setUpdatingReg(false); }
                                                                }}
                                                                className={`text-[10px] px-2 py-1 uppercase font-bold tracking-wider rounded border transition-colors ${member.check_in_status ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-500 text-white border-green-500 hover:bg-green-600'}`}
                                                            >
                                                                {member.check_in_status ? 'Deshacer Check-In' : 'Hacer Check-In'}
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Home className="w-3 h-3 text-gray-400" />
                                                            <select 
                                                                value={member.cabin_id || ''} 
                                                                onChange={async (e) => {
                                                                    setUpdatingReg(true);
                                                                    const newCabinId = e.target.value ? Number(e.target.value) : null;
                                                                    try {
                                                                        await supabaseApi.groupMembers.update(member.id, { cabin_id: newCabinId });
                                                                        setMembers(members.map(m => m.id === member.id ? { ...m, cabin_id: newCabinId } : m));
                                                                    } finally { setUpdatingReg(false); }
                                                                }}
                                                                disabled={updatingReg}
                                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 outline-none text-xs font-medium dark:text-gray-300"
                                                            >
                                                                <option value="">-- Cabaña sin asignar --</option>
                                                                {cabins.filter(c => c.camp_id === selectedReg.camp_id).map(c => (
                                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button 
                                        disabled={updatingReg}
                                        onClick={async () => {
                                            setUpdatingReg(true);
                                            try {
                                                const newStatus = !selectedReg.check_in_status;
                                                await supabase.from('registrations').update({ check_in_status: newStatus }).eq('id', selectedReg.id);
                                                setSelectedReg({ ...selectedReg, check_in_status: newStatus });
                                                setRegistrations(registrations.map(r => r.id === selectedReg.id ? { ...r, check_in_status: newStatus } : r));
                                            } finally { setUpdatingReg(false); }
                                        }}
                                        className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl font-medium transition-colors border ${selectedReg.check_in_status ? 'bg-white dark:bg-gray-800 border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'bg-green-500 border-green-500 text-white hover:bg-green-600'}`}
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> {selectedReg.check_in_status ? 'Deshacer Check-In' : 'Marcar Check-In'}
                                    </button>
                                    <a href={`https://wa.me/52${selectedReg.responsable_phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                        <Phone className="w-4 h-4" /> WhatsApp
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Medical Form Detail Modal */}
            <AnimatePresence>
                {medicalFormData && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => setMedicalFormData(null)}>
                        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                            <div className="bg-gradient-to-br from-red-600 to-orange-500 p-8 text-white relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                            <HeartPulse className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tight">Expediente Clínico</h3>
                                            <p className="text-white/80 text-sm font-medium">Información confidencial de salud</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setMedicalFormData(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                {medicalFormData.empty ? (
                                    <div className="text-center py-10 opacity-50">
                                        <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
                                        <p className="font-bold">Aún no se ha completado la ficha médica.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6">
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Alergias</p>
                                            <p className="text-sm font-bold dark:text-white leading-relaxed">{medicalFormData.allergies || 'Ninguna reportada'}</p>
                                        </div>
                                        
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Medicamentos / Condiciones</p>
                                            <p className="text-sm font-bold dark:text-white leading-relaxed">{medicalFormData.medications || 'Ninguna reportada'}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Tipo de Sangre</p>
                                                <p className="text-lg font-black dark:text-white">{medicalFormData.blood_type || '—'}</p>
                                            </div>
                                            <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/20">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">Emergencia</p>
                                                <p className="text-xs font-bold dark:text-white break-words">{medicalFormData.emergency_name || '—'}</p>
                                                <p className="text-sm font-black text-red-600 mt-1">{medicalFormData.emergency_phone || '—'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button onClick={() => setMedicalFormData(null)} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-center transition-transform active:scale-95 shadow-xl shadow-gray-200 dark:shadow-none">
                                    Cerrar Expediente
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
