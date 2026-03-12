import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authRequired, AuthRequest } from '../middleware/auth';

export const teacherRouter: import("express").Router = Router();
teacherRouter.use(authRequired);

teacherRouter.post('/classrooms', async (req: AuthRequest, res: Response): Promise<void> => {
  const r = z.object({ name: z.string().min(1).max(120) }).safeParse(req.body);
  if (!r.success) { res.status(400).json({ error: { code: 'VALIDATION', message: r.error.errors[0].message } }); return; }
  const classroom = await prisma.classroom.create({ data: { name: r.data.name, teacherUserId: req.userId! } });
  res.status(201).json(classroom);
});

teacherRouter.get('/classrooms', async (req: AuthRequest, res: Response): Promise<void> => {
  const classrooms = await prisma.classroom.findMany({
    where: { teacherUserId: req.userId! },
    include: { _count: { select: { enrollments: true, classAssignments: true } } },
  });
  res.json(classrooms);
});

teacherRouter.post('/classrooms/:id/enroll', async (req: AuthRequest, res: Response): Promise<void> => {
  const classroom = await prisma.classroom.findFirst({ where: { id: req.params.id, teacherUserId: req.userId! } });
  if (!classroom) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Classroom not found.' } }); return; }

  const r = z.object({ studentEmail: z.string().email() }).safeParse(req.body);
  if (!r.success) { res.status(400).json({ error: { code: 'VALIDATION', message: r.error.errors[0].message } }); return; }

  const student = await prisma.user.findUnique({ where: { email: r.data.studentEmail } });
  if (!student) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Student not found. They must register first.' } }); return; }

  const enrollment = await prisma.enrollment.upsert({
    where: { classroomId_studentUserId: { classroomId: classroom.id, studentUserId: student.id } },
    create: { classroomId: classroom.id, studentUserId: student.id },
    update: {},
  });
  res.status(201).json(enrollment);
});

teacherRouter.post('/classrooms/:id/assign-set', async (req: AuthRequest, res: Response): Promise<void> => {
  const classroom = await prisma.classroom.findFirst({ where: { id: req.params.id, teacherUserId: req.userId! } });
  if (!classroom) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Classroom not found.' } }); return; }

  const r = z.object({ practiceSetId: z.string(), dueDate: z.string().optional() }).safeParse(req.body);
  if (!r.success) { res.status(400).json({ error: { code: 'VALIDATION', message: r.error.errors[0].message } }); return; }

  const ca = await prisma.classAssignment.create({
    data: { classroomId: classroom.id, practiceSetId: r.data.practiceSetId, dueDate: r.data.dueDate ? new Date(r.data.dueDate) : null },
  });
  res.status(201).json(ca);
});

teacherRouter.get('/classrooms/:id/analytics', async (req: AuthRequest, res: Response): Promise<void> => {
  const classroom = await prisma.classroom.findFirst({
    where: { id: req.params.id, teacherUserId: req.userId! },
    include: { enrollments: true },
  });
  if (!classroom) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Classroom not found.' } }); return; }

  const studentIds = classroom.enrollments.map(e => e.studentUserId);
  const attempts = await prisma.attempt.findMany({
    where: { userId: { in: studentIds } },
    include: { problem: { include: { set: true } } },
  });

  const total = attempts.length;
  const correct = attempts.filter(a => a.isCorrect).length;
  const subjectStats: Record<string, { correct: number; total: number }> = {};
  for (const a of attempts) {
    const s = a.problem.set.subject;
    if (!subjectStats[s]) subjectStats[s] = { correct: 0, total: 0 };
    subjectStats[s].total++;
    if (a.isCorrect) subjectStats[s].correct++;
  }

  res.json({
    studentCount: studentIds.length,
    totalAttempts: total,
    overallAccuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    subjectStats: Object.entries(subjectStats).map(([subject, v]) => ({
      subject, ...v, accuracy: Math.round((v.correct / v.total) * 100),
    })),
  });
});
