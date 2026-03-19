import asyncHandler from 'express-async-handler';
import { Router } from 'express';
import { getContent, getToken, getGithubAuthorizeUrl, getGithubToken } from '../service/service';
import AppError from './exception';

const router = Router();

router.get('/content/:token/*', asyncHandler(async (req, res) => {
  const { token } = req.params;
  const proxyPath = req.params[0];

  if (!token || !proxyPath) throw new AppError(404, 'Bad Request');
  const pathList = proxyPath.split('/');
  if (pathList.length < 2) throw new AppError(404, 'Bad Request');

  const response = await getContent(pathList[0], pathList[1], proxyPath, token);
  res.setHeader('Content-Type', response.contentType);
  res.status(response.status).send(response.data);
}));

router.post('/token', asyncHandler(async (req, res) => {
  const { user, repo, token: githubToken, tokenList: githubTokenList } = req.body as {
    user: string;
    repo: string;
    token?: string;
    tokenList?: string[];
  };

  if (!githubToken && (!githubTokenList || !Array.isArray(githubTokenList))) throw new AppError(404, 'Bad Request');
  if (!user || !repo) throw new AppError(404, 'Bad Request');

  res.status(200).json({ token: await getToken(user, repo, githubToken, githubTokenList) });
}));

router.get('/github-oauth/authorize', (req, res) => {
  const { redirectUri } = req.query as { redirectUri?: string };
  if (!redirectUri) throw new AppError(404, 'Bad Request');
  res.redirect(getGithubAuthorizeUrl(redirectUri));
});

router.post('/github-oauth/token', asyncHandler(async (req, res) => {
  const { code, redirectUri } = req.query as { code?: string; redirectUri?: string };
  if (!code || !redirectUri) throw new AppError(404, 'Bad Request');
  res.status(200).json(await getGithubToken(code, redirectUri));
}));

export default router;
