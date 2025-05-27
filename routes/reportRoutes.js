import express from 'express';
import { Op } from 'sequelize';
import Invoice from '../models/Invoice.js';
import { Order, OrderProduct } from '../models/Order.js';
import Product from '../models/Product.js';
import Client from '../models/Client.js';
import { authenticateToken, authorizeRoles } from '../services/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/reports/ventas:
 *   get:
 *     summary: Reporte de ventas totales por periodo de tiempo
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Reporte de ventas totales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cantidad:
 *                   type: integer
 *                 total:
 *                   type: number
 *                 facturas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Invoice'
 */
// Reporte de ventas totales por periodo de tiempo
router.get('/ventas', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const where = {};
    if (desde && hasta) {
      where.date = { [Op.between]: [new Date(desde), new Date(hasta)] };
    }
    const facturas = await Invoice.findAll({ where });
    const total = facturas.reduce((acc, f) => acc + (f.total || 0), 0);
    res.json({ cantidad: facturas.length, total, facturas });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/reports/ventas-producto:
 *   get:
 *     summary: Reporte de ventas por producto
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Reporte de ventas por producto
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nombre:
 *                     type: string
 *                   cantidad:
 *                     type: integer
 *                   total:
 *                     type: number
 */
// Reporte de ventas por producto
router.get('/ventas-producto', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const where = {};
    if (desde && hasta) {
      where.createdAt = { [Op.between]: [new Date(desde), new Date(hasta)] };
    }
    const ordenes = await Order.findAll({ where, include: [{ model: Product, through: { attributes: ['quantity', 'price'] } }] });
    const productos = {};
    ordenes.forEach(order => {
      order.Products.forEach(prod => {
        if (!productos[prod.id]) productos[prod.id] = { nombre: prod.name, cantidad: 0, total: 0 };
        productos[prod.id].cantidad += prod.OrderProduct.quantity;
        productos[prod.id].total += parseFloat(prod.OrderProduct.price) * prod.OrderProduct.quantity;
      });
    });
    res.json(Object.values(productos));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/reports/ventas-cliente:
 *   get:
 *     summary: Reporte de ventas por cliente
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Reporte de ventas por cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   cliente:
 *                     $ref: '#/components/schemas/Client'
 *                   total:
 *                     type: number
 *                   cantidad:
 *                     type: integer
 */
// Reporte de ventas por cliente
router.get('/ventas-cliente', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const where = {};
    if (desde && hasta) {
      where.date = { [Op.between]: [new Date(desde), new Date(hasta)] };
    }
    const facturas = await Invoice.findAll({ where, include: [Client] });
    const clientes = {};
    facturas.forEach(f => {
      if (!clientes[f.clientId]) clientes[f.clientId] = { cliente: f.Client, total: 0, cantidad: 0 };
      clientes[f.clientId].total += f.total;
      clientes[f.clientId].cantidad += 1;
    });
    res.json(Object.values(clientes));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/reports/resumen:
 *   get:
 *     summary: Resumen de facturación e ingresos
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Resumen de facturación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalFacturas:
 *                   type: integer
 *                 totalIngresos:
 *                   type: number
 *                 facturasPendientes:
 *                   type: integer
 */
// Información de facturas emitidas, ingresos totales, facturas pendientes
router.get('/resumen', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const totalFacturas = await Invoice.count();
    const totalIngresos = await Invoice.sum('total');
    const facturasPendientes = await Order.count({ where: { status: 'pending' } });
    res.json({ totalFacturas, totalIngresos, facturasPendientes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
