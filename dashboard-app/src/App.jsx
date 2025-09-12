import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import Config from './components/Config';
import Clients from './components/Clients';
import Projects from './components/Projects';
import Portfolio from './components/Portfolio';
import Login from './components/Login';

const setAuthToken = token => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

function App() {
    const [page, setPage] = useState('dashboard');
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tokenFromStorage = localStorage.getItem('token');
        if (tokenFromStorage) {
            setAuthToken(tokenFromStorage);
            setToken(tokenFromStorage);
        }
        setLoading(false);
    }, []);

    const handleLogin = (token) => {
        localStorage.setItem('token', token);
        setAuthToken(token);
        setToken(token);
        setPage('dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setAuthToken(null);
    };

    const NavButton = ({ pageName, currentPage, setPage }) => {
        const isActive = pageName.toLowerCase() === currentPage;
        return (
            <button
                onClick={() => setPage(pageName.toLowerCase())}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
                {pageName}
            </button>
        );
    };

    if (loading) {
        return <div className="text-center text-white">Loading...</div>; // Or a proper spinner
    }

    if (!token) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen p-4 lg:p-8">
            <nav className="glass-card p-4 rounded-2xl mb-8 flex justify-between items-center">
                <div className="text-white font-bold text-xl">FinTech Pro</div>
                <div className="flex space-x-4">
                    <NavButton pageName="Dashboard" currentPage={page} setPage={setPage} />
                    <NavButton pageName="Clients" currentPage={page} setPage={setPage} />
                    <NavButton pageName="Projects" currentPage={page} setPage={setPage} />
                    <NavButton pageName="Portfolio" currentPage={page} setPage={setPage} />
                    <NavButton pageName="Configuración" currentPage={page} setPage={setPage} />
                    <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">Logout</button>
                </div>
            </nav>

            <main>
                {page === 'dashboard' && <Dashboard />}
                {page === 'clients' && <Clients />}
                {page === 'projects' && <Projects />}
                {page === 'portfolio' && <Portfolio />}
                {page === 'configuración' && <Config />}
                {page === 'login' && <Login onLogin={handleLogin} />}
            </main>
        </div>
    );
}

export default App;
