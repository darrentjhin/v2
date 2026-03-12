import { Router, type Response } from 'express';
import nodemailer from 'nodemailer';
import { z } from 'zod';

import { authRequired, type AuthRequest } from '../middleware/auth';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';

export const contactRouter: import('express').Router = Router();

const CONTACT_TO = process.env.CONTACT_TO ?? 'lerenai.cs@gmail.com';

const contactSchema = z.object({
  name: z.string().min(1).max(120).trim(),
  email: z.string().email().max(200),
  message: z.string().min(1).max(4000),
});

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

// Public: submit contact form. Always saved to DB; email sent only if configured.
contactRouter.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { code: 'VALIDATION', message: parsed.error.errors[0].message } });
    return;
  }

  const { name, email, message } = parsed.data;

  const words = countWords(message);
  if (words > 250) {
    res.status(400).json({ error: { code: 'VALIDATION', message: 'Message must be 250 words or fewer.' } });
    return;
  }

  // Always save to DB so you never lose a message
  await prisma.contactSubmission.create({
    data: { name, email, message, wordCount: words },
  });

  const authUser = process.env.CONTACT_USER || process.env.SMTP_USER;
  const authPass = process.env.CONTACT_PASS || process.env.SMTP_PASS;

  if (authUser && authPass) {
    const userAgent = req.headers['user-agent'] ?? 'unknown';
    const fromIp = req.ip ?? req.headers['x-forwarded-for'] ?? 'unknown';
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: authUser, pass: authPass },
    });
    const subject = `New contact from ${name}`;
    const plain = [
      `New contact message from Leren landing page`,
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      `Words: ${words}`,
      '',
      'Message:',
      message,
      '',
      `User Agent: ${userAgent}`,
      `IP: ${fromIp}`,
    ].join('\n');
    try {
      await transporter.sendMail({
        from: `"Leren Contact" <${authUser}>`,
        to: CONTACT_TO,
        replyTo: email,
        subject,
        text: plain,
      });
    } catch (err: unknown) {
      logger.error({ err: err instanceof Error ? err.message : err }, 'Contact form: failed to send email');
      // Still 200 - message was saved to DB
    }
  } else {
    logger.info({ name, email, words }, 'Contact message saved (email not configured)');
  }

  res.status(200).json({ ok: true });
});

// Protected: list contact submissions (for viewing in app)
contactRouter.get('/submissions', authRequired, async (req: AuthRequest, res: Response): Promise<void> => {
  const list = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  res.json(list);
});
