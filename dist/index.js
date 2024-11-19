"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const perguntas_routes_1 = __importDefault(require("./routes/perguntas.routes"));
const respostas_routes_1 = __importDefault(require("./routes/respostas.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_1 = require("./helpers/swagger");
dotenv_1.default.config();
const connectToDatabase = async () => {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
        console.error('Error: MONGODB_URI is not defined in the environment variables.');
        process.exit(1);
    }
    try {
        await mongoose_1.default.connect(mongoURI);
        console.log('MongoDB successfully connected');
    }
    catch (err) {
        console.error('Failed to connect to MongoDB:', err instanceof Error ? err.message : err);
        process.exit(1);
    }
};
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
connectToDatabase();
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Configura o Swagger
(0, swagger_1.setupSwagger)(app);
// Rotas
app.use('/api/v1', user_routes_1.default);
app.use('/api/v1', admin_routes_1.default);
app.use('/api/v1', perguntas_routes_1.default);
app.use('/api/v1', respostas_routes_1.default);
// Serverless para Vercel
exports.default = async (req, res) => {
    return app(req, res);
};
// Server (opção para desenvolvimento local)
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
