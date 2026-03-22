import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { Lock, ArrowRight, ShieldCheck, Mail, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { loginAdmin, isAdmin } = useAuth();
    const navigate = useNavigate();

    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const success = await loginAdmin(email, password);
            if (success) {
                navigate('/admin');
            }
        } catch (err: any) {
            let msg = err.message || 'Credenciales inválidas';
            if (msg.includes('Invalid login credentials')) msg = 'Correo o contraseña incorrectos.';
            else if (msg.includes('rate limit')) msg = 'Demasiados intentos. Por favor, espera un momento.';
            setError(msg);
            setPassword('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-800"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold dark:text-white">Acceso Administrador</h1>
                    <p className="text-gray-500 text-sm mt-1">Ingresa tus credenciales para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            className="block w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 dark:text-white"
                            placeholder="Correo de Administrador"
                            autoFocus
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className={`block w-full pl-11 pr-4 py-3 border ${error ? 'border-red-500 bg-red-50 dark:bg-red-500/10' : 'border-gray-200 dark:border-gray-700'} rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900 dark:text-white`}
                            placeholder="Contraseña"
                        />
                    </div>
                    
                    {error && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center">
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl text-white bg-dark dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-medium transition-colors disabled:opacity-70 mt-4"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Ingresar <ArrowRight className="ml-2 w-5 h-5" /></>}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full text-center text-sm text-gray-500 hover:text-primary transition-colors mt-6"
                    >
                        &larr; Volver al sitio web
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
