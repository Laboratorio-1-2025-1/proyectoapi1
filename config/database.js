// Importar Sequelize para la conexión con la base de datos
import { Sequelize } from 'sequelize';

// Crear una nueva instancia de Sequelize con la configuración de SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',           // Especificar que usaremos SQLite como motor de base de datos
  storage: './database.sqlite', // Ruta donde se almacenará el archivo de la base de datos
  logging: false               // Desactivar los logs de Sequelize para no saturar la consola
});

// Exportar la instancia de Sequelize para poder usarla en otros archivos
export default sequelize; 