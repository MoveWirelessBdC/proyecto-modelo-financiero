// dashboard-app/src/pages/ConfigurationPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';

const ConfigurationPage = () => {
    const [config, setConfig] = useState({
        ltv_threshold_warning: 0,
        ltv_threshold_danger: 0,
        default_interest_rate: 0,
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await api.get('/config');
                if (response.data && Object.keys(response.data).length > 0) {
                    // Convert values from string to number if necessary
                    const numericConfig = Object.entries(response.data).reduce((acc, [key, value]) => {
                        acc[key] = parseFloat(value);
                        return acc;
                    }, {});
                    setConfig(numericConfig);
                }
            } catch (err) {
                console.error('Error fetching config:', err);
                setError('Error al cargar la configuración.');
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            await api.post('/config', config);
            setMessage('¡Configuración guardada exitosamente!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError('Error al guardar la configuración.');
            console.error('Error saving config:', err);
        }
    };

    if (loading) return <div className="p-8"><h1 className="text-2xl text-gray-500">Cargando configuración...</h1></div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-light text-gray-800 mb-12">Configuración Global</h1>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="ltv_threshold_warning" className="block text-sm font-medium text-gray-700">Umbral LTV de Consolidación (%)</label>
                        <p className="text-xs text-gray-500 mt-1 mb-2">
                            El LTV a partir del cual el medidor se pone en naranja.
                        </p>
                        <input
                            type="number"
                            id="ltv_threshold_warning"
                            name="ltv_threshold_warning"
                            value={config.ltv_threshold_warning}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="ltv_threshold_danger" className="block text-sm font-medium text-gray-700">Umbral LTV de Riesgo (%)</label>
                        <p className="text-xs text-gray-500 mt-1 mb-2">
                            El LTV a partir del cual el medidor se pone en rojo y se bloquean nuevos proyectos.
                        </p>
                        <input
                            type="number"
                            id="ltv_threshold_danger"
                            name="ltv_threshold_danger"
                            value={config.ltv_threshold_danger}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="mb-8">
                        <label htmlFor="default_interest_rate" className="block text-sm font-medium text-gray-700">Tasa de Interés por Defecto (%)</label>
                         <input
                            type="number"
                            id="default_interest_rate"
                            name="default_interest_rate"
                            value={config.default_interest_rate}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="flex items-center">
                        <button 
                            type="submit" 
                            className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Guardar Cambios
                        </button>
                        {message && <p className="ml-4 text-green-600">{message}</p>}
                        {error && <p className="ml-4 text-red-600">{error}</p>}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConfigurationPage;