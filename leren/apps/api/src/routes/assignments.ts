import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';
import { authRequired, AuthRequest } from '../middleware/auth';
import { analyzeAssignment } from '../ai/provider';

export const assignmentsRouter: import("express").Router = Router();
assignmentsRouter.use(authRequired);

const uploadsDir = path.join(process.cwd(), 'uploads');
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
}).single('file');

assignmentsRouter.post('/upload', (req: AuthRequest, res: Response): void => {
  upload(req, res, async (err) => {
    if (err) { res.status(400).json({ error: { code: 'UPLOAD_ERROR', message: err.message } }); return; }
    if (!req.file) { res.status(400).json({ error: { code: 'MISSING_FILE', message: 'File required.' } }); return; }

    const assignment = await prisma.assignment.create({
      data: {
        userId: req.userId!,
        fileUrl: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        status: 'PENDING',
      },
    });
    res.status(201).json(assignment);
  });
});

assignmentsRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const items = await prisma.assignment.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
  });
  res.json(items.map(i => ({ ...i, questions: i.questions ? JSON.parse(i.questions) : [] })));
});

assignmentsRouter.post('/:id/analyze', async (req: AuthRequest, res: Response): Promise<void> => {
  const assignment = await prisma.assignment.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!assignment) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Assignment not found.' } }); return; }

  const filePath = path.join(process.cwd(), assignment.fileUrl);
  if (!fs.existsSync(filePath)) { res.status(404).json({ error: { code: 'FILE_NOT_FOUND', message: 'File missing.' } }); return; }

  const mimeType = assignment.fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
  const base64 = fs.readFileSync(filePath).toString('base64');
  const { summary, questions } = await analyzeAssignment(base64, mimeType);

  const updated = await prisma.assignment.update({
    where: { id: assignment.id },
    data: { status: 'ANALYZED', summary, questions: JSON.stringify(questions) },
  });
  res.json({ ...updated, questions });
});
