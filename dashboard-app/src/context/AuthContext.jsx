// dashboard-app/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Al cargar la app, revisa si hay un token en localStorage
        const token = localStorage.getItem('accessToken');
        if (token) {
            // Si hay token, podríamos decodificarlo para obtener info del usuario
            // Por ahora, solo asumimos que está logueado
            setUser({ token }); 
        }
    }, []);

    const login = async (email, password) => {
        const response = await axios.post('http://localhost:3001/api/auth/login', {
            email,
            password
        });
        const { accessToken, ...userData } = response.data;
        localStorage.setItem('accessToken', accessToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
    };

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