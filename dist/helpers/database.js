"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectToDatabase = async () => {
    if (process.env.NODE_ENV === 'test') {
        console.log('Skipping database connection in test environment');
        return;
    }
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
        throw new Error('MONGO_URI is not defined in the environment variables.');
    }
    try {
        await mongoose_1.default.connect(mongoURI);
        console.log('MongoDB successfully connected');
    }
    catch (err) {
        console.error('Failed to connect to MongoDB:', err instanceof Error ? err.message : err);
        throw err;
    }
};
exports.connectToDatabase = connectToDatabase;
