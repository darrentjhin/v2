import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authRequired, AuthRequest } from '../middleware/auth';
import { transcribeAudio, generateTutorReply } from '../ai/provider';
import { logger } from '../lib/logger';

export const tutorRouter: import("express").Router = Router();
tutorRouter.use(authRequired);

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', 'image/png', 'image/jpeg'];
    cb(null, allowed.includes(file.mimetype));
  },
}).fields([{ name: 'audio', maxCount: 1 }, { name: 'screenshot', maxCount: 1 }]);

// POST /api/tutor/session — create session
tutorRouter.post('/session', async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await prisma.tutorSession.create({
    data: {
      userId:    req.userId!,
      title:     req.body.title ?? null,
      subjectId: req.body.subjectId ?? null,
    },
  });
  res.status(201).json(session);
});

// GET /api/tutor/sessions — list sessions
tutorRouter.get('/sessions', async (req: AuthRequest, res: Response): Promise<void> => {
  const sessions = await prisma.tutorSession.findMany({
    where: { userId: req.userId! },
    orderBy: { startedAt: 'desc' },
    take: 50,
    include: { _count: { select: { turns: true } } },
  });
  res.json(sessions);
});

// GET /api/tutor/session/:id — get session with turns
tutorRouter.get('/session/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await prisma.tutorSession.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    include: { turns: { orderBy: { createdAt: 'asc' } } },
  });
  if (!session) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Session not found.' } }); return; }
  res.json(session);
});

// PATCH /api/tutor/session/:id/end — end session
tutorRouter.patch('/session/:id/end', async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await prisma.tutorSession.updateMany({
    where: { id: req.params.id, userId: req.userId! },
    data: { endedAt: new Date() },
  });
  res.json({ updated: session.count });
});

// POST /api/tutor/session/:id/turn — upload audio + screenshot turn
tutorRouter.post('/session/:id/turn', (req: AuthRequest, res: Response): void => {
  upload(req, res, async (err) => {
    if (err) { res.status(400).json({ error: { code: 'UPLOAD_ERROR', message: err.message } }); return; }

    const files = req.files as { audio?: Express.Multer.File[]; screenshot?: Express.Multer.File[] };
    const audioFile = files?.audio?.[0];
    const screenshotFile = files?.screenshot?.[0];

    if (!audioFile) { res.status(400).json({ error: { code: 'MISSING_AUDIO', message: 'Audio file is required.' } }); return; }

    const session = await prisma.tutorSession.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!session) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Session not found.' } }); return; }

    const audioUrl = `/uploads/${audioFile.filename}`;
    const screenshotUrl = screenshotFile ? `/uploads/${screenshotFile.filename}` : null;

    const turn = await prisma.tutorTurn.create({
      data: { sessionId: session.id, role: 'USER', text: '', audioUrl, screenshotUrl },
    });

    res.status(201).json(turn);

    // Fire-and-forget: transcribe + reply in background
    setImmediate(async () => {
      try {
        const text = await transcribeAudio(audioFile.path);
        await prisma.tutorTurn.update({ where: { id: turn.id }, data: { text } });

        const settings = await prisma.settings.findUnique({ where: { userId: req.userId! } });
        const recentTurns = await prisma.tutorTurn.findMany({
          where: { sessionId: session.id },
          orderBy: { createdAt: 'asc' },
          take: 10,
        });
        const context = recentTurns.map(t => `${t.role}: ${t.text}`).join('\n');

        let screenshotBase64: string | undefined;
        if (screenshotFile) {
          screenshotBase64 = fs.readFileSync(screenshotFile.path).toString('base64');
        }

        const replyText = await generateTutorReply({
          userText: text,
          screenshotBase64,
          tutorLanguage: settings?.tutorLanguage,
          bilingualMode: settings?.bilingualMode,
          sessionContext: context,
        });

        await prisma.tutorTurn.create({
          data: { sessionId: session.id, role: 'TUTOR', text: replyText },
        });
      } catch (e) {
        logger.error({ err: e }, 'Background turn processing failed');
      }
    });
  });
});

// GET /api/tutor/session/:id/poll — poll for latest turns (for real-time feel)
tutorRouter.get('/session/:id/poll', async (req: AuthRequest, res: Response): Promise<void> => {
  const since = req.query.since ? new Date(req.query.since as string) : new Date(0);
  const turns = await prisma.tutorTurn.findMany({
    where: { sessionId: req.params.id, createdAt: { gt: since } },
    orderBy: { createdAt: 'asc' },
  });
  res.json(turns);
});
