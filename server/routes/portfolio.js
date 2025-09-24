import express from 'express';
import { Op, fn, col, literal } from 'sequelize';
import db from '../models/index.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();
const { PortfolioAsset, AssetValueHistory, AmortizationSchedule } = db;

// GET all assets
router.get('/assets', [authMiddleware, checkPermission('portfolio:view')], async (req, res) => {
    try {
        const assets = await PortfolioAsset.findAll({ order: [['purchase_date', 'DESC']] });
        res.json(assets);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ADD a new asset
router.post('/assets', [authMiddleware, checkPermission('portfolio:edit')], async (req, res) => {
    try {
        const { name, ticker_symbol, purchase_value, purchase_date } = req.body;
        const newAsset = await PortfolioAsset.create({
            name,
            ticker_symbol,
            purchase_value,
            purchase_date,
            current_market_value: purchase_value, // Initially, market value is the purchase value
        });
        res.status(201).json(newAsset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// DELETE an asset
router.delete('/assets/:id', [authMiddleware, checkPermission('portfolio:delete')], async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await PortfolioAsset.destroy({ where: { id } });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).send('Asset not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET /api/portfolio/performance?days=30
router.get('/performance', authMiddleware, async (req, res) => {
    const days = parseInt(req.query.days, 10) || 30;
    try {
        const performance = await AssetValueHistory.findAll({
            where: {
                record_date: {
                    [Op.gte]: literal(`CURRENT_DATE - INTERVAL '${days} days'`)
                }
            },
            include: [{
                model: PortfolioAsset,
                attributes: ['name']
            }],
            order: [['record_date', 'ASC']]
        });

        const performanceData = performance.reduce((acc, record) => {
            const assetName = record.PortfolioAsset.name;
            acc[assetName] = acc[assetName] || [];
            acc[assetName].push({ date: record.record_date, value: parseFloat(record.market_value) });
            return acc;
        }, {});

        res.json(performanceData);
    } catch (err) {
        console.error('Error fetching portfolio performance:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET /api/portfolio/overview
router.get('/overview', authMiddleware, async (req, res) => {
    try {
        // 1. Total portfolio value
        const totalMarketValue = await PortfolioAsset.sum('current_market_value');

        // 2. Total active debt
        const totalDebtResult = await AmortizationSchedule.findOne({
            attributes: [[fn('SUM', col('remaining_balance')), 'total_debt']],
            where: {
                id: {
                    [Op.in]: literal(`(
                        SELECT MAX(id) 
                        FROM amortization_schedule 
                        WHERE status = 'Pending' 
                        GROUP BY project_id
                    )`)
                }
            },
            raw: true
        });
        const totalDebt = parseFloat(totalDebtResult.total_debt) || 0;

        // 3. Interest income this month
        const interestIncomeResult = await AmortizationSchedule.findOne({
            attributes: [[fn('SUM', col('interest')), 'interest_this_month']],
            where: {
                status: 'Paid',
                payment_date: {
                    [Op.and]: [
                        literal("to_char(payment_date, 'YYYY-MM') = to_char(CURRENT_DATE, 'YYYY-MM')")
                    ]
                }
            },
            raw: true
        });
        const interestIncomeThisMonth = parseFloat(interestIncomeResult.interest_this_month) || 0;

        // 4. Loan-to-Value (LTV)
        const ltv = totalMarketValue > 0 ? (totalDebt / totalMarketValue) * 100 : 0;

        res.json({
            totalMarketValue: (totalMarketValue || 0).toFixed(2),
            totalDebt: totalDebt.toFixed(2),
            interestIncomeThisMonth: interestIncomeThisMonth.toFixed(2),
            ltv: ltv.toFixed(2)
        });

    } catch (err) {
        console.error('Error fetching dashboard overview:', err);
        res.status(500).send('Server Error');
    }
});

export default router;