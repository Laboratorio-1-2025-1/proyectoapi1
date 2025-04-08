import express from "express";
import { createClient, deleteClient, getAllClients, getClientById, updateClient } from "../controllers/clientController.js";
const router = express.Router();


router.get('/', getAllClients);

router.get('/:id', getClientById );

router.post('/', createClient );

router.put('/:id', updateClient );

router.delete('/:id', deleteClient );

export default router;  
