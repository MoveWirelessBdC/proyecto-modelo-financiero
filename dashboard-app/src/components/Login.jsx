// dashboard-app/src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Corregido: Importar desde el hook personalizado

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // <--- Esta línea faltaba
    const { login } = useAuth(); // Obtenemos la función login del "cerebro"

    const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login.jsx: handleSubmit called');
    setError(''); // Clear previous errors

    try {
      console.log('Login.jsx: Calling login function from useAuth...');
      await login(email, password);
      console.log('Login.jsx: Login successful, navigating to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login.jsx: Login error caught:', err);
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

    // El resto del componente (el formulario) no cambia
    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                {/* ... (el código del formulario es el mismo de antes) ... */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px' }}/>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password</label>
                    <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }}/>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" style={{ padding: '10px 15px' }}>Entrar</button>
            </form>
        </div>
    );
};

export default Login;