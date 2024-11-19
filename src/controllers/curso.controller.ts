import { Request, Response } from "express";
import { Curso } from "../models/curso.models";

export const criarCurso = async (req: Request, res: Response) => {
  try {
    const { nome, campus } = req.body;

    const novoCurso = new Curso({ nome, campus });
    const cursoSalvo = await novoCurso.save();

    res.status(201).json(cursoSalvo);
  } catch (error) {
    res.status(500).json({ message: `Erro ao criar curso: ${error}` });
  }
};

export const atualizarCurso = async (req: Request, res: Response) : Promise<void> =>  {
  try {
    const { id } = req.params; // Recebe o ID do curso a ser atualizado
    const { nome, campus } = req.body; // Recebe os dados a serem atualizados

    // Atualiza o curso no banco de dados
    const cursoAtualizado = await Curso.findByIdAndUpdate(
      id, 
      { nome, campus }, 
      { new: true } // Retorna o curso atualizado após a modificação
    );

    if (!cursoAtualizado) {
      res.status(404).json({ message: "Curso não encontrado" });
      return;
    }

    res.status(200).json(cursoAtualizado);
  } catch (error) {
    res.status(500).json({ message: `Erro ao atualizar curso: ${error}` });
  }
};

export const deletarCurso = async (req: Request, res: Response) : Promise<void> => {
  try {
    const { id } = req.params; // Recebe o ID do curso a ser deletado

    // Deleta o curso no banco de dados
    const cursoDeletado = await Curso.findByIdAndDelete(id);

    if (!cursoDeletado) {
      res.status(404).json({ message: "Curso não encontrado" });
      return;
    }

    res.status(200).json({ message: "Curso deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: `Erro ao deletar curso: ${error}` });
  }
};

export const listarCursos = async (req: Request, res: Response) => {
  try {
    const cursos = await Curso.find(); // Busca todos os cursos no banco de dados

    res.status(200).json(cursos);
  } catch (error) {
    res.status(500).json({ message: `Erro ao listar cursos: ${error}` });
  }
};