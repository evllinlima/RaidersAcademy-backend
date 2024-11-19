import { Request, Response } from "express";
import { Campus } from "../models/campus.models";

export const criarCampus = async (req: Request, res: Response) => {
  try {
    const { nome, localizacao } = req.body;

    const novoCampus = new Campus({ nome, localizacao });
    const campusSalvo = await novoCampus.save();

    res.status(201).json(campusSalvo);
  } catch (error) {
    res.status(500).json({ message: `Erro ao criar campus: ${error}` });
  }
};

export const atualizarCampus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campusAtualizado = await Campus.findByIdAndUpdate(id, req.body, { new: true });

    if (!campusAtualizado) {
      res.status(404).json({ message: "Campus não encontrado" });
      return;
    }

    res.status(200).json(campusAtualizado);
  } catch (error) {
    res.status(500).json({ message: `Erro ao atualizar campus: ${error}` });
  }
};

export const deletarCampus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const campusDeletado = await Campus.findByIdAndDelete(id);

    if (!campusDeletado) {
      res.status(404).json({ message: "Campus não encontrado" });
      return;
    }

    res.status(200).json({ message: "Campus deletado com sucesso!" });
  } catch (error) {
    res.status(500).json({ message: `Erro ao deletar campus: ${error}` });
  }
};

export const listarCampus = async (req: Request, res: Response) : Promise<void> => {
  try {
    // Busca todos os campus no banco de dados
    const campus = await Campus.find();

    if (!campus || campus.length === 0) {
      res.status(404).json({ message: "Nenhum campus encontrado" });
      return;
    }

    res.status(200).json(campus);
  } catch (error) {
    res.status(500).json({ message: `Erro ao listar campus: ${error}` });
  }
};