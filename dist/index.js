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
const allowedOrigins = new Set([
    'http://localhost:4200',
    'https://poc-csp-front.vercel.app',
    ...(process.env.FRONTEND_ORIGIN?.split(',') ?? [])
]
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean));
app.use((0, cors_1.default)({ origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin.replace(/\/$/, ''))) {
            callback(null, true);
            return;
        }
        callback(new Error('Origin is not allowed by CORS'));
    } }));
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
