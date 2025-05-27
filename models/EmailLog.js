import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EmailLog = sequelize.define('EmailLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  to: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
});

export default EmailLog;
