import mongoose, { Schema, Document } from "mongoose";

// Definição da interface para o usuário
export interface IUsuario extends Document {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  tipo: "aluno" | "professor" | "administrador"; // Define os tipos permitidos
  curso?: string; // Curso para alunos
  cursosProfessores?: string[]; // Cursos que um professor ministra
  isAdmin: boolean; // Indica se o usuário é um administrador
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
    type: String, 
    required: [function (this: IUsuario) { return this.tipo === "aluno"; }, "O campo curso é obrigatório para alunos."] 
  },
  cursosProfessores: { 
    type: [String], 
    required: [function (this: IUsuario) { return this.tipo === "professor"; }, "O campo cursosProfessores é obrigatório para professores."] 
  },
  isAdmin: { type: Boolean, default: false },
});

// Exportação do modelo
export const Usuario = mongoose.model<IUsuario>("Usuario", UsuarioSchema);