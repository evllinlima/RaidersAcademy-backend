import { Request, Response } from "express";
import { Resposta } from "../models/respostas.models";

interface UserRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Criar uma nova resposta
export const criarResposta = async (req: UserRequest, res: Response): Promise<void> => {
  try {
    const { descricao, pergunta } = req.body; // Dados da resposta

    // Verifica se os dados obrigatórios foram fornecidos
    if (!descricao || !pergunta) {
      res.status(400).json({ message: "Descrição e pergunta são obrigatórios" });
      return;
    }

    // Cria uma nova resposta associada ao usuário autenticado
    const novaResposta = new Resposta({
      descricao,
      autor: req.user?.id, // Pega o ID do usuário autenticado
      pergunta, // ID da pergunta associada
    });

    // Salva a nova resposta no banco de dados
    const respostaSalva = await novaResposta.save();

    // Retorna a resposta criada como resposta
    res.status(201).json(respostaSalva);
  } catch (error) {
    res.status(500).json({ message: `Erro ao criar a resposta: ${error}` });
  }
};

// Atualizar uma resposta existente
export const atualizarResposta = async (req: UserRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // ID da resposta a ser atualizada
    const { descricao } = req.body; // Dados para atualização

    // Verifica se a descrição foi fornecida
    if (!descricao) {
      res.status(400).json({ message: "Descrição é obrigatória para atualização" });
      return;
    }

    // Atualiza a resposta no banco de dados
    const respostaAtualizada = await Resposta.findByIdAndUpdate(
      id,
      { descricao },
      { new: true } // Retorna a resposta atualizada após a modificação
    );

    if (!respostaAtualizada) {
      res.status(404).json({ message: "Resposta não encontrada" });
      return;
    }

    res.status(200).json(respostaAtualizada);
  } catch (error) {
    res.status(500).json({ message: `Erro ao atualizar resposta: ${error}` });
  }
};

// Deletar uma resposta
export const deletarResposta = async (req: UserRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // ID da resposta a ser deletada

    // Deleta a resposta no banco de dados
    const respostaDeletada = await Resposta.findByIdAndDelete(id);

    if (!respostaDeletada) {
      res.status(404).json({ message: "Resposta não encontrada" });
      return;
    }

    res.status(200).json({ message: "Resposta deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ message: `Erro ao deletar resposta: ${error}` });
  }
};

// Listar todas as respostas de uma pergunta
export const listarRespostasPorPergunta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { perguntaId } = req.params; // ID da pergunta para buscar as respostas

    // Busca todas as respostas associadas à pergunta
    const respostas = await Resposta.find({ pergunta: perguntaId }).populate("autor"); // Popula o autor com as informações do usuário

    res.status(200).json(respostas);
  } catch (error) {
    res.status(500).json({ message: `Erro ao listar respostas: ${error}` });
  }
};
