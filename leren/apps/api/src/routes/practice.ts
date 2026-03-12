import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authRequired, AuthRequest } from '../middleware/auth';
import { generatePracticeProblems, checkAnswer } from '../ai/provider';

export const practiceRouter: import("express").Router = Router();
practiceRouter.use(authRequired);

const generateSchema = z.object({
  subject: z.string().min(1).max(100),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  count: z.number().int().min(1).max(20).default(5),
});

practiceRouter.post('/generate', async (req: AuthRequest, res: Response): Promise<void> => {
  const r = generateSchema.safeParse(req.body);
  if (!r.success) { res.status(400).json({ error: { code: 'VALIDATION', message: r.error.errors[0].message } }); return; }

  const problems = await generatePracticeProblems(r.data.subject, r.data.difficulty, r.data.count);
  const set = await prisma.practiceSet.create({
    data: {
      userId: req.userId!,
      subject: r.data.subject,
      difficulty: r.data.difficulty,
      problems: { create: problems },
    },
    include: { problems: true },
  });
  res.status(201).json(set);
});

practiceRouter.get('/sets', async (req: AuthRequest, res: Response): Promise<void> => {
  const sets = await prisma.practiceSet.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { problems: true } } },
  });
  res.json(sets);
});

practiceRouter.get('/sets/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const set = await prisma.practiceSet.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    include: { problems: true },
  });
  if (!set) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Set not found.' } }); return; }
  res.json(set);
});

const attemptSchema = z.object({ problemId: z.string(), answer: z.string().min(1) });

practiceRouter.post('/attempt', async (req: AuthRequest, res: Response): Promise<void> => {
  const r = attemptSchema.safeParse(req.body);
  if (!r.success) { res.status(400).json({ error: { code: 'VALIDATION', message: r.error.errors[0].message } }); return; }

  const problem = await prisma.practiceProblem.findUnique({ where: { id: r.data.problemId } });
  if (!problem) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Problem not found.' } }); return; }

  const { isCorrect, feedback } = await checkAnswer(problem.prompt, problem.solution, r.data.answer);
  const attempt = await prisma.attempt.create({
    data: { problemId: r.data.problemId, userId: req.userId!, answer: r.data.answer, isCorrect, feedback },
  });
  res.status(201).json(attempt);
});
