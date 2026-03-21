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
        const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || import.meta.env.VITE_ADMIN_EMAIL || '').split(',').map((e: string) => e.trim().toLowerCase());

        // Check Supabase session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            
            // Verify admin status
            const adminSession = localStorage.getItem('adminAuth');
            const isUserAdmin = currentUser?.email && adminEmails.includes(currentUser.email.toLowerCase());

            if (adminSession === 'true' && isUserAdmin) {
                setIsAdmin(true);
            } else if (!currentUser || !isUserAdmin) {
                setIsAdmin(false);
                localStorage.removeItem('adminAuth');
            }
            
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            
            const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || import.meta.env.VITE_ADMIN_EMAIL || '').split(',').map((e: string) => e.trim().toLowerCase());
            const isUserAdmin = currentUser?.email && adminEmails.includes(currentUser.email.toLowerCase());

            if (isUserAdmin && localStorage.getItem('adminAuth') === 'true') {
                setIsAdmin(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loginAdmin = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || import.meta.env.VITE_ADMIN_EMAIL || '').split(',').map((e: string) => e.trim().toLowerCase());
        const isUserAdmin = data.user?.email && adminEmails.includes(data.user.email.toLowerCase());

        if (isUserAdmin) {
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
