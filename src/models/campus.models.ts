import mongoose, { Schema, Document } from "mongoose";

export interface ICampus extends Document {
  nome: string;
  localizacao: string;
}

const CampusSchema: Schema = new Schema({
  nome: { type: String, required: true },
  localizacao: { type: String, required: true },
});

export const Campus = mongoose.model<ICampus>("Campus", CampusSchema);