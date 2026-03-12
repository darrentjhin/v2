import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authRequired, AuthRequest } from '../middleware/auth';
import { generatePracticeFromSubject, generateSubjectSummary, extractTextFromFile } from '../ai/provider';

export const subjectsRouter: import('express').Router = Router();
subjectsRouter.use(authRequired);

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain'];
    cb(null, allowed.includes(file.mimetype));
  },
});
const uploadSingle = upload.single('file');
const uploadMulti  = upload.array('files', 10);

// ─── SPECIFIC ROUTES FIRST (before /:id) ────────────────────────────────────

// GET /api/subjects — list active subjects only
subjectsRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const subjects = await prisma.subject.findMany({
    where: { userId: req.userId!, status: 'active' },
    orderBy: { createdAt: 'desc' },
    include: { files: { where: { status: 'active' }, orderBy: { createdAt: 'asc' } } },
  });
  res.json(subjects);
});

// GET /api/subjects/archived — list archived subjects
subjectsRouter.get('/archived', async (req: AuthRequest, res: Response): Promise<void> => {
  const subjects = await prisma.subject.findMany({
    where: { userId: req.userId!, status: 'archived' },
    orderBy: { createdAt: 'desc' },
    include: { files: { where: { status: 'active' }, orderBy: { createdAt: 'asc' } } },
  });
  res.json(subjects);
});

// GET /api/subjects/trashed — list trashed subjects (auto-purge >10 days old)
subjectsRouter.get('/trashed', async (req: AuthRequest, res: Response): Promise<void> => {
  const cutoff = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  // Purge expired trash first
  const expired = await prisma.subject.findMany({
    where: { userId: req.userId!, status: 'trashed', trashedAt: { lte: cutoff } },
    include: { files: true },
  });
  for (const s of expired) {
    for (const f of s.files) {
      const fp = path.join(process.cwd(), f.fileUrl);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    await prisma.subject.delete({ where: { id: s.id } });
  }
  const subjects = await prisma.subject.findMany({
    where: { userId: req.userId!, status: 'trashed' },
    orderBy: { trashedAt: 'desc' },
    include: { files: { where: { status: 'active' }, orderBy: { createdAt: 'asc' } } },
  });
  res.json(subjects);
});

// GET /api/subjects/files/trashed — list all individually-trashed files for the user
subjectsRouter.get('/files/trashed', async (req: AuthRequest, res: Response): Promise<void> => {
  const TRASH_DAYS = 10;
  const cutoff = new Date(Date.now() - TRASH_DAYS * 24 * 60 * 60 * 1000);

  // Purge expired trashed files
  const expired = await prisma.subjectFile.findMany({
    where: {
      subject: { userId: req.userId! },
      status: 'trashed',
      trashedAt: { lte: cutoff },
    },
  });
  for (const f of expired) {
    const fp = path.join(process.cwd(), f.fileUrl);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
    await prisma.subjectFile.delete({ where: { id: f.id } });
  }

  const files = await prisma.subjectFile.findMany({
    where: {
      subject: { userId: req.userId! },
      status: 'trashed',
    },
    include: { subject: { select: { id: true, name: true } } },
    orderBy: { trashedAt: 'desc' },
  });
  res.json(files);
});

// POST /api/subjects — create a new subject
const createSchema = z.object({ name: z.string().min(1).max(100).trim() });

subjectsRouter.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const r = createSchema.safeParse(req.body);
  if (!r.success) {
    res.status(400).json({ error: { code: 'VALIDATION', message: r.error.errors[0].message } });
    return;
  }
  const subject = await prisma.subject.create({
    data: { userId: req.userId!, name: r.data.name },
    include: { files: true },
  });
  res.status(201).json(subject);
});

// ─── SUBJECT-LEVEL PATCH ROUTES ─────────────────────────────────────────────

// PATCH /api/subjects/:id/archive
subjectsRouter.patch('/:id/archive', async (req: AuthRequest, res: Response): Promise<void> => {
  const subject = await prisma.subject.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!subject) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subject not found.' } }); return; }
  const updated = await prisma.subject.update({
    where: { id: subject.id },
    data: { status: 'archived', trashedAt: null },
    include: { files: { where: { status: 'active' } } },
  });
  res.json(updated);
});

