import asyncHandler from 'express-async-handler';
import { Router } from 'express';
import AppError from './exception';
import { createSubscription, cancelSubscription } from '../service/service';
import { DayName } from '../util/code';

const router = Router();

router.post('/subscription', asyncHandler(async (req, res) => {
  const { userId, email, sendTime, sendDays } = req.body as {
    userId: string;
    email: string;
    sendTime: string;
    sendDays: DayName[];
  };

  if (!userId || !email || !sendTime || !sendDays) throw new AppError(404, 'Bad Request');

  await createSubscription({ userId, email, sendTime, sendDays });
  res.status(201).json({});
}));

router.delete('/subscription', asyncHandler(async (req, res) => {
  const { email } = req.query as { email?: string };

  if (!email) throw new AppError(404, 'Bad Request');

  await cancelSubscription(email);
  res.status(204).json({});
}));

export default router;
