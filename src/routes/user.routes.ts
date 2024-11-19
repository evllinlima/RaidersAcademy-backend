import express from 'express';
import { 
  registerUser, 
  loginUser, 
  updateUser, 
  deleteUser, 
  getUser, 
  getPublicProfile, 
  authenticateToken 
} from '../controllers/user.controller';

const router = express.Router();

/**
 * @swagger
 * /api/v1/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               cpf:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [aluno, professor]
 *               curso:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Email já cadastrado
 *       500:
 *         description: Erro ao registrar o usuário
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: Faz login do usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso, retorna o token
 *       400:
 *         description: Email ou senha incorretos
 *       500:
 *         description: Erro ao fazer login
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   put:
 *     summary: Atualiza as informações de um usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       403:
 *         description: Permissão negada
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao atualizar o usuário
 */
router.put("/user/:id", authenticateToken, updateUser);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   delete:
 *     summary: Deleta um usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *       403:
 *         description: Permissão negada
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao deletar o usuário
 */
router.delete("/user/:id", authenticateToken, deleteUser);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   get:
 *     summary: Retorna as informações de um usuário autenticado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Retorna o perfil do usuário
 *       403:
 *         description: Permissão negada
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao carregar o perfil
 */
router.get("/user/:id", authenticateToken, getUser);

/**
 * @swagger
 * /api/v1/user/public/{id}:
 *   get:
 *     summary: Retorna o perfil público de um usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Retorna o perfil público do usuário
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao carregar o perfil público
 */
router.get("/user/public/:id", getPublicProfile);

export default router;
