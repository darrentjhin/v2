import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authRequired, AuthRequest } from '../middleware/auth';

export const profileRouter: import("express").Router = Router();
profileRouter.use(authRequired);

const updateSchema = z.object({
  fullName: z.string().max(120).optional(),
  school: z.string().max(120).optional(),
  major: z.string().max(120).optional(),
  gradeLevel: z.string().max(60).optional(),
  nativeLanguage: z.string().max(60).optional(),
  targetLanguage: z.string().max(60).optional(),
});

profileRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await prisma.profile.upsert({
    where: { userId: req.userId! },
    create: { userId: req.userId! },
    update: {},
  });
  res.json(profile);
});

profileRouter.patch('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: { code: 'VALIDATION', message: result.error.errors[0].message } });
    return;
  }
  const profile = await prisma.profile.upsert({
    where: { userId: req.userId! },
    create: { userId: req.userId!, ...result.data },
    update: result.data,
  });
  res.json(profile);
});
