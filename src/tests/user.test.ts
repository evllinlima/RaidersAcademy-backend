import request from "supertest";
import app from "../index";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Usuario } from "../models/user.model";

dotenv.config();

let mockUserId: mongoose.Types.ObjectId;
let mockUserId2: mongoose.Types.ObjectId;
let mockToken: string;
let mockToken2: string;

// Configuração inicial antes dos testes
beforeAll(async () => {
  // Conectar ao banco de dados de teste
  await mongoose.connect("mongodb://localhost:27017/test");

  // Criar o ObjectId antes
  mockUserId = new mongoose.Types.ObjectId();
  mockUserId2 = new mongoose.Types.ObjectId();

  // Criar o usuário no banco com senha hashada
  const hashedPassword = await bcrypt.hash("senha123", 10);
  const mockUser = new Usuario({
    _id: mockUserId,
    nome: "João",
    email: "joao@exemplo.com",
    senha: hashedPassword,
    cpf: "12345678900",
    tipo: "aluno",
    curso: new mongoose.Types.ObjectId(),
  });
  await mockUser.save();

  // Gerar o token com o mesmo mockUserId
  mockToken = jwt.sign(
    {
      id: mockUserId.toString(),
      email: "joao@exemplo.com",
      tipo: "aluno",
    },
    process.env.JWT_SECRET || "default_secret",
    { expiresIn: "1h" }
  );

  const mockUser2 = new Usuario({
    _id: mockUserId2,
    nome: "Pedro",
    email: "pedro@exemplo.com",
    senha: hashedPassword,
    cpf: "12345678904",
    tipo: "aluno",
    curso: new mongoose.Types.ObjectId(),
  });
  await mockUser2.save();

  // Gerar o token com o mesmo mockUserId
  mockToken2 = jwt.sign(
    {
      id: mockUserId2.toString(),
      email: "pedro@exemplo.com",
      tipo: "aluno",
    },
    process.env.JWT_SECRET || "default_secret",
    { expiresIn: "1h" }
  );
});

