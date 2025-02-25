import { validate } from "email-validator";

// Arreglo en memoria para almacenar clientes
let clients = [];
let nextId = 1;
// GET /api/client - Obtener todos los clientes
const getAllClients = (req, res) => {
  res.json(clients);
};
// GET /api/client/:id - Obtener un cliente por su ID
const getClientById = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const client = clients.find((p) => p.id === id);
  if (!client) {
    return res.status(404).json({ message: "cliente no encontrado" });
  }
  res.json(client);
};
// POST /api/client - Crear un nuevo cliente
const createClient = (req, res) => {
  const { name, lastname, email, phone } = req.body;
  if (!name || !lastname || !phone || email == null) {
    return res.status(400).json({ message: "Todos los datos son requeridos" });
  }
  if (!validate(email)) {
    return res.status(400).json({ message: "El email no es valido" });
  }
  const newClient = {
    id: nextId++,
    name,
    lastname,
    email,
    phone
  };

  clients.push(newClient);
  res.status(201).json(newClient);
};
// PUT /api/client/:id - Actualizar un Cliente existente
const updateClient = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, lastname, email, phone } = req.body;
  const client = clients.find((p) => p.id === id);
  if (!client) {
    return res.status(404).json({ message: "cliento no encontrado" });
  }
  if (!validate(email)) {
    return res.status(400).json({ message: "El email no es valido" });
  }
  // Actualizar propiedades solo si se envían en el body
  if (name !== undefined) client.name = name;
  if (lastname !== undefined) client.lastname = lastname;
  if (email !== undefined) client.email = email;
  if (phone !== undefined) client.phone = phone;
  res.json(client);
};
// DELETE /api/client/:id - Eliminar un Cliente
const deleteClient = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = clients.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Cliente no encontrado" });
  }
  const deletedClient = clients.splice(index, 1);
  res.json({ message: "Cliente eliminado", Client: deletedClient[0] });
};

export {
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  createClient,
};
