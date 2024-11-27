"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = require("../models/user.model");
dotenv_1.default.config();
let mockUserId;
let mockUserId2;
let mockToken;
let mockToken2;
// Configuração inicial antes dos testes
beforeAll(async () => {
    // Conectar ao banco de dados de teste
    await mongoose_1.default.connect("mongodb://localhost:27017/test");
    // Criar o ObjectId antes
    mockUserId = new mongoose_1.default.Types.ObjectId();
    mockUserId2 = new mongoose_1.default.Types.ObjectId();
    // Criar o usuário no banco com senha hashada
    const hashedPassword = await bcryptjs_1.default.hash("senha123", 10);
    const mockUser = new user_model_1.Usuario({
        _id: mockUserId,
        nome: "João",
        email: "joao@exemplo.com",
        senha: hashedPassword,
        cpf: "12345678900",
        tipo: "aluno",
        curso: new mongoose_1.default.Types.ObjectId(),
    });
    await mockUser.save();
    // Gerar o token com o mesmo mockUserId
    mockToken = jsonwebtoken_1.default.sign({
        id: mockUserId.toString(),
        email: "joao@exemplo.com",
        tipo: "aluno",
    }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" });
    const mockUser2 = new user_model_1.Usuario({
        _id: mockUserId2,
        nome: "Pedro",
        email: "pedro@exemplo.com",
        senha: hashedPassword,
        cpf: "12345678904",
        tipo: "aluno",
        curso: new mongoose_1.default.Types.ObjectId(),
    });
    await mockUser2.save();
    // Gerar o token com o mesmo mockUserId
    mockToken2 = jsonwebtoken_1.default.sign({
        id: mockUserId2.toString(),
        email: "pedro@exemplo.com",
        tipo: "aluno",
    }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" });
});
// Limpeza após todos os testes
afterAll(async () => {
    await mongoose_1.default.connection.dropDatabase();
    await mongoose_1.default.connection.close();
});
// Teste de registro de usuário
describe("POST /api/v1/register", () => {
    it("deve registrar um novo usuário com sucesso", async () => {
        const cursoId = new mongoose_1.default.Types.ObjectId();
        const novoUsuario = {
            nome: "Maria",
            email: "maria@exemplo.com",
            senha: "senha123",
            cpf: "12345678901",
            tipo: "aluno",
            curso: cursoId.toString(),
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/register")
            .send(novoUsuario)
            .set("Accept", "application/json");
        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Usuário registrado com sucesso!");
        expect(response.body.email).toBe(novoUsuario.email);
    });
    it("não deve permitir registrar um usuário com email duplicado", async () => {
        const novoUsuario = {
            nome: "Maria Duplicada",
            email: "maria@exemplo.com", // Email já existente
            senha: "senha123",
            cpf: "12345678902",
            tipo: "aluno",
            curso: new mongoose_1.default.Types.ObjectId().toString(),
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/register")
            .send(novoUsuario)
            .set("Accept", "application/json");
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Email já cadastrado. Tente outro.");
    });
    it("deve retornar 500 se ocorrer um erro ao registrar o usuário", async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/register")
            .send({ username: "user", password: "password" })
            .set("Accept", "application/json");
        expect(response.status).toBe(500);
        expect(response.body.message).toContain("Erro ao registrar o usuário");
    });
});
// Teste de login de usuário
describe("POST /api/v1/login", () => {
    it("deve autenticar o usuário com sucesso e retornar um token", async () => {
        const usuario = {
            email: "joao@exemplo.com",
            senha: "senha123",
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/login")
            .send(usuario)
            .set("Accept", "application/json");
        mockToken = response.body.token;
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
    });
    it("deve retornar erro para email inexistente", async () => {
        const usuario = {
            email: "inexistente@exemplo.com",
            senha: "senha123",
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/login")
            .send(usuario)
            .set("Accept", "application/json");
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Email ou senha incorretos");
    });
    it("deve retornar erro para senha incorreta", async () => {
        const usuario = {
            email: "joao@exemplo.com",
            senha: "senhaErrada",
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/login")
            .send(usuario)
            .set("Accept", "application/json");
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Email ou senha incorretos");
    });
    it("deve retornar erro 500 se ocorrer uma falha no login", async () => {
        jest
            .spyOn(user_model_1.Usuario, "findOne")
            .mockRejectedValueOnce(new Error("Erro no banco de dados"));
        const usuario = {
            email: "erro@exemplo.com",
            senha: "senhaErrada",
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .post("/api/v1/login")
            .send(usuario)
            .set("Accept", "application/json");
        expect(response.status).toBe(500);
        expect(response.body.message).toContain("Erro ao logar");
    });
});
// Teste de atualização de usuário
describe("PUT /api/v1/user/:id", () => {
    it("deve atualizar as informações do usuário com sucesso", async () => {
        const usuarioAtualizado = {
            nome: "João Atualizado",
            cpf: "09876543210",
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .put(`/api/v1/user/${mockUserId.toString()}`)
            .send(usuarioAtualizado)
            .set("Authorization", `Bearer ${mockToken}`)
            .set("Accept", "application/json");
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Usuário atualizado com sucesso!");
        expect(response.body.user.nome).toBe(usuarioAtualizado.nome);
    });
    it("deve negar a atualização para usuários não autorizados", async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .put(`/api/v1/user/${mockUserId2.toString()}`)
            .send({ nome: "Nome Não Autorizado" })
            .set("Authorization", `Bearer ${mockToken}`)
            .set("Accept", "application/json");
        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Você não tem permissão para atualizar este perfil.");
    });
    it("deve retornar erro quando token não é fornecido", async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .put(`/api/v1/user/${mockUserId.toString()}`)
            .send({ nome: "Teste Sem Token" })
            .set("Accept", "application/json");
        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Acesso não autorizado");
    });
    it("deve retornar erro 500 se ocorrer uma falha ao atualizar o usuário", async () => {
        // Simulando uma falha no método Usuario.findByIdAndUpdate para gerar um erro 500
        jest
            .spyOn(user_model_1.Usuario, "findByIdAndUpdate")
            .mockRejectedValueOnce(new Error("Erro ao atualizar no banco de dados"));
        const usuario = {
            email: "novo@exemplo.com",
            tipo: "aluno",
            curso: "cursoId", // Simulando os dados para a atualização
        };
        // Simulando um ID de usuário que seria fornecido no parâmetro da URL
        const userId = mockUserId.toString();
        const response = await (0, supertest_1.default)(index_1.default)
            .put(`/api/v1/user/${userId}`)
            .send(usuario)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${mockToken}`); // Usando o token mockado
        expect(response.status).toBe(500); // Esperando um erro 500
        expect(response.body.message).toContain("Erro ao atualizar o usuário");
    });
    it("deve retornar erro 404 se o usuário não for encontrado", async () => {
        const fakeUserId = new mongoose_1.default.Types.ObjectId().toString();
        const usuarioAtualizado = {
            nome: "Nome Falso",
        };
        const response = await (0, supertest_1.default)(index_1.default)
            .put(`/api/v1/user/${fakeUserId}`)
            .send(usuarioAtualizado)
            .set("Authorization", `Bearer ${mockToken}`)
            .set("Accept", "application/json");
        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Usuário não encontrado");
    });
});
// Teste de obtenção de usuário
describe("GET /api/v1/user/:id", () => {
    it("deve retornar as informações do usuário com sucesso", async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .get(`/api/v1/user/${mockUserId.toString()}`)
            .set("Authorization", `Bearer ${mockToken}`)
            .set("Accept", "application/json");
        expect(response.status).toBe(200);
        expect(response.body.nome).toBeDefined();
    });
    it("deve negar o acesso a um perfil privado de outro usuário", async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .get(`/api/v1/user/${mockUserId2.toString()}`) // Tentando acessar o perfil de outro usuário
            .set("Authorization", `Bearer ${mockToken}`) // Token do user1, que não deve ter acesso ao perfil de user2
            .set("Accept", "application/json");
        // A verificação deve garantir que o status seja 403, pois o user1 não pode acessar o perfil de user2
        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Acesso negado. Você não pode ver o perfil de outro usuário.");
    });
    it("deve retornar erro se o usuário não existir", async () => {
        const fakeUserId = new mongoose_1.default.Types.ObjectId().toString();
        const response = await (0, supertest_1.default)(index_1.default)
            .get(`/api/v1/user/${fakeUserId}`)
            .set("Authorization", `Bearer ${mockToken}`)
            .set("Accept", "application/json");
        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Usuário não encontrado");
    });
    it("deve retornar erro se o token não for fornecido", async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .get(`/api/v1/user/${mockUserId.toString()}`)
            .set("Accept", "application/json");
        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Acesso não autorizado");
    });
    it("deve retornar erro 500 se ocorrer uma falha ao carregar o perfil", async () => {
        // Simulando falha no método Usuario.findById para gerar um erro 500
        jest
            .spyOn(user_model_1.Usuario, "findById")
            .mockRejectedValueOnce(new Error("Erro ao buscar o usuário"));
        const response = await (0, supertest_1.default)(index_1.default)
            .get(`/api/v1/user/${mockUserId.toString()}`)
            .set("Authorization", `Bearer ${mockToken}`)
            .set("Accept", "application/json");
        expect(response.status).toBe(500);
        expect(response.body.message).toContain("Erro ao carregar o perfil");
    });
});
// Teste de obtenção de perfil público do usuário
describe("GET /api/v1/user/:id/public", () => {
    it("deve retornar as informações públicas do usuário com sucesso", async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .get(`/api/v1/user/public/${mockUserId.toString()}`)
            .set("Accept", "application/json");
        expect(response.status).toBe(200);
        expect(response.body.nome).toBe("João Atualizado");
    });
    it("deve retornar erro se o usuário não existir", async () => {
        const fakeUserId = new mongoose_1.default.Types.ObjectId().toString();
        const response = await (0, supertest_1.default)(index_1.default)
            .get(`/api/v1/user/public/${fakeUserId}`)
            .set("Accept", "application/json");
        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Usuário não encontrado");
    });
    it('deve retornar erro 500 se ocorrer uma falha ao carregar o perfil público', async () => {
        // Simula uma falha na consulta ao banco de dados
        jest.spyOn(user_model_1.Usuario, 'findById').mockImplementationOnce(() => {
            throw new Error('Erro ao carregar perfil');
        });
        const response = await (0, supertest_1.default)(index_1.default)
            .get(`/api/v1/user/public/${mockUserId}`)
            .set("Accept", "application/json");
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Erro ao carregar o perfil público');
    });
});
// Teste de deleção de usuário
describe("DELETE /api/v1/user/:id", () => {
    it("deve deletar o usuário com sucesso", async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .delete(`/api/v1/user/${mockUserId.toString()}`)
            .set("Authorization", `Bearer ${mockToken}`)
            .set("Accept", "application/json");
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Usuário deletado com sucesso!");
    });
    it("deve negar a deleção para usuários não autorizados", async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .delete(`/api/v1/user/${mockUserId2.toString()}`)
            .set("Authorization", `Bearer ${mockToken}`)
            .set("Accept", "application/json");
        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Você não tem permissão para excluir este perfil.");
    });
    it("deve retornar erro se o usuário não existir", async () => {
        const fakeUserId = new mongoose_1.default.Types.ObjectId().toString();
        const response = await (0, supertest_1.default)(index_1.default)
            .delete(`/api/v1/user/${fakeUserId}`)
            .set("Authorization", `Bearer ${mockToken}`)
            .set("Accept", "application/json");
        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Usuário não encontrado");
    });
    it("deve retornar erro se o token não for fornecido", async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .delete(`/api/v1/user/${mockUserId.toString()}`)
            .set("Accept", "application/json");
        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Acesso não autorizado");
    });
    it("deve retornar erro 500 se ocorrer uma falha ao deletar o usuário", async () => {
        jest
            .spyOn(user_model_1.Usuario, "findByIdAndDelete")
            .mockRejectedValueOnce(new Error("Erro ao deletar no banco de dados"));
        const response = await (0, supertest_1.default)(index_1.default)
            .delete(`/api/v1/user/${mockUserId.toString()}`)
            .set("Authorization", `Bearer ${mockToken}`)
            .set("Accept", "application/json");
        expect(response.status).toBe(500);
        expect(response.body.message).toContain("Erro ao deletar o usuário");
    });
});
