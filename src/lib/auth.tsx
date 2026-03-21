import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    loading: boolean;
    loginAdmin: (password: string) => boolean;
    logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAdmin: false,
    loading: true,
    loginAdmin: () => false,
    logoutAdmin: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for admin session
        const adminSession = localStorage.getItem('adminAuth');
        if (adminSession === 'true') {
            setIsAdmin(true);
        }

        // Check Supabase session for regular users
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const loginAdmin = (password: string) => {
        if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
            localStorage.setItem('adminAuth', 'true');
            setIsAdmin(true);
            return true;
        }
        return false;
    };

    const logoutAdmin = () => {
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
