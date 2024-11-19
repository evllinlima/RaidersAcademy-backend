"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
// Configurações do Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Raiders Academy API',
            version: '1.0.0',
            description: 'Documentação da API da Raiders Academy',
        },
        servers: [
            {
                url: 'raiders-academy-backend.vercel.app',
            },
        ],
    },
    apis: ['./dist/routes/*.{ts,js}'],
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
const setupSwagger = (app) => {
    app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
    console.log('Swagger disponível em /docs');
};
exports.setupSwagger = setupSwagger;
