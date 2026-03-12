import { Router, Response, Request } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { authRequired, AuthRequest } from '../middleware/auth';
import { logger } from '../lib/logger';

export const billingRouter: import("express").Router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2023-10-16' });

billingRouter.post('/create-checkout-session', authRequired, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found.' } }); return; }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.CLIENT_URL}/app/settings?plan=upgraded`,
    cancel_url: `${process.env.CLIENT_URL}/app/settings`,
    metadata: { userId: user.id },
  });

  res.json({ url: session.url });
});

billingRouter.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '');
  } catch {
    res.status(400).send('Webhook signature failed');
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (userId) {
      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: 'PRO',
          subscriptionStatus: sub.status,
          currentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000),
        },
      });
      logger.info({ userId }, 'User upgraded to PRO');
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    await prisma.user.updateMany({
      where: { subscriptionStatus: sub.status },
      data: { plan: 'FREE', subscriptionStatus: 'canceled' },
    });
  }

  res.json({ received: true });
});
