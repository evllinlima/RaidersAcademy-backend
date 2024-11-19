"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autenticarAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
// Middleware para verificar se o token é válido e se o usuário é administrador
const autenticarAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Acesso não autorizado" });
        return;
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await user_model_1.Usuario.findById(decodedToken.id);
        if (!user || !user.isAdmin) {
            res.status(403).json({ message: "Apenas administradores podem acessar esta rota." });
            return;
        }
        // Adiciona o usuário ao request sem forçar a tipagem de _id
        req.user = user;
        // Passa o controle para o próximo middleware
        next();
    }
    catch (error) {
        res.status(403).json({ message: "Token inválido" });
        return;
    }
};
exports.autenticarAdmin = autenticarAdmin;
