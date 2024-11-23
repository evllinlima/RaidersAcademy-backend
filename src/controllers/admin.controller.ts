import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Usuario } from "../models/user.model";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Criar uma interface personalizada para incluir a propriedade `user` no tipo Request
interface AdminRequest extends Request {
  user?: {
    isAdmin?: boolean;
  };
}

// Registrar um novo administrador
export const registerAdmin = async (req: AdminRequest, res: Response): Promise<void> => {
  const { nome, email, senha, cpf } = req.body;

  try {
    // Verificar se já existe um administrador cadastrado no sistema
    const existeAdmin = await Usuario.findOne({ isAdmin: true });

    // Se não existe administrador, qualquer pessoa pode criar o primeiro administrador
    if (existeAdmin) {
      // Se já existe um administrador, verificar se a requisição tem um usuário autenticado como admin
      if (!req.user || !req.user.isAdmin) {
        res.status(403).json({ message: "Apenas administradores podem registrar novos administradores." });
        return;
      }
    }

    // Verificar se já existe um usuário com o mesmo email ou CPF
    const emailDuplicado = await Usuario.findOne({ email });
    const cpfDuplicado = await Usuario.findOne({ cpf });

    if (emailDuplicado || cpfDuplicado) {
      res.status(400).json({ message: "Email ou CPF já cadastrado." });
      return;
    }

    // Gera a senha criptografada
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar um novo administrador
    const novoAdmin = new Usuario({
      nome,
      email,
      senha: senhaHash,
      cpf,
      tipo: "administrador",
      isAdmin: true,
    });

    // Salvar no banco
    await novoAdmin.save();

    res.status(201).json({ message: "Administrador registrado com sucesso!", id: novoAdmin._id });
    return;
  } catch (error) {
    res.status(500).json({ message: `Erro ao registrar administrador: ${error}` });
    return;
  }
};

// Login de administrador para gerar JWT
export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  const { email, senha } = req.body;

  try {
    // Verifica se o email está cadastrado
    const usuario = await Usuario.findOne({ email });

    if (!usuario || !usuario.isAdmin) {
      res.status(401).json({ message: "Credenciais inválidas ou usuário não é administrador." });
      return;
    }

    // Verifica a senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      res.status(401).json({ message: "Credenciais inválidas." });
      return;
    }

    // Gera o token JWT
    const token = jwt.sign({ id: usuario._id, isAdmin: usuario.isAdmin }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login bem-sucedido", token });
  } catch (error) {
    res.status(500).json({ message: `Erro ao fazer login: ${error}` });
  }
};