import express from "express";
import { 
  criarPergunta, 
  atualizarPergunta, 
  deletarPergunta, 
  listarPerguntasPorDisciplina, 
  buscarPerguntaPorId
} from "../controllers/perguntas.controller";
import { authenticateToken } from "../controllers/user.controller";

const router = express.Router();

/**
 * @swagger
 * /api/v1/perguntas:
 *   post:
 *     summary: Cria uma nova pergunta
 *     tags: [Perguntas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               disciplina:
 *                 type: string
 *                 description: ID da disciplina associada
 *     responses:
 *       201:
 *         description: Pergunta criada com sucesso
 *       400:
 *         description: Campos obrigatórios não fornecidos
 *       500:
 *         description: Erro ao criar a pergunta
 */
router.post("/perguntas", authenticateToken, criarPergunta);

/**
 * @swagger
 * /api/v1/perguntas/{id}:
 *   put:
 *     summary: Atualiza uma pergunta existente
 *     tags: [Perguntas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da pergunta a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               disciplina:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pergunta atualizada com sucesso
 *       404:
 *         description: Pergunta não encontrada
 *       500:
 *         description: Erro ao atualizar a pergunta
 */
router.put("/perguntas/:id", authenticateToken, atualizarPergunta);

/**
 * @swagger
 * /api/v1/perguntas/{id}:
 *   delete:
 *     summary: Deleta uma pergunta existente
 *     tags: [Perguntas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da pergunta a ser deletada
 *     responses:
 *       200:
 *         description: Pergunta deletada com sucesso
 *       404:
 *         description: Pergunta não encontrada
 *       500:
 *         description: Erro ao deletar a pergunta
 */
router.delete("/perguntas/:id", authenticateToken, deletarPergunta);

/**
 * @swagger
 * /api/v1/perguntas/{disciplinaId}:
 *   get:
 *     summary: Lista perguntas por disciplina
 *     tags: [Perguntas]
 *     parameters:
 *       - in: path
 *         name: disciplinaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da disciplina cujas perguntas serão listadas
 *     responses:
 *       200:
 *         description: Lista de perguntas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   titulo:
 *                     type: string
 *                   descricao:
 *                     type: string
 *                   disciplina:
 *                     type: string
 *                   autor:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       email:
 *                         type: string
 *       404:
 *         description: Nenhuma pergunta encontrada para a disciplina
 *       500:
 *         description: Erro ao listar perguntas
 */
router.get("/perguntas/:disciplinaId", listarPerguntasPorDisciplina);

router.get('/perguntas/:id', buscarPerguntaPorId);

export default router;
