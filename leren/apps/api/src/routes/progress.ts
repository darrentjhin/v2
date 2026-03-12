import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authRequired, AuthRequest } from '../middleware/auth';

export const progressRouter: import("express").Router = Router();
progressRouter.use(authRequired);

progressRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const [attempts, sessions] = await Promise.all([
    prisma.attempt.findMany({
      where: { userId: req.userId! },
      include: { problem: { include: { set: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.tutorSession.findMany({
      where: { userId: req.userId!, endedAt: { not: null } },
      orderBy: { startedAt: 'asc' },
    }),
  ]);

  const total = attempts.length;
  const correct = attempts.filter(a => a.isCorrect).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Streak: consecutive days with at least one attempt
  const days = [...new Set(attempts.map(a => a.createdAt.toISOString().split('T')[0]))].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  for (let i = 0; i < days.length; i++) {
    const d = new Date(days[i]);
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (d.toISOString().split('T')[0] === expected.toISOString().split('T')[0]) { streak++; } else { break; }
  }

  // Timeseries: attempts per day
  const timeseries: Record<string, { correct: number; total: number }> = {};
  for (const a of attempts) {
    const day = a.createdAt.toISOString().split('T')[0];
    if (!timeseries[day]) timeseries[day] = { correct: 0, total: 0 };
    timeseries[day].total++;
    if (a.isCorrect) timeseries[day].correct++;
  }

  // Weak topics: subjects with accuracy < 60%
  const subjectStats: Record<string, { correct: number; total: number }> = {};
  for (const a of attempts) {
    const s = a.problem.set.subject;
    if (!subjectStats[s]) subjectStats[s] = { correct: 0, total: 0 };
    subjectStats[s].total++;
    if (a.isCorrect) subjectStats[s].correct++;
  }
  const weakTopics = Object.entries(subjectStats)
    .filter(([, v]) => v.total >= 3 && v.correct / v.total < 0.6)
    .map(([subject, v]) => ({ subject, accuracy: Math.round((v.correct / v.total) * 100) }));

  res.json({
    total, correct, accuracy, streak,
    sessionCount: sessions.length,
    timeseries: Object.entries(timeseries).map(([date, v]) => ({ date, ...v })),
    subjectStats: Object.entries(subjectStats).map(([subject, v]) => ({
      subject, ...v, accuracy: Math.round((v.correct / v.total) * 100),
    })),
    weakTopics,
  });
});
