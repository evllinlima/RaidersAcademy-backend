import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Importar o jwt_secret do .env
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

interface UserRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Registrar um novo usuário
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    // Verificar se já existe um usuário com o mesmo email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email já cadastrado. Tente outro." });
      return;
    }

    // Gera a senha criptografada
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar um novo usuário
    let user = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Salvar o usuário no banco de dados
    await user.save();

    // Após o registro, redireciona para a página de perfil do usuário (ou retorna o token em uma API RESTful)
    res.status(201).json({
      message: "Usuário registrado com sucesso!",
      userId: user._id,
      email: user.email,
    });
  } catch (error) {
    console.error(error); // Log do erro para debug no servidor
    res.status(500).json({ message: `Erro ao registrar o usuário: ${error}` });
  }
};

// Fazer login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password }: { email: string; password: string } = req.body;

  try {
    // Encontrar o usuário com base no email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Email ou senha incorretos" });
      return;
    }

    // Comparar a senha fornecida com a senha criptografada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Email ou senha incorretos" });
      return;
    }

    // Se o login for bem-sucedido, gera um token JWT e retorna
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" } // O token expira em 1 hora
    );

    res.json({ token });
  } catch (error) {
    console.error(error); // Log do erro para debug no servidor
    res.status(500).json({ message: `Erro ao logar: ${error}` });
  }
};

// Atualizar as informações do usuário
export const updateUser = async (
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    // Verifica se o usuário que está fazendo a requisição é o mesmo que está tentando atualizar
    if (req.user?.id !== req.params.id) {
      res
        .status(403)
        .json({
          message: "Você não tem permissão para atualizar este perfil.",
        });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedUser) {
      res.status(404).json({ message: "Usuário não encontrado" });
      return;
    }

    res
      .status(200)
      .json({ message: "Usuário atualizado com sucesso!", user: updatedUser });
  } catch (error) {
    console.error(error); // Log do erro para debug no servidor
    res.status(500).json({ message: "Erro ao atualizar o usuário", error });
  }
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

    const deletedUser = await User.findByIdAndDelete(req.params.id);

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

    const user = await User.findById(req.params.id);
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
    const user = await User.findById(req.params.id).select("name"); // Seleciona apenas o nome
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

const authenticateToken = (
  req: UserRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1]; // Pega o token do header

  if (!token) {
    res.status(401).json({ message: "Acesso não autorizado" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido" });
    }

    req.user = user as { id: string; email: string }; // Salva as informações do usuário no request
    next(); // Chama a próxima rota
  });
};

export { authenticateToken };
