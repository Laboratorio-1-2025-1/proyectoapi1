import { Order, OrderProduct } from '../models/Order.js';
import Product from '../models/Product.js';
import Client from '../models/Client.js';
import { sendInvoice } from '../services/invoiceService.js';

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

    // Enviar la factura por email
    try {
      await sendInvoice(order.id);
    } catch (emailError) {
      console.error('Error al enviar la factura:', emailError);
    }

    res.status(201).json(completeOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la orden', error: error.message });
  }
};

// PUT /api/order/:id - Actualizar una orden existente
const updateOrder = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // Solo permitimos actualizar el estado
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