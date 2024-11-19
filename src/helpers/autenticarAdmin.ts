import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Usuario, IUsuario } from "../models/user.model";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

interface AdminRequest extends Request {
  user?: IUsuario;
}

// Middleware para verificar se o token é válido e se o usuário é administrador
export const autenticarAdmin = async (
  req: AdminRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Acesso não autorizado" });
    return;
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET) as { id: string; isAdmin: boolean };
    const user = await Usuario.findById(decodedToken.id);

    if (!user || !user.isAdmin) {
      res.status(403).json({ message: "Apenas administradores podem acessar esta rota." });
      return;
    }

    // Adiciona o usuário ao request sem forçar a tipagem de _id
    req.user = user;

    // Passa o controle para o próximo middleware
    next();
  } catch (error) {
    res.status(403).json({ message: "Token inválido" });
    return;
  }
};
