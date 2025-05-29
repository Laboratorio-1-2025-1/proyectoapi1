# API de Gestión de Órdenes

Este proyecto es una API RESTful construida con Node.js, Express y Sequelize para la gestión de clientes, productos y órdenes, incluyendo la **generación y almacenamiento automático de facturas** y el envío de facturas por correo electrónico utilizando SendGrid.

## Características

- CRUD de clientes, productos y órdenes.
- Relación entre órdenes, productos y clientes.
- **Facturación automática:** al crear una orden, se genera y almacena una factura en la base de datos (con numeración, subtotal, impuestos y total).
- **Envío automático de facturas por correo electrónico** al cliente tras crear la orden.
- Registro de logs de envío de correo (EmailLog).
- **Autenticación JWT con roles (admin, empleado).**
- Documentación interactiva con Swagger (disponible en `/api-docs`).

## Instalación

1. Clona el repositorio y navega al directorio del proyecto.
2. Instala las dependencias:

   ```powershell
   npm install
   ```

3. Copia el archivo `.env.example` a `.env` y configura tus credenciales de SendGrid:

   ```
   SENDGRID_API_KEY=tu_api_key
   SENDGRID_FROM_EMAIL=tu_email_verificado@dominio.com
   ```

4. Inicia el servidor:

   ```powershell
   npm start
   ```

5. Accede a la documentación Swagger en: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Estructura del Proyecto

- `controllers/` - Lógica de negocio para cada entidad.
- `models/` - Definición de modelos Sequelize.
- `routes/` - Definición de rutas de la API.
- `services/` - Servicios auxiliares (ej: envío de facturas).
- `config/` - Configuración de base de datos, SendGrid y Swagger.

## Endpoints Principales

- `/api/auth/register` - Registro de usuario (admin o empleado).
- `/api/auth/login` - Login de usuario (obtención de token JWT).
- `/api/clients` - Gestión de clientes.
- `/api/products` - Gestión de productos.
- `/api/orders` - Gestión de órdenes (al crear una orden, se genera y envía la factura automáticamente).
- `/api/invoices` - Consulta de facturas generadas.
- `/api/email-logs` - Consulta de logs de envío de correos.

Consulta la documentación Swagger para detalles de cada endpoint, ejemplos de request/response y uso de autenticación.

## Notas

- La base de datos utiliza SQLite y se almacena en `database.sqlite`.
- El envío de correos requiere una cuenta y API Key de SendGrid.
- Para acceder a los endpoints protegidos, primero realiza login y usa el token JWT en el header `Authorization: Bearer <token>`.
- No olvides agregar tu archivo `.env` al `.gitignore` para proteger tus credenciales.

---

Desarrollado para fines académicos.
