import express from 'express';
import pool from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all project routes
router.use(authMiddleware);

// Function to calculate amortization schedule
const calculateAmortization = (principal, annualRate, termMonths) => {
    const monthlyRate = annualRate / 12 / 100;
    const monthlyPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
    
    let balance = principal;
    const schedule = [];

    for (let i = 1; i <= termMonths; i++) {
        const interest = balance * monthlyRate;
        const principalPayment = monthlyPayment - interest;
        balance -= principalPayment;

        schedule.push({
            month: i,
            monthlyPayment: monthlyPayment.toFixed(2),
            principal: principalPayment.toFixed(2),
            interest: interest.toFixed(2),
            remainingBalance: balance.toFixed(2),
        });
    }
    return schedule;
};

// GET all projects with client info
router.get('/', async (req, res) => {
    try {
        const allProjects = await pool.query(`
            SELECT p.*, c.name as client_name 
            FROM projects p
            JOIN clients c ON p.client_id = c.id
            ORDER BY p.start_date DESC
        `);
        res.json(allProjects.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// GET a single project with its amortization schedule
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);

        if (project.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const schedule = await pool.query('SELECT * FROM amortization_schedule WHERE project_id = $1 ORDER BY month ASC', [id]);

        res.json({ ...project.rows[0], schedule: schedule.rows });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// CREATE a new project and its amortization schedule
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const {
            client_id, description, amount, start_date, 
            interest_rate, insurance_cost, term_months, sales_commission
        } = req.body;

        const newProject = await client.query(
            `INSERT INTO projects (client_id, description, amount, start_date, interest_rate, insurance_cost, term_months, sales_commission)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [client_id, description, amount, start_date, interest_rate, insurance_cost, term_months, sales_commission]
        );
        const projectId = newProject.rows[0].id;

        // Calculate total annual rate for amortization
        const totalAnnualRate = parseFloat(interest_rate) + parseFloat(insurance_cost);
        const schedule = calculateAmortization(parseFloat(amount), totalAnnualRate, parseInt(term_months));

        // Insert amortization schedule into the database
        const insertPromises = schedule.map(row => {
            const paymentDate = new Date(start_date);
            paymentDate.setMonth(paymentDate.getMonth() + row.month);
            return client.query(
                `INSERT INTO amortization_schedule (project_id, month, payment_date, monthly_payment, principal, interest, remaining_balance)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [projectId, row.month, paymentDate, row.monthlyPayment, row.principal, row.interest, row.remainingBalance]
            );
        });

        await Promise.all(insertPromises);

        await client.query('COMMIT');
        res.status(201).json(newProject.rows[0]);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server error');
    } finally {
        client.release();
    }
});

// UPDATE payment status for a specific month
router.put('/:projectId/payments/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { status } = req.body;

        if (!['Paid', 'Pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updatedPayment = await pool.query(
            'UPDATE amortization_schedule SET status = $1 WHERE id = $2 RETURNING *',
            [status, paymentId]
        );

        if (updatedPayment.rows.length === 0) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        res.json(updatedPayment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// DELETE a project
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // The ON DELETE CASCADE in the table definition will handle related amortization schedule entries
        const deleteOp = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);

        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ message: 'Project and its amortization schedule deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
