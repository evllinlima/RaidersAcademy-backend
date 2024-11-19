import mongoose, { Schema, Document } from "mongoose";

export interface ICurso extends Document {
  nome: string;
  campus: mongoose.Types.ObjectId;
}

const CursoSchema: Schema = new Schema({
  nome: { type: String, required: true },
  campus: { type: mongoose.Schema.Types.ObjectId, ref: "Campus", required: true },
});

export const Curso = mongoose.model<ICurso>("Curso", CursoSchema);