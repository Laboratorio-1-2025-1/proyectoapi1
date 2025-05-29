import { Order, OrderProduct } from '../models/Order.js';
import Product from '../models/Product.js';
import Client from '../models/Client.js';
import Invoice from '../models/Invoice.js';
import { sendInvoice } from '../services/invoiceService.js';
import { Op } from 'sequelize';

// GET /api/order - Obtener todas las órdenes
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: Client },
        { model: Product, through: { attributes: ['quantity', 'price'] } }
      ]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las órdenes', error: error.message });
  }
};

// GET /api/order/:id - Obtener una orden por su ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Client },
        { model: Product, through: { attributes: ['quantity', 'price'] } }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la orden', error: error.message });
  }
};

// POST /api/order - Crear una nueva orden
const createOrder = async (req, res) => {
  try {
    const { clientId, products } = req.body;
    // Validación básica
    if (!clientId || !products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Datos incompletos o inválidos" });
    }

    // Verificar que el cliente existe
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Calcular el total sumando (precio * cantidad) de cada producto
    let total = 0;
    for (const item of products) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Producto con ID ${item.productId} no encontrado` });
      }
      total += parseFloat(product.price) * item.quantity;
    }

    // Crear la orden
    const order = await Order.create({
      clientId,
      total,
      status: 'pending'
    });

    // Agregar productos a la orden
    for (const item of products) {
      const product = await Product.findByPk(item.productId);
      await OrderProduct.create({
        OrderId: order.id,
        ProductId: item.productId,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Obtener la orden completa con sus relaciones
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        { model: Client },
        { model: Product, through: { attributes: ['quantity', 'price'] } }
      ]
    });

    // --- FACTURACIÓN AUTOMÁTICA ---
    // Lógica de numeración y cálculo de impuestos (copiada de invoiceController.js)
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
    function calculateTax(subtotal) {
      const taxRate = 0.19;
      return subtotal * taxRate;
    }
    // Crear la factura asociada a la orden
    const subtotal = parseFloat(order.total);
    const tax = calculateTax(subtotal);
    const totalFactura = subtotal + tax;
    const number = await generateInvoiceNumber();
    const invoice = await Invoice.create({
      number,
      date: new Date(),
      clientId: order.clientId,
      orderId: order.id,
      subtotal,
      tax,
      total: totalFactura
    });

    // Enviar la factura por email (puedes adaptar sendInvoice para recibir la factura si lo deseas)
    try {
      await sendInvoice(order.id); // El template puede mostrar el total de la factura (con impuestos)
    } catch (emailError) {
      console.error('Error al enviar la factura:', emailError);
    }

    res.status(201).json({ order: completeOrder, invoice });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la orden', error: error.message });
  }
};

// PUT /api/order/:id - Actualizar una orden existente
const updateOrder = async (req, res) => {
  try {
    const { status, products } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // Actualizar productos y cantidades si se envía el array products
    if (products && Array.isArray(products) && products.length > 0) {
      // Eliminar productos actuales
      await OrderProduct.destroy({ where: { OrderId: order.id } });
      let total = 0;
      for (const item of products) {
        const product = await Product.findByPk(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Producto con ID ${item.productId} no encontrado` });
        }
        await OrderProduct.create({
          OrderId: order.id,
          ProductId: item.productId,
          quantity: item.quantity,
          price: product.price
        });
        total += parseFloat(product.price) * item.quantity;
      }
      // Actualizar el total de la orden
      await order.update({ total });
    }

    // Actualizar el estado si se envía
    if (status) {
      await order.update({ status });
    }

    // Obtener la orden actualizada con sus relaciones
    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        { model: Client },
        { model: Product, through: { attributes: ['quantity', 'price'] } }
      ]
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la orden', error: error.message });
  }
};

// DELETE /api/order/:id - Eliminar una orden
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    await order.destroy();
    res.json({ message: "Orden eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la orden', error: error.message });
  }
};

export {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
};