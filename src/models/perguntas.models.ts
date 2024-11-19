import mongoose, { Schema, Document } from "mongoose";

export interface IPergunta extends Document {
  titulo: string;
  descricao: string;
  autor: mongoose.Types.ObjectId;
  disciplina: mongoose.Types.ObjectId;
}

const PerguntaSchema = new Schema<IPergunta>({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  disciplina: { type: mongoose.Schema.Types.ObjectId, ref: "Disciplina", required: true },
});

export const Pergunta = mongoose.model<IPergunta>("Pergunta", PerguntaSchema);