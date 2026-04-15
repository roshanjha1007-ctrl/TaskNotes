import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './middleware/errorHandler';
import { requestContext } from './middleware/requestContext';

const app = express();
const PORT = process.env.PORT ?? 4000;

// ─── Security / Logging ───────────────────────────────────────────────────────

app.use(helmet());
app.use(requestContext);
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  }),
);
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: Number(process.env.RATE_LIMIT_MAX ?? 120),
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(morgan(':method :url :status :response-time ms req=:req[x-request-id]'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// 404 catch-all
app.use((_req, _res, next) => {
  next(new AppError(404, 'Route not found.'));
});

// Global error handler (must be last)
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅  TaskNotes API running on http://localhost:${PORT}`);
});

export default app;
