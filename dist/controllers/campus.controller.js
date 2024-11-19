"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarCampus = exports.deletarCampus = exports.atualizarCampus = exports.criarCampus = void 0;
const campus_models_1 = require("../models/campus.models");
const criarCampus = async (req, res) => {
    try {
        const { nome, localizacao } = req.body;
        const novoCampus = new campus_models_1.Campus({ nome, localizacao });
        const campusSalvo = await novoCampus.save();
        res.status(201).json(campusSalvo);
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao criar campus: ${error}` });
    }
};
exports.criarCampus = criarCampus;
const atualizarCampus = async (req, res) => {
    try {
        const { id } = req.params;
        const campusAtualizado = await campus_models_1.Campus.findByIdAndUpdate(id, req.body, { new: true });
        if (!campusAtualizado) {
            res.status(404).json({ message: "Campus não encontrado" });
            return;
        }
        res.status(200).json(campusAtualizado);
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao atualizar campus: ${error}` });
    }
};
exports.atualizarCampus = atualizarCampus;
const deletarCampus = async (req, res) => {
    try {
        const { id } = req.params;
        const campusDeletado = await campus_models_1.Campus.findByIdAndDelete(id);
        if (!campusDeletado) {
            res.status(404).json({ message: "Campus não encontrado" });
            return;
        }
        res.status(200).json({ message: "Campus deletado com sucesso!" });
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao deletar campus: ${error}` });
    }
};
exports.deletarCampus = deletarCampus;
const listarCampus = async (req, res) => {
    try {
        // Busca todos os campus no banco de dados
        const campus = await campus_models_1.Campus.find();
        if (!campus || campus.length === 0) {
            res.status(404).json({ message: "Nenhum campus encontrado" });
            return;
        }
        res.status(200).json(campus);
    }
    catch (error) {
        res.status(500).json({ message: `Erro ao listar campus: ${error}` });
    }
};
exports.listarCampus = listarCampus;
