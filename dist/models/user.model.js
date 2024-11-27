"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Definição do esquema
const UsuarioSchema = new mongoose_1.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Curso",
        required: [function () { return this.tipo === "aluno"; }, "O campo curso é obrigatório para alunos."]
    },
    cursosProfessores: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: "Curso",
        required: [function () { return this.tipo === "professor"; }, "O campo cursosProfessores é obrigatório para professores."]
    },
    isAdmin: { type: Boolean, default: false },
});
// Exportação do modelo
exports.Usuario = mongoose_1.default.model("Usuario", UsuarioSchema);
