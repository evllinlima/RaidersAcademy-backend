"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarCursos = exports.deletarCurso = exports.atualizarCurso = exports.criarCurso = void 0;
const curso_models_1 = require("../models/curso.models");
const criarCurso = async (req, res) => {
    try {
        const { nome, campus } = req.body;
        const novoCurso = new curso_models_1.Curso({ nome, campus });
        const cursoSalvo = await novoCurso.save();
        res.status(201).json(cursoSalvo);
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao criar curso: ${error}` });
    }
};
exports.criarCurso = criarCurso;
const atualizarCurso = async (req, res) => {
    try {
        const { id } = req.params; // Recebe o ID do curso a ser atualizado
        const { nome, campus } = req.body; // Recebe os dados a serem atualizados
        // Atualiza o curso no banco de dados
        const cursoAtualizado = await curso_models_1.Curso.findByIdAndUpdate(id, { nome, campus }, { new: true } // Retorna o curso atualizado após a modificação
        );
        if (!cursoAtualizado) {
            res.status(404).json({ message: "Curso não encontrado" });
            return;
        }
        res.status(200).json(cursoAtualizado);
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao atualizar curso: ${error}` });
    }
};
exports.atualizarCurso = atualizarCurso;
const deletarCurso = async (req, res) => {
    try {
        const { id } = req.params; // Recebe o ID do curso a ser deletado
        // Deleta o curso no banco de dados
        const cursoDeletado = await curso_models_1.Curso.findByIdAndDelete(id);
        if (!cursoDeletado) {
            res.status(404).json({ message: "Curso não encontrado" });
            return;
        }
        res.status(200).json({ message: "Curso deletado com sucesso" });
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao deletar curso: ${error}` });
    }
};
exports.deletarCurso = deletarCurso;
const listarCursos = async (req, res) => {
    try {
        const cursos = await curso_models_1.Curso.find(); // Busca todos os cursos no banco de dados
        res.status(200).json(cursos);
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao listar cursos: ${error}` });
    }
};
exports.listarCursos = listarCursos;
