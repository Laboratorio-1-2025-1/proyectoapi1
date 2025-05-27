import EmailLog from '../models/EmailLog.js';
import express from 'express';
import { authenticateToken, authorizeRoles } from '../services/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/email-logs:
 *   get:
 *     summary: Obtener todos los logs de envío de email
 *     tags: [EmailLogs]
 *     responses:
 *       200:
 *         description: Lista de logs de envío
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EmailLog'
 */
// Proteger endpoints de logs de email solo para usuarios autenticados y rol admin
// Obtener todos los logs de envío de email
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const logs = await EmailLog.findAll({ order: [['createdAt', 'DESC']] });
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/email-logs/{id}:
 *   get:
 *     summary: Obtener un log de envío de email por ID
 *     tags: [EmailLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del log de envío
 *     responses:
 *       200:
 *         description: Log encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmailLog'
 *       404:
 *         description: Log no encontrado
 */
// Obtener un log específico por ID
router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const log = await EmailLog.findByPk(req.params.id);
      if (!log) return res.status(404).json({ error: 'Log no encontrado' });
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
