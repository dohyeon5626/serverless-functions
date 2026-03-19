import asyncHandler from 'express-async-handler';
import multer from 'multer';
import { Router } from 'express';
import { createSubscription, getSubscriptionById, getSubscriptionStatus } from '../service/service';
import AppError from './exception';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/subscription',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const { recipients, senderName, senderEmail, message, openDate, usePasswordKey, originalHeader } = req.body as {
      recipients: string;
      senderName: string;
      senderEmail: string;
      message: string;
      openDate: string;
      usePasswordKey: string;
      originalHeader?: string;
    };

    if (!recipients || !senderName || !senderEmail || !message || !openDate || !usePasswordKey) {
      throw new AppError(404, 'Bad Request');
    }
    if (Number(openDate) <= new Date().getTime()) {
      throw new AppError(404, 'Bad Request');
    }

    const capsuleData = {
      recipients: JSON.parse(recipients),
      senderName,
      senderEmail,
      message,
      openDate: Number(openDate),
      usePasswordKey: usePasswordKey === 'true',
      originalHeader,
    };

    res.status(201).json({ id: await createSubscription(capsuleData, req.file ?? null) });
  }));

router.get('/subscription/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    res.status(200).json(await getSubscriptionById(id));
  }));

router.get('/subscription-status',
  asyncHandler(async (_req, res) => {
    res.status(200).json(await getSubscriptionStatus());
  }));

export default router;
