import 'dotenv/config';
import express from "express";
import clientRoutes from "./routes/clientRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import sequelize from "./config/database.js";
import Client from "./models/Client.js";
import Product from "./models/Product.js";
import { Order, OrderProduct } from "./models/Order.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON en las peticiones
app.use(express.json());

// Rutas de la API
app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/orders', orderRoutes);

// Inicializar la base de datos
const initDatabase = async () => {
  try {
    await sequelize.sync();
    console.log('Base de datos sincronizada');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  }
};

// Inicio del servidor
app.listen(PORT, async () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    await initDatabase();
});