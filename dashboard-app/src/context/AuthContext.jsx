// dashboard-app/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api'; // Import the configured api instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add a loading state

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    // Use the api instance which has the interceptor
                    const response = await api.get('/auth/me'); 
                    setUser(response.data.user);
                } catch (error) {
                    console.error("Failed to fetch user", error);
                    localStorage.removeItem('accessToken'); // Token is invalid
                    setUser(null);
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    const login = async (email, password) => {
        // Use the api instance
        const response = await api.post('/auth/login', {
            email,
            password
        });
        const { accessToken, user } = response.data;
        localStorage.setItem('accessToken', accessToken);
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
    };

    // Don't render children until we've checked for a user
    if (loading) {
        return <div>Loading...</div>; // Or a proper spinner component
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Un "hook" personalizado para acceder fácilmente al contexto
export const useAuth = () => {
    return useContext(AuthContext);
};