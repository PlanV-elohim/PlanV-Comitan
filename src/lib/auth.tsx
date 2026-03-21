import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    loading: boolean;
    loginAdmin: (email: string, password: string) => Promise<boolean>;
    logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAdmin: false,
    loading: true,
    loginAdmin: async () => false,
    logoutAdmin: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check Supabase session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            
            // Verify admin status
            const adminSession = localStorage.getItem('adminAuth');
            if (adminSession === 'true' && currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL) {
                setIsAdmin(true);
            } else if (!currentUser || currentUser?.email !== import.meta.env.VITE_ADMIN_EMAIL) {
                setIsAdmin(false);
                localStorage.removeItem('adminAuth');
            }
            
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            
            if (currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL && localStorage.getItem('adminAuth') === 'true') {
                setIsAdmin(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loginAdmin = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        if (data.user?.email === import.meta.env.VITE_ADMIN_EMAIL) {
            localStorage.setItem('adminAuth', 'true');
            setIsAdmin(true);
            return true;
        } else {
            await supabase.auth.signOut();
            throw new Error('El correo ingresado no tiene privilegios de administrador.');
        }
    };

    const logoutAdmin = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('adminAuth');
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading, loginAdmin, logoutAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
