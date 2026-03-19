import { CompactEncrypt, compactDecrypt } from 'jose';

export const createJWE = async (payload: object, secretKey: Uint8Array): Promise<string> => {
  return new CompactEncrypt(new TextEncoder().encode(JSON.stringify(payload)))
    .setProtectedHeader({ alg: 'dir', enc: 'A128GCM' })
    .encrypt(secretKey);
};

export const decryptJWEAndGetPayload = async (jwe: string, secretKey: Uint8Array): Promise<Record<string, unknown>> => {
  const { plaintext } = await compactDecrypt(jwe, secretKey);
  return JSON.parse(new TextDecoder().decode(plaintext));
};
