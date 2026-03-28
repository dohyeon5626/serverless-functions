import asyncHandler from 'express-async-handler';
import { Router } from 'express';
import AppError from './exception';
import { createAction } from '../service/service';

const router = Router();

router.post('/verification', asyncHandler(async (req, res) => {
  const { token, verificationTimeout, owner, repo } = req.body as {
    token?: string;
    verificationTimeout?: number;
    owner?: string;
    repo?: string;
  };

  if (!token || verificationTimeout === undefined || !owner || !repo) throw new AppError(400, 'Bad Request');
  if (verificationTimeout < 5 || verificationTimeout > 60) throw new AppError(400, 'verificationTimeout must be between 5 and 60');

  const id = await createAction({ token, verificationTimeout, owner, repo });
  res.status(201).json({ id });
}));

export default router;
