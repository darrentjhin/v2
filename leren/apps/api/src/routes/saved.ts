import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authRequired, AuthRequest } from '../middleware/auth';

export const savedRouter: import("express").Router = Router();
savedRouter.use(authRequired);

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

savedRouter.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const r = createSchema.safeParse(req.body);
  if (!r.success) { res.status(400).json({ error: { code: 'VALIDATION', message: r.error.errors[0].message } }); return; }
  const item = await prisma.savedExplanation.create({
    data: { userId: req.userId!, ...r.data, tags: JSON.stringify(r.data.tags) },
  });
  res.status(201).json({ ...item, tags: JSON.parse(item.tags) });
});

savedRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { q, page = '1', pageSize = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(pageSize);
  const where = { userId: req.userId!, ...(q ? { title: { contains: q } } : {}) };
  const [items, total] = await Promise.all([
    prisma.savedExplanation.findMany({ where, skip, take: parseInt(pageSize), orderBy: { createdAt: 'desc' } }),
    prisma.savedExplanation.count({ where }),
  ]);
  res.json({ data: items.map(i => ({ ...i, tags: JSON.parse(i.tags) })), total, page: parseInt(page), pageSize: parseInt(pageSize) });
});

savedRouter.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const item = await prisma.savedExplanation.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!item) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found.' } }); return; }
  res.json({ ...item, tags: JSON.parse(item.tags) });
});

savedRouter.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.savedExplanation.deleteMany({ where: { id: req.params.id, userId: req.userId! } });
  res.status(204).send();
});
