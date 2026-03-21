import { MessageSquare, Mail, Search, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function ContactManager() {
    const [messages] = useState([
        { id: 1, name: "María González", email: "maria@example.com", subject: "Duda sobre pagos", snippet: "Hola, quisiera saber a qué cuenta se deposita...", date: "Hoy, 10:30 AM", unread: true },
        { id: 2, name: "Carlos Ramírez", email: "carlos@example.com", subject: "Participación especial", snippet: "Me gustaría saber si puedo llevar mi guitarra...", date: "Ayer, 4:15 PM", unread: false },
        { id: 3, name: "Lucía Fernández", email: "lucia@example.com", subject: "Problema con registro", snippet: "Intento registrar a 10 personas pero me dice...", date: "18 Mar, 2:00 PM", unread: false }
    ]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold dark:text-white tracking-tight mb-2">Bandeja de Entrada</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Revisa los mensajes enviados desde la página pública.</p>
                </div>
                <div className="relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar mensajes..." 
                        className="pl-12 pr-4 py-3 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 w-full sm:w-64 focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white"
                    />
                </div>
            </header>

            <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden flex flex-col min-h-[500px]">
                {/* List Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center px-6">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold text-gray-500 dark:text-gray-400">Todos ({messages.length})</span>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                    {messages.map((msg, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            key={msg.id}
                            className={`p-6 flex flex-col sm:flex-row gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group ${msg.unread ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-gray-500 font-bold text-lg relative">
                                {msg.name.charAt(0)}
                                {msg.unread && (
                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary border-2 border-white dark:border-gray-900 rounded-full"></span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                    <h3 className={`text-lg truncate ${msg.unread ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-200'}`}>
                                        {msg.name}
                                    </h3>
                                    <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5 whitespace-nowrap">
                                        <Clock className="w-3.5 h-3.5" /> {msg.date}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                                    <Mail className="w-4 h-4" /> {msg.email}
                                </div>
                                <h4 className={`text-sm mb-1 ${msg.unread ? 'font-bold dark:text-gray-200' : 'font-medium text-gray-600 dark:text-gray-400'}`}>
                                    {msg.subject}
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                                    {msg.snippet}
                                </p>
                            </div>
                            <div className="shrink-0 flex items-center sm:items-start opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm px-3 py-1.5 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Marcar leído
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
