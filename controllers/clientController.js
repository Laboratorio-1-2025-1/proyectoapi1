import { validate } from "email-validator";
import Client from '../models/Client.js';

// GET /api/client - Obtener todos los clientes
const getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los clientes', error: error.message });
  }
};

// GET /api/client/:id - Obtener un cliente por su ID
const getClientById = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el cliente', error: error.message });
  }
};

// POST /api/client - Crear un nuevo cliente
const createClient = async (req, res) => {
  try {
    const { name, lastname, email, phone } = req.body;
    if (!name || !lastname || !phone || !email) {
      return res.status(400).json({ message: "Todos los datos son requeridos" });
    }

    // Validar formato de email
    if (!validate(email)) {
      return res.status(400).json({ message: "El email no es válido" });
    }

    const client = await Client.create({
      name,
      lastname,
      email,
      phone
    });

    res.status(201).json(client);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "El email ya está registrado" });
    }
    res.status(500).json({ message: 'Error al crear el cliente', error: error.message });
  }
};

// PUT /api/client/:id - Actualizar un Cliente existente
const updateClient = async (req, res) => {
  try {
    const { name, lastname, email, phone } = req.body;
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Validar formato de email si se envía uno nuevo
    if (email && !validate(email)) {
      return res.status(400).json({ message: "El email no es válido" });
    }

    await client.update({
      name: name || client.name,
      lastname: lastname || client.lastname,
      email: email || client.email,
      phone: phone || client.phone
    });

    res.json(client);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "El email ya está registrado" });
    }
    res.status(500).json({ message: 'Error al actualizar el cliente', error: error.message });
  }
};

// DELETE /api/client/:id - Eliminar un Cliente
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    await client.destroy();
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el cliente', error: error.message });
  }
};

export {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};
