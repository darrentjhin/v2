import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authRequired, AuthRequest } from '../middleware/auth';

export const settingsRouter: import("express").Router = Router();
settingsRouter.use(authRequired);

const updateSchema = z.object({
  uiLanguage: z.string().max(10).optional(),
  tutorLanguage: z.string().max(10).optional(),
  bilingualMode: z.boolean().optional(),
  voice: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']).optional(),
  voiceSpeed: z.number().min(0.5).max(2.0).optional(),
  autoReplySeconds: z.number().int().min(1).max(10).optional(),
  storeHistory: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
});

settingsRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const settings = await prisma.settings.upsert({
    where: { userId: req.userId! },
    create: { userId: req.userId! },
    update: {},
  });
  res.json(settings);
});

settingsRouter.patch('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: { code: 'VALIDATION', message: result.error.errors[0].message } });
    return;
  }
  const settings = await prisma.settings.upsert({
    where: { userId: req.userId! },
    create: { userId: req.userId!, ...result.data },
    update: result.data,
  });
  res.json(settings);
});
