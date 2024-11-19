"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarDisciplinas = exports.deletarDisciplina = exports.atualizarDisciplina = exports.criarDisciplina = void 0;
const disciplina_models_1 = require("../models/disciplina.models"); // Certifique-se de que o caminho esteja correto
// Criar uma nova disciplina
const criarDisciplina = async (req, res) => {
    try {
        const { nome, curso } = req.body; // Desestrutura os dados enviados no corpo da requisição
        // Verifica se o nome e o curso foram fornecidos
        if (!nome || !curso) {
            res.status(400).json({ message: "Nome e curso são obrigatórios" });
            return;
        }
        // Cria a nova disciplina
        const novaDisciplina = new disciplina_models_1.Disciplina({
            nome,
            curso, // O campo 'curso' pode ser enviado como uma string (ID do curso)
        });
        // Salva a disciplina no banco de dados
        const disciplinaSalva = await novaDisciplina.save();
        res.status(201).json(disciplinaSalva);
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao criar disciplina: ${error}` });
    }
};
exports.criarDisciplina = criarDisciplina;
// Atualizar uma disciplina existente
const atualizarDisciplina = async (req, res) => {
    try {
        const { id } = req.params; // ID da disciplina a ser atualizada
        const { nome, curso } = req.body; // Dados para atualizar
        // Verifica se os dados para atualização foram fornecidos
        if (!nome && !curso) {
            res.status(400).json({ message: "Nome ou curso devem ser fornecidos para atualização" });
            return;
        }
        // Atualiza a disciplina no banco de dados
        const disciplinaAtualizada = await disciplina_models_1.Disciplina.findByIdAndUpdate(id, { nome, curso }, // Apenas nome e curso, sem conversão para ObjectId
        { new: true } // Retorna o objeto atualizado
        );
        if (!disciplinaAtualizada) {
            res.status(404).json({ message: "Disciplina não encontrada" });
            return;
        }
        res.status(200).json(disciplinaAtualizada);
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao atualizar disciplina: ${error}` });
    }
};
exports.atualizarDisciplina = atualizarDisciplina;
// Deletar uma disciplina
const deletarDisciplina = async (req, res) => {
    try {
        const { id } = req.params; // ID da disciplina a ser deletada
        // Deleta a disciplina no banco de dados
        const disciplinaDeletada = await disciplina_models_1.Disciplina.findByIdAndDelete(id);
        if (!disciplinaDeletada) {
            res.status(404).json({ message: "Disciplina não encontrada" });
            return;
        }
        res.status(200).json({ message: "Disciplina deletada com sucesso" });
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao deletar disciplina: ${error}` });
    }
};
exports.deletarDisciplina = deletarDisciplina;
// Listar todas as disciplinas
const listarDisciplinas = async (req, res) => {
    try {
        const disciplinas = await disciplina_models_1.Disciplina.find(); // Busca todas as disciplinas no banco de dados
        res.status(200).json(disciplinas);
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao listar disciplinas: ${error}` });
    }
};
exports.listarDisciplinas = listarDisciplinas;
