import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const Config = () => {
    const [config, setConfig] = useState({
        companyName: '',
        brokerMarginRate: 0,
        brokerMaxLtv: 0,
        riskLtvConsolidation: 0,
        riskLtvDefensive: 0,
        defaultCustomerRate: 0,
        defaultInsuranceCost: 0,
        defaultTerm: 0,
        opCostsRent: 0,
        opCostsSalaries: 0,
        opCostsGeneral: 0,
    });

    useEffect(() => {
        axios.get(`${API_URL}/config`)
            .then(response => {
                if (response.data && Object.keys(response.data).length > 0) {
                    setConfig(response.data);
                }
            })
            .catch(error => console.error('Error fetching config:', error));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prevConfig => ({
            ...prevConfig,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`${API_URL}/config`, config)
            .then(response => {
                alert('Configuration saved!');
            })
            .catch(error => console.error('Error saving config:', error));
    };

    return (
        <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-2xl font-bold gradient-text mb-6">Configuración Global</h2>
            <form onSubmit={handleSubmit}>
                {/* Mi Empresa */}
                <fieldset className="mb-6">
                    <legend className="text-xl font-semibold text-gray-800 mb-4">Mi Empresa</legend>
                    <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
                    <input type="text" name="companyName" value={config.companyName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </fieldset>

                {/* Parámetros del Bróker */}
                <fieldset className="mb-6">
                    <legend className="text-xl font-semibold text-gray-800 mb-4">Parámetros del Bróker</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tasa de Interés de Margen Anual (%)</label>
                            <input type="number" name="brokerMarginRate" value={config.brokerMarginRate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">LTV Máximo Permitido (%)</label>
                            <input type="number" name="brokerMaxLtv" value={config.brokerMaxLtv} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                    </div>
                </fieldset>

                {/* Política de Riesgo LTV */}
                <fieldset className="mb-6">
                    <legend className="text-xl font-semibold text-gray-800 mb-4">Política de Riesgo LTV</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Umbral LTV Consolidación (%)</label>
                            <input type="number" name="riskLtvConsolidation" value={config.riskLtvConsolidation} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Umbral LTV Defensivo (%)</label>
                            <input type="number" name="riskLtvDefensive" value={config.riskLtvDefensive} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                    </div>
                </fieldset>

                {/* Parámetros Financieros por Defecto */}
                <fieldset className="mb-6">
                    <legend className="text-xl font-semibold text-gray-800 mb-4">Parámetros Financieros por Defecto</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tasa de Interés al Cliente (%)</label>
                            <input type="number" name="defaultCustomerRate" value={config.defaultCustomerRate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Costo de Seguro (%)</label>
                            <input type="number" name="defaultInsuranceCost" value={config.defaultInsuranceCost} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Plazo (meses)</label>
                            <input type="number" name="defaultTerm" value={config.defaultTerm} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                    </div>
                </fieldset>

                {/* Costos Operativos Mensuales */}
                <fieldset className="mb-6">
                    <legend className="text-xl font-semibold text-gray-800 mb-4">Costos Operativos Mensuales</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Alquiler</label>
                            <input type="number" name="opCostsRent" value={config.opCostsRent} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Salarios</label>
                            <input type="number" name="opCostsSalaries" value={config.opCostsSalaries} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Gastos Generales</label>
                            <input type="number" name="opCostsGeneral" value={config.opCostsGeneral} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                    </div>
                </fieldset>

                <div className="flex justify-end">
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Guardar Configuración
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Config;
