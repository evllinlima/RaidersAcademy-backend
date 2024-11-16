"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const user_controller_2 = require("../controllers/user.controller");
const router = express_1.default.Router();
// Rotas de registro/login
router.post("/register", user_controller_1.registerUser);
router.post("/login", user_controller_1.loginUser);
// Rotas protegidas. Utilizando o JWT para autenticação
router.put("/user/:id", user_controller_2.authenticateToken, user_controller_1.updateUser);
router.delete("/user/:id", user_controller_2.authenticateToken, user_controller_1.deleteUser);
router.get("/user/:id", user_controller_2.authenticateToken, user_controller_1.getUser);
// Rota públicas
router.get("/user/public/:id", user_controller_1.getPublicProfile);
exports.default = router;
