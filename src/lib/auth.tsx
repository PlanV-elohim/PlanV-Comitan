import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    userType: 'admin' | 'camper' | null;
    loading: boolean;
    loginAdmin: (email: string, password: string) => Promise<boolean>;
    loginCamper: (email: string, password: string) => Promise<boolean>;
    registerCamper: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
    logout: () => void;
    logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAdmin: false,
    userType: null,
    loading: true,
    loginAdmin: async () => false,
    loginCamper: async () => false,
    registerCamper: async () => false,
    logout: () => {},
    logoutAdmin: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [userType, setUserType] = useState<'admin' | 'camper' | null>(null);
    const [loading, setLoading] = useState(true);

    const checkUserRole = (currentUser: User | null) => {
        const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || import.meta.env.VITE_ADMIN_EMAIL || '').split(',').map((e: string) => e.trim().toLowerCase());
        
        if (!currentUser) {
            setIsAdmin(false);
            setUserType(null);
            localStorage.removeItem('adminAuth');
            localStorage.removeItem('camperAuth');
            return;
        }

        const adminSession = localStorage.getItem('adminAuth');
        const camperSession = localStorage.getItem('camperAuth');
        const isUserAdmin = currentUser.email && adminEmails.includes(currentUser.email.toLowerCase());

        if (adminSession === 'true' && isUserAdmin) {
            setIsAdmin(true);
            setUserType('admin');
        } else if (camperSession === 'true' && !isUserAdmin) {
            setIsAdmin(false);
            setUserType('camper');
        } else if (!isUserAdmin) {
            setIsAdmin(false);
            setUserType('camper');
            localStorage.setItem('camperAuth', 'true');
        } else {
            setIsAdmin(false);
            setUserType(null);
            localStorage.removeItem('adminAuth');
            localStorage.removeItem('camperAuth');
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            checkUserRole(currentUser);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            checkUserRole(currentUser);
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
            setUserType('admin');
            return true;
        } else {
            await supabase.auth.signOut();
            throw new Error('El correo ingresado no tiene privilegios de administrador.');
        }
    };

    const loginCamper = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        localStorage.setItem('camperAuth', 'true');
        setIsAdmin(false);
        setUserType('camper');
        return true;
    };

    const registerCamper = async (email: string, password: string, firstName: string, lastName: string) => {
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName
                }
            }
        });
        if (error) throw error;
        
        if (data.session) {
            localStorage.setItem('camperAuth', 'true');
            setIsAdmin(false);
            setUserType('camper');
        }
        return true;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('camperAuth');
        setIsAdmin(false);
        setUserType(null);
    };

    const logoutAdmin = logout;

    return (
        <AuthContext.Provider value={{ user, isAdmin, userType, loading, loginAdmin, loginCamper, registerCamper, logout, logoutAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
