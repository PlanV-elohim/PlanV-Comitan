import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Loader2, Tent, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../components/ui/Toast';

export default function CamperAuth() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    
    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const { loginCamper, registerCamper, userType } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    // Prevent access if already logged in as a camper
    if (userType === 'camper') {
        const from = location.state?.from?.pathname || '/mi-perfil';
        navigate(from, { replace: true });
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                await loginCamper(email, password);
                showToast('¡Bienvenido de vuelta!', 'success');
            } else {
                if (!firstName || !lastName || !email || !password) {
                    throw new Error('Por favor, completa todos los campos.');
                }
                if (password.length < 6) {
                    throw new Error('La contraseña debe tener al menos 6 caracteres.');
                }
                await registerCamper(email, password, firstName, lastName);
                showToast('Cuenta creada con éxito. ¡Bienvenido!', 'success');
            }
            // Navigate to profile or return to wherever they came from
            const from = location.state?.from?.pathname || '/mi-perfil';
            navigate(from, { replace: true });
        } catch (error: any) {
            console.error(error);
            showToast(error.message || 'Error de autenticación. Verifica tus datos.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 w-full px-4 sm:px-0">
                <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al inicio
                </Link>

                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-gray-100">
                        <Tent className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    {isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {isLogin ? 'Bienvenido a tu portal de acampante' : 'Únete para gestionar tus registros y medallas'}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 w-full px-4 sm:px-0">
                <div className="bg-white py-8 px-4 sm:px-10 shadow-xl rounded-3xl border border-gray-100/50">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <AnimatePresence mode="popLayout">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700">Nombre</label>
                                        <div className="mt-1 relative rounded-xl shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                required={!isLogin}
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-3 border-gray-200 rounded-xl focus:ring-primary focus:border-primary sm:text-sm bg-gray-50 transition-colors focus:bg-white"
                                                placeholder="Juan"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700">Apellidos</label>
                                        <div className="mt-1 relative rounded-xl shadow-sm">
                                            <input
                                                type="text"
                                                required={!isLogin}
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="block w-full px-4 py-3 border-gray-200 rounded-xl focus:ring-primary focus:border-primary sm:text-sm bg-gray-50 transition-colors focus:bg-white"
                                                placeholder="Pérez"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="block text-sm font-bold text-gray-700">
                                Correo electrónico
                            </label>
                            <div className="mt-1 relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border-gray-200 rounded-xl focus:ring-primary focus:border-primary sm:text-sm bg-gray-50 transition-colors focus:bg-white"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700">
                                Contraseña
                            </label>
                            <div className="mt-1 relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border-gray-200 rounded-xl focus:ring-primary focus:border-primary sm:text-sm bg-gray-50 transition-colors focus:bg-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'Entrar al portal' : 'Comenzar mi aventura'}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500 font-medium">O podrías</span>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setFirstName('');
                                setLastName('');
                            }}
                            className="font-bold text-primary hover:text-primary/80 transition-colors text-sm hover:underline underline-offset-4"
                        >
                            {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
