import mongoose, { Schema, Document } from "mongoose";

export interface IResposta extends Document {
  descricao: string;
  autor: mongoose.Types.ObjectId; // Referência ao usuário
  pergunta: mongoose.Types.ObjectId; // Relacionada a uma pergunta
}

const RespostaSchema = new Schema<IResposta>({
  descricao: { type: String, required: true },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  pergunta: { type: mongoose.Schema.Types.ObjectId, ref: "Pergunta", required: true },
});

export const Resposta = mongoose.model<IResposta>("Resposta", RespostaSchema);