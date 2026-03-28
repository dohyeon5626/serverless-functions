import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { saveAction, getAction, deleteAction } from '../plugin/repository';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;
const ALGORITHM = 'aes-256-gcm';

const encryptToken = (token: string): string => {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
};

export interface CreateActionInput {
  token: string;
  verificationTimeout: number;
  owner: string;
  repo: string;
  issueNumber?: number;
  prNumber?: number;
  commentId: number;
}

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET as string;

const decryptToken = (encrypted: string): string => {
  const [ivHex, authTagHex, encryptedHex] = encrypted.split(':');
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  return decipher.update(encryptedHex, 'hex', 'utf8') + decipher.final('utf8');
};

const verifyTurnstile = async (turnstileToken: string): Promise<boolean> => {
  const res = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    secret: TURNSTILE_SECRET,
    response: turnstileToken,
  });
  return res.data.success === true;
};

export const verifyAction = async (id: string, turnstileToken: string): Promise<void> => {
  const record = await getAction(id);
  if (!record) throw new Error('Not Found');

  const isValid = await verifyTurnstile(turnstileToken);
  if (!isValid) throw new Error('Turnstile verification failed');

  const pat = decryptToken(record.token);
  await axios.post(
    `https://api.github.com/repos/${record.owner}/${record.repo}/dispatches`,
    {
      event_type: 'bot-check',
      client_payload: {
        ...(record.issueNumber !== undefined && { issueNumber: record.issueNumber }),
        ...(record.prNumber !== undefined && { prNumber: record.prNumber }),
        commentId: record.commentId,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github+json',
      },
    },
  );

  await deleteAction(id);
};

export const createAction = async (input: CreateActionInput): Promise<string> => {
  const id = nanoid();
  const encryptedToken = encryptToken(input.token);
  const ttl = Math.floor(Date.now() / 1000) + input.verificationTimeout * 60;

  await saveAction({
    id,
    token: encryptedToken,
    owner: input.owner,
    repo: input.repo,
    ...(input.issueNumber !== undefined && { issueNumber: input.issueNumber }),
    ...(input.prNumber !== undefined && { prNumber: input.prNumber }),
    commentId: input.commentId,
    ttl,
  });

  return id;
};
