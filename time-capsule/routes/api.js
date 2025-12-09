import asyncHandler from 'express-async-handler';
import { Router } from "express";
import AppError from './exception.js';

const router = Router();

router.get("/test", asyncHandler(async (req, res) => {
  return res.status(200).json({"timestamp": new Date()});
}));


export default router;