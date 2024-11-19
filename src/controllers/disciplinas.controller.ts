import { Request, Response } from "express";
import { Disciplina } from "../models/disciplina.models"; // Certifique-se de que o caminho esteja correto

// Criar uma nova disciplina
export const criarDisciplina = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, curso } = req.body; // Desestrutura os dados enviados no corpo da requisição

    // Verifica se o nome e o curso foram fornecidos
    if (!nome || !curso) {
      res.status(400).json({ message: "Nome e curso são obrigatórios" });
      return;
    }

    // Cria a nova disciplina
    const novaDisciplina = new Disciplina({
      nome,
      curso, // O campo 'curso' pode ser enviado como uma string (ID do curso)
    });

    // Salva a disciplina no banco de dados
    const disciplinaSalva = await novaDisciplina.save();

    res.status(201).json(disciplinaSalva);
  } catch (error) {
    res.status(500).json({ message: `Erro ao criar disciplina: ${error}` });
  }
};

// Atualizar uma disciplina existente
export const atualizarDisciplina = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // ID da disciplina a ser atualizada
    const { nome, curso } = req.body; // Dados para atualizar

    // Verifica se os dados para atualização foram fornecidos
    if (!nome && !curso) {
      res.status(400).json({ message: "Nome ou curso devem ser fornecidos para atualização" });
      return;
    }

    // Atualiza a disciplina no banco de dados
    const disciplinaAtualizada = await Disciplina.findByIdAndUpdate(
      id,
      { nome, curso }, // Apenas nome e curso, sem conversão para ObjectId
      { new: true } // Retorna o objeto atualizado
    );

    if (!disciplinaAtualizada) {
      res.status(404).json({ message: "Disciplina não encontrada" });
      return;
    }

    res.status(200).json(disciplinaAtualizada);
  } catch (error) {
    res.status(500).json({ message: `Erro ao atualizar disciplina: ${error}` });
  }
};

// Deletar uma disciplina
export const deletarDisciplina = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // ID da disciplina a ser deletada

    // Deleta a disciplina no banco de dados
    const disciplinaDeletada = await Disciplina.findByIdAndDelete(id);

    if (!disciplinaDeletada) {
      res.status(404).json({ message: "Disciplina não encontrada" });
      return;
    }

    res.status(200).json({ message: "Disciplina deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ message: `Erro ao deletar disciplina: ${error}` });
  }
};

// Listar todas as disciplinas
export const listarDisciplinas = async (req: Request, res: Response): Promise<void> => {
  try {
    const disciplinas = await Disciplina.find(); // Busca todas as disciplinas no banco de dados

    res.status(200).json(disciplinas);
  } catch (error) {
    res.status(500).json({ message: `Erro ao listar disciplinas: ${error}` });
  }
};
