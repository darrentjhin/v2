import { Router, Request, Response } from 'express';
import bcrypt from "bcryptjs";
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { authRequired, AuthRequest } from '../middleware/auth';

export const authRouter: import("express").Router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: { code: 'VALIDATION', message: result.error.errors[0].message } });
    return;
  }
  const { email, password } = result.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: { code: 'CONFLICT', message: 'Email already registered.' } });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: { create: {} },
      settings: { create: {} },
    },
  });
  const token = signToken({ userId: user.id });
  res.status(201).json({ token, userId: user.id });
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: { code: 'VALIDATION', message: result.error.errors[0].message } });
    return;
  }
  const { email, password } = result.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } });
    return;
  }
  const token = signToken({ userId: user.id });
  res.json({ token, userId: user.id });
});

// GET /api/auth/me
authRouter.get('/me', authRequired, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true, email: true, plan: true, subscriptionStatus: true, currentPeriodEnd: true, createdAt: true,
      profile: true, settings: true,
    },
  });
  if (!user) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found.' } });
    return;
  }
  res.json(user);
});
