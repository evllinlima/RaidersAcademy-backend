"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const perguntas_models_1 = require("../models/perguntas.models");
const user_model_1 = require("../models/user.model");
beforeAll(async () => {
    await mongoose_1.default.connect("mongodb://localhost:27017/testPerguntas");
});
beforeEach(async () => {
    await user_model_1.Usuario.deleteMany({});
});
afterAll(async () => {
    await mongoose_1.default.connection.dropDatabase();
    await mongoose_1.default.connection.close();
});
let mockToken;
let adminToken;
let disciplinaId;
beforeEach(async () => {
    const hashedPassword = await bcryptjs_1.default.hash("senha123", 10);
    const usuario = new user_model_1.Usuario({
        nome: "Aluno Teste",
        email: "aluno@teste.com",
        senha: hashedPassword,
        cpf: "12345678966",
        tipo: "aluno",
        curso: new mongoose_1.default.Types.ObjectId(),
    });
    await usuario.save();
    const admin = new user_model_1.Usuario({
        nome: "Admin Teste",
        email: "admin@teste.com",
        senha: hashedPassword,
        cpf: "12345678905",
        tipo: "administrador",
        isAdmin: true,
    });
    await admin.save();
    const adminLoginResponse = await (0, supertest_1.default)(index_1.default)
        .post("/api/v1/admin/login")
        .send({
        email: "admin@teste.com",
        senha: "senha123",
    });
    adminToken = adminLoginResponse.body.token;
    const loginResponse = await (0, supertest_1.default)(index_1.default)
        .post("/api/v1/login")
        .send({ email: "aluno@teste.com", senha: "senha123" });
    mockToken = loginResponse.body.token;
    // Criação de uma disciplina para os testes de Pergunta
    const disciplinaResponse = await (0, supertest_1.default)(index_1.default)
        .post("/api/v1/disciplina")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
        nome: "Algoritmo",
        curso: new mongoose_1.default.Types.ObjectId(),
    });
    disciplinaId = disciplinaResponse.body._id;
});
describe("Rotas de Perguntas", () => {
    it("Deve criar uma nova pergunta com sucesso", async () => {
        console.log(disciplinaId);
        const novaPergunta = {
            titulo: "O que é algoritmo?",
            descricao: "Descrição sobre o que é algoritmo.",
            disciplina: disciplinaId,
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/perguntas")
            .set("Authorization", `Bearer ${mockToken}`)
            .send(novaPergunta);
        expect(response.status).toBe(201);
        expect(response.body.titulo).toBe(novaPergunta.titulo);
        expect(response.body.descricao).toBe(novaPergunta.descricao);
    });
    it("Deve retornar erro 400 se os dados obrigatórios não forem fornecidos", async () => {
        const resposta = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/perguntas")
            .set("Authorization", `Bearer ${mockToken}`)
            .send({
            titulo: "Pergunta sem descrição",
            disciplina: disciplinaId,
        });
        expect(resposta.status).toBe(400);
        expect(resposta.body.message).toBe("Título, descrição e disciplina são obrigatórios");
    });
    it("Deve listar todas as perguntas de uma disciplina com sucesso", async () => {
        const novaPergunta = {
            titulo: "O que é uma lista em JavaScript?",
            descricao: "Descrição sobre listas.",
            disciplina: disciplinaId,
        };
        await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/perguntas")
            .set("Authorization", `Bearer ${mockToken}`)
            .send(novaPergunta);
        const response = await (0, supertest_1.default)(index_1.default)
            .get(`/api/v1/perguntas/${disciplinaId}`)
            .set("Authorization", `Bearer ${mockToken}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });
    it("Deve retornar erro 500 se houver erro ao listar perguntas", async () => {
        jest.spyOn(perguntas_models_1.Pergunta, "find").mockImplementationOnce(() => {
            throw new Error("Erro no banco de dados");
        });
        const resposta = await (0, supertest_1.default)(index_1.default)
            .get(`/api/v1/perguntas/${disciplinaId}`)
            .set("Authorization", `Bearer ${mockToken}`);
        expect(resposta.status).toBe(500);
        expect(resposta.body.error).toBe("Erro ao listar perguntas");
    });
    it("Deve atualizar uma pergunta com sucesso", async () => {
        const novaPergunta = {
            titulo: "Como funciona o algoritmo de busca?",
            descricao: "Descrição sobre algoritmos de busca.",
            disciplina: disciplinaId,
        };
        const perguntaCriada = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/perguntas")
            .set("Authorization", `Bearer ${mockToken}`)
            .send(novaPergunta);
        const perguntaId = perguntaCriada.body._id;
        const atualizacao = {
            titulo: "Como funciona o algoritmo de busca binária?",
            descricao: "Descrição detalhada sobre busca binária.",
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .put(`/api/v1/perguntas/${perguntaId}`)
            .set("Authorization", `Bearer ${mockToken}`)
            .send(atualizacao);
        expect(response.status).toBe(200);
        expect(response.body.titulo).toBe(atualizacao.titulo);
        expect(response.body.descricao).toBe(atualizacao.descricao);
    });
    it("Deve retornar erro 404 se a pergunta não for encontrada para atualização", async () => {
        const resposta = await (0, supertest_1.default)(index_1.default)
            .put("/api/v1/perguntas/507f1f77bcf86cd799439011")
            .set("Authorization", `Bearer ${mockToken}`)
            .send({ titulo: "Pergunta atualizada", descricao: "Nova descrição" });
        expect(resposta.status).toBe(404);
        expect(resposta.body.message).toBe("Pergunta não encontrada");
    });
    it("Deve deletar uma pergunta com sucesso", async () => {
        const novaPergunta = {
            titulo: "O que é recursão?",
            descricao: "Descrição sobre recursão.",
            disciplina: disciplinaId,
        };
        const perguntaCriada = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/perguntas")
            .set("Authorization", `Bearer ${mockToken}`)
            .send(novaPergunta);
        const perguntaId = perguntaCriada.body._id;
        const resposta = await (0, supertest_1.default)(index_1.default)
            .delete(`/api/v1/perguntas/${perguntaId}`)
            .set("Authorization", `Bearer ${mockToken}`);
        expect(resposta.status).toBe(200);
        expect(resposta.body.message).toBe("Pergunta deletada com sucesso");
    });
    it("Deve retornar erro 404 se a pergunta não for encontrada para exclusão", async () => {
        const resposta = await (0, supertest_1.default)(index_1.default)
            .delete("/api/v1/perguntas/507f1f77bcf86cd799439011")
            .set("Authorization", `Bearer ${mockToken}`);
        expect(resposta.status).toBe(404);
        expect(resposta.body.message).toBe("Pergunta não encontrada");
    });
    it("Deve retornar erro 500 se houver erro ao deletar a pergunta", async () => {
        jest
            .spyOn(perguntas_models_1.Pergunta, "findByIdAndDelete")
            .mockRejectedValue(new Error("Erro ao deletar"));
        const resposta = await (0, supertest_1.default)(index_1.default)
            .delete("/api/v1/perguntas/1234567890")
            .set("Authorization", `Bearer ${mockToken}`);
        expect(resposta.status).toBe(500);
        expect(resposta.body.message).toBe("Erro ao deletar a pergunta: Error: Erro ao deletar");
    });
});
