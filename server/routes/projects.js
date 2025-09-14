import express from 'express';
import pool from '../db/index.js';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Tu función de amortización
const calculateAmortization = (principal, annualRate, termMonths, startDate) => {
    const monthlyRate = annualRate / 12 / 100;
    if (termMonths <= 0 || principal <= 0) return [];
    const monthlyPayment = monthlyRate > 0 ? (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths)) : principal / termMonths;
    let balance = principal;
    const schedule = [];
    const baseDate = new Date(startDate);
    for (let i = 1; i <= termMonths; i++) {
        const interest = balance * monthlyRate;
        let principalPayment = monthlyPayment - interest;
        if (i === termMonths) {
            principalPayment = principalPayment + balance - principalPayment > 0 ? balance : principalPayment;
            balance = 0;
        } else {
            balance -= principalPayment;
        }
        const paymentDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate());
        schedule.push({
            month_number: i,
            payment_date: paymentDate.toISOString().split('T')[0],
            monthly_payment: monthlyPayment.toFixed(2),
            principal: principalPayment.toFixed(2),
            interest: interest.toFixed(2),
            remaining_balance: balance.toFixed(2),
            status: 'Pending'
        });
    }
    return schedule;
};

// Tu ruta para obtener todos los proyectos
router.get('/', [authMiddleware, checkPermission('projects:view')], async (req, res) => {
    try {
        const allProjects = await pool.query(`
            SELECT p.*, c.name as client_name 
            FROM projects p
            JOIN clients c ON p.client_id = c.id
            ORDER BY p.start_date DESC
        `);
        res.json(allProjects.rows);
    } catch (err) {
        console.error("Error fetching projects:", err);
        res.status(500).json({ message: 'Error interno del servidor al obtener los proyectos.' });
    }
});

// Tu ruta para crear un proyecto
router.post('/', [authMiddleware, checkPermission('projects:create')], async (req, res) => {
    const dbClient = await pool.connect();
    try {
        const { client_id, description, amount, start_date, interest_rate, insurance_cost = 0, sales_commission = 0, term_months } = req.body;
        const created_by_id = req.user.id;
        const num_client_id = parseInt(client_id, 10);
        const num_amount = parseFloat(amount);
        const num_interest_rate = parseFloat(interest_rate);
        const num_term_months = parseInt(term_months, 10);
        const num_insurance_cost = parseFloat(insurance_cost);
        const num_sales_commission = parseFloat(sales_commission);
        if (isNaN(num_client_id) || isNaN(num_amount) || isNaN(num_interest_rate) || isNaN(num_term_months)) {
            return res.status(400).json({ message: 'Datos inválidos.' });
        }
        if (num_amount <= 0 || num_term_months <= 0) {
             return res.status(400).json({ message: 'El monto y el plazo deben ser mayores a cero.' });
        }
        if (!start_date || isNaN(new Date(start_date))) {
            return res.status(400).json({ message: 'La fecha de inicio es inválida.' });
        }
        await dbClient.query('BEGIN');
        const newProjectQuery = `
            INSERT INTO projects (client_id, description, amount, start_date, interest_rate, insurance_cost, sales_commission, term_months, created_by_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
        `;
        const projectResult = await dbClient.query(newProjectQuery, [num_client_id, description, num_amount, start_date, num_interest_rate, num_insurance_cost, num_sales_commission, num_term_months, created_by_id]);
        const newProject = projectResult.rows[0];
        const totalAnnualRate = num_interest_rate + num_insurance_cost;
        const schedule = calculateAmortization(num_amount, totalAnnualRate, num_term_months, start_date);
        if (schedule.length > 0) {
            const scheduleInsertQuery = `
                INSERT INTO amortization_schedule (project_id, month_number, payment_date, monthly_payment, principal, interest, remaining_balance, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
            `;
            for (const row of schedule) {
                await dbClient.query(scheduleInsertQuery, [newProject.id, row.month_number, row.payment_date, row.monthly_payment, row.principal, row.interest, row.remaining_balance, row.status]);
            }
        }
        await dbClient.query('COMMIT');
        res.status(201).json(newProject);
    } catch (err) {
        await dbClient.query('ROLLBACK');
        console.error("--- ERROR DETALLADO AL CREAR PROYECTO ---", err);
        res.status(500).json({ message: 'Error interno del servidor al crear el proyecto.' });
    } finally {
        dbClient.release();
    }
});

// Mi versión corregida y robusta de la ruta para obtener un solo proyecto
router.get('/:id', [authMiddleware, checkPermission('projects:view')], async (req, res) => {
    const dbClient = await pool.connect();
    try {
        const projectId = parseInt(req.params.id, 10);
        if (isNaN(projectId)) {
            return res.status(400).json({ message: 'ID de proyecto inválido.' });
        }
        const projectQuery = 'SELECT p.*, c.name as client_name FROM projects p JOIN clients c ON p.client_id = c.id WHERE p.id = $1';
        const scheduleQuery = 'SELECT * FROM amortization_schedule WHERE project_id = $1 ORDER BY month_number ASC';
        
        // Usamos dbClient para ambas consultas
        const projectResult = await dbClient.query(projectQuery, [projectId]);
        if (projectResult.rows.length === 0) {
            return res.status(404).json({ message: 'Proyecto no encontrado.' });
        }
        const scheduleResult = await dbClient.query(scheduleQuery, [projectId]);
        
        res.json({ project: projectResult.rows[0], schedule: scheduleResult.rows });
    } catch (err) {
        console.error(`Error fetching project with id ${req.params.id}:`, err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        dbClient.release();
    }
});

// Tu ruta para borrar un proyecto
router.delete('/:id', [authMiddleware, checkPermission('projects:delete')], async (req, res) => {
     try {
        const projectId = parseInt(req.params.id, 10);
        if (isNaN(projectId)) return res.status(400).json({ message: 'ID de proyecto inválido.' });
        const result = await pool.query('DELETE FROM projects WHERE id = $1', [projectId]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Proyecto no encontrado para eliminar.' });
        res.status(204).send();
    } catch (err) {
        console.error(`Error deleting project with id ${req.params.id}:`, err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Tu ruta para actualizar un pago
router.put('/:projectId/payments/:paymentId', [authMiddleware, checkPermission('payments:edit')], async (req, res) => {
    try {
        const { projectId, paymentId } = req.params;
        const { status } = req.body;
        const numProjectId = parseInt(projectId, 10);
        const numPaymentId = parseInt(paymentId, 10);
        if (isNaN(numProjectId) || isNaN(numPaymentId)) return res.status(400).json({ message: 'IDs de proyecto o pago inválidos.' });
        if (!status || !['Paid', 'Pending', 'Late'].includes(status)) return res.status(400).json({ message: 'El estado proporcionado es inválido.' });
        const result = await pool.query('UPDATE amortization_schedule SET status = $1 WHERE project_id = $2 AND id = $3 RETURNING *', [status, numProjectId, numPaymentId]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Registro de pago no encontrado.' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`Error updating payment ${req.params.paymentId} for project ${req.params.projectId}:`, err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

export default router;