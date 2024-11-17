import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from './routes/user.routes';
import dotenv from 'dotenv';
import { VercelRequest, VercelResponse } from '@vercel/node';

dotenv.config();

const connectToDatabase = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;

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

// Routes
app.use('/api/v1', userRoutes);

// Serverless
export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};

// Server outra opção de conexão
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