// PATCH /api/subjects/:id/trash
subjectsRouter.patch('/:id/trash', async (req: AuthRequest, res: Response): Promise<void> => {
  const subject = await prisma.subject.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!subject) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subject not found.' } }); return; }
  const updated = await prisma.subject.update({
    where: { id: subject.id },
    data: { status: 'trashed', trashedAt: new Date() },
    include: { files: { where: { status: 'active' } } },
  });
  res.json(updated);
});

// PATCH /api/subjects/:id/restore — back to active
subjectsRouter.patch('/:id/restore', async (req: AuthRequest, res: Response): Promise<void> => {
  const subject = await prisma.subject.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!subject) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subject not found.' } }); return; }
  const updated = await prisma.subject.update({
    where: { id: subject.id },
    data: { status: 'active', trashedAt: null },
    include: { files: { where: { status: 'active' } } },
  });
  res.json(updated);
});

// DELETE /api/subjects/:id
subjectsRouter.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const subject = await prisma.subject.findFirst({ where: { id: req.params.id, userId: req.userId! }, include: { files: true } });
  if (!subject) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subject not found.' } }); return; }

  for (const f of subject.files) {
    const fp = path.join(process.cwd(), f.fileUrl);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  await prisma.subject.delete({ where: { id: subject.id } });
  res.status(204).send();
});

// ─── /:id DYNAMIC ROUTE ──────────────────────────────────────────────────────

// GET /api/subjects/:id — single subject with files and recent sessions
subjectsRouter.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const subject = await prisma.subject.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    include: {
      files: { where: { status: 'active' }, orderBy: { createdAt: 'asc' } },
      sessions: {
        orderBy: { startedAt: 'desc' },
        take: 5,
        include: { _count: { select: { turns: true } } },
      },
    },
  });
  if (!subject) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subject not found.' } }); return; }
  res.json(subject);
});

// POST /api/subjects/:id/summary — generate AI summary from uploaded files
subjectsRouter.post('/:id/summary', async (req: AuthRequest, res: Response): Promise<void> => {
  const subject = await prisma.subject.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    include: { files: { where: { status: 'active' } } },
  });
  if (!subject) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subject not found.' } }); return; }
  if (subject.files.length === 0) {
    res.status(400).json({ error: { code: 'NO_FILES', message: 'Upload some materials first.' } }); return;
  }

  const fileContexts: Array<{ type: 'text' | 'image' | 'pdf'; content: string }> = [];
  for (const f of subject.files) {
    if (f.extractedText) {
      fileContexts.push({ type: 'text', content: f.extractedText });
    } else {
      const fp = path.join(process.cwd(), f.fileUrl);
      if (fs.existsSync(fp)) fileContexts.push({ type: f.fileType as 'image' | 'pdf', content: fs.readFileSync(fp).toString('base64') });
    }
  }

  const summary = await generateSubjectSummary(subject.name, fileContexts);
  const updated = await prisma.subject.update({ where: { id: subject.id }, data: { summary } });
  res.json({ summary: updated.summary });
});

// ─── FILE ROUTES UNDER /:id ──────────────────────────────────────────────────

// POST /api/subjects/:id/files — upload one or more files to a subject
subjectsRouter.post('/:id/files', (req: AuthRequest, res: Response): void => {
  const isMulti = req.headers['content-type']?.includes('multipart') &&
    (req.headers['x-multi-upload'] === '1' || true);
  const middleware = isMulti ? uploadMulti : uploadSingle;

  middleware(req as any, res, async (err) => {
    if (err) { res.status(400).json({ error: { code: 'UPLOAD_ERROR', message: err.message } }); return; }

    const rawFiles: Express.Multer.File[] = [];
    if (Array.isArray((req as any).files) && (req as any).files.length > 0) rawFiles.push(...(req as any).files);
    else if ((req as any).file) rawFiles.push((req as any).file);

    if (rawFiles.length === 0) {
      res.status(400).json({ error: { code: 'MISSING_FILE', message: 'At least one file required.' } }); return;
    }

    const subject = await prisma.subject.findFirst({ where: { id: req.params.id, userId: req.userId! } });
    if (!subject) {
      rawFiles.forEach(f => fs.existsSync(f.path) && fs.unlinkSync(f.path));
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subject not found.' } }); return;
    }

    const created = await Promise.all(rawFiles.map(async (f) => {
      const mime = f.mimetype;
      const fileType = mime === 'text/plain' ? 'text' : mime === 'application/pdf' ? 'pdf' : 'image';
      let extractedText: string | null = null;
      try {
        const fileBase64 = fs.readFileSync(f.path).toString('base64');
        extractedText = await extractTextFromFile(fileBase64, mime, f.originalname);
      } catch { /* non-critical */ }
      return prisma.subjectFile.create({
        data: {
          subjectId: subject.id,
          fileName: f.originalname,
          fileUrl: `/uploads/${f.filename}`,
          fileType,
          extractedText,
        },
      });
    }));

    res.status(201).json(created.length === 1 ? created[0] : created);
  });
});

