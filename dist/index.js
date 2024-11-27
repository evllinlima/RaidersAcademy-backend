"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const perguntas_routes_1 = __importDefault(require("./routes/perguntas.routes"));
const respostas_routes_1 = __importDefault(require("./routes/respostas.routes"));
const swagger_1 = require("./helpers/swagger");
const database_1 = require("./helpers/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Conecta ao MongoDB
(0, database_1.connectToDatabase)().catch((err) => {
    console.error('Error during database connection:', err);
    process.exit(1); // Termina o processo em caso de falha
});
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
exports.default = app;
// Server (opção para desenvolvimento local)
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
