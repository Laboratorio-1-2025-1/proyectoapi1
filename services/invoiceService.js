import { sendEmail } from '../config/sendgrid.js';
import { Order, OrderProduct } from '../models/Order.js';
import Client from '../models/Client.js';
import Product from '../models/Product.js';

const generateInvoiceHTML = (order, client, products) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .invoice-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 5px;
          }
          .invoice-title {
            color: #2c3e50;
            margin: 0;
          }
          .invoice-date {
            color: #7f8c8d;
            margin: 10px 0;
          }
          .client-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 30px;
          }
          .client-info h2 {
            color: #2c3e50;
            margin-top: 0;
          }
          .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .products-table th {
            background-color: #2c3e50;
            color: white;
            padding: 12px;
            text-align: left;
          }
          .products-table td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
          }
          .products-table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .total-section {
            text-align: right;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 5px;
          }
          .total-amount {
            font-size: 1.5em;
            color: #2c3e50;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #7f8c8d;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <h1 class="invoice-title">FACTURA #${order.id}</h1>
          <p class="invoice-date">Fecha: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="client-info">
          <h2>Datos del Cliente</h2>
          <p><strong>Nombre:</strong> ${client.name} ${client.lastname}</p>
          <p><strong>Email:</strong> ${client.email}</p>
          <p><strong>Teléfono:</strong> ${client.phone}</p>
        </div>

        <h2>Detalles de la Orden</h2>
        <table class="products-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(product => `
              <tr>
                <td>${product.name}</td>
                <td>${product.OrderProduct.quantity}</td>
                <td>$${product.OrderProduct.price.toFixed(2)}</td>
                <td>$${(product.OrderProduct.quantity * product.OrderProduct.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <h3>Total de la Factura</h3>
          <p class="total-amount">$${order.total.toFixed(2)}</p>
        </div>

        <div class="footer">
          <p>Gracias por su compra</p>
          <p>Este es un correo automático, por favor no responda a este mensaje</p>
        </div>
      </body>
    </html>
  `;
};

export const sendInvoice = async (orderId) => {
  try {
    // Obtener la orden con sus relaciones
    const order = await Order.findByPk(orderId, {
      include: [
        { model: Client },
        { 
          model: Product,
          through: { attributes: ['quantity', 'price'] }
        }
      ]
    });

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    // Generar el HTML de la factura
    const invoiceHTML = generateInvoiceHTML(order, order.Client, order.Products);

    // Enviar el email
    await sendEmail(
      order.Client.email,
      `Factura #${order.id} - Tu Compra`,
      invoiceHTML
    );

    return true;
  } catch (error) {
    console.error('Error al enviar la factura:', error);
    throw error;
  }
}; 