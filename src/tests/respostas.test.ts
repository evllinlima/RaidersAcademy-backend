import request from "supertest";
import app from "../index";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { Resposta } from "../models/respostas.models";
import { Pergunta } from "../models/perguntas.models";
import { Usuario } from "../models/user.model";

beforeAll(async () => {
  await mongoose.connect("mongodb://localhost:27017/testRespostas");
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

let mockToken: string;
let perguntaId: string;
let adminToken: string;

beforeEach(async () => {
  // Limpa as coleções antes de cada teste
  await Usuario.deleteMany({});
  await Pergunta.deleteMany({});
  await Resposta.deleteMany({});

  // Cria um usuário para os testes
  const hashedPassword = await bcrypt.hash("senha123", 10);
  const usuario = new Usuario({
    nome: "Aluno Teste",
    email: "aluno@teste.com",
    senha: hashedPassword,
    cpf: "12345678966",
    tipo: "aluno",
    curso: new mongoose.Types.ObjectId(),
  });
  await usuario.save();

  // Cria um admin
  const admin = new Usuario({
    nome: "Admin Teste",
    email: "admin@teste.com",
    senha: hashedPassword,
    cpf: "12345678905",
    tipo: "administrador",
    isAdmin: true,
  });
  await admin.save();

  // Faz login e obtém o token
  const loginResponse = await request(app)
    .post("/api/v1/login")
    .send({ email: "aluno@teste.com", senha: "senha123" });

  mockToken = loginResponse.body.token;

  // Login do admin
  const adminLoginResponse = await request(app)
    .post("/api/v1/admin/login")
    .send({ email: "admin@teste.com", senha: "senha123" });

  adminToken = adminLoginResponse.body.token;

  // Cria uma pergunta para os testes
  const pergunta = new Pergunta({
    titulo: "Pergunta Teste",
    descricao: "Descrição da pergunta teste",
    autor: usuario._id,
    disciplina: new mongoose.Types.ObjectId(),
  });
  const perguntaSalva = await pergunta.save();
  perguntaId = perguntaSalva._id as string;
});

describe("Rotas de Respostas", () => {
  describe("POST /api/v1/respostas", () => {
    it("Deve criar uma nova resposta com sucesso", async () => {
      const novaResposta = {
        descricao: "Esta é uma resposta de teste",
        pergunta: perguntaId,
      };

      const response = await request(app)
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

      const response = await request(app)
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

      const response = await request(app)
        .post("/api/v1/respostas")
        .send(novaResposta);

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/v1/respostas/:id", () => {
    it("Deve atualizar uma resposta com sucesso", async () => {
      // Primeiro cria uma resposta
      const novaResposta = new Resposta({
        descricao: "Resposta original",
        pergunta: perguntaId,
        autor: new mongoose.Types.ObjectId(),
      });
      const respostaSalva = await novaResposta.save();

      // Depois atualiza
      const atualizacao = {
        descricao: "Resposta atualizada",
      };

      const response = await request(app)
        .put(`/api/v1/respostas/${respostaSalva._id}`)
        .set("Authorization", `Bearer ${mockToken}`)
        .send(atualizacao);

      expect(response.status).toBe(200);
      expect(response.body.descricao).toBe(atualizacao.descricao);
    });

    it("Deve retornar erro 404 se a resposta não for encontrada", async () => {
      const idInexistente = new mongoose.Types.ObjectId();
      const atualizacao = {
        descricao: "Tentativa de atualização",
      };

      const response = await request(app)
        .put(`/api/v1/respostas/${idInexistente}`)
        .set("Authorization", `Bearer ${mockToken}`)
        .send(atualizacao);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Resposta não encontrada");
    });

    it("Deve retornar erro 400 se a descrição não for fornecida", async () => {
      const respostaSalva = await new Resposta({
        descricao: "Resposta original",
        pergunta: perguntaId,
        autor: new mongoose.Types.ObjectId(),
      }).save();

      const response = await request(app)
        .put(`/api/v1/respostas/${respostaSalva._id}`)
        .set("Authorization", `Bearer ${mockToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Descrição é obrigatória para atualização");
    });
  });

  describe("DELETE /api/v1/respostas/:id", () => {
    it("Deve deletar uma resposta com sucesso", async () => {
      const novaResposta = await new Resposta({
        descricao: "Resposta para deletar",
        pergunta: perguntaId,
        autor: new mongoose.Types.ObjectId(),
      }).save();

      const response = await request(app)
        .delete(`/api/v1/respostas/${novaResposta._id}`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Resposta deletada com sucesso");
    });

    it("Deve retornar erro 404 se a resposta não for encontrada para deletar", async () => {
      const idInexistente = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/v1/respostas/${idInexistente}`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Resposta não encontrada");
    });
  });

  describe("GET /api/v1/perguntas/:perguntaId/respostas", () => {
    it("Deve listar todas as respostas de uma pergunta", async () => {
      // Cria algumas respostas para a pergunta
      await Resposta.create([
        {
          descricao: "Primeira resposta",
          pergunta: perguntaId,
          autor: new mongoose.Types.ObjectId(),
        },
        {
          descricao: "Segunda resposta",
          pergunta: perguntaId,
          autor: new mongoose.Types.ObjectId(),
        },
      ]);

      const response = await request(app)
        .get(`/api/v1/perguntas/${perguntaId}/respostas`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it("Deve retornar array vazio se não houver respostas", async () => {
      const response = await request(app)
        .get(`/api/v1/perguntas/${perguntaId}/respostas`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it("Deve retornar erro 500 se houver erro ao listar respostas", async () => {
      jest.spyOn(Resposta, "find").mockImplementationOnce(() => {
        throw new Error("Erro ao buscar respostas");
      });

      const response = await request(app)
        .get(`/api/v1/perguntas/${perguntaId}/respostas`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(500);
      expect(response.body.message).toContain("Erro ao listar respostas");
    });
  });
});