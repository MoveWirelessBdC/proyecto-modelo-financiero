import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextDef.js';

// Un "hook" personalizado para acceder fácilmente al contexto
export const useAuth = () => {
    return useContext(AuthContext);
};