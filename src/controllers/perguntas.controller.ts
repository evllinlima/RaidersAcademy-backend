import { Request, Response } from "express";
import { Pergunta } from "../models/perguntas.models";

interface UserRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const criarPergunta = async (req: UserRequest, res: Response): Promise<void> => {
  try {
    const { titulo, descricao, disciplina } = req.body;

    // Verifica se os dados obrigatórios foram fornecidos
    if (!titulo || !descricao || !disciplina) {
      res.status(400).json({ message: "Título, descrição e disciplina são obrigatórios" });
      return;
    }

    // Cria uma nova pergunta associada ao usuário autenticado
    const novaPergunta = new Pergunta({
      titulo,
      descricao,
      autor: req.user?.id, // Pega o ID do usuário autenticado
      disciplina,
    });

    // Salva a nova pergunta no banco de dados
    const perguntaSalva = await novaPergunta.save();

    // Retorna a pergunta criada como resposta
    res.status(201).json(perguntaSalva);
  } catch (error) {
    res.status(500).json({ message: `Erro ao criar a pergunta: ${error}` });
  }
};

export const buscarPerguntaPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const pergunta = await Pergunta.findById(id).populate('disciplina');

    if (!pergunta) {
      res.status(404).json({ message: "Pergunta não encontrada" });
      return;
    }

    res.status(200).json(pergunta);
  } catch (error) {
    res.status(500).json({ message: `Erro ao buscar pergunta: ${error}` });
  }
};



export const listarPerguntasPorDisciplina = async (req: Request, res: Response) => {
  try {
    const { disciplinaId } = req.params;

    const perguntas = await Pergunta.find({ disciplina: disciplinaId }).populate("autor");
    res.status(200).json(perguntas);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar perguntas" });
  }
};


export const atualizarPergunta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // ID da pergunta a ser atualizada
    const { titulo, descricao, disciplina } = req.body; // Dados para atualização

    // Atualiza a pergunta
    const perguntaAtualizada = await Pergunta.findByIdAndUpdate(
      id,
      { titulo, descricao, disciplina },
      { new: true } // Retorna o documento atualizado
    );

    if (!perguntaAtualizada) {
      res.status(404).json({ message: "Pergunta não encontrada" });
      return;
    }

    res.status(200).json(perguntaAtualizada);
  } catch (error) {
    res.status(500).json({ message: `Erro ao atualizar a pergunta: ${error}` });
  }
};

export const deletarPergunta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // ID da pergunta a ser deletada

    // Deleta a pergunta
    const perguntaDeletada = await Pergunta.findByIdAndDelete(id);

    if (!perguntaDeletada) {
      res.status(404).json({ message: "Pergunta não encontrada" });
      return;
    }

    res.status(200).json({ message: "Pergunta deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ message: `Erro ao deletar a pergunta: ${error}` });
  }
};

