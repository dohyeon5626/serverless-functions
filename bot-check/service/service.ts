import { createCipheriv, randomBytes } from 'crypto';
import { nanoid } from 'nanoid';
import { saveAction } from '../plugin/repository';

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
}

export const createAction = async (input: CreateActionInput): Promise<string> => {
  const id = nanoid();
  const encryptedToken = encryptToken(input.token);

  const ttl = Math.floor(Date.now() / 1000) + input.verificationTimeout * 60;

  await saveAction({
    id,
    token: encryptedToken,
    verificationTimeout: input.verificationTimeout,
    owner: input.owner,
    repo: input.repo,
    createdAt: Date.now(),
    ttl,
  });

  return id;
};
