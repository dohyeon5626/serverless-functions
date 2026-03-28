import asyncHandler from 'express-async-handler';
import { Router } from 'express';
import AppError from './exception';
import { createAction } from '../service/service';

const router = Router();

router.post('/verification', asyncHandler(async (req, res) => {
  const { token, verificationTimeout, owner, repo, issueNumber, prNumber, commentId } = req.body as {
    token?: string;
    verificationTimeout?: number;
    owner?: string;
    repo?: string;
    issueNumber?: number;
    prNumber?: number;
    commentId: number;
  };

  if (!token || verificationTimeout === undefined || !owner || !repo) throw new AppError(400, 'Bad Request');
  if (verificationTimeout < 5 || verificationTimeout > 60) throw new AppError(400, 'verificationTimeout must be between 5 and 60');

  const hasIssue = issueNumber !== undefined;
  const hasPr = prNumber !== undefined;
  if (hasIssue === hasPr) throw new AppError(400, 'Exactly one of issueNumber or prNumber must be provided');

  const id = await createAction({ token, verificationTimeout, owner, repo, issueNumber, prNumber, commentId });
  res.status(201).json({ id });
}));

export default router;
