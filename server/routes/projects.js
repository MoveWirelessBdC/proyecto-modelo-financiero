import express from 'express';
import db from '../models/index.js';
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

// GET /api/projects - Obtiene todos los proyectos
router.get('/', [authMiddleware, checkPermission('projects:view')], async (req, res) => {
    try {
        const allProjects = await db.Project.findAll({
            include: [{
                model: db.Client,
                attributes: ['name']
            }],
            order: [['start_date', 'DESC']]
        });

        const flattenedProjects = allProjects.map(p => ({
            ...p.toJSON(),
            client_name: p.Client ? p.Client.name : null
        }));

        res.json(flattenedProjects);
    } catch (err) {
        console.error("Error fetching projects:", err);
        res.status(500).json({ message: 'Error interno del servidor al obtener los proyectos.' });
    }
});

// POST /api/projects - Crea un proyecto
router.post('/', [authMiddleware, checkPermission('projects:create')], async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const { client_id, description, amount, start_date, interest_rate, insurance_cost = 0, sales_commission = 0, term_months } = req.body;
        const created_by_id = req.user.id;

        const newProject = await db.Project.create({
            client_id,
            description,
            amount,
            start_date,
            interest_rate,
            insurance_cost,
            sales_commission,
            term_months,
            created_by_id
        }, { transaction: t });

        const totalAnnualRate = parseFloat(interest_rate) + parseFloat(insurance_cost);
        const schedule = calculateAmortization(parseFloat(amount), totalAnnualRate, parseInt(term_months, 10), start_date);

        if (schedule.length > 0) {
            const scheduleWithProjectId = schedule.map(row => ({ ...row, project_id: newProject.id }));
            await db.AmortizationSchedule.bulkCreate(scheduleWithProjectId, { transaction: t });
        }

        await t.commit();
        res.status(201).json(newProject);
    } catch (err) {
        await t.rollback();
        console.error("--- ERROR DETALLADO AL CREAR PROYECTO ---", err);
        res.status(500).json({ message: 'Error interno del servidor al crear el proyecto.' });
    }
});

// GET /api/projects/:id - Obtiene un solo proyecto
router.get('/:id', [authMiddleware, checkPermission('projects:view')], async (req, res) => {
    try {
        const projectId = parseInt(req.params.id, 10);
        if (isNaN(projectId)) {
            return res.status(400).json({ message: 'ID de proyecto inválido.' });
        }

        const project = await db.Project.findByPk(projectId, {
            include: [
                { model: db.Client, attributes: ['name'] },
                { model: db.AmortizationSchedule, as: 'schedule', order: [['month_number', 'ASC']] }
            ]
        });

        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado.' });
        }
        
        const flattenedProject = {
            ...project.toJSON(),
            client_name: project.Client ? project.Client.name : null
        };

        res.json({ project: flattenedProject, schedule: project.schedule });
    } catch (err) {
        console.error(`Error fetching project with id ${req.params.id}:`, err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// DELETE /api/projects/:id - Borra un proyecto
router.delete('/:id', [authMiddleware, checkPermission('projects:delete')], async (req, res) => {
    try {
        const projectId = parseInt(req.params.id, 10);
        if (isNaN(projectId)) return res.status(400).json({ message: 'ID de proyecto inválido.' });

        const project = await db.Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado para eliminar.' });
        }

        await project.destroy();
        res.status(204).send();
    } catch (err) {
        console.error(`Error deleting project with id ${req.params.id}:`, err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// PUT /api/projects/:projectId/payments/:paymentId - Actualiza un pago
router.put('/:projectId/payments/:paymentId', [authMiddleware, checkPermission('payments:edit')], async (req, res) => {
    try {
        const { projectId, paymentId } = req.params;
        const { status } = req.body;

        const numProjectId = parseInt(projectId, 10);
        const numPaymentId = parseInt(paymentId, 10);

        if (isNaN(numProjectId) || isNaN(numPaymentId)) return res.status(400).json({ message: 'IDs de proyecto o pago inválidos.' });
        if (!status || !['Paid', 'Pending', 'Late'].includes(status)) return res.status(400).json({ message: 'El estado proporcionado es inválido.' });

        const payment = await db.AmortizationSchedule.findOne({
            where: { id: numPaymentId, project_id: numProjectId }
        });

        if (!payment) {
            return res.status(404).json({ message: 'Registro de pago no encontrado.' });
        }

        payment.status = status;
        await payment.save();

        res.json(payment);
    } catch (err) {
        console.error(`Error updating payment ${req.params.paymentId} for project ${req.params.projectId}:`, err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

export default router;
