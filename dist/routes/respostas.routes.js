"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const respostas_controller_1 = require("../controllers/respostas.controller");
const user_controller_1 = require("../controllers/user.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/v1/respostas:
 *   post:
 *     summary: Cria uma nova resposta
 *     tags: [Respostas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descricao:
 *                 type: string
 *               pergunta:
 *                 type: string
 *                 description: ID da pergunta associada
 *     responses:
 *       201:
 *         description: Resposta criada com sucesso
 *       400:
 *         description: Campos obrigatórios não fornecidos
 *       500:
 *         description: Erro ao criar a resposta
 */
router.post("/respostas", user_controller_1.authenticateToken, respostas_controller_1.criarResposta);
/**
 * @swagger
 * /api/v1/respostas/{id}:
 *   put:
 *     summary: Atualiza uma resposta existente
 *     tags: [Respostas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da resposta a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descricao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resposta atualizada com sucesso
 *       400:
 *         description: Descrição não fornecida
 *       404:
 *         description: Resposta não encontrada
 *       500:
 *         description: Erro ao atualizar a resposta
 */
router.put("/respostas/:id", user_controller_1.authenticateToken, respostas_controller_1.atualizarResposta);
/**
 * @swagger
 * /api/v1/respostas/{id}:
 *   delete:
 *     summary: Deleta uma resposta existente
 *     tags: [Respostas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da resposta a ser deletada
 *     responses:
 *       200:
 *         description: Resposta deletada com sucesso
 *       404:
 *         description: Resposta não encontrada
 *       500:
 *         description: Erro ao deletar a resposta
 */
router.delete("/respostas/:id", user_controller_1.authenticateToken, respostas_controller_1.deletarResposta);
/**
 * @swagger
 * /api/v1/perguntas/{perguntaId}/respostas:
 *   get:
 *     summary: Lista todas as respostas de uma pergunta
 *     tags: [Respostas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: perguntaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da pergunta cujas respostas serão listadas
 *     responses:
 *       200:
 *         description: Lista de respostas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   descricao:
 *                     type: string
 *                   autor:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       email:
 *                         type: string
 *                   pergunta:
 *                     type: string
 *       404:
 *         description: Nenhuma resposta encontrada para a pergunta
 *       500:
 *         description: Erro ao listar as respostas
 */
router.get("/perguntas/:perguntaId/respostas", respostas_controller_1.listarRespostasPorPergunta);
exports.default = router;
