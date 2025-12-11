import asyncHandler from 'express-async-handler';
import multer from 'multer';
import { Router } from "express";
import { createSubscription } from '../service/service.js'
import AppError from './exception.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/subscription",
  upload.single('image'), 
  asyncHandler(async (req, res) => {
    const { 
        recipients, 
        senderName, 
        senderPhone, 
        message, 
        openDate, 
        usePasswordKey
    } = req.body;
    
    if (!recipients || !senderName || !senderPhone || !message || !openDate || !usePasswordKey) {
      throw new AppError(404, 'Bad Request');
    }
    
    const capsuleData = {
        recipients: JSON.parse(recipients), 
        senderName,
        senderPhone,
        message,
        openDate,
        usePasswordKey: usePasswordKey === 'true',
        imageFile: req.file || null
    };

    return res.status(201).json({ 
        id: await createSubscription(capsuleData)
    });
  }));


export default router;