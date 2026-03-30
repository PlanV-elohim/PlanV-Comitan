import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { Loader2 } from 'lucide-react';

export default function CamperLayout() {
    const { userType, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (userType !== 'camper') {
        // Redirigir a la pantalla de login de acampante
        return <Navigate to="/portal/login" state={{ from: location }} replace />;
    }

    // Renderiza el contenido protegido (Portal.tsx)
    return <Outlet />;
}
