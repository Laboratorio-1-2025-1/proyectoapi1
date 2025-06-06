import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestión de Órdenes',
      version: '1.0.0',
      description: 'API para gestionar clientes, productos y órdenes',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      schemas: {
        Client: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID del cliente',
            },
            name: {
              type: 'string',
              description: 'Nombre del cliente',
            },
            lastname: {
              type: 'string',
              description: 'Apellido del cliente',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del cliente',
            },
            phone: {
              type: 'string',
              description: 'Teléfono del cliente',
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID del producto',
            },
            name: {
              type: 'string',
              description: 'Nombre del producto',
            },
            description: {
              type: 'string',
              description: 'Descripción del producto',
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Precio del producto',
            },
            stock: {
              type: 'integer',
              description: 'Cantidad en stock',
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID de la orden',
            },
            clientId: {
              type: 'integer',
              description: 'ID del cliente',
            },
            total: {
              type: 'number',
              format: 'float',
              description: 'Total de la orden',
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'cancelled'],
              description: 'Estado de la orden',
            },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: {
                    type: 'integer',
                    description: 'ID del producto',
                  },
                  quantity: {
                    type: 'integer',
                    description: 'Cantidad del producto',
                  },
                },
              },
            },
          },
        },
        Invoice: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID de la factura' },
            number: { type: 'string', description: 'Número de factura' },
            date: { type: 'string', format: 'date-time', description: 'Fecha de emisión' },
            clientId: { type: 'integer', description: 'ID del cliente' },
            orderId: { type: 'integer', description: 'ID de la orden' },
            subtotal: { type: 'number', format: 'float', description: 'Subtotal de la factura' },
            tax: { type: 'number', format: 'float', description: 'Impuesto aplicado' },
            total: { type: 'number', format: 'float', description: 'Total de la factura' }
          }
        },
        EmailLog: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID del log' },
            to: { type: 'string', description: 'Correo destinatario' },
            subject: { type: 'string', description: 'Asunto del correo' },
            status: { type: 'string', description: 'Estado del envío (success/error)' },
            error: { type: 'string', description: 'Mensaje de error si lo hubo' },
            attempts: { type: 'integer', description: 'Cantidad de intentos de envío' },
            createdAt: { type: 'string', format: 'date-time', description: 'Fecha de creación del log' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Fecha de actualización del log' }
          }
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Rutas donde buscar la documentación
};

export const specs = swaggerJsdoc(options);