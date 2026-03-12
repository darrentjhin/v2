import 'dotenv/config';
import 'express-async-errors'; // must be first — forwards unhandled async errors to errorHandler
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { logger } from './lib/logger';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { profileRouter } from './routes/profile';
import { settingsRouter } from './routes/settings';
import { tutorRouter } from './routes/tutor';
import { savedRouter } from './routes/saved';
import { practiceRouter } from './routes/practice';
import { progressRouter } from './routes/progress';
import { assignmentsRouter } from './routes/assignments';
import { subjectsRouter } from './routes/subjects';
import { teacherRouter } from './routes/teacher';
import { billingRouter } from './routes/billing';
import { contactRouter } from './routes/contact';

const app: import('express').Application = express();
const PORT = parseInt(process.env.PORT ?? '4000');

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api/', rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }));
app.use('/api/tutor/', rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false }));

// ── Request ID + logging ───────────────────────────────────────────────────────
app.use((req, res, next) => {
  const reqId = uuidv4();
  (req as express.Request & { id: string }).id = reqId;
  const start = Date.now();
  res.on('finish', () => {
    logger.info({ reqId, method: req.method, url: req.url, status: res.statusCode, ms: Date.now() - start });
  });
  next();
});

// ── Body parsers ───────────────────────────────────────────────────────────────
// Stripe webhook needs raw body
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static file serving for uploads ──────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/tutor', tutorRouter);
app.use('/api/saved', savedRouter);
app.use('/api/practice', practiceRouter);
app.use('/api/progress', progressRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/billing', billingRouter);
app.use('/api/contact', contactRouter);

// ── Error handler ──────────────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Leren API running on http://localhost:${PORT}`);
});

export default app;
