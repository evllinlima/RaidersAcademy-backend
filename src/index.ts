import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import perguntasRoutes from './routes/perguntas.routes';
import respostasRoutes from './routes/respostas.routes';
import { setupSwagger } from './helpers/swagger';
import { connectToDatabase } from './helpers/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Conecta ao MongoDB
connectToDatabase().catch((err) => {
  console.error('Error during database connection:', err);
  process.exit(1); // Termina o processo em caso de falha
});

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
export default app;

// Server (opção para desenvolvimento local)
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
