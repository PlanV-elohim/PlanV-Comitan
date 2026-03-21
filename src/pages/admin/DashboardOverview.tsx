import { useState, useEffect } from 'react';
import { Users, Tent, TrendingUp, Calendar as CalendarIcon, MessageSquare, Loader2, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabaseApi } from '../../lib/api';

export default function DashboardOverview() {
    const [stats, setStats] = useState({ reservas: 0, campsActivos: 0, ingresos: 0, mensajes: 0 });
    const [chartData, setChartData] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [camps, regs, messages] = await Promise.all([
                    supabaseApi.camps.getAll(),
                    supabaseApi.registrations.getAll(),
                    supabaseApi.messages.getAll()
                ]);

                // Calculate top metrics
                const activeCamps = camps.filter((c: any) => c.status !== 'history').length;
                const totalReservas = regs.reduce((sum: number, r: any) => sum + (r.group_size || 1), 0);
                const ingresos = totalReservas * 250; // Mock $250 avg fee estimation
                const unreadMessages = messages.filter((m: any) => !m.is_read).length;

                setStats({ reservas: totalReservas, campsActivos: activeCamps, ingresos, mensajes: unreadMessages });

                // Calculate Last 6 Months Chart Data
                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const statsByMonth = Array.from({length: 6}).map((_, i) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - (5 - i));
                    return { name: monthNames[d.getMonth()], reservas: 0, month: d.getMonth(), year: d.getFullYear() };
                });

                regs.forEach((r: any) => {
                    const date = new Date(r.created_at);
                    const bucket = statsByMonth.find(b => b.month === date.getMonth() && b.year === date.getFullYear());
                    if (bucket) bucket.reservas += (r.group_size || 1);
                });
                setChartData(statsByMonth);

                // Compute Recent Activity Feed
                const activity: any[] = [];
                regs.slice(0, 6).forEach((r: any) => {
                    const campName = camps.find((c: any) => c.id === r.camp_id)?.title || 'un campamento';
                    activity.push({
                        type: 'reservation',
                        name: `${r.responsable_name} ${r.responsable_lastname}`,
                        action: `reservó ${r.group_size || 1} cupo${(r.group_size || 1) > 1 ? 's' : ''}`,
                        camp: campName,
                        date: new Date(r.created_at)
                    });
                });
                messages.slice(0, 3).forEach((m: any) => {
                    activity.push({
                        type: 'message',
                        name: m.name,
                        action: `envió un mensaje de contacto`,
                        camp: null,
                        date: new Date(m.created_at)
                    });
                });
                
                // Sort by newest
                activity.sort((a, b) => b.date.getTime() - a.date.getTime());
                
                const formatTimeAgo = (date: Date) => {
                    const minutes = Math.floor((new Date().getTime() - date.getTime()) / 60000);
                    if (minutes < 1) return `Hace segundos`;
                    if (minutes < 60) return `Hace ${minutes} min`;
                    const hours = Math.floor(minutes / 60);
                    if (hours < 24) return `Hace ${hours} horas`;
                    return `Hace ${Math.floor(hours / 24)} días`;
                };

                setRecentActivity(activity.slice(0, 5).map(a => ({ ...a, time: formatTimeAgo(a.date) })));
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                <p className="font-medium animate-pulse">Cargando métricas en vivo...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold dark:text-white tracking-tight mb-2">Resumen General</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Métricas clave y estado actual del ministerio.</p>
                </div>
                <div className="px-5 py-2.5 bg-white dark:bg-gray-900 border border-green-200 dark:border-green-900/50 rounded-full text-sm font-medium shadow-sm flex items-center gap-2 text-green-700 dark:text-green-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    BBDD Sincronizada
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { label: "Cupos Reservados", value: stats.reservas, trend: "Histórico total", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Campamentos Activos", value: stats.campsActivos, trend: "En plataforma", icon: Tent, color: "text-primary", bg: "bg-primary/10" },
                    { label: "Ingresos Estimados", value: `$${stats.ingresos.toLocaleString()}`, trend: "Cálculo base", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
                    { label: "Nuevos Mensajes", value: stats.mensajes, trend: stats.mensajes > 0 ? "Requieren atención" : "Bandeja limpia", icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-500/10" }
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.4 }}
                        key={stat.label} 
                        className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none hover:shadow-2xl hover:border-gray-200 dark:hover:border-gray-700 transition-all group flex flex-col justify-between"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm leading-tight max-w-[100px]">{stat.label}</h3>
                        </div>
                        <div>
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 inline-block px-3 py-1.5 rounded-lg self-start">
                            {stat.trend}
                        </div>
                    </motion.div>
                ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 h-96 flex flex-col shadow-sm">
                    <h3 className="font-bold text-xl dark:text-white mb-6">Inscripciones Últimos 6 Meses</h3>
                    <div className="flex-1 w-full h-full -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorReservas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                    itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="reservas" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorReservas)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 h-96 flex flex-col shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-xl dark:text-white">Actividad Reciente</h3>
                        <a href="/admin/reservaciones" className="text-xs font-semibold text-primary hover:underline">Ver todas &rarr;</a>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {recentActivity.length === 0 ? (
                            <p className="text-gray-500 text-center mt-10">No hay actividad reciente.</p>
                        ) : recentActivity.map((log, i) => (
                            <div key={i} className="flex gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                    log.type === 'reservation' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                }`}>
                                    {log.type === 'reservation' ? <Tent className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm dark:text-gray-200 leading-snug">
                                        <span className="font-semibold">{log.name}</span>{' '}
                                        <span className="text-gray-500">{log.action}</span>
                                        {log.camp && <span className="font-medium text-gray-700 dark:text-gray-300"> · {log.camp}</span>}
                                    </p>
                                    <span className="text-xs text-gray-400 mt-0.5 block">{log.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
