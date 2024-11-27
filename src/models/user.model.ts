import mongoose, { Schema, Document } from "mongoose";
import { ICurso } from "./curso.models";

// Definição da interface para o usuário
export interface IUsuario extends Document {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  tipo: "aluno" | "professor" | "administrador";
  curso?: mongoose.Types.ObjectId | ICurso;
  cursosProfessores?: mongoose.Types.ObjectId[] | ICurso[];
  isAdmin: boolean;
}

// Definição do esquema
const UsuarioSchema: Schema = new Schema({
  nome: { type: String, required: true, max: 100 },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  tipo: { 
    type: String, 
    enum: ["aluno", "professor", "administrador"], 
    required: true 
  },
  curso: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Curso", 
    required: [function (this: IUsuario) { return this.tipo === "aluno"; }, "O campo curso é obrigatório para alunos."]
  },
  cursosProfessores: { 
    type: [mongoose.Schema.Types.ObjectId], 
    ref: "Curso", 
    required: [function (this: IUsuario) { return this.tipo === "professor"; }, "O campo cursosProfessores é obrigatório para professores."]
  },
  isAdmin: { type: Boolean, default: false },
});

// Exportação do modelo
export const Usuario = mongoose.model<IUsuario>("Usuario", UsuarioSchema);
