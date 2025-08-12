
import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import type { UserProfile, AuthContextType } from '../types';
import { apiFetch } from '../services/supabase'; // Now the generic API client

// Storage Key for the auth token
const TOKEN_KEY = 'umkm-app-token';

const AVATAR_URLS = [
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Mimi',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Abby',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Callie',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Leo',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Max',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Bear',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Loki',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Milo',
];

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleAuthSuccess = useCallback((data: { user: UserProfile, token: string }) => {
        setUser(data.user);
        localStorage.setItem(TOKEN_KEY, data.token);
        return { success: true, user: data.user };
    }, []);

    useEffect(() => {
        const verifySession = async () => {
            const token = localStorage.getItem(TOKEN_KEY);
            if (token) {
                try {
                    const data = await apiFetch('/auth/me');
                    setUser(data.user);
                } catch (error) {
                    console.warn("Session token is invalid. Logging out.");
                    localStorage.removeItem(TOKEN_KEY);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
        verifySession();
    }, []);

    const login = async (email: string, passwordInput: string): Promise<{ success: true, user: UserProfile } | { success: false, error?: string }> => {
        try {
            const data = await apiFetch('/auth/login', {
                method: 'POST',
                body: { email, password: passwordInput }
            });
            return handleAuthSuccess(data);
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };
    
    const register = async (name: string, email: string, passwordInput: string): Promise<{ success: true, user: UserProfile } | { success: false, error?: string }> => {
        try {
            const data = await apiFetch('/auth/register', {
                method: 'POST',
                body: { name, email, password: passwordInput }
            });
            return handleAuthSuccess(data);
        } catch (error: any) {
             return { success: false, error: error.message };
        }
    };

    const loginWithGoogle = async (googleUser: { name: string; email: string; }): Promise<{ success: true, user: UserProfile } | { success: false, error?: string }> => {
        try {
            const data = await apiFetch('/auth/google', {
                method: 'POST',
                body: googleUser
            });
            return handleAuthSuccess(data);
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        // Optionally, call a backend endpoint to invalidate the token
        // apiFetch('/auth/logout', { method: 'POST' }).catch(e => console.error("Logout failed", e));
    };

    const updateProfile = async (newName: string, newEmail: string): Promise<{ success: true, user: UserProfile } | { success: false, error: string }> => {
        try {
            const { user: updatedUser } = await apiFetch('/user/profile', {
                method: 'PUT',
                body: { name: newName, email: newEmail }
            });
            setUser(updatedUser);
            return { success: true, user: updatedUser };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const changePassword = async (oldPassword: string, newPassword: string): Promise<{ success: true } | { success: false, error: string }> => {
         try {
            await apiFetch('/user/password', {
                method: 'PUT',
                body: { oldPassword, newPassword }
            });
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const updateAvatar = async (avatarUrl: string): Promise<{ success: true, user: UserProfile }> => {
        try {
            const { user: updatedUser } = await apiFetch('/user/avatar', {
                method: 'PUT',
                body: { avatarUrl }
            });
            setUser(updatedUser);
            return { success: true, user: updatedUser };
        } catch (error: any) {
            throw new Error(error.message || "Failed to update avatar");
        }
    };

    const value = useMemo(() => ({
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        loginWithGoogle,
        updateProfile,
        changePassword,
        updateAvatar
    }), [user, isLoading, handleAuthSuccess]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
       throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
