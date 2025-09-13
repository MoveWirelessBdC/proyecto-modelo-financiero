// dashboard-app/src/components/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Importamos el hook

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth(); // Obtenemos la función login del "cerebro"

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            // Ya no necesitamos hacer nada más aquí, el AuthContext se encarga
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al iniciar sesión.';
            setError(errorMessage);
        }
    };

    // El resto del componente (el formulario) no cambia
    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleLogin}>
                {/* ... (el código del formulario es el mismo de antes) ... */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px' }}/>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }}/>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" style={{ padding: '10px 15px' }}>Entrar</button>
            </form>
        </div>
    );
};

export default Login;