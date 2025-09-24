// dashboard-app/src/context/AuthContext.jsx
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextDef.js';
import api from '../api/api'; // Import the configured api instance

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add a loading state

    useEffect(() => {
        const initializeAuth = () => {
            const token = localStorage.getItem('token');
            console.log('AuthContext: Initializing auth, token found:', token ? 'YES' : 'NO');
            
            if (token) {
                // Si hay token, intentar validarlo
                validateToken(token);
            } else {
                console.log('AuthContext: No token found, user stays null');
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const validateToken = async (token) => {
        try {
            console.log('AuthContext: Validating token with /auth/me');
            const response = await api.get('/auth/me');
            console.log('AuthContext: Token validation successful:', response.data);
            setUser(response.data.user || response.data);
        } catch (error) {
            console.error('AuthContext: Token validation failed', error);
            // Token inválido, limpiar todo
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        console.log('AuthContext.jsx: login function called with email:', email);
        try {
            console.log('AuthContext.jsx: Sending POST request to /auth/login...');
            const res = await api.post('/auth/login', { email, password });
            console.log('AuthContext.jsx: Login API call successful. Response:', res.data);
            
            // Save token and user data
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user || res.data); // Handle different response structures
            
            return res.data;
        } catch (error) {
            console.error('AuthContext.jsx: Login failed in AuthContext:', error);
            throw error;
        }
    };

    const logout = () => {
        console.log('AuthContext: Logging out, removing token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // Don't render children until we've checked for a user
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
