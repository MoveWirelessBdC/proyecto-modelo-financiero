import express from 'express';
import pool from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

// --- Portfolio Assets --- //

// GET all assets
router.get('/assets', async (req, res) => {
    try {
        const assets = await pool.query('SELECT * FROM portfolio_assets ORDER BY purchase_date DESC');
        res.json(assets.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ADD a new asset
router.post('/assets', async (req, res) => {
    try {
        const { name, purchase_value, purchase_date, current_market_value } = req.body;
        const newAsset = await pool.query(
            'INSERT INTO portfolio_assets (name, purchase_value, purchase_date, current_market_value, last_updated) VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING *',
            [name, purchase_value, purchase_date, current_market_value || purchase_value]
        );
        res.status(201).json(newAsset.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// UPDATE an asset's market value
router.put('/assets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { current_market_value } = req.body;
        const updatedAsset = await pool.query(
            'UPDATE portfolio_assets SET current_market_value = $1, last_updated = CURRENT_DATE WHERE id = $2 RETURNING *',
            [current_market_value, id]
        );
        if (updatedAsset.rows.length === 0) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        res.json(updatedAsset.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE an asset
router.delete('/assets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteOp = await pool.query('DELETE FROM portfolio_assets WHERE id = $1 RETURNING *', [id]);
        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        res.json({ message: 'Asset deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Portfolio Transactions --- //

// GET all transactions
router.get('/transactions', async (req, res) => {
    try {
        const transactions = await pool.query('SELECT * FROM portfolio_transactions ORDER BY transaction_date DESC');
        res.json(transactions.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ADD a new transaction
router.post('/transactions', async (req, res) => {
    try {
        const { type, amount, transaction_date, description } = req.body;
        const newTransaction = await pool.query(
            'INSERT INTO portfolio_transactions (type, amount, transaction_date, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [type, amount, transaction_date, description]
        );
        res.status(201).json(newTransaction.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Portfolio Overview --- //

router.get('/overview', async (req, res) => {
    try {
        // 1. Calculate Total Market Value of Assets
        const assetsValue = await pool.query('SELECT SUM(current_market_value) as total_value FROM portfolio_assets');
        const totalMarketValue = parseFloat(assetsValue.rows[0].total_value) || 0;

        // 2. Calculate Total Broker Debt (Corrected Query)
        const debtResult = await pool.query(`
            SELECT SUM(p.amount) - COALESCE(SUM(paid.principal_paid), 0) AS total_debt
            FROM projects p
            LEFT JOIN (
                SELECT project_id, SUM(principal) as principal_paid
                FROM amortization_schedule
                WHERE status = 'Paid'
                GROUP BY project_id
            ) paid ON p.id = paid.project_id
        `);
        const totalDebt = parseFloat(debtResult.rows[0].total_debt) || 0;

        // 3. Calculate LTV
        const ltv = totalMarketValue > 0 ? (totalDebt / totalMarketValue) * 100 : 0;

        // 4. Get other KPIs (example calculations)
        const interestIncome = await pool.query('SELECT SUM(interest) as monthly_interest FROM amortization_schedule WHERE payment_date >= date_trunc(\'month\', CURRENT_DATE) AND payment_date < date_trunc(\'month\', CURRENT_DATE) + interval \'1 month\' AND status = \'Paid\'');
        const pendingPayments = await pool.query('SELECT COUNT(*) as count FROM amortization_schedule WHERE payment_date >= date_trunc(\'month\', CURRENT_DATE) AND payment_date < date_trunc(\'month\', CURRENT_DATE) + interval \'1 month\' AND status = \'Pending\'');

        res.json({
            totalMarketValue: totalMarketValue.toFixed(2),
            totalDebt: totalDebt.toFixed(2),
            ltv: ltv.toFixed(2),
            interestIncomeThisMonth: (parseFloat(interestIncome.rows[0].monthly_interest) || 0).toFixed(2),
            pendingPaymentsThisMonth: parseInt(pendingPayments.rows[0].count) || 0
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;