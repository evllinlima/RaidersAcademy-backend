import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import perguntasRoutes from './routes/perguntas.routes';
import respostasRoutes from './routes/respostas.routes';
import dotenv from 'dotenv';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { setupSwagger } from './helpers/swagger';

dotenv.config();

const connectToDatabase = async () => {
  const mongoURI = process.env.MONGO_URI as string | undefined;

  if (!mongoURI) {
    console.error('Error: MONGODB_URI is not defined in the environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB successfully connected');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
};

const app = express();
const PORT = process.env.PORT || 3000;

connectToDatabase();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configura o Swagger
setupSwagger(app);

// Rotas
app.use('/api/v1', userRoutes);
app.use('/api/v1', adminRoutes);
app.use('/api/v1', perguntasRoutes);
app.use('/api/v1', respostasRoutes);

// Serverless para Vercel
export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};

// Server (opção para desenvolvimento local)
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
