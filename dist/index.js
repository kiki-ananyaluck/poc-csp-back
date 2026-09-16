"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 3000);
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:4200' }));
app.use(express_1.default.json());
app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', service: 'poc-csp-back' });
});
app.get('/api/message', (_request, response) => {
    response.json({ message: 'สวัสดีจาก Node.js backend' });
});
app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
});
