import asyncHandler from 'express-async-handler';
import { Router } from "express";
import AppError from './exception.js';
import { createSubscription, cancelSubscription } from '../service/service.js';

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

router.delete("/subscription", asyncHandler(async (req, res) => {
  const { 
    email
  } = req.query;
  
  if (!email) {
    throw new AppError(404, 'Bad Request');
  }
  
  await cancelSubscription(email);
  return res.status(204).json();
}));

export default router;