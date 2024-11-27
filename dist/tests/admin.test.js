"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("../models/user.model");
const autenticarAdmin_1 = require("../helpers/autenticarAdmin");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const campus_models_1 = require("../models/campus.models");
const curso_models_1 = require("../models/curso.models");
const disciplina_models_1 = require("../models/disciplina.models");
let mockToken;
let adminId;
beforeAll(async () => {
    await mongoose_1.default.connect("mongodb://localhost:27017/testAdmin");
});
beforeEach(async () => {
    await user_model_1.Usuario.deleteMany({});
});
afterAll(async () => {
    await mongoose_1.default.connection.dropDatabase();
    await mongoose_1.default.connection.close();
});
describe("POST api/v1/admin/firstRegister", () => {
    it("deve retornar 500 se ocorrer um erro interno", async () => {
        jest.spyOn(user_model_1.Usuario.prototype, "save").mockImplementationOnce(() => {
            throw new Error("Erro de teste");
        });
        const firstAdmin = {
            nome: "Admin Teste",
            email: "adminErroInterno@teste.com",
            senha: "senha123",
            cpf: "12345678905",
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/admin/firstRegister")
            .send(firstAdmin);
        expect(response.status).toBe(500);
        expect(response.body.message).toContain("Erro ao registrar administrador:");
    });
    it("deve criar o primeiro administrador", async () => {
        const firstAdmin = {
            nome: "Admin Teste",
            email: "admin@teste.com",
            senha: "senha123",
            cpf: "12345678905",
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/admin/firstRegister")
            .send(firstAdmin);
        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Administrador registrado com sucesso!");
        adminId = response.body.id;
    });
});
describe("POST api/v1/admin/login", () => {
    beforeEach(async () => {
        // Criar um admin para os testes de login
        const hashedPassword = await bcryptjs_1.default.hash("senha123", 10);
        const admin = new user_model_1.Usuario({
            nome: "Admin Teste",
            email: "admin@teste.com",
            senha: hashedPassword,
            cpf: "12345678905",
            tipo: "administrador",
            isAdmin: true,
        });
        await admin.save();
    });
    it("deve fazer login de um administrador com sucesso", async () => {
        const loginPayload = {
            email: "admin@teste.com",
            senha: "senha123",
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/admin/login")
            .send(loginPayload);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Login bem-sucedido");
        expect(response.body.token).toBeDefined();
        mockToken = response.body.token;
    });
    it("não deve fazer login com credenciais inválidas", async () => {
        const loginPayload = {
            email: "admin@teste.com",
            senha: "senhaErrada",
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/admin/login")
            .send(loginPayload);
        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Credenciais inválidas.");
    });
    it("não deve fazer login se usuário não for um administrador", async () => {
        const hashedPassword = await bcryptjs_1.default.hash("senha123", 10);
        const usuario = new user_model_1.Usuario({
            nome: "Usuario Comum",
            email: "usuario@teste.com",
            senha: hashedPassword,
            cpf: "12345678908",
            tipo: "aluno",
            curso: new mongoose_1.default.Types.ObjectId(),
            isAdmin: false,
        });
        await usuario.save();
        const adminPayload = {
            email: "usuario@teste.com",
            senha: "senha123",
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/admin/login")
            .send(adminPayload);
        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Credenciais inválidas ou usuário não é administrador.");
    });
    it("deve retornar erro 500 se ocorrer um erro interno no login", async () => {
        jest.spyOn(user_model_1.Usuario, "findOne").mockImplementationOnce(() => {
            throw new Error("Erro de banco de dados simulado");
        });
        const loginPayload = {
            email: "admin@teste.com",
            senha: "senha123",
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/admin/login")
            .send(loginPayload);
        expect(response.status).toBe(500);
        expect(response.body.message).toContain("Erro ao fazer login");
    });
});
describe("POST api/v1/admin/register", () => {
    beforeEach(async () => {
        const hashedPassword = await bcryptjs_1.default.hash("senha123", 10);
        const admin = new user_model_1.Usuario({
            nome: "Admin Teste",
            email: "admin@teste.com",
            senha: hashedPassword,
            cpf: "12345678905",
            tipo: "administrador",
            isAdmin: true,
        });
        await admin.save();
        const loginResponse = await (0, supertest_1.default)(index_1.default).post("/api/v1/admin/login").send({
            email: "admin@teste.com",
            senha: "senha123",
        });
        mockToken = loginResponse.body.token;
    });
    it("deve registrar um novo administrador com sucesso", async () => {
        const adminPayload = {
            nome: "Admin Novo",
            email: "adminNovo@teste.com",
            senha: "senha123",
            cpf: "12345678906",
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/admin/register")
            .set("Authorization", `Bearer ${mockToken}`)
            .send(adminPayload);
        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Administrador registrado com sucesso!");
    });
    it("deve retornar 403 se um administrador já existir e a requisição não for autenticada", async () => {
        const novoAdmin = {
            nome: "Admin Não Autenticado",
            email: "naoAutenticado@teste.com",
            senha: "senha123",
            cpf: "98765432109",
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/admin/firstRegister")
            .send(novoAdmin)
            .set("Accept", "application/json");
        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Apenas administradores podem registrar novos administradores.");
    });
    it("não deve registrar um administrador se o email já existir", async () => {
        const adminDuplicado = {
            nome: "Email Duplicado",
            email: "admin@teste.com",
            senha: "senha123",
            cpf: "98765432107",
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/admin/register")
            .set("Authorization", `Bearer ${mockToken}`)
            .send(adminDuplicado);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Email ou CPF já cadastrado.");
    });
    it("não deve registrar um administrador se o CPF já existir", async () => {
        const adminCpfDuplicado = {
            nome: "CPF Duplicado",
            email: "novo@teste.com",
            senha: "senha123",
            cpf: "12345678905",
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/admin/register")
            .set("Authorization", `Bearer ${mockToken}`)
            .send(adminCpfDuplicado);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Email ou CPF já cadastrado.");
    });
});
describe("Middleware autenticarAdmin", () => {
    beforeEach(async () => {
        // Criar um admin e um usuário comum para os testes
        const hashedPassword = await bcryptjs_1.default.hash("senha123", 10);
        const admin = new user_model_1.Usuario({
            nome: "Admin Teste",
            email: "admin@teste.com",
            senha: hashedPassword,
            cpf: "12345678905",
            tipo: "administrador",
            isAdmin: true,
        });
        await admin.save();
        const usuario = new user_model_1.Usuario({
            nome: "Usuario Comum",
            email: "usuario@teste.com",
            senha: hashedPassword,
            cpf: "12345678908",
            tipo: "aluno",
            curso: new mongoose_1.default.Types.ObjectId(),
            isAdmin: false,
        });
        await usuario.save();
    });
    it("deve permitir acesso a um administrador autenticado", async () => {
        const loginResponse = await (0, supertest_1.default)(index_1.default).post("/api/v1/admin/login").send({
            email: "admin@teste.com",
            senha: "senha123",
        });
        const token = loginResponse.body.token;
        expect(token).toBeDefined();
        const req = {
            headers: {
                authorization: `Bearer ${token}`,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();
        await (0, autenticarAdmin_1.autenticarAdmin)(req, res, next);
        expect(next).toHaveBeenCalled();
    });
    it("não deve permitir acesso se o token for inválido", async () => {
        const req = {
            headers: {
                authorization: "Bearer TOKEN_INVALIDO",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();
        await (0, autenticarAdmin_1.autenticarAdmin)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Token inválido" });
    });
    it("não deve permitir acesso sem token", async () => {
        const req = {
            headers: {},
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();
        await (0, autenticarAdmin_1.autenticarAdmin)(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });
});
describe("Rotas do Campus", () => {
    beforeEach(async () => {
        await campus_models_1.Campus.deleteMany({});
        const hashedPassword = await bcryptjs_1.default.hash("senha123", 10);
        const admin = new user_model_1.Usuario({
            nome: "Admin Teste",
            email: "admin@teste.com",
            senha: hashedPassword,
            cpf: "12345678905",
            tipo: "administrador",
            isAdmin: true,
        });
        await admin.save();
        const loginResponse = await (0, supertest_1.default)(index_1.default).post("/api/v1/admin/login").send({
            email: "admin@teste.com",
            senha: "senha123",
        });
        mockToken = loginResponse.body.token;
    });
    describe("POST /api/v1/campus", () => {
        it("deve criar um novo campus quando autenticado como admin", async () => {
            const novoCampus = {
                nome: "Campus Centro",
                localizacao: "Rua Principal, 123",
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .post("/api/v1/campus")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(novoCampus);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("_id");
            expect(response.body.nome).toBe(novoCampus.nome);
            expect(response.body.localizacao).toBe(novoCampus.localizacao);
        });
        it("não deve criar um campus sem autenticação", async () => {
            const novoCampus = {
                nome: "Campus Centro",
                localizacao: "Rua Principal, 123",
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .post("/api/v1/campus")
                .send(novoCampus);
            expect(response.status).toBe(401);
        });
        it("deve retornar 500 se ocorrer um erro ao criar campus", async () => {
            jest.spyOn(campus_models_1.Campus.prototype, "save").mockImplementationOnce(() => {
                throw new Error("Erro ao salvar");
            });
            const novoCampus = {
                nome: "Campus Centro",
                localizacao: "Rua Principal, 123",
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .post("/api/v1/campus")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(novoCampus);
            expect(response.status).toBe(500);
            expect(response.body.message).toContain("Erro ao criar campus");
        });
    });
    describe("PUT /api/v1/campus/:id", () => {
        it("deve atualizar um campus existente quando autenticado como admin", async () => {
            // Primeiro criar um campus
            const campus = new campus_models_1.Campus({
                nome: "Campus Antigo",
                localizacao: "Localização Antiga",
            });
            const campusSalvo = await campus.save();
            const atualizacao = {
                nome: "Campus Novo",
                localizacao: "Nova Localização",
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/campus/${campusSalvo._id}`)
                .set("Authorization", `Bearer ${mockToken}`)
                .send(atualizacao);
            expect(response.status).toBe(200);
            expect(response.body.nome).toBe(atualizacao.nome);
            expect(response.body.localizacao).toBe(atualizacao.localizacao);
        });
        it("deve retornar 404 ao tentar atualizar campus inexistente", async () => {
            const idInexistente = new mongoose_1.default.Types.ObjectId();
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/campus/${idInexistente}`)
                .set("Authorization", `Bearer ${mockToken}`)
                .send({
                nome: "Campus Novo",
                localizacao: "Nova Localização",
            });
            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Campus não encontrado");
        });
        it("deve retornar 500 se ocorrer um erro ao atualizar campus", async () => {
            const campus = new campus_models_1.Campus({
                nome: "Campus Teste",
                localizacao: "Localização Teste",
            });
            const campusSalvo = await campus.save();
            jest.spyOn(campus_models_1.Campus, "findByIdAndUpdate").mockImplementationOnce(() => {
                throw new Error("Erro ao atualizar");
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/campus/${campusSalvo._id}`)
                .set("Authorization", `Bearer ${mockToken}`)
                .send({
                nome: "Campus Atualizado",
                localizacao: "Nova Localização",
            });
            expect(response.status).toBe(500);
            expect(response.body.message).toContain("Erro ao atualizar campus");
        });
    });
    describe("DELETE /api/v1/campus/:id", () => {
        it("deve deletar um campus existente quando autenticado como admin", async () => {
            // Primeiro criar um campus
            const campus = new campus_models_1.Campus({
                nome: "Campus para Deletar",
                localizacao: "Localização Teste",
            });
            const campusSalvo = await campus.save();
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/campus/${campusSalvo._id}`)
                .set("Authorization", `Bearer ${mockToken}`);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Campus deletado com sucesso!");
            // Verificar se realmente foi deletado
            const campusDeletado = await campus_models_1.Campus.findById(campusSalvo._id);
            expect(campusDeletado).toBeNull();
        });
        it("deve retornar 404 ao tentar deletar campus inexistente", async () => {
            const idInexistente = new mongoose_1.default.Types.ObjectId();
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/campus/${idInexistente}`)
                .set("Authorization", `Bearer ${mockToken}`);
            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Campus não encontrado");
        });
        it("deve retornar 500 se ocorrer um erro ao deletar campus", async () => {
            const campus = new campus_models_1.Campus({
                nome: "Campus Teste",
                localizacao: "Localização Teste",
            });
            const campusSalvo = await campus.save();
            jest.spyOn(campus_models_1.Campus, "findByIdAndDelete").mockImplementationOnce(() => {
                throw new Error("Erro ao deletar");
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/campus/${campusSalvo._id}`)
                .set("Authorization", `Bearer ${mockToken}`);
            expect(response.status).toBe(500);
            expect(response.body.message).toContain("Erro ao deletar campus");
        });
    });
    describe("GET /api/v1/campus", () => {
        it("deve listar todos os campus", async () => {
            // Criar alguns campus para teste
            await campus_models_1.Campus.create([
                { nome: "Campus 1", localizacao: "Local 1" },
                { nome: "Campus 2", localizacao: "Local 2" },
            ]);
            const response = await (0, supertest_1.default)(index_1.default).get("/api/v1/campus");
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
        });
        it("deve retornar 404 quando não houver campus cadastrados", async () => {
            const response = await (0, supertest_1.default)(index_1.default).get("/api/v1/campus");
            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Nenhum campus encontrado");
        });
        it("deve retornar 500 se ocorrer um erro ao listar campus", async () => {
            jest.spyOn(campus_models_1.Campus, "find").mockImplementationOnce(() => {
                throw new Error("Erro ao buscar");
            });
            const response = await (0, supertest_1.default)(index_1.default).get("/api/v1/campus");
            expect(response.status).toBe(500);
            expect(response.body.message).toContain("Erro ao listar campus");
        });
    });
});
describe("Rotas do Curso", () => {
    beforeEach(async () => {
        await curso_models_1.Curso.deleteMany({});
        await campus_models_1.Campus.deleteMany({});
        const hashedPassword = await bcryptjs_1.default.hash("senha123", 10);
        const admin = new user_model_1.Usuario({
            nome: "Admin Teste",
            email: "admin@teste.com",
            senha: hashedPassword,
            cpf: "12345678905",
            tipo: "administrador",
            isAdmin: true,
        });
        await admin.save();
        const loginResponse = await (0, supertest_1.default)(index_1.default).post("/api/v1/admin/login").send({
            email: "admin@teste.com",
            senha: "senha123",
        });
        mockToken = loginResponse.body.token;
    });
    describe("POST /api/v1/curso", () => {
        it("deve criar um novo curso quando autenticado como admin", async () => {
            const campus = new campus_models_1.Campus({
                nome: "Campus Teste",
                localizacao: "Localização Teste",
            });
            const campusSalvo = await campus.save();
            const novoCurso = {
                nome: "Engenharia de Software",
                campus: campusSalvo._id,
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .post("/api/v1/curso")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(novoCurso);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("_id");
            expect(response.body.nome).toBe(novoCurso.nome);
            expect(response.body.campus.toString()).toBe(campusSalvo._id.toString());
        });
        it("não deve criar um curso sem autenticação", async () => {
            const novoCurso = {
                nome: "Engenharia de Software",
                campus: new mongoose_1.default.Types.ObjectId(),
            };
            const response = await (0, supertest_1.default)(index_1.default).post("/api/v1/curso").send(novoCurso);
            expect(response.status).toBe(401);
        });
        it("deve retornar 500 se ocorrer um erro ao criar curso", async () => {
            jest.spyOn(curso_models_1.Curso.prototype, "save").mockImplementationOnce(() => {
                throw new Error("Erro ao salvar");
            });
            const novoCurso = {
                nome: "Engenharia de Software",
                campus: new mongoose_1.default.Types.ObjectId(),
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .post("/api/v1/curso")
                .set("Authorization", `Bearer ${mockToken}`)
                .send(novoCurso);
            expect(response.status).toBe(500);
            expect(response.body.message).toContain("Erro ao criar curso");
        });
    });
    describe("PUT /api/v1/curso/:id", () => {
        it("deve atualizar um curso existente quando autenticado como admin", async () => {
            const campus = new campus_models_1.Campus({
                nome: "Campus Teste",
                localizacao: "Localização Teste",
            });
            const campusSalvo = await campus.save();
            const curso = new curso_models_1.Curso({
                nome: "Curso Antigo",
                campus: campusSalvo._id,
            });
            const cursoSalvo = await curso.save();
            const atualizacao = {
                nome: "Curso Novo",
                campus: campusSalvo._id,
            };
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/curso/${cursoSalvo._id}`)
                .set("Authorization", `Bearer ${mockToken}`)
                .send(atualizacao);
            expect(response.status).toBe(200);
            expect(response.body.nome).toBe(atualizacao.nome);
        });
        it("deve retornar 404 ao tentar atualizar curso inexistente", async () => {
            const idInexistente = new mongoose_1.default.Types.ObjectId();
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/curso/${idInexistente}`)
                .set("Authorization", `Bearer ${mockToken}`)
                .send({
                nome: "Curso Novo",
                campus: new mongoose_1.default.Types.ObjectId(),
            });
            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Curso não encontrado");
        });
        it("deve retornar 500 se ocorrer um erro ao atualizar curso", async () => {
            const curso = new curso_models_1.Curso({
                nome: "Curso Teste",
                campus: new mongoose_1.default.Types.ObjectId(),
            });
            const cursoSalvo = await curso.save();
            jest.spyOn(curso_models_1.Curso, "findByIdAndUpdate").mockImplementationOnce(() => {
                throw new Error("Erro ao atualizar");
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .put(`/api/v1/curso/${cursoSalvo._id}`)
                .set("Authorization", `Bearer ${mockToken}`)
                .send({
                nome: "Curso Atualizado",
                campus: new mongoose_1.default.Types.ObjectId(),
            });
            expect(response.status).toBe(500);
            expect(response.body.message).toContain("Erro ao atualizar curso");
        });
    });
    describe("DELETE /api/v1/curso/:id", () => {
        it("deve deletar um curso existente quando autenticado como admin", async () => {
            const curso = new curso_models_1.Curso({
                nome: "Curso para Deletar",
                campus: new mongoose_1.default.Types.ObjectId(),
            });
            const cursoSalvo = await curso.save();
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/curso/${cursoSalvo._id}`)
                .set("Authorization", `Bearer ${mockToken}`);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Curso deletado com sucesso");
            const cursoDeletado = await curso_models_1.Curso.findById(cursoSalvo._id);
            expect(cursoDeletado).toBeNull();
        });
        it("deve retornar 404 ao tentar deletar curso inexistente", async () => {
            const idInexistente = new mongoose_1.default.Types.ObjectId();
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/curso/${idInexistente}`)
                .set("Authorization", `Bearer ${mockToken}`);
            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Curso não encontrado");
        });
        it("deve retornar 500 se ocorrer um erro ao deletar curso", async () => {
            const curso = new curso_models_1.Curso({
                nome: "Curso Teste",
                campus: new mongoose_1.default.Types.ObjectId(),
            });
            const cursoSalvo = await curso.save();
            jest.spyOn(curso_models_1.Curso, "findByIdAndDelete").mockImplementationOnce(() => {
                throw new Error("Erro ao deletar");
            });
            const response = await (0, supertest_1.default)(index_1.default)
                .delete(`/api/v1/curso/${cursoSalvo._id}`)
                .set("Authorization", `Bearer ${mockToken}`);
            expect(response.status).toBe(500);
            expect(response.body.message).toContain("Erro ao deletar curso");
        });
    });
    describe("GET /api/v1/curso", () => {
        it("deve listar todos os cursos", async () => {
            const campus = new campus_models_1.Campus({
                nome: "Campus Teste",
                localizacao: "Localização Teste",
            });
            const campusSalvo = await campus.save();
            await curso_models_1.Curso.create([
                { nome: "Curso 1", campus: campusSalvo._id },
                { nome: "Curso 2", campus: campusSalvo._id },
            ]);
            const response = await (0, supertest_1.default)(index_1.default).get("/api/v1/curso");
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
        });
        it("deve retornar lista vazia quando não houver cursos cadastrados", async () => {
            const response = await (0, supertest_1.default)(index_1.default).get("/api/v1/curso");
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });
        it("deve retornar 500 se ocorrer um erro ao listar cursos", async () => {
            jest.spyOn(curso_models_1.Curso, "find").mockImplementationOnce(() => {
                throw new Error("Erro ao buscar");
            });
            const response = await (0, supertest_1.default)(index_1.default).get("/api/v1/curso");
            expect(response.status).toBe(500);
            expect(response.body.message).toContain("Erro ao listar cursos");
        });
    });
});
describe("Rotas de Disciplinas", () => {
    let mockToken;
    let disciplinaId;
    beforeEach(async () => {
        await user_model_1.Usuario.deleteMany({});
        const hashedPassword = await bcryptjs_1.default.hash("senha123", 10);
        const admin = new user_model_1.Usuario({
            nome: "Admin Teste",
            email: "admin@teste.com",
            senha: hashedPassword,
            cpf: "12345678905",
            tipo: "administrador",
            isAdmin: true,
        });
        await admin.save();
        const loginResponse = await (0, supertest_1.default)(index_1.default).post("/api/v1/admin/login").send({
            email: "admin@teste.com",
            senha: "senha123",
        });
        mockToken = loginResponse.body.token;
    });
    it("Deve criar uma nova disciplina", async () => {
        const novaDisciplina = {
            nome: "Algoritmo",
            curso: new mongoose_1.default.Types.ObjectId(),
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/disciplina")
            .set("Authorization", `Bearer ${mockToken}`)
            .send(novaDisciplina);
        expect(response.status).toBe(201);
        disciplinaId = response.body._id;
        console.log(disciplinaId);
    });
    it("Deve retornar erro 400 ao tentar criar uma disciplina sem nome ou curso", async () => {
        const disciplinaSemNome = {
            curso: new mongoose_1.default.Types.ObjectId(),
        };
        const disciplinaSemCurso = {
            nome: "Algoritmo",
        };
        let response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/disciplina")
            .set("Authorization", `Bearer ${mockToken}`)
            .send(disciplinaSemNome);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Nome e curso são obrigatórios");
        response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/disciplina")
            .set("Authorization", `Bearer ${mockToken}`)
            .send(disciplinaSemCurso);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Nome e curso são obrigatórios");
    });
    it("Deve retornar erro 500 se ocorrer um erro no servidor ao criar uma disciplina", async () => {
        const novaDisciplina = {
            nome: "Algoritmo",
            curso: new mongoose_1.default.Types.ObjectId(),
        };
        // Mocka o erro no método save da Disciplina
        jest
            .spyOn(disciplina_models_1.Disciplina.prototype, "save")
            .mockRejectedValue(new Error("Erro no banco de dados"));
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/disciplina")
            .set("Authorization", `Bearer ${mockToken}`)
            .send(novaDisciplina);
        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Erro ao criar disciplina: Error: Erro no banco de dados");
    });
    it("Deve atualizar uma disciplina existente", async () => {
        const atualizacao = { nome: "Algoritmo e logica" };
        const response = await (0, supertest_1.default)(index_1.default)
            .put(`/api/v1/disciplina/${disciplinaId}`)
            .set("Authorization", `Bearer ${mockToken}`)
            .send(atualizacao);
        expect(response.status).toBe(200);
        expect(response.body.nome).toBe("Algoritmo e logica");
    });
    it("Deve retornar erro 400 se nome ou curso não forem fornecidos para atualização", async () => {
        const disciplinaExistente = {
            nome: "Algoritmo",
            curso: new mongoose_1.default.Types.ObjectId(),
        };
        const disciplinaResponse = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/disciplina")
            .set("Authorization", `Bearer ${mockToken}`)
            .send(disciplinaExistente);
        const disciplinaId = disciplinaResponse.body._id;
        const respostaSemDados = await (0, supertest_1.default)(index_1.default)
            .put(`/api/v1/disciplina/${disciplinaId}`)
            .set("Authorization", `Bearer ${mockToken}`)
            .send({});
        expect(respostaSemDados.status).toBe(400);
        expect(respostaSemDados.body.message).toBe("Nome ou curso devem ser fornecidos para atualização");
    });
    it("Deve retornar erro 404 se a disciplina não for encontrada", async () => {
        const idInvalido = new mongoose_1.default.Types.ObjectId();
        const resposta = await (0, supertest_1.default)(index_1.default)
            .put(`/api/v1/disciplina/${idInvalido}`)
            .set("Authorization", `Bearer ${mockToken}`)
            .send({ nome: "Algoritmo Avançado" });
        expect(resposta.status).toBe(404);
        expect(resposta.body.message).toBe("Disciplina não encontrada");
    });
    it("Deve retornar erro 500 se ocorrer um erro no servidor ao atualizar a disciplina", async () => {
        const disciplinaExistente = {
            nome: "Algoritmo",
            curso: new mongoose_1.default.Types.ObjectId(),
        };
        const disciplinaResponse = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/disciplina")
            .set("Authorization", `Bearer ${mockToken}`)
            .send(disciplinaExistente);
        const disciplinaId = disciplinaResponse.body._id;
        jest
            .spyOn(disciplina_models_1.Disciplina, "findByIdAndUpdate")
            .mockRejectedValue(new Error("Erro no banco de dados"));
        const resposta = await (0, supertest_1.default)(index_1.default)
            .put(`/api/v1/disciplina/${disciplinaId}`)
            .set("Authorization", `Bearer ${mockToken}`)
            .send({ nome: "Algoritmo Avançado" });
        expect(resposta.status).toBe(500);
        expect(resposta.body.message).toBe("Erro ao atualizar disciplina: Error: Erro no banco de dados");
    });
    it("Deve listar todas as disciplinas", async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .get("/api/v1/disciplina")
            .set("Authorization", `Bearer ${mockToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBeGreaterThan(0);
    });
    it("Deve retornar erro 500 se ocorrer um erro no servidor ao listar disciplinas", async () => {
        jest.spyOn(disciplina_models_1.Disciplina, "find").mockRejectedValue(new Error("Erro no banco de dados"));
        const resposta = await (0, supertest_1.default)(index_1.default)
            .get("/api/v1/disciplina")
            .set("Authorization", `Bearer ${mockToken}`);
        expect(resposta.status).toBe(500);
        expect(resposta.body.message).toBe("Erro ao listar disciplinas: Error: Erro no banco de dados");
    });
    it("Deve deletar uma disciplina existente", async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .delete(`/api/v1/disciplina/${disciplinaId}`)
            .set("Authorization", `Bearer ${mockToken}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Disciplina deletada com sucesso");
    });
    it("Deve retornar erro 404 se a disciplina não for encontrada", async () => {
        const idInvalido = new mongoose_1.default.Types.ObjectId();
        const resposta = await (0, supertest_1.default)(index_1.default)
            .delete(`/api/v1/disciplina/${idInvalido}`)
            .set("Authorization", `Bearer ${mockToken}`);
        expect(resposta.status).toBe(404);
        expect(resposta.body.message).toBe("Disciplina não encontrada");
    });
    it("Deve retornar erro 500 se ocorrer um erro no servidor ao deletar a disciplina", async () => {
        const disciplinaExistente = {
            nome: "Algoritmo",
            curso: new mongoose_1.default.Types.ObjectId(),
        };
        const disciplinaResponse = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/disciplina")
            .set("Authorization", `Bearer ${mockToken}`)
            .send(disciplinaExistente);
        const disciplinaId = disciplinaResponse.body._id;
        jest.spyOn(disciplina_models_1.Disciplina, "findByIdAndDelete").mockRejectedValue(new Error("Erro no banco de dados"));
        const resposta = await (0, supertest_1.default)(index_1.default)
            .delete(`/api/v1/disciplina/${disciplinaId}`)
            .set("Authorization", `Bearer ${mockToken}`);
        expect(resposta.status).toBe(500);
        expect(resposta.body.message).toBe("Erro ao deletar disciplina: Error: Erro no banco de dados");
    });
});