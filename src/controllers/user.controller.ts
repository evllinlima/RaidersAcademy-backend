import { Request, Response, NextFunction } from "express";
import { Usuario } from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

interface UserRequest extends Request {
  user?: {
    id: string;
    email: string;
    tipo: "aluno" | "professor";
  };
}

// Registrar um novo usuário
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { nome, email, senha, cpf, tipo, curso } = req.body;

  try {
    // Verificar se o email já está cadastrado
    const existingUser = await Usuario.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email já cadastrado. Tente outro." });
      return;
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Criar novo usuário
    const novoUsuario = new Usuario({
      nome,
      email,
      senha: hashedPassword,
      cpf,
      tipo,
      curso: tipo === "aluno" ? curso : null, // Apenas alunos possuem um único curso
      cursosProfessores: tipo === "professor" ? req.body.cursosProfessores : undefined,
    });

    // Salvar no banco
    const usuarioSalvo = await novoUsuario.save();

    res.status(201).json({
      message: "Usuário registrado com sucesso!",
      userId: usuarioSalvo._id,
      email: usuarioSalvo.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Erro ao registrar o usuário: ${error}` });
  }
};

// Fazer login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, senha } = req.body;

  try {
    // Procurar o usuário pelo email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      res.status(400).json({ message: "Email ou senha incorretos" });
      return;
    }

    // Comparar senhas
    const isMatch = await bcrypt.compare(senha, usuario.senha);
    if (!isMatch) {
      res.status(400).json({ message: "Email ou senha incorretos" });
      return;
    }

    // Gerar JWT
    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, tipo: usuario.tipo },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Erro ao logar: ${error}` });
  }
};

// Atualizar informações do usuário
export const updateUser = async (req: UserRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.id !== req.params.id) {
      res.status(403).json({ message: "Você não tem permissão para atualizar este perfil." });
      return;
    }

    const updatedUser = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedUser) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }

    res.status(200).json({ message: "Usuário atualizado com sucesso!", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Erro ao atualizar o usuário: ${error}` });
  }
};

// Middleware para autenticação
const authenticateToken = (req: UserRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Acesso não autorizado" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido" });
    }

    req.user = user as { id: string; email: string; tipo: "aluno" | "professor" };
    next();
  });
};

// Deletar o usuário pelo ID
export const deleteUser = async (
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    // Verifica se o usuário que está fazendo a requisição é o mesmo que está tentando excluir
    if (req.user?.id !== req.params.id) {
      res
        .status(403)
        .json({ message: "Você não tem permissão para excluir este perfil." });
      return;
    }

    const deletedUser = await Usuario.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }

    res.status(200).json({ message: "Usuário deletado com sucesso!" });
  } catch (error) {
    console.error(error); // Log do erro para debug no servidor
    res.status(500).json({ message: "Erro ao deletar o usuário", error });
  }
};

// Obter informações do usuário pelo ID
export const getUser = async (
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    // Verifica se o usuário que está fazendo a requisição é o mesmo que está no perfil
    if (req.user?.id !== req.params.id) {
      res
        .status(403)
        .json({
          message:
            "Acesso negado. Você não pode ver o perfil de outro usuário.",
        });
    }

    const user = await Usuario.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }

    res.render("profile", { user }); // Retorna as informações do perfil
  } catch (error) {
    res.status(500).json({ message: `Erro ao carregar o perfil: ${error}` });
  }
};

// Obter informações públicas do usuário (sem autenticação)
export const getPublicProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await Usuario.findById(req.params.id).select("nome"); // Seleciona apenas o nome
    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }

    res.json(user); // Retorna as informações públicas do perfil (apenas o nome)
  } catch (error) {
    res
      .status(500)
      .json({ message: `Erro ao carregar o perfil público: ${error}` });
  }
};

export { authenticateToken };
