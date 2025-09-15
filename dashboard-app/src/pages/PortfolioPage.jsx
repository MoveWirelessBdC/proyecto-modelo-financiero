// dashboard-app/src/pages/PortfolioPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';

const PortfolioPage = () => {
    const [assets, setAssets] = useState([]);
    const [newAsset, setNewAsset] = useState({ name: '', ticker_symbol: '', purchase_value: '', purchase_date: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const response = await api.get('/portfolio/assets');
            setAssets(response.data);
        } catch (err) {
            console.error('Error fetching assets:', err);
            setError('No se pudieron cargar los activos del portafolio.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAsset(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/portfolio/assets', newAsset);
            fetchAssets(); // Refresh list
            setNewAsset({ name: '', ticker_symbol: '', purchase_value: '', purchase_date: '' }); // Reset form
        } catch (err) {
            console.error('Error adding asset:', err);
            setError('Error al añadir el activo.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/portfolio/assets/${id}`);
            fetchAssets(); // Refresh list
        } catch (err) {
            console.error('Error deleting asset:', err);
            setError('Error al eliminar el activo.');
        }
    };
    
    return (
        <div className="p-8">
            <h1 className="text-3xl font-light text-gray-800 mb-12">Gestión de Portafolio</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna del Formulario */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-lg border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Añadir Nuevo Activo</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Activo</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newAsset.name}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Bono del Tesoro, Acciones AAPL"
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="ticker_symbol" className="block text-sm font-medium text-gray-700">Símbolo Ticker (Opcional)</label>
                                <input
                                    type="text"
                                    id="ticker_symbol"
                                    name="ticker_symbol"
                                    value={newAsset.ticker_symbol}
                                    onChange={handleInputChange}
                                    placeholder="Ej: GOOG, TSLA"
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="purchase_value" className="block text-sm font-medium text-gray-700">Valor de Compra ($)</label>
                                <input
                                    type="number"
                                    id="purchase_value"
                                    name="purchase_value"
                                    value={newAsset.purchase_value}
                                    onChange={handleInputChange}
                                    placeholder="10000"
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700">Fecha de Compra</label>
                                <input
                                    type="date"
                                    id="purchase_date"
                                    name="purchase_date"
                                    value={newAsset.purchase_date}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <button 
                                type="submit"
                                className="w-full bg-gray-800 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Añadir Activo
                            </button>
                            {error && <p className="mt-4 text-red-600">{error}</p>}
                        </form>
                    </div>
                </div>

                {/* Columna de la Tabla */}
                <div className="lg:col-span-2">
                     <div className="bg-white p-8 rounded-lg border border-gray-200 overflow-x-auto">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Activos Actuales</h2>
                        {loading ? (
                            <p>Cargando activos...</p>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticker</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor de Compra</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor de Mercado</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {assets.map(asset => (
                                        <tr key={asset.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.ticker_symbol || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${parseFloat(asset.purchase_value).toLocaleString('en-US')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">${parseFloat(asset.current_market_value).toLocaleString('en-US')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleDelete(asset.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioPage;