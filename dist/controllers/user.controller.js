"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = exports.getPublicProfile = exports.getUser = exports.deleteUser = exports.updateUser = exports.loginUser = exports.registerUser = void 0;
const user_model_1 = require("../models/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
// Registrar um novo usuário
const registerUser = async (req, res) => {
    const { nome, email, senha, cpf, tipo, curso } = req.body;
    try {
        // Verificar se o email já está cadastrado
        const existingUser = await user_model_1.Usuario.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "Email já cadastrado. Tente outro." });
            return;
        }
        // Criptografar a senha
        const hashedPassword = await bcryptjs_1.default.hash(senha, 10);
        // Criar novo usuário
        const novoUsuario = new user_model_1.Usuario({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: `Erro ao registrar o usuário: ${error}` });
    }
};
exports.registerUser = registerUser;
// Fazer login
const loginUser = async (req, res) => {
    const { email, senha } = req.body;
    try {
        // Procurar o usuário pelo email
        const usuario = await user_model_1.Usuario.findOne({ email });
        if (!usuario) {
            res.status(400).json({ message: "Email ou senha incorretos" });
            return;
        }
        // Comparar senhas
        const isMatch = await bcryptjs_1.default.compare(senha, usuario.senha);
        if (!isMatch) {
            res.status(400).json({ message: "Email ou senha incorretos" });
            return;
        }
        // Gerar JWT
        const token = jsonwebtoken_1.default.sign({ id: usuario._id, email: usuario.email, tipo: usuario.tipo }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: `Erro ao logar: ${error}` });
    }
};
exports.loginUser = loginUser;
// Atualizar informações do usuário
const updateUser = async (req, res) => {
    try {
        if (req.user?.id !== req.params.id) {
            res.status(403).json({ message: "Você não tem permissão para atualizar este perfil." });
            return;
        }
        const updatedUser = await user_model_1.Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) {
            res.status(404).json({ message: "Usuário não encontrado" });
            return;
        }
        res.status(200).json({ message: "Usuário atualizado com sucesso!", user: updatedUser });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: `Erro ao atualizar o usuário: ${error}` });
    }
};
exports.updateUser = updateUser;
// Middleware para autenticação
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Acesso não autorizado" });
        return;
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido" });
        }
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
// Deletar o usuário pelo ID
const deleteUser = async (req, res) => {
    try {
        // Verifica se o usuário que está fazendo a requisição é o mesmo que está tentando excluir
        if (req.user?.id !== req.params.id) {
            res
                .status(403)
                .json({ message: "Você não tem permissão para excluir este perfil." });
            return;
        }
        const deletedUser = await user_model_1.Usuario.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            res.status(404).json({ message: "Usuário não encontrado" });
            return;
        }
        res.status(200).json({ message: "Usuário deletado com sucesso!" });
    }
    catch (error) {
        console.error(error); // Log do erro para debug no servidor
        res.status(500).json({ message: "Erro ao deletar o usuário", error });
    }
};
exports.deleteUser = deleteUser;
// Obter informações do usuário pelo ID
const getUser = async (req, res) => {
    try {
        // Verifica se o usuário que está fazendo a requisição é o mesmo que está no perfil
        if (req.user?.id !== req.params.id) {
            res
                .status(403)
                .json({
                message: "Acesso negado. Você não pode ver o perfil de outro usuário.",
            });
        }
        const user = await user_model_1.Usuario.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: "Usuário não encontrado" });
            return;
        }
        res.render("profile", { user }); // Retorna as informações do perfil
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao carregar o perfil: ${error}` });
    }
};
exports.getUser = getUser;
// Obter informações públicas do usuário (sem autenticação)
const getPublicProfile = async (req, res) => {
    try {
        const user = await user_model_1.Usuario.findById(req.params.id).select("nome"); // Seleciona apenas o nome
        if (!user) {
            res.status(404).json({ message: "Usuário não encontrado" });
            return;
        }
        res.json(user); // Retorna as informações públicas do perfil (apenas o nome)
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Erro ao carregar o perfil público: ${error}` });
    }
};
exports.getPublicProfile = getPublicProfile;
