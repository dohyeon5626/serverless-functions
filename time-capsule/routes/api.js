import asyncHandler from 'express-async-handler';
import multer from 'multer';
import { Router } from "express";
import { createSubscription, getSubscriptionById, getSubscriptionStatus } from '../service/service.js'
import AppError from './exception.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/subscription",
  upload.single('image'), 
  asyncHandler(async (req, res) => {
    const { 
        recipients, 
        senderName, 
        senderEmail, 
        message, 
        openDate, 
        usePasswordKey,
        originalHeader
    } = req.body;
    
    if (!recipients || !senderName || !senderEmail || !message || !openDate || !usePasswordKey) {
      throw new AppError(404, 'Bad Request');
    }
    if (openDate <= new Date().getTime()) {
      throw new AppError(404, 'Bad Request');
    }
    
    const capsuleData = {
        recipients: JSON.parse(recipients), 
        senderName,
        senderEmail,
        message,
        openDate : Number(openDate),
        usePasswordKey: usePasswordKey === 'true',
        originalHeader
    };

    return res.status(201).json({ 
        id: await createSubscription(capsuleData, req.file || null)
    });
  }));

router.get("/subscription/:id", 
  asyncHandler(async (req, res) => {
    const { id } = req.params; 
    return res.status(200).json(await getSubscriptionById(id));
  }));

router.get("/subscription-status", 
  asyncHandler(async (req, res) => {
    return res.status(200).json(await getSubscriptionStatus());
  }));


export default router;