// PATCH /api/subjects/:id/files/:fileId/trash — move a file to trash
subjectsRouter.patch('/:id/files/:fileId/trash', async (req: AuthRequest, res: Response): Promise<void> => {
  const subject = await prisma.subject.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!subject) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subject not found.' } }); return; }

  const file = await prisma.subjectFile.findFirst({ where: { id: req.params.fileId, subjectId: subject.id } });
  if (!file) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'File not found.' } }); return; }

  const updated = await prisma.subjectFile.update({
    where: { id: file.id },
    data: { status: 'trashed', trashedAt: new Date() },
    include: { subject: { select: { id: true, name: true } } },
  });
  res.json(updated);
});

// PATCH /api/subjects/:id/files/:fileId/restore — restore a file from trash
subjectsRouter.patch('/:id/files/:fileId/restore', async (req: AuthRequest, res: Response): Promise<void> => {
  const subject = await prisma.subject.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!subject) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subject not found.' } }); return; }

  const file = await prisma.subjectFile.findFirst({ where: { id: req.params.fileId, subjectId: subject.id } });
  if (!file) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'File not found.' } }); return; }

  const updated = await prisma.subjectFile.update({
    where: { id: file.id },
    data: { status: 'active', trashedAt: null },
  });
  res.json(updated);
});

// DELETE /api/subjects/:id/files/:fileId — permanently delete a file
subjectsRouter.delete('/:id/files/:fileId', async (req: AuthRequest, res: Response): Promise<void> => {
  const subject = await prisma.subject.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!subject) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subject not found.' } }); return; }

  const file = await prisma.subjectFile.findFirst({ where: { id: req.params.fileId, subjectId: subject.id } });
  if (!file) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'File not found.' } }); return; }

  const fp = path.join(process.cwd(), file.fileUrl);
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
  await prisma.subjectFile.delete({ where: { id: file.id } });
  res.status(204).send();
});

// POST /api/subjects/:id/practice — generate a practice exam
const practiceSchema = z.object({
  count:      z.number().int().min(1).max(50).default(10),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
});

subjectsRouter.post('/:id/practice', async (req: AuthRequest, res: Response): Promise<void> => {
  const r = practiceSchema.safeParse(req.body);
  if (!r.success) {
    res.status(400).json({ error: { code: 'VALIDATION', message: r.error.errors[0].message } });
    return;
  }

  const subject = await prisma.subject.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    include: { files: { where: { status: 'active' } } },
  });
  if (!subject) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subject not found.' } }); return; }

  const fileContexts: Array<{ type: 'text' | 'image' | 'pdf'; content: string }> = [];
  for (const f of subject.files) {
    if (f.extractedText) {
      fileContexts.push({ type: 'text', content: f.extractedText });
    } else {
      const fp = path.join(process.cwd(), f.fileUrl);
      if (fs.existsSync(fp)) {
        const b64 = fs.readFileSync(fp).toString('base64');
        fileContexts.push({ type: f.fileType as 'image' | 'pdf', content: b64 });
      }
    }
  }

  const problems = await generatePracticeFromSubject(subject.name, fileContexts, r.data.difficulty, r.data.count);

  const set = await prisma.practiceSet.create({
    data: {
      userId: req.userId!,
      subject: subject.name,
      difficulty: r.data.difficulty,
      problems: { create: problems },
    },
    include: { problems: true },
  });

  res.status(201).json(set);
});
