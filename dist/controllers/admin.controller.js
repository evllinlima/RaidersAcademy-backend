"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("../models/user.model");
// Registrar um novo administrador
const registerAdmin = async (req, res) => {
    const { nome, email, senha, cpf } = req.body;
    try {
        // Verificar se já existe um administrador cadastrado no sistema
        const existeAdmin = await user_model_1.Usuario.findOne({ isAdmin: true });
        // Se já existe um administrador, apenas outro administrador pode registrar novos
        if (existeAdmin && (!req.user || !req.user?.isAdmin)) {
            res.status(403).json({ message: "Apenas administradores podem registrar novos administradores." });
            return;
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
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao registrar administrador: ${error}` });
    }
};
exports.registerAdmin = registerAdmin;
