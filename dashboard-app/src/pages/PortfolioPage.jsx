    // dashboard-app/src/pages/PortfolioPage.jsx
    import React, { useState, useEffect } from 'react';
    import api from '../api/api';

    const PortfolioPage = () => {
        const [assets, setAssets] = useState([]);
        const [newAsset, setNewAsset] = useState({ name: '', ticker_symbol: '', purchase_value: '', purchase_date: '' });

        useEffect(() => {
            fetchAssets();
        }, []);

        const fetchAssets = async () => {
            try {
                const response = await api.get('/portfolio/assets');
                setAssets(response.data);
            } catch (error) {
                console.error('Error fetching assets:', error);
            }
        };

        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setNewAsset(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                await api.post('/portfolio/assets', newAsset);
                fetchAssets();
                setNewAsset({ name: '', ticker_symbol: '', purchase_value: '', purchase_date: '' });
            } catch (error) {
                console.error('Error adding asset:', error);
            }
        };

        const handleDelete = async (id) => {
            try {
                await api.delete(`/portfolio/assets/${id}`);
                fetchAssets();
            } catch (error) {
                console.error('Error deleting asset:', error);
            }
        };
        
        return (
            <div>
                <h1>Gestión de Portafolio de Colateral</h1>
                {/* Formulario ajustado */}
                <div style={{ /*...*/ }}>
                    <h3>Añadir Nuevo Activo</h3>
                    <form onSubmit={handleSubmit} style={{ /*...*/ }}>
                        <input name="name" value={newAsset.name} onChange={handleInputChange} placeholder="Nombre del Activo (Ej: Bono del Tesoro)" />
                        <input name="ticker_symbol" value={newAsset.ticker_symbol} onChange={handleInputChange} placeholder="Símbolo Ticker (Ej: GOOG)" />
                        <input type="number" name="purchase_value" value={newAsset.purchase_value} onChange={handleInputChange} placeholder="Valor de Compra ($)" />
                        <input type="date" name="purchase_date" value={newAsset.purchase_date} onChange={handleInputChange} />
                        <button type="submit">Añadir Activo</button>
                    </form>
                </div>

                {/* Tabla ajustada */}
                <h3>Activos Actuales</h3>
                <table style={{ /*...*/ }}>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Símbolo</th>
                            <th>Valor de Mercado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map(asset => (
                            <tr key={asset.id}>
                                <td>{asset.name}</td>
                                <td>{asset.ticker_symbol || 'N/A'}</td>
                                <td>${parseFloat(asset.current_market_value).toLocaleString('en-US')}</td>
                                <td>
                                    <button onClick={() => handleDelete(asset.id)} style={{ color: 'red' }}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    export default PortfolioPage;
    