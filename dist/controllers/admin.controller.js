"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAdmin = exports.registerAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("../models/user.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
// Registrar um novo administrador
const registerAdmin = async (req, res) => {
    const { nome, email, senha, cpf } = req.body;
    try {
        // Verificar se já existe um administrador cadastrado no sistema
        const existeAdmin = await user_model_1.Usuario.findOne({ isAdmin: true });
        // Se não existe administrador, qualquer pessoa pode criar o primeiro administrador
        if (existeAdmin) {
            // Se já existe um administrador, verificar se a requisição tem um usuário autenticado como admin
            if (!req.user || !req.user.isAdmin) {
                res.status(403).json({ message: "Apenas administradores podem registrar novos administradores." });
                return;
            }
        }
        // Verificar se já existe um usuário com o mesmo email ou CPF
        const emailDuplicado = await user_model_1.Usuario.findOne({ email });
        const cpfDuplicado = await user_model_1.Usuario.findOne({ cpf });
        if (emailDuplicado || cpfDuplicado) {
            res.status(400).json({ message: "Email ou CPF já cadastrado." });
            return;
        }
        // Gera a senha criptografada
        const senhaHash = await bcryptjs_1.default.hash(senha, 10);
        // Criar um novo administrador
        const novoAdmin = new user_model_1.Usuario({
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
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao registrar administrador: ${error}` });
        return;
    }
};
exports.registerAdmin = registerAdmin;
// Login de administrador para gerar JWT
const loginAdmin = async (req, res) => {
    const { email, senha } = req.body;
    try {
        // Verifica se o email está cadastrado
        const usuario = await user_model_1.Usuario.findOne({ email });
        if (!usuario || !usuario.isAdmin) {
            res.status(401).json({ message: "Credenciais inválidas ou usuário não é administrador." });
            return;
        }
        // Verifica a senha
        const senhaValida = await bcryptjs_1.default.compare(senha, usuario.senha);
        if (!senhaValida) {
            res.status(401).json({ message: "Credenciais inválidas." });
            return;
        }
        // Gera o token JWT
        const token = jsonwebtoken_1.default.sign({ id: usuario._id, isAdmin: usuario.isAdmin }, JWT_SECRET, {
            expiresIn: "1h",
        });
        res.status(200).json({ message: "Login bem-sucedido", token });
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao fazer login: ${error}` });
    }
};
exports.loginAdmin = loginAdmin;
