import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Corregido: Importar desde el hook personalizado

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();

    if (!user) {
        // user is not authenticated
        return <Navigate to="/login" />;
    }
    return children;
};

export default ProtectedRoute;
