"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletarPergunta = exports.atualizarPergunta = exports.listarPerguntasPorDisciplina = exports.criarPergunta = void 0;
const perguntas_models_1 = require("../models/perguntas.models");
const criarPergunta = async (req, res) => {
    try {
        const { titulo, descricao, disciplina } = req.body;
        // Verifica se os dados obrigatórios foram fornecidos
        if (!titulo || !descricao || !disciplina) {
            res.status(400).json({ message: "Título, descrição e disciplina são obrigatórios" });
            return;
        }
        // Cria uma nova pergunta associada ao usuário autenticado
        const novaPergunta = new perguntas_models_1.Pergunta({
            titulo,
            descricao,
            autor: req.user?.id, // Pega o ID do usuário autenticado
            disciplina,
        });
        // Salva a nova pergunta no banco de dados
        const perguntaSalva = await novaPergunta.save();
        // Retorna a pergunta criada como resposta
        res.status(201).json(perguntaSalva);
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao criar a pergunta: ${error}` });
    }
};
exports.criarPergunta = criarPergunta;
const listarPerguntasPorDisciplina = async (req, res) => {
    try {
        const { disciplinaId } = req.params;
        const perguntas = await perguntas_models_1.Pergunta.find({ disciplina: disciplinaId }).populate("autor");
        res.status(200).json(perguntas);
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao listar perguntas" });
    }
};
exports.listarPerguntasPorDisciplina = listarPerguntasPorDisciplina;
const atualizarPergunta = async (req, res) => {
    try {
        const { id } = req.params; // ID da pergunta a ser atualizada
        const { titulo, descricao, disciplina } = req.body; // Dados para atualização
        // Atualiza a pergunta
        const perguntaAtualizada = await perguntas_models_1.Pergunta.findByIdAndUpdate(id, { titulo, descricao, disciplina }, { new: true } // Retorna o documento atualizado
        );
        if (!perguntaAtualizada) {
            res.status(404).json({ message: "Pergunta não encontrada" });
            return;
        }
        res.status(200).json(perguntaAtualizada);
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao atualizar a pergunta: ${error}` });
    }
};
exports.atualizarPergunta = atualizarPergunta;
const deletarPergunta = async (req, res) => {
    try {
        const { id } = req.params; // ID da pergunta a ser deletada
        // Deleta a pergunta
        const perguntaDeletada = await perguntas_models_1.Pergunta.findByIdAndDelete(id);
        if (!perguntaDeletada) {
            res.status(404).json({ message: "Pergunta não encontrada" });
            return;
        }
        res.status(200).json({ message: "Pergunta deletada com sucesso" });
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao deletar a pergunta: ${error}` });
    }
};
exports.deletarPergunta = deletarPergunta;
