import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Client from './Client.js';
import { Order } from './Order.js';

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tax: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
});

Invoice.belongsTo(Client, { foreignKey: 'clientId' });
Invoice.belongsTo(Order, { foreignKey: 'orderId' });
Client.hasMany(Invoice, { foreignKey: 'clientId' });
Order.hasOne(Invoice, { foreignKey: 'orderId' });

export default Invoice;
