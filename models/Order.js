import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Client from './Client.js';
import Product from './Product.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'pending'
  }
});

// Tabla de relación para los productos de la orden
const OrderProduct = sequelize.define('OrderProduct', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
});

// Definir las relaciones
Order.belongsTo(Client, { foreignKey: 'clientId' });
Client.hasMany(Order, { foreignKey: 'clientId' });

Order.belongsToMany(Product, { through: OrderProduct });
Product.belongsToMany(Order, { through: OrderProduct });

export { Order, OrderProduct }; 