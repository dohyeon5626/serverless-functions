import asyncHandler from 'express-async-handler';
import { Router } from "express";
import AppError from './exception.js';
import { createSubscription } from '../service/service.js';

const router = Router();

router.post("/subscription", asyncHandler(async (req, res) => {
  const { 
    userId, 
    email, 
    sendTime, 
    problemCount,
    sendDays
  } = req.body;
  
  if (!userId || !email || !sendTime || !problemCount || !sendDays) {
    throw new AppError(404, 'Bad Request');
  }
  
  await createSubscription({
    userId, 
    email, 
    sendTime,
    problemCount,
    sendDays
  });

  return res.status(201).json();
}));

export default router;