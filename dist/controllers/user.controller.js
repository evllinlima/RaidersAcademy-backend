"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = exports.getPublicProfile = exports.getUser = exports.deleteUser = exports.updateUser = exports.loginUser = exports.registerUser = void 0;
const user_model_1 = require("../models/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Importar o jwt_secret do .env
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
// Registrar um novo usuário
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Verificar se já existe um usuário com o mesmo email
        const existingUser = await user_model_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "Email já cadastrado. Tente outro." });
            return;
        }
        // Gera a senha criptografada
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Criar um novo usuário
        let user = new user_model_1.User({
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
    }
    catch (error) {
        console.error(error); // Log do erro para debug no servidor
        res.status(500).json({ message: `Erro ao registrar o usuário: ${error}` });
    }
};
exports.registerUser = registerUser;
// Fazer login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Encontrar o usuário com base no email
        const user = await user_model_1.User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Email ou senha incorretos" });
            return;
        }
        // Comparar a senha fornecida com a senha criptografada
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Email ou senha incorretos" });
            return;
        }
        // Se o login for bem-sucedido, gera um token JWT e retorna
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" } // O token expira em 1 hora
        );
        res.json({ token });
    }
    catch (error) {
        console.error(error); // Log do erro para debug no servidor
        res.status(500).json({ message: `Erro ao logar: ${error}` });
    }
};
exports.loginUser = loginUser;
// Atualizar as informações do usuário
const updateUser = async (req, res) => {
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
        const updatedUser = await user_model_1.User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!updatedUser) {
            res.status(404).json({ message: "Usuário não encontrado" });
            return;
        }
        res
            .status(200)
            .json({ message: "Usuário atualizado com sucesso!", user: updatedUser });
    }
    catch (error) {
        console.error(error); // Log do erro para debug no servidor
        res.status(500).json({ message: "Erro ao atualizar o usuário", error });
    }
};
exports.updateUser = updateUser;
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
        const deletedUser = await user_model_1.User.findByIdAndDelete(req.params.id);
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
        const user = await user_model_1.User.findById(req.params.id);
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
        const user = await user_model_1.User.findById(req.params.id).select("name"); // Seleciona apenas o nome
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
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Pega o token do header
    if (!token) {
        res.status(401).json({ message: "Acesso não autorizado" });
        return;
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido" });
        }
        req.user = user; // Salva as informações do usuário no request
        next(); // Chama a próxima rota
    });
};
exports.authenticateToken = authenticateToken;