// Limpeza após todos os testes
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// Teste de registro de usuário
describe("POST /api/v1/register", () => {
  it("deve registrar um novo usuário com sucesso", async () => {
    const cursoId = new mongoose.Types.ObjectId();

    const novoUsuario = {
      nome: "Maria",
      email: "maria@exemplo.com",
      senha: "senha123",
      cpf: "12345678901",
      tipo: "aluno",
      curso: cursoId.toString(),
    };

    const response = await request(app)
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
      curso: new mongoose.Types.ObjectId().toString(),
    };

    const response = await request(app)
      .post("/api/v1/register")
      .send(novoUsuario)
      .set("Accept", "application/json");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email já cadastrado. Tente outro.");
  });

  it("deve retornar 500 se ocorrer um erro ao registrar o usuário", async () => {
    const response = await request(app)
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

    const response = await request(app)
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

    const response = await request(app)
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

    const response = await request(app)
      .post("/api/v1/login")
      .send(usuario)
      .set("Accept", "application/json");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email ou senha incorretos");
  });

  it("deve retornar erro 500 se ocorrer uma falha no login", async () => {
    jest
      .spyOn(Usuario, "findOne")
      .mockRejectedValueOnce(new Error("Erro no banco de dados"));

    const usuario = {
      email: "erro@exemplo.com",
      senha: "senhaErrada",
    };

    const response = await request(app)
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

    const response = await request(app)
      .put(`/api/v1/user/${mockUserId.toString()}`)
      .send(usuarioAtualizado)
      .set("Authorization", `Bearer ${mockToken}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Usuário atualizado com sucesso!");
    expect(response.body.user.nome).toBe(usuarioAtualizado.nome);
  });

  it("deve negar a atualização para usuários não autorizados", async () => {
    const response = await request(app)
      .put(`/api/v1/user/${mockUserId2.toString()}`)
      .send({ nome: "Nome Não Autorizado" })
      .set("Authorization", `Bearer ${mockToken}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Você não tem permissão para atualizar este perfil."
    );
  });

  it("deve retornar erro quando token não é fornecido", async () => {
    const response = await request(app)
      .put(`/api/v1/user/${mockUserId.toString()}`)
      .send({ nome: "Teste Sem Token" })
      .set("Accept", "application/json");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Acesso não autorizado");
  });

  it("deve retornar erro 500 se ocorrer uma falha ao atualizar o usuário", async () => {
    // Simulando uma falha no método Usuario.findByIdAndUpdate para gerar um erro 500
    jest
      .spyOn(Usuario, "findByIdAndUpdate")
      .mockRejectedValueOnce(new Error("Erro ao atualizar no banco de dados"));

    const usuario = {
      email: "novo@exemplo.com",
      tipo: "aluno",
      curso: "cursoId", // Simulando os dados para a atualização
    };

    // Simulando um ID de usuário que seria fornecido no parâmetro da URL
    const userId = mockUserId.toString();

    const response = await request(app)
      .put(`/api/v1/user/${userId}`)
      .send(usuario)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${mockToken}`); // Usando o token mockado

    expect(response.status).toBe(500); // Esperando um erro 500
    expect(response.body.message).toContain("Erro ao atualizar o usuário");
  });

  it("deve retornar erro 404 se o usuário não for encontrado", async () => {
    const fakeUserId = new mongoose.Types.ObjectId().toString();

    const usuarioAtualizado = {
      nome: "Nome Falso",
    };

    const response = await request(app)
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
    const response = await request(app)
      .get(`/api/v1/user/${mockUserId.toString()}`)
      .set("Authorization", `Bearer ${mockToken}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.nome).toBeDefined();
  });

  it("deve negar o acesso a um perfil privado de outro usuário", async () => {
    const response = await request(app)
      .get(`/api/v1/user/${mockUserId2.toString()}`) // Tentando acessar o perfil de outro usuário
      .set("Authorization", `Bearer ${mockToken}`) // Token do user1, que não deve ter acesso ao perfil de user2
      .set("Accept", "application/json");

    // A verificação deve garantir que o status seja 403, pois o user1 não pode acessar o perfil de user2
    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Acesso negado. Você não pode ver o perfil de outro usuário."
    );
  });

  it("deve retornar erro se o usuário não existir", async () => {
    const fakeUserId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .get(`/api/v1/user/${fakeUserId}`)
      .set("Authorization", `Bearer ${mockToken}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Usuário não encontrado");
  });

  it("deve retornar erro se o token não for fornecido", async () => {
    const response = await request(app)
      .get(`/api/v1/user/${mockUserId.toString()}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Acesso não autorizado");
  });

  it("deve retornar erro 500 se ocorrer uma falha ao carregar o perfil", async () => {
    // Simulando falha no método Usuario.findById para gerar um erro 500
    jest
      .spyOn(Usuario, "findById")
      .mockRejectedValueOnce(new Error("Erro ao buscar o usuário"));

    const response = await request(app)
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
    const response = await request(app)
      .get(`/api/v1/user/public/${mockUserId.toString()}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.nome).toBe("João Atualizado");
  });

  it("deve retornar erro se o usuário não existir", async () => {
    const fakeUserId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .get(`/api/v1/user/public/${fakeUserId}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Usuário não encontrado");
  });

  it('deve retornar erro 500 se ocorrer uma falha ao carregar o perfil público', async () => {
    // Simula uma falha na consulta ao banco de dados
    jest.spyOn(Usuario, 'findById').mockImplementationOnce(() => {
      throw new Error('Erro ao carregar perfil');
    });
  
    const response = await request(app)
      .get(`/api/v1/user/public/${mockUserId}`)
      .set("Accept", "application/json");
  
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Erro ao carregar o perfil público');
  });
  
});

// Teste de deleção de usuário
describe("DELETE /api/v1/user/:id", () => {
  it("deve deletar o usuário com sucesso", async () => {
    const response = await request(app)
      .delete(`/api/v1/user/${mockUserId.toString()}`)
      .set("Authorization", `Bearer ${mockToken}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Usuário deletado com sucesso!");
  });

  it("deve negar a deleção para usuários não autorizados", async () => {
    const response = await request(app)
      .delete(`/api/v1/user/${mockUserId2.toString()}`)
      .set("Authorization", `Bearer ${mockToken}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Você não tem permissão para excluir este perfil."
    );
  });

  it("deve retornar erro se o usuário não existir", async () => {
    const fakeUserId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .delete(`/api/v1/user/${fakeUserId}`)
      .set("Authorization", `Bearer ${mockToken}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Usuário não encontrado");
  });

  it("deve retornar erro se o token não for fornecido", async () => {
    const response = await request(app)
      .delete(`/api/v1/user/${mockUserId.toString()}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Acesso não autorizado");
  });

  it("deve retornar erro 500 se ocorrer uma falha ao deletar o usuário", async () => {
    
    jest
      .spyOn(Usuario, "findByIdAndDelete")
      .mockRejectedValueOnce(new Error("Erro ao deletar no banco de dados"));

    const response = await request(app)
      .delete(`/api/v1/user/${mockUserId.toString()}`)
      .set("Authorization", `Bearer ${mockToken}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(500);
    expect(response.body.message).toContain("Erro ao deletar o usuário");
  });
});
