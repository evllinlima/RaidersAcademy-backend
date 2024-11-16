import express from 'express';
import { registerUser, loginUser, updateUser, deleteUser, getUser, getPublicProfile } from '../controllers/user.controller';
import { authenticateToken } from '../controllers/user.controller';

const router = express.Router();

// Rotas de registro/login
router.post("/register", registerUser);
router.post("/login", loginUser);

// Rotas protegidas. Utilizando o JWT para autenticação
router.put("/user/:id", authenticateToken, updateUser);
router.delete("/user/:id", authenticateToken, deleteUser);
router.get("/user/:id", authenticateToken, getUser);

// Rota públicas
router.get("/user/public/:id", getPublicProfile);

export default router;
