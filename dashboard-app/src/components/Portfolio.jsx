import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const Portfolio = () => {
    const [assets, setAssets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [assetsRes, transRes] = await Promise.all([
                axios.get(`${API_URL}/portfolio/assets`),
                axios.get(`${API_URL}/portfolio/transactions`)
            ]);
            setAssets(assetsRes.data);
            setTransactions(transRes.data);
            setError('');
        } catch (err) {
            setError('Could not fetch portfolio data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAsset = async (assetData, id) => {
        try {
            if (id) {
                await axios.put(`${API_URL}/portfolio/assets/${id}`, assetData);
            } else {
                await axios.post(`${API_URL}/portfolio/assets`, assetData);
            }
            fetchData();
        } catch (err) {
            console.error('Error saving asset', err);
        }
    };

    const handleSaveTransaction = async (transactionData) => {
        try {
            await axios.post(`${API_URL}/portfolio/transactions`, transactionData);
            fetchData();
        } catch (err) {
            console.error('Error saving transaction', err);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-6 rounded-2xl space-y-6">
                <h2 className="text-2xl font-bold gradient-text">Portfolio Assets</h2>
                <AssetForm onSave={handleSaveAsset} />
                <AssetTable assets={assets} onSave={handleSaveAsset} />
            </div>
            <div className="glass-card p-6 rounded-2xl space-y-6">
                <h2 className="text-2xl font-bold gradient-text">Portfolio Transactions</h2>
                <TransactionForm onSave={handleSaveTransaction} />
                <TransactionTable transactions={transactions} />
            </div>
        </div>
    );
};

const AssetTable = ({ assets, onSave }) => {
    const handleValueChange = (id, value) => {
        onSave({ current_market_value: value }, id);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-transparent rounded-lg">
                <thead>
                    <tr className="bg-gray-700/50">
                        <th className="py-3 px-4 text-left text-white">Asset</th>
                        <th className="py-3 px-4 text-left text-white">Purchase Value</th>
                        <th className="py-3 px-4 text-left text-white">Market Value</th>
                    </tr>
                </thead>
                <tbody>
                    {assets.map(asset => (
                        <tr key={asset.id} className="border-b border-gray-700">
                            <td className="py-3 px-4 text-gray-300">{asset.name}</td>
                            <td className="py-3 px-4 text-gray-300">${parseFloat(asset.purchase_value).toLocaleString()}</td>
                            <td className="py-3 px-4 text-gray-300">
                                <input 
                                    type="number" 
                                    defaultValue={parseFloat(asset.current_market_value)}
                                    onBlur={(e) => handleValueChange(asset.id, e.target.value)}
                                    className="bg-gray-800 w-32 text-white p-1 rounded"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AssetForm = ({ onSave }) => {
    const [data, setData] = useState({ name: '', purchase_value: '', purchase_date: '' });
    const handleChange = e => setData({ ...data, [e.target.name]: e.target.value });
    const handleSubmit = e => { e.preventDefault(); onSave(data); setData({ name: '', purchase_value: '', purchase_date: '' }); };
    return (
        <form onSubmit={handleSubmit} className="flex items-end gap-4">
            <input type="text" name="name" value={data.name} onChange={handleChange} placeholder="Asset Name" className="input-field" required />
            <input type="number" name="purchase_value" value={data.purchase_value} onChange={handleChange} placeholder="Purchase Value" className="input-field" required />
            <input type="date" name="purchase_date" value={data.purchase_date} onChange={handleChange} className="input-field" required />
            <button type="submit" className="btn-primary">Add Asset</button>
        </form>
    );
}

const TransactionTable = ({ transactions }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-transparent rounded-lg">
            <thead>
                <tr className="bg-gray-700/50">
                    <th className="py-3 px-4 text-left text-white">Type</th>
                    <th className="py-3 px-4 text-left text-white">Amount</th>
                    <th className="py-3 px-4 text-left text-white">Date</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map(t => (
                    <tr key={t.id} className="border-b border-gray-700">
                        <td className="py-3 px-4 text-gray-300">{t.type}</td>
                        <td className="py-3 px-4 text-gray-300">${parseFloat(t.amount).toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-300">{new Date(t.transaction_date).toLocaleDateString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const TransactionForm = ({ onSave }) => {
    const [data, setData] = useState({ type: 'Initial Capital', amount: '', transaction_date: '' });
    const handleChange = e => setData({ ...data, [e.target.name]: e.target.value });
    const handleSubmit = e => { e.preventDefault(); onSave(data); setData({ type: 'Initial Capital', amount: '', transaction_date: '' }); };
    return (
        <form onSubmit={handleSubmit} className="flex items-end gap-4">
            <select name="type" value={data.type} onChange={handleChange} className="input-field">
                <option>Initial Capital</option>
                <option>Reinvestment</option>
                <option>Liquidation</option>
            </select>
            <input type="number" name="amount" value={data.amount} onChange={handleChange} placeholder="Amount" className="input-field" required />
            <input type="date" name="transaction_date" value={data.transaction_date} onChange={handleChange} className="input-field" required />
            <button type="submit" className="btn-primary">Add Transaction</button>
        </form>
    );
}

export default Portfolio;
