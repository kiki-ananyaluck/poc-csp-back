"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const config_js_1 = require("./config.js");
const csp_report_route_js_1 = require("./routes/csp-report.route.js");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: (origin, callback) => {
        if (!origin || config_js_1.allowedOrigins.has(origin.replace(/\/$/, ''))) {
            callback(null, true);
            return;
        }
        callback(new Error('Origin is not allowed by CORS'));
    } }));
app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', service: 'poc-csp-back' });
});
app.get('/api/message', (_request, response) => {
    response.json({ message: 'สวัสดีจาก Node.js backend' });
});
app.use(csp_report_route_js_1.cspReportRouter);
app.use((error, _request, response, _next) => {
    const bodyParserError = error;
    if (bodyParserError?.type === 'entity.too.large') {
        response.status(413).json({ error: 'payload_too_large' });
        return;
    }
    if (bodyParserError?.type === 'entity.parse.failed' || error instanceof SyntaxError) {
        response.status(400).json({ error: 'invalid_json' });
        return;
    }
    console.error(error);
    response.status(500).json({ error: 'internal_error' });
});
app.listen(config_js_1.port, () => {
    console.log(`API running at http://localhost:${config_js_1.port}`);
});
