import axios from "axios";
import { createJWE, decryptJWEAndGetPayload } from '../util/jwe.js';
import AppError from "../routes/exception.js";

const SECRET_KEY = new Uint8Array(Buffer.from(process.env.SECRET_KEY, 'base64'));

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

const TEST_GITHUB_CLIENT_ID = process.env.TEST_GITHUB_CLIENT_ID;
const TEST_GITHUB_CLIENT_SECRET = process.env.TEST_GITHUB_CLIENT_SECRET;

const EXTENSION_ID = 'pmpjligbgooljdpakhophgddmcipglna';

const getGithubCredentials = (redirectUri) => redirectUri.includes(EXTENSION_ID)
  ? { clientId: GITHUB_CLIENT_ID, clientSecret: GITHUB_CLIENT_SECRET }
  : { clientId: TEST_GITHUB_CLIENT_ID, clientSecret: TEST_GITHUB_CLIENT_SECRET };

const fetchFromGithub = (proxyPath, githubToken) =>
  axios.get(`https://raw.githubusercontent.com/${proxyPath}`, {
    headers: { Authorization: `token ${githubToken}` },
    responseType: 'arraybuffer',
    validateStatus: () => true,
  });

export const getContent = async (user, repo, proxyPath, token) => {
  let response;

  if (token.startsWith("ey")) {
    let payload;
    try {
      payload = await decryptJWEAndGetPayload(token, SECRET_KEY);
    } catch {
      throw new AppError(401, 'Invalid Token');
    }

    const isValid =
      payload.user === user &&
      payload.repo === repo &&
      payload.exp > Math.floor(Date.now() / 1000);

    if (!isValid) throw new AppError(401, 'Invalid Token');
    if (!payload.token && (!payload.tokenList || !Array.isArray(payload.tokenList)))
      throw new AppError(401, 'Invalid Token');

    if (payload.token) {
      response = await fetchFromGithub(proxyPath, payload.token);
    } else {
      for (const githubToken of payload.tokenList) {
        response = await fetchFromGithub(proxyPath, githubToken);
        if (response.status === 200) break;
      }
    }
  } else {
    response = await fetchFromGithub(proxyPath, token);
  }

  return {
    contentType: response.headers['content-type'],
    status: response.status,
    data: Buffer.from(response.data),
  };
};

export const getToken = async (user, repo, githubToken, githubTokenList) => {
  const tokenPayload = githubToken ? { token: githubToken } : { tokenList: githubTokenList };
  return createJWE(
    { user, repo, ...tokenPayload, exp: Math.floor(Date.now() / 1000) + 3600 },
    SECRET_KEY
  );
};

export const getGithubAuthorizeUrl = (redirectUri) => {
  const { clientId } = getGithubCredentials(redirectUri);
  return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;
};

export const getGithubToken = async (code, redirectUri) => {
  const { clientId, clientSecret } = getGithubCredentials(redirectUri);
  try {
    const { data } = await axios.post(
      'https://github.com/login/oauth/access_token',
      { client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, code },
      { headers: { Accept: 'application/json' } }
    );
    if (data.error) throw new Error('auth_failed');
    console.log(data);
    return { token: data.access_token };
  } catch {
    throw new AppError(401, 'Invalid Authentication Information');
  }
};
