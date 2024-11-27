"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const respostas_models_1 = require("../models/respostas.models");
const perguntas_models_1 = require("../models/perguntas.models");
const user_model_1 = require("../models/user.model");
beforeAll(async () => {
    await mongoose_1.default.connect("mongodb://localhost:27017/testRespostas");
});
afterAll(async () => {
    await mongoose_1.default.connection.dropDatabase();
    await mongoose_1.default.connection.close();
});
let mockToken;
let perguntaId;
let adminToken;
beforeEach(async () => {
    // Limpa as coleções antes de cada teste
    await user_model_1.Usuario.deleteMany({});
    await perguntas_models_1.Pergunta.deleteMany({});
    await respostas_models_1.Resposta.deleteMany({});
    // Cria um usuário para os testes
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
    // Cria um admin
    const admin = new user_model_1.Usuario({
        nome: "Admin Teste",
        email: "admin@teste.com",
        senha: hashedPassword,
        cpf: "12345678905",
        tipo: "administrador",
        isAdmin: true,
    });
    await admin.save();
    // Faz login e obtém o token
    const loginResponse = await (0, supertest_1.default)(index_1.default)
        .post("/api/v1/login")
        .send({ email: "aluno@teste.com", senha: "senha123" });
    mockToken = loginResponse.body.token;
    // Login do admin
    const adminLoginResponse = await (0, supertest_1.default)(index_1.default)
        .post("/api/v1/admin/login")
        .send({ email: "admin@teste.com", senha: "senha123" });
    adminToken = adminLoginResponse.body.token;
    // Cria uma pergunta para os testes
    const pergunta = new perguntas_models_1.Pergunta({
        titulo: "Pergunta Teste",
        descricao: "Descrição da pergunta teste",
        autor: usuario._id,
        disciplina: new mongoose_1.default.Types.ObjectId(),
    });
    const perguntaSalva = await pergunta.save();
    perguntaId = perguntaSalva._id;
});
describe("Rotas de Respostas", () => {
    describe("POST /api/v1/respostas", () => {
        it("Deve criar uma nova resposta com sucesso", async () => {
            const novaResposta = {
                descricao: "Esta é uma resposta de teste",
                pergunta: perguntaId,
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .post("/api/v1/respostas")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(novaResposta);
            expect(response.status).toBe(201);
            expect(response.body.descricao).toBe(novaResposta.descricao);
            expect(response.body.pergunta).toBe(perguntaId.toString());
        });
        it("Deve retornar erro 400 se dados obrigatórios não forem fornecidos", async () => {
            const respostaIncompleta = {
                descricao: "Esta é uma resposta de teste",
                // Pergunta faltando
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .post("/api/v1/respostas")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(respostaIncompleta);
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Descrição e pergunta são obrigatórios");
        });
        it("Deve retornar erro 401 se não houver token de autenticação", async () => {
            const novaResposta = {
                descricao: "Esta é uma resposta de teste",
                pergunta: perguntaId,
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .post("/api/v1/respostas")
                .send(novaResposta);
            expect(response.status).toBe(401);
        });
    });
    describe("PUT /api/v1/respostas/:id", () => {
        it("Deve atualizar uma resposta com sucesso", async () => {
            // Primeiro cria uma resposta
            const novaResposta = new respostas_models_1.Resposta({
                descricao: "Resposta original",
                pergunta: perguntaId,
                autor: new mongoose_1.default.Types.ObjectId(),
            });
            const respostaSalva = await novaResposta.save();
            // Depois atualiza
            const atualizacao = {
                descricao: "Resposta atualizada",
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/respostas/${respostaSalva._id}`)
                .set("Authorization", `Bearer ${mockToken}`)
                .send(atualizacao);
            expect(response.status).toBe(200);
            expect(response.body.descricao).toBe(atualizacao.descricao);
        });
        it("Deve retornar erro 404 se a resposta não for encontrada", async () => {
            const idInexistente = new mongoose_1.default.Types.ObjectId();
            const atualizacao = {
                descricao: "Tentativa de atualização",
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/respostas/${idInexistente}`)
                .set("Authorization", `Bearer ${mockToken}`)
                .send(atualizacao);
            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Resposta não encontrada");
        });
        it("Deve retornar erro 400 se a descrição não for fornecida", async () => {
            const respostaSalva = await new respostas_models_1.Resposta({
                descricao: "Resposta original",
                pergunta: perguntaId,
                autor: new mongoose_1.default.Types.ObjectId(),
            }).save();
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/respostas/${respostaSalva._id}`)
                .set("Authorization", `Bearer ${mockToken}`)
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Descrição é obrigatória para atualização");
        });
    });
    describe("DELETE /api/v1/respostas/:id", () => {
        it("Deve deletar uma resposta com sucesso", async () => {
            const novaResposta = await new respostas_models_1.Resposta({
                descricao: "Resposta para deletar",
                pergunta: perguntaId,
                autor: new mongoose_1.default.Types.ObjectId(),
            }).save();
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/respostas/${novaResposta._id}`)
                .set("Authorization", `Bearer ${mockToken}`);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Resposta deletada com sucesso");
        });
        it("Deve retornar erro 404 se a resposta não for encontrada para deletar", async () => {
            const idInexistente = new mongoose_1.default.Types.ObjectId();
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/respostas/${idInexistente}`)
                .set("Authorization", `Bearer ${mockToken}`);
            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Resposta não encontrada");
        });
    });
    describe("GET /api/v1/perguntas/:perguntaId/respostas", () => {
        it("Deve listar todas as respostas de uma pergunta", async () => {
            // Cria algumas respostas para a pergunta
            await respostas_models_1.Resposta.create([
                {
                    descricao: "Primeira resposta",
                    pergunta: perguntaId,
                    autor: new mongoose_1.default.Types.ObjectId(),
                },
                {
                    descricao: "Segunda resposta",
                    pergunta: perguntaId,
                    autor: new mongoose_1.default.Types.ObjectId(),
                },
            ]);
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/perguntas/${perguntaId}/respostas`)
                .set("Authorization", `Bearer ${mockToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
        });
        it("Deve retornar array vazio se não houver respostas", async () => {
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/perguntas/${perguntaId}/respostas`)
                .set("Authorization", `Bearer ${mockToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });
        it("Deve retornar erro 500 se houver erro ao listar respostas", async () => {
            jest.spyOn(respostas_models_1.Resposta, "find").mockImplementationOnce(() => {
                throw new Error("Erro ao buscar respostas");
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .get(`/api/v1/perguntas/${perguntaId}/respostas`)
                .set("Authorization", `Bearer ${mockToken}`);
            expect(response.status).toBe(500);
            expect(response.body.message).toContain("Erro ao listar respostas");
        });
    });
});
