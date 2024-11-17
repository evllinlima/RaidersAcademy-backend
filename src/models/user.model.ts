import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, max: 100 },
  email: { type: String, required: true, max: 100 },
  password: { type: String, required: true },
});

export const User = mongoose.model("User", UserSchema);