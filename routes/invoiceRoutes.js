import express from 'express';
import {
  generateInvoiceManual,
  getAllInvoices,
  getInvoiceById
} from '../controllers/invoiceController.js';
import { authenticateToken, authorizeRoles } from '../services/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Obtener todas las facturas
 *     tags: [Facturas]
 *     responses:
 *       200:
 *         description: Lista de facturas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 */
router.get('/', authenticateToken, authorizeRoles('admin', 'empleado'), getAllInvoices);

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Obtener una factura por ID
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Factura no encontrada
 */
router.get('/:id', authenticateToken, authorizeRoles('admin', 'empleado'), getInvoiceById);

/**
 * @swagger
 * /api/invoices/generate:
 *   post:
 *     summary: Generar una factura manualmente a partir de una orden
 *     tags: [Facturas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: ID de la orden para facturar
 *     responses:
 *       201:
 *         description: Factura generada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Orden no encontrada
 */
router.post('/generate', authenticateToken, authorizeRoles('admin', 'empleado'), generateInvoiceManual);

export default router;