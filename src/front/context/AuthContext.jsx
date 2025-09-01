// --- src/context/AuthContext.js ---
// Manages global authentication state using React's Context API.

import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Mock login function
    const login = (userData) => {
        const mockUser = { name: 'Hero Kid', email: userData.email, points: 250, streak: 3 };
        setUser(mockUser);
        navigate('/dashboard');
    };

    // Mock Google login
    const loginWithGoogle = () => {
        const mockUser = { name: 'Hero Kid', email: 'hero@google.com', points: 250, streak: 3 };
        setUser(mockUser);
        navigate('/dashboard');
    };

    const logout = () => {
        setUser(null);
        navigate('/');
    };

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};
