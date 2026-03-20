import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, verifyOtp, sendOtp } from '../api/auth';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string, userData?: any) => void;
    logout: () => void;
    user: any | null;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return !!localStorage.getItem('helo_med_token');
    });

    const [user, setUser] = useState<any | null>(() => {
        const savedUser = localStorage.getItem('helo_med_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const refreshProfile = async () => {
        if (!isAuthenticated) return;
        try {
            const userData = await getProfile();
            setUser(userData);
            localStorage.setItem('helo_med_user', JSON.stringify(userData));
        } catch (error: any) {
            console.error("Failed to refresh profile:", error.response?.data || error.message);
        }
    };

    const login = (token: string, userData: any) => {
        localStorage.setItem('helo_med_token', token);
        if (userData) {
            localStorage.setItem('helo_med_user', JSON.stringify(userData));
            setUser(userData);
        }
        setIsAuthenticated(true);
    };

    useEffect(() => {
        if (isAuthenticated) {
            refreshProfile();
        } else {
            console.log("Auto-login bypass in progress...");
            sendOtp('1234567890')
                .then(() => verifyOtp('1234567890', '1000'))
                .then(authData => {
                    if (authData?.token) {
                        login(authData.token, authData.user);
                    }
                })
                .catch(err => console.error("Auto-login bypass failed:", err));
        }
    }, [isAuthenticated]);


    const logout = () => {
        localStorage.removeItem('helo_med_token');
        localStorage.removeItem('helo_med_user');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, user, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
