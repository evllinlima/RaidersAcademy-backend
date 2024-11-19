import mongoose, { Schema, Document } from "mongoose";

export interface IDisciplina extends Document {
  nome: string;
  curso: mongoose.Types.ObjectId;
}

const DisciplinaSchema: Schema = new Schema({
  nome: { type: String, required: true },
  curso: { type: mongoose.Schema.Types.ObjectId, ref: "Curso", required: true },
});

export const Disciplina = mongoose.model<IDisciplina>("Disciplina", DisciplinaSchema);