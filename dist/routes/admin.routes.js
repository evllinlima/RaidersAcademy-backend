"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("../controllers/admin.controller");
const autenticarAdmin_1 = require("../helpers/autenticarAdmin");
const campus_controller_1 = require("../controllers/campus.controller");
const curso_controller_1 = require("../controllers/curso.controller");
const disciplinas_controller_1 = require("../controllers/disciplinas.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * /admin/register:
 *   post:
 *     summary: Registra um novo administrador
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *               - cpf
 *             properties:
 *               nome:
 *                 type: string
 *                 description: O nome completo do administrador.
 *               email:
 *                 type: string
 *                 description: O email do administrador.
 *               senha:
 *                 type: string
 *                 description: A senha do administrador.
 *               cpf:
 *                 type: string
 *                 description: O CPF do administrador.
 *     responses:
 *       201:
 *         description: Administrador registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Administrador registrado com sucesso!"
 *                 id:
 *                   type: string
 *                   example: "60d9f7b4b5f1e8c4d2d8e9d9"
 *       400:
 *         description: Email ou CPF já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email ou CPF já cadastrado."
 *       403:
 *         description: Apenas administradores podem registrar novos administradores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Apenas administradores podem registrar novos administradores."
 *       500:
 *         description: Erro ao registrar o administrador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao registrar administrador: erro desconhecido."
 */
router.post("/admin/register", admin_controller_1.registerAdmin);
/**
 * @swagger
 * /campus:
 *   post:
 *     summary: Cria um novo campus
 *     tags: [Campus]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - localizacao
 *             properties:
 *               nome:
 *                 type: string
 *                 description: O nome do campus.
 *               localizacao:
 *                 type: string
 *                 description: A localização do campus.
 *     responses:
 *       201:
 *         description: Campus criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: O ID do campus criado.
 *                   example: "60d9f7b4b5f1e8c4d2d8e9d9"
 *                 nome:
 *                   type: string
 *                   example: "Campus Central"
 *                 localizacao:
 *                   type: string
 *                   example: "Rua das Flores, 100"
 *       500:
 *         description: Erro ao criar campus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao criar campus: erro desconhecido."
 */
router.post("/campus", autenticarAdmin_1.autenticarAdmin, campus_controller_1.criarCampus);
/**
 * @swagger
 * /campus/{id}:
 *   put:
 *     summary: Atualiza as informações de um campus existente
 *     tags: [Campus]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: O ID do campus a ser atualizado.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: O nome do campus.
 *               localizacao:
 *                 type: string
 *                 description: A localização do campus.
 *     responses:
 *       200:
 *         description: Campus atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60d9f7b4b5f1e8c4d2d8e9d9"
 *                 nome:
 *                   type: string
 *                   example: "Campus Atualizado"
 *                 localizacao:
 *                   type: string
 *                   example: "Rua Nova, 200"
 *       404:
 *         description: Campus não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Campus não encontrado"
 *       500:
 *         description: Erro ao atualizar campus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao atualizar campus: erro desconhecido."
 */
router.put("/campus/:id", autenticarAdmin_1.autenticarAdmin, campus_controller_1.atualizarCampus);
/**
 * @swagger
 * /campus/{id}:
 *   delete:
 *     summary: Deleta um campus existente
 *     tags: [Campus]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: O ID do campus a ser deletado.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campus deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Campus deletado com sucesso!"
 *       404:
 *         description: Campus não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Campus não encontrado"
 *       500:
 *         description: Erro ao deletar campus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao deletar campus: erro desconhecido."
 */
router.delete("/campus/:id", autenticarAdmin_1.autenticarAdmin, campus_controller_1.deletarCampus);
/**
 * @swagger
 * /curso:
 *   post:
 *     summary: Cria um novo curso
 *     tags: [Curso]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - campus
 *             properties:
 *               nome:
 *                 type: string
 *                 description: O nome do curso.
 *               campus:
 *                 type: string
 *                 description: O ID do campus onde o curso será oferecido.
 *     responses:
 *       201:
 *         description: Curso criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: O ID do curso criado.
 *                   example: "60d9f7b4b5f1e8c4d2d8e9d9"
 *                 nome:
 *                   type: string
 *                   example: "Curso de Engenharia"
 *                 campus:
 *                   type: string
 *                   example: "60d9f7b4b5f1e8c4d2d8e9d8"
 *       500:
 *         description: Erro ao criar curso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao criar curso: erro desconhecido."
 */
router.post("/curso", autenticarAdmin_1.autenticarAdmin, curso_controller_1.criarCurso);
/**
 * @swagger
 * /curso/{id}:
 *   put:
 *     summary: Atualiza as informações de um curso existente
 *     tags: [Curso]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: O ID do curso a ser atualizado.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: O nome do curso.
 *               campus:
 *                 type: string
 *                 description: O ID do campus onde o curso será oferecido.
 *     responses:
 *       200:
 *         description: Curso atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60d9f7b4b5f1e8c4d2d8e9d9"
 *                 nome:
 *                   type: string
 *                   example: "Curso de Engenharia Atualizado"
 *                 campus:
 *                   type: string
 *                   example: "60d9f7b4b5f1e8c4d2d8e9d8"
 *       404:
 *         description: Curso não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Curso não encontrado"
 *       500:
 *         description: Erro ao atualizar curso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao atualizar curso: erro desconhecido."
 */
router.put("/curso/:id", autenticarAdmin_1.autenticarAdmin, curso_controller_1.atualizarCurso);
/**
 * @swagger
 * /curso/{id}:
 *   delete:
 *     summary: Deleta um curso existente
 *     tags: [Curso]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: O ID do curso a ser deletado.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Curso deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Curso deletado com sucesso"
 *       404:
 *         description: Curso não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Curso não encontrado"
 *       500:
 *         description: Erro ao deletar curso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao deletar curso: erro desconhecido."
 */
router.delete("/curso/:id", autenticarAdmin_1.autenticarAdmin, curso_controller_1.deletarCurso);
/**
 * @swagger
 * /disciplina:
 *   post:
 *     summary: Cria uma nova disciplina
 *     tags: [Disciplina]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - curso
 *             properties:
 *               nome:
 *                 type: string
 *                 description: O nome da disciplina.
 *               curso:
 *                 type: string
 *                 description: O ID do curso relacionado à disciplina.
 *     responses:
 *       201:
 *         description: Disciplina criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: O ID da disciplina criada.
 *                   example: "60d9f7b4b5f1e8c4d2d8e9d9"
 *                 nome:
 *                   type: string
 *                   example: "Matemática"
 *                 curso:
 *                   type: string
 *                   example: "60d9f7b4b5f1e8c4d2d8e9d8"
 *       400:
 *         description: Nome e curso são obrigatórios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Nome e curso são obrigatórios"
 *       500:
 *         description: Erro ao criar disciplina
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao criar disciplina: erro desconhecido."
 */
router.post("/disciplina", autenticarAdmin_1.autenticarAdmin, disciplinas_controller_1.criarDisciplina);
/**
 * @swagger
 * /disciplina/{id}:
 *   put:
 *     summary: Atualiza as informações de uma disciplina existente
 *     tags: [Disciplina]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: O ID da disciplina a ser atualizada.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: O nome da disciplina.
 *               curso:
 *                 type: string
 *                 description: O ID do curso relacionado à disciplina.
 *     responses:
 *       200:
 *         description: Disciplina atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60d9f7b4b5f1e8c4d2d8e9d9"
 *                 nome:
 *                   type: string
 *                   example: "Matemática Avançada"
 *                 curso:
 *                   type: string
 *                   example: "60d9f7b4b5f1e8c4d2d8e9d8"
 *       400:
 *         description: Nome ou curso devem ser fornecidos para atualização
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Nome ou curso devem ser fornecidos para atualização"
 *       404:
 *         description: Disciplina não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Disciplina não encontrada"
 *       500:
 *         description: Erro ao atualizar disciplina
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao atualizar disciplina: erro desconhecido."
 */
router.put("/disciplina:id", autenticarAdmin_1.autenticarAdmin, disciplinas_controller_1.atualizarDisciplina);
/**
 * @swagger
 * /disciplina/{id}:
 *   delete:
 *     summary: Deleta uma disciplina existente
 *     tags: [Disciplina]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: O ID da disciplina a ser deletada.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Disciplina deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Disciplina deletada com sucesso"
 *       404:
 *         description: Disciplina não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Disciplina não encontrada"
 *       500:
 *         description: Erro ao deletar disciplina
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao deletar disciplina: erro desconhecido."
 */
router.delete("/disciplina/:id", autenticarAdmin_1.autenticarAdmin, disciplinas_controller_1.deletarDisciplina);
/**
 * @swagger
 * /campus:
 *   get:
 *     summary: Lista todos os campus
 *     tags: [Campus]
 *     responses:
 *       200:
 *         description: Lista de todos os campus
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: O ID do campus.
 *                   nome:
 *                     type: string
 *                     description: O nome do campus.
 *                   localizacao:
 *                     type: string
 *                     description: A localização do campus.
 *       404:
 *         description: Nenhum campus encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Nenhum campus encontrado"
 *       500:
 *         description: Erro ao listar campus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao listar campus: erro desconhecido."
 */
router.get("/campus", campus_controller_1.listarCampus);
/**
 * @swagger
 * /curso:
 *   get:
 *     summary: Lista todos os cursos
 *     tags: [Curso]
 *     responses:
 *       200:
 *         description: Lista de todos os cursos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: O ID do curso.
 *                   nome:
 *                     type: string
 *                     description: O nome do curso.
 *                   campus:
 *                     type: string
 *                     description: O ID do campus relacionado ao curso.
 *       500:
 *         description: Erro ao listar cursos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao listar cursos: erro desconhecido."
 */
router.get("/curso", curso_controller_1.listarCursos);
/**
 * @swagger
 * /disciplina:
 *   get:
 *     summary: Lista todas as disciplinas
 *     tags: [Disciplina]
 *     responses:
 *       200:
 *         description: Lista de todas as disciplinas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: O ID da disciplina.
 *                   nome:
 *                     type: string
 *                     description: O nome da disciplina.
 *                   curso:
 *                     type: string
 *                     description: O ID do curso relacionado à disciplina.
 *       500:
 *         description: Erro ao listar disciplinas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao listar disciplinas: erro desconhecido."
 */
router.get("/disciplina", disciplinas_controller_1.listarDisciplinas);
exports.default = router;
