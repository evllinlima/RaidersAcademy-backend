import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Usuario } from "../models/user.model";

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

    // Se já existe um administrador, apenas outro administrador pode registrar novos
    if (existeAdmin && (!req.user || !req.user?.isAdmin)) {
      res.status(403).json({ message: "Apenas administradores podem registrar novos administradores." });
      return;
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
  } catch (error) {
    res.status(500).json({ message: `Erro ao registrar administrador: ${error}` });
  }
};