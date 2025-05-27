import Invoice from '../models/Invoice.js';
import { Order } from '../models/Order.js';
import Client from '../models/Client.js';
import { Op } from 'sequelize';

// Formato de numeración: FACT-YYYYMM-XXXX
async function generateInvoiceNumber() {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastInvoice = await Invoice.findOne({
    where: { number: { [Op.like]: `FACT-${yearMonth}-%` } },
    order: [['createdAt', 'DESC']]
  });
  let next = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.number.split('-')[2], 10);
    next = lastNumber + 1;
  }
  return `FACT-${yearMonth}-${String(next).padStart(4, '0')}`;
}

// Calcular impuestos (ejemplo: IVA 19%)
function calculateTax(subtotal) {
  const taxRate = 0.19;
  return subtotal * taxRate;
}

// Generar factura manualmente	extrae orderId del body
export const generateInvoiceManual = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findByPk(orderId, { include: [Client] });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

    const subtotal = parseFloat(order.total);
    const tax = calculateTax(subtotal);
    const total = subtotal + tax;
    const number = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      number,
      date: new Date(),
      clientId: order.clientId,
      orderId: order.id,
      subtotal,
      tax,
      total
    });
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({ include: [Client, Order] });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, { include: [Client, Order] });
    if (!invoice) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